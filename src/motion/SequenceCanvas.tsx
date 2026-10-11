"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { defaultCachePolicy, defaultCanvasQuality } from "./defaults";
import { FrameLoadLimiter, FrameRepository } from "./FrameRepository";
import {
  routeSequencePrewarm,
  SequenceRepositoryPool,
} from "./SequenceRepositoryPool";
import {
  clamp,
  clamp01,
  computeBackingStore,
  coverSourceRect,
  entranceBlendOpacity,
  frameIndexForProgress,
  frameWindow,
  sequenceFocusForFrame,
} from "./math";
import type {
  CanvasQualityPolicy,
  DecodedFrame,
  FrameSequenceDefinition,
  MotionPreference,
  SequenceCachePolicy,
  SequenceStatusDetail,
} from "./types";

export interface SequenceCanvasHandle {
  /** Imperative progress avoids a React render on every scroll event. */
  setProgress: (progress: number, sequenceId?: string) => void;
  /** Call when the scene is within the chosen preload window. */
  prewarm: (anticipatedProgress?: number) => void;
  /** Warm another sequence without changing the visible stage. */
  prewarmSequence: (
    sequence: FrameSequenceDefinition,
    anticipatedProgress?: number,
  ) => void;
  /** Move frame 0 with its document portal before the pin threshold. */
  setPortalOffset: (offsetPx: number) => void;
  redraw: () => void;
  getSequenceId: () => string;
}

export interface SequenceCanvasProps {
  sequence: FrameSequenceDefinition;
  initialProgress?: number;
  motionPreference?: MotionPreference;
  cachePolicy?: Partial<SequenceCachePolicy>;
  qualityPolicy?: Partial<CanvasQualityPolicy>;
  className?: string;
  onStatusChange?: (detail: SequenceStatusDetail) => void;
}

function resolveReducedFrame(
  sequence: FrameSequenceDefinition,
): number {
  const configured = sequence.reducedMotionFrame ?? "end";
  if (configured === "start") return 0;
  if (configured === "end") return sequence.frameCount - 1;
  return Math.round(clamp(configured, 0, sequence.frameCount - 1));
}

async function loadFallback(url: string): Promise<DecodedFrame> {
  const image = new Image();
  image.decoding = "async";
  image.src = url;
  await image.decode();
  return {
    index: -1,
    source: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    estimatedBytes: image.naturalWidth * image.naturalHeight * 4,
    release: () => undefined,
  };
}

interface RenderedVisual {
  definition: FrameSequenceDefinition;
  frame: DecodedFrame;
  entranceBase?: DecodedFrame;
}

function needsEntranceBlend(
  definition: FrameSequenceDefinition,
  frameIndex: number,
): boolean {
  const blendFrames = Math.max(
    0,
    Math.floor(definition.entranceBlendFrames ?? 0),
  );
  return frameIndex > 0 && frameIndex < blendFrames;
}

export const SequenceCanvas = forwardRef<
  SequenceCanvasHandle,
  SequenceCanvasProps
>(function SequenceCanvas(
  {
    sequence,
    initialProgress = 0,
    motionPreference = "auto",
    cachePolicy,
    qualityPolicy,
    className,
    onStatusChange,
  },
  forwardedRef,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const repositoryRef = useRef<FrameRepository | null>(null);
  const repositoryPoolRef = useRef<
    SequenceRepositoryPool<FrameRepository> | null
  >(null);
  const loadLimiterRef = useRef<FrameLoadLimiter | null>(null);
  const targetFrameRef = useRef(0);
  const renderedFrameRef = useRef<number | null>(null);
  const renderedSequenceRef = useRef<string | null>(null);
  const previousTargetRef = useRef(0);
  const progressRef = useRef(clamp01(initialProgress));
  const foregroundBusyRef = useRef(false);
  const fallbackPendingRef = useRef(false);
  const generationRef = useRef(0);
  const resizeRafRef = useRef<number | null>(null);
  const portalOffsetRef = useRef(0);
  const onStatusRef = useRef(onStatusChange);
  const statusRef = useRef<SequenceStatusDetail["status"] | null>(null);
  const renderedVisualRef = useRef<RenderedVisual | null>(null);

  useEffect(() => {
    onStatusRef.current = onStatusChange;
  }, [onStatusChange]);

  const resolvedCachePolicy = useMemo(
    () => ({ ...defaultCachePolicy(), ...cachePolicy }),
    [cachePolicy],
  );
  const resolvedQualityPolicy = useMemo(
    () => ({ ...defaultCanvasQuality(), ...qualityPolicy }),
    [qualityPolicy],
  );

  const getRepositoryPool = useCallback(() => {
    if (!repositoryPoolRef.current) {
      loadLimiterRef.current ??= new FrameLoadLimiter(
        resolvedCachePolicy.concurrency,
      );
      const limiter = loadLimiterRef.current;
      repositoryPoolRef.current = new SequenceRepositoryPool(
        (definition) => new FrameRepository(
          definition,
          resolvedCachePolicy,
          limiter,
        ),
        (repository) => repository.dispose(),
      );
    }
    return repositoryPoolRef.current;
  }, [resolvedCachePolicy]);

  const prefersReducedMotion =
    motionPreference === "reduce" ||
    (motionPreference === "auto" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const emitStatus = useCallback(
    (
      status: SequenceStatusDetail["status"],
      error?: Error,
      renderedFrame = renderedFrameRef.current,
    ) => {
      if (statusRef.current === status && !error) return;
      statusRef.current = status;
      onStatusRef.current?.({
        sequenceId: sequence.id,
        status,
        requestedFrame: targetFrameRef.current,
        renderedFrame,
        error,
      });
    },
    [sequence.id],
  );

  const paint = useCallback(
    (
      frame: DecodedFrame,
      definition: FrameSequenceDefinition,
      entranceBase?: DecodedFrame,
      reason?: string,
    ) => {
      const canvas = canvasRef.current;
      if (!canvas || canvas.width < 1 || canvas.height < 1) return false;
      const context = canvas.getContext("2d", {
        alpha: false,
        desynchronized: true,
      });
      if (!context) return false;

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      const focus = sequenceFocusForFrame(definition, frame.index);
      const drawLayer = (layer: DecodedFrame) => {
        const crop = coverSourceRect(
          layer.width,
          layer.height,
          canvas.width,
          canvas.height,
          focus,
        );
        context.drawImage(
          layer.source,
          crop.sx,
          crop.sy,
          crop.sw,
          crop.sh,
          0,
          0,
          canvas.width,
          canvas.height,
        );
      };

      if (needsEntranceBlend(definition, frame.index)) {
        if (!entranceBase) return false;
        context.globalAlpha = 1;
        drawLayer(entranceBase);
        context.globalAlpha = entranceBlendOpacity(
          frame.index,
          definition.entranceBlendFrames,
        );
        drawLayer(frame);
        context.globalAlpha = 1;
      } else {
        context.globalAlpha = 1;
        drawLayer(frame);
      }
      renderedVisualRef.current = { definition, frame, entranceBase };
      return true;
    },
    [],
  );

  const draw = useCallback(
    (frame: DecodedFrame, entranceBase?: DecodedFrame, reason?: string) => {
      const resolvedEntranceBase = entranceBase ?? (
        needsEntranceBlend(sequence, frame.index)
          ? repositoryRef.current?.getDecoded(0)
          : undefined
      );
      if (!paint(frame, sequence, resolvedEntranceBase, reason)) return false;
      renderedFrameRef.current = frame.index;
      renderedSequenceRef.current = sequence.id;
      emitStatus(frame.index < 0 ? "degraded" : "ready", undefined, frame.index);
      return true;
    },
    [emitStatus, paint, sequence],
  );

  const requestFallback = useCallback(
    (cause: Error) => {
      if (!sequence.fallbackUrl || fallbackPendingRef.current) {
        emitStatus(renderedFrameRef.current == null ? "error" : "degraded", cause);
        return;
      }

      fallbackPendingRef.current = true;
      const generation = generationRef.current;
      void loadFallback(sequence.fallbackUrl)
        .then((frame) => {
          if (generation === generationRef.current) draw(frame);
        })
        .catch((error: unknown) => {
          const fallbackError =
            error instanceof Error ? error : new Error(String(error));
          emitStatus("error", fallbackError);
        })
        .finally(() => {
          fallbackPendingRef.current = false;
        });
    },
    [draw, emitStatus, sequence.fallbackUrl],
  );

  const requestForeground = useCallback(() => {
    const repository = repositoryRef.current;
    if (!repository || foregroundBusyRef.current) return;
    foregroundBusyRef.current = true;
    const generation = generationRef.current;

    const run = async () => {
      let failed = false;
      try {
        while (
          generation === generationRef.current &&
          repository === repositoryRef.current
        ) {
          const requested = targetFrameRef.current;
          const frame = await repository.load(requested, true);
          const entranceBase = needsEntranceBlend(sequence, requested)
            ? await repository.load(0, true)
            : undefined;
          if (
            generation !== generationRef.current ||
            repository !== repositoryRef.current
          ) {
            return;
          }

          const currentTarget = targetFrameRef.current;
          const currentRendered = renderedFrameRef.current;
          const direction = currentTarget >= (currentRendered ?? 0) ? 1 : -1;

          // If requested frame is exact target, or is a monotonic step towards target:
          const isMonotonicProgress =
            currentRendered == null ||
            (direction >= 0
              ? requested > currentRendered && requested <= currentTarget
              : requested < currentRendered && requested >= currentTarget);

          if (requested === currentTarget || isMonotonicProgress) {
            draw(frame, entranceBase, 'foreground');
            if (requested === currentTarget) return;
          }
        }
      } catch (error: unknown) {
        failed = true;
        const failure = error instanceof Error ? error : new Error(String(error));
        if (generation === generationRef.current) requestFallback(failure);
      } finally {
        const stillCurrent =
          generation === generationRef.current &&
          repository === repositoryRef.current;
        if (stillCurrent) {
          foregroundBusyRef.current = false;
          if (!failed && !repository.getDecoded(targetFrameRef.current)) {
            requestForeground();
          }
        }
      }
    };

    void run();
  }, [draw, requestFallback, sequence]);

  const setProgress = useCallback(
    (progress: number, sequenceId?: string) => {
      if (sequenceId && sequenceId !== sequence.id) {
        return;
      }
      progressRef.current = clamp01(progress);
      const repository = repositoryRef.current;
      if (!repository) return;

      const target = prefersReducedMotion
        ? resolveReducedFrame(sequence)
        : frameIndexForProgress(progressRef.current, sequence.frameCount);
      const direction = target >= previousTargetRef.current ? 1 : -1;
      previousTargetRef.current = target;
      targetFrameRef.current = target;

      const decoded = repository.getDecoded(target);
      if (decoded) {
        if (!draw(decoded, undefined, 'exact')) requestForeground();
      } else {
        const nearest = repository.getNearestDecoded(target, {
          direction,
          rendered: renderedFrameRef.current,
          maxDistance: resolvedCachePolicy.decodeRadius * 2,
        });
        const rendered = renderedFrameRef.current;
        if (
          nearest &&
          renderedSequenceRef.current === sequence.id &&
          (rendered == null ||
            Math.abs(nearest.index - target) < Math.abs(rendered - target))
        ) {
          draw(nearest, undefined, 'nearest');
        }
        requestForeground();
      }

      const decodedNeighborhood = frameWindow(
        target,
        resolvedCachePolicy.decodeRadius,
        sequence.frameCount,
        direction,
      );
      const networkNeighborhood = frameWindow(
        target,
        resolvedCachePolicy.networkRadius,
        sequence.frameCount,
        direction,
      );

      repository.compact([
        ...decodedNeighborhood,
        target,
        ...(needsEntranceBlend(sequence, target) ? [0] : []),
        ...(renderedSequenceRef.current === sequence.id &&
        renderedFrameRef.current != null
          ? [renderedFrameRef.current]
          : []),
      ]);
      repository.scheduleDecode(decodedNeighborhood, true);
      repository.scheduleEncoded(networkNeighborhood, true);
    },
    [
      draw,
      prefersReducedMotion,
      requestForeground,
      resolvedCachePolicy.decodeRadius,
      resolvedCachePolicy.networkRadius,
      sequence,
    ],
  );

  const prewarm = useCallback(
    (anticipatedProgress = progressRef.current) => {
      const repository = repositoryRef.current;
      if (!repository) return;
      const target = prefersReducedMotion
        ? resolveReducedFrame(sequence)
        : frameIndexForProgress(anticipatedProgress, sequence.frameCount);
      repository.scheduleDecode(
        frameWindow(
          target,
          resolvedCachePolicy.decodeRadius,
          sequence.frameCount,
          1,
        ),
        true,
      );
      if (!prefersReducedMotion) {
        repository.scheduleEncoded(
          frameWindow(
            target,
            resolvedCachePolicy.networkRadius,
            sequence.frameCount,
            1,
          ),
        );
      }
    },
    [
      prefersReducedMotion,
      resolvedCachePolicy.decodeRadius,
      resolvedCachePolicy.networkRadius,
      sequence,
    ],
  );

  const prewarmSequence = useCallback(
    (
      definition: FrameSequenceDefinition,
      anticipatedProgress = 0,
    ) => {
      const route = routeSequencePrewarm(
        getRepositoryPool(),
        definition,
        {
          sequenceId: sequence.id,
          repository: repositoryRef.current,
          progress: progressRef.current,
          visual: renderedVisualRef.current,
        },
      );
      const repository = route.repository;
      const target = prefersReducedMotion
        ? resolveReducedFrame(definition)
        : frameIndexForProgress(anticipatedProgress, definition.frameCount);
      const decodeRadius = prefersReducedMotion
        ? 0
        : Math.min(1, resolvedCachePolicy.decodeRadius);
      const networkRadius = Math.min(8, resolvedCachePolicy.networkRadius);
      const rendered = renderedVisualRef.current;
      const isActive =
        repository === repositoryRef.current && definition.id === sequence.id;
      const keep = prefersReducedMotion
        ? [target]
        : [
            target,
            ...(target <= 5 ? [0] : []),
            ...(target >= definition.frameCount - 6 ? [definition.frameCount - 1] : []),
            ...(isActive ? [targetFrameRef.current] : []),
            ...(rendered?.definition.id === definition.id
              ? [rendered.frame.index]
              : []),
          ];

      repository.protect(keep);
      repository.scheduleDecode(
        prefersReducedMotion
          ? [target]
          : frameWindow(
              target,
              decodeRadius,
              definition.frameCount,
              anticipatedProgress >= 0.5 ? -1 : 1,
            ),
        true,
      );
      if (!prefersReducedMotion) {
        repository.scheduleEncoded(
          frameWindow(
            target,
            networkRadius,
            definition.frameCount,
            1,
          ),
          true,
        );
      }
    },
    [
      getRepositoryPool,
      prefersReducedMotion,
      resolvedCachePolicy.decodeRadius,
      resolvedCachePolicy.networkRadius,
      sequence.id,
    ],
  );

  const redraw = useCallback(() => {
    const visual = renderedVisualRef.current;
    if (visual && paint(
      visual.frame,
      visual.definition,
      visual.entranceBase,
    )) return;
    requestForeground();
  }, [paint, requestForeground]);

  const setPortalOffset = useCallback((offsetPx: number) => {
    const canvas = canvasRef.current;
    const nextOffset = Math.max(0, Number.isFinite(offsetPx) ? offsetPx : 0);
    if (!canvas || portalOffsetRef.current === nextOffset) return;
    portalOffsetRef.current = nextOffset;
    canvas.style.transform = `translate3d(0, ${nextOffset}px, 0)`;
  }, []);

  useImperativeHandle(
    forwardedRef,
    () => ({
      setProgress,
      prewarm,
      prewarmSequence,
      setPortalOffset,
      redraw,
      getSequenceId: () => sequence.id,
    }),
    [prewarm, prewarmSequence, redraw, sequence.id, setPortalOffset, setProgress],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const size = computeBackingStore(
        rect.width,
        rect.height,
        window.devicePixelRatio || 1,
        resolvedQualityPolicy.maxDevicePixelRatio,
        resolvedQualityPolicy.maxCanvasPixels,
      );
      if (canvas.width === size.width && canvas.height === size.height) return;
      canvas.width = size.width;
      canvas.height = size.height;
      redraw();
    };

    const scheduleResize = () => {
      if (resizeRafRef.current != null) return;
      resizeRafRef.current = requestAnimationFrame(() => {
        resizeRafRef.current = null;
        resize();
      });
    };

    const observer = new ResizeObserver(scheduleResize);
    observer.observe(canvas);
    window.visualViewport?.addEventListener("resize", scheduleResize);
    scheduleResize();

    return () => {
      observer.disconnect();
      window.visualViewport?.removeEventListener("resize", scheduleResize);
      if (resizeRafRef.current != null) {
        cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = null;
      }
    };
  }, [redraw, resolvedQualityPolicy]);

  useEffect(() => {
    return () => {
      generationRef.current += 1;
      repositoryRef.current = null;
      repositoryPoolRef.current?.dispose();
      repositoryPoolRef.current = null;
      loadLimiterRef.current = null;
      renderedVisualRef.current = null;
    };
  }, [resolvedCachePolicy]);

  useEffect(() => {
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    foregroundBusyRef.current = false;
    fallbackPendingRef.current = false;
    statusRef.current = null;

    const activation = getRepositoryPool().activate(sequence);
    const previousEntry = activation.previous;
    if (
      previousEntry &&
      previousEntry.definition.id !== activation.current.definition.id
    ) {
        const rendered = renderedVisualRef.current;
        previousEntry.repository.compact([
          0,
          previousEntry.definition.frameCount - 1,
          ...(rendered?.definition.id === previousEntry.definition.id
            ? [rendered.frame.index]
            : []),
        ]);
        // Reset progressRef to initialProgress so the new sequence starts cleanly
        progressRef.current = clamp01(initialProgress);
    }

    const repository = activation.current.repository;
    repositoryRef.current = repository;
    emitStatus("loading");
    const initialTarget = prefersReducedMotion
      ? resolveReducedFrame(sequence)
      : frameIndexForProgress(initialProgress, sequence.frameCount);
    repository.scheduleDecode(
      prefersReducedMotion
        ? [initialTarget]
        : frameWindow(
            initialTarget,
            resolvedCachePolicy.decodeRadius,
            sequence.frameCount,
            1,
          ),
      true,
    );
    setProgress(progressRef.current, sequence.id);
  }, [
    emitStatus,
    getRepositoryPool,
    initialProgress,
    prefersReducedMotion,
    sequence,
    setProgress,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
});
