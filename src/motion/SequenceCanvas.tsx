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
import { getSharedSequenceRepositoryPool } from "./linguaSequences";
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
  /** Imperatively switch sequence and update progress in the same frame. */
  activateSequence: (
    sequence: FrameSequenceDefinition,
    progress: number,
  ) => void;
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
  return new Promise<DecodedFrame>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    const finalize = () => {
      const width = image.naturalWidth || image.width || 1280;
      const height = image.naturalHeight || image.height || 1280;
      resolve({
        index: -1,
        source: image,
        width,
        height,
        estimatedBytes: 0,
        release: () => undefined,
      });
    };
    image.onload = () => {
      if (typeof image.decode === "function") {
        image.decode().then(finalize, finalize);
      } else {
        finalize();
      }
    };
    image.onerror = () => reject(new Error(`Fallback failed to load: ${url}`));
    image.src = url;
    if (image.complete && image.naturalWidth > 0) {
      if (typeof image.decode === "function") {
        image.decode().then(finalize, finalize);
      } else {
        finalize();
      }
    }
  });
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
    motionPreference = "full",
    cachePolicy,
    qualityPolicy,
    className,
    onStatusChange,
  },
  forwardedRef,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentSequenceRef = useRef<FrameSequenceDefinition>(sequence);
  const repositoryRef = useRef<FrameRepository | null>(null);
  const customPoolRef = useRef<SequenceRepositoryPool<FrameRepository> | null>(
    null,
  );
  const loadLimiterRef = useRef<FrameLoadLimiter | null>(null);
  const targetFrameRef = useRef(0);
  const renderedFrameRef = useRef<number | null>(null);
  const renderedSequenceRef = useRef<string | null>(null);
  const previousTargetRef = useRef(0);
  const progressRef = useRef(clamp01(initialProgress));
  const initialProgressRef = useRef(initialProgress);
  const foregroundBusyRef = useRef(false);
  const fallbackPendingRef = useRef(false);
  const generationRef = useRef(0);
  const resizeRafRef = useRef<number | null>(null);
  const portalOffsetRef = useRef(0);
  const onStatusRef = useRef(onStatusChange);
  const statusRef = useRef<SequenceStatusDetail["status"] | null>(null);
  const renderedVisualRef = useRef<RenderedVisual | null>(null);
  const sizedOnceRef = useRef(false);

  useEffect(() => {
    onStatusRef.current = onStatusChange;
  }, [onStatusChange]);

  useEffect(() => {
    initialProgressRef.current = initialProgress;
  }, [initialProgress]);

  const resolvedCachePolicy = useMemo(
    () => ({ ...defaultCachePolicy(), ...cachePolicy }),
    [cachePolicy],
  );
  const resolvedQualityPolicy = useMemo(
    () => ({ ...defaultCanvasQuality(), ...qualityPolicy }),
    [qualityPolicy],
  );

  const getRepositoryPool = useCallback(() => {
    if (!cachePolicy) {
      return getSharedSequenceRepositoryPool();
    }
    if (!customPoolRef.current) {
      loadLimiterRef.current ??= new FrameLoadLimiter(
        resolvedCachePolicy.concurrency,
      );
      const limiter = loadLimiterRef.current;
      customPoolRef.current = new SequenceRepositoryPool(
        (definition) =>
          new FrameRepository(definition, resolvedCachePolicy, limiter),
        (repository) => repository.dispose(),
      );
    }
    return customPoolRef.current;
  }, [cachePolicy, resolvedCachePolicy]);

  const prefersReducedMotion = motionPreference === "reduce";

  const emitStatus = useCallback(
    (
      status: SequenceStatusDetail["status"],
      error?: Error,
      renderedFrame = renderedFrameRef.current,
    ) => {
      if (statusRef.current === status && !error) return;
      statusRef.current = status;
      onStatusRef.current?.({
        sequenceId: currentSequenceRef.current.id,
        status,
        requestedFrame: targetFrameRef.current,
        renderedFrame,
        error,
      });
    },
    [],
  );

  const ensureCanvasSized = useCallback(
    (canvas: HTMLCanvasElement) => {
      if (sizedOnceRef.current && canvas.width >= 1 && canvas.height >= 1) {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const cssWidth = rect.width > 0 ? rect.width : window.innerWidth || 1280;
      const cssHeight =
        rect.height > 0 ? rect.height : window.innerHeight || 720;
      if (cssWidth <= 0 || cssHeight <= 0) return;
      const size = computeBackingStore(
        cssWidth,
        cssHeight,
        window.devicePixelRatio || 1,
        resolvedQualityPolicy.maxDevicePixelRatio,
        resolvedQualityPolicy.maxCanvasPixels,
      );
      canvas.width = size.width;
      canvas.height = size.height;
      sizedOnceRef.current = true;
    },
    [resolvedQualityPolicy],
  );

  const paint = useCallback(
    (
      frame: DecodedFrame,
      definition: FrameSequenceDefinition,
      entranceBase?: DecodedFrame,
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return false;
      ensureCanvasSized(canvas);
      if (canvas.width < 1 || canvas.height < 1) return false;
      const context = canvas.getContext("2d", {
        alpha: false,
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
    [ensureCanvasSized],
  );

  const draw = useCallback(
    (frame: DecodedFrame, entranceBase?: DecodedFrame) => {
      const activeSequence = currentSequenceRef.current;
      const resolvedEntranceBase =
        entranceBase ??
        (needsEntranceBlend(activeSequence, frame.index)
          ? repositoryRef.current?.getDecoded(0)
          : undefined);
      if (!paint(frame, activeSequence, resolvedEntranceBase)) return false;
      renderedFrameRef.current = frame.index;
      renderedSequenceRef.current = activeSequence.id;
      emitStatus(
        frame.index < 0 ? "degraded" : "ready",
        undefined,
        frame.index,
      );
      return true;
    },
    [emitStatus, paint],
  );

  const requestFallback = useCallback(
    (cause: Error) => {
      const activeSequence = currentSequenceRef.current;
      if (!activeSequence.fallbackUrl || fallbackPendingRef.current) {
        emitStatus(
          renderedFrameRef.current == null ? "error" : "degraded",
          cause,
        );
        return;
      }

      fallbackPendingRef.current = true;
      const generation = generationRef.current;
      void loadFallback(activeSequence.fallbackUrl)
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
    [draw, emitStatus],
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
          const activeSequence = currentSequenceRef.current;
          const requested = targetFrameRef.current;
          const frame = await repository.load(requested, true);
          const entranceBase = needsEntranceBlend(activeSequence, requested)
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

          const isMonotonicProgress =
            currentRendered == null ||
            renderedSequenceRef.current !== activeSequence.id ||
            (direction >= 0
              ? requested > currentRendered && requested <= currentTarget
              : requested < currentRendered && requested >= currentTarget);

          if (requested === currentTarget || isMonotonicProgress) {
            draw(frame, entranceBase);
            if (requested === currentTarget) return;
          }
        }
      } catch (error: unknown) {
        failed = true;
        const failure =
          error instanceof Error ? error : new Error(String(error));
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
  }, [draw, requestFallback]);

  const setProgress = useCallback(
    (progress: number, sequenceId?: string) => {
      const activeSequence = currentSequenceRef.current;
      if (sequenceId && sequenceId !== activeSequence.id) {
        return;
      }
      progressRef.current = clamp01(progress);
      const repository = repositoryRef.current;
      if (!repository) return;

      const target = prefersReducedMotion
        ? resolveReducedFrame(activeSequence)
        : frameIndexForProgress(progressRef.current, activeSequence.frameCount);
      const direction = target >= previousTargetRef.current ? 1 : -1;
      previousTargetRef.current = target;
      targetFrameRef.current = target;

      if (
        renderedSequenceRef.current === activeSequence.id &&
        renderedFrameRef.current === target
      ) {
        return;
      }

      const decoded = repository.getDecoded(target);
      if (decoded) {
        if (!draw(decoded)) requestForeground();
      } else {
        const nearest = repository.getNearestDecoded(target, {
          direction,
          rendered: renderedFrameRef.current,
          maxDistance: activeSequence.frameCount,
        });
        const rendered = renderedFrameRef.current;
        if (
          nearest &&
          renderedSequenceRef.current === activeSequence.id &&
          (rendered == null ||
            Math.abs(nearest.index - target) < Math.abs(rendered - target))
        ) {
          draw(nearest);
        }
        requestForeground();
      }

      if (!repository.isFullyLoaded()) {
        const decodedNeighborhood = frameWindow(
          target,
          resolvedCachePolicy.decodeRadius,
          activeSequence.frameCount,
          direction,
        );
        repository.scheduleDecode(decodedNeighborhood, true);
      }
    },
    [draw, prefersReducedMotion, requestForeground, resolvedCachePolicy.decodeRadius],
  );

  const activateSequence = useCallback(
    (nextSequence: FrameSequenceDefinition, nextProgress: number) => {
      if (
        currentSequenceRef.current.id !== nextSequence.id ||
        !repositoryRef.current
      ) {
        currentSequenceRef.current = nextSequence;
        generationRef.current += 1;
        foregroundBusyRef.current = false;
        fallbackPendingRef.current = false;
        statusRef.current = null;
        const activation = getRepositoryPool().activate(nextSequence);
        repositoryRef.current = activation.current.repository;
      }
      setProgress(nextProgress, nextSequence.id);
    },
    [getRepositoryPool, setProgress],
  );

  const prewarm = useCallback(
    (anticipatedProgress = progressRef.current) => {
      const activeSequence = currentSequenceRef.current;
      const repository = repositoryRef.current;
      if (!repository || repository.isFullyLoaded()) return;
      const target = prefersReducedMotion
        ? resolveReducedFrame(activeSequence)
        : frameIndexForProgress(anticipatedProgress, activeSequence.frameCount);
      repository.scheduleDecode(
        frameWindow(
          target,
          resolvedCachePolicy.decodeRadius,
          activeSequence.frameCount,
          1,
        ),
        true,
      );
    },
    [prefersReducedMotion, resolvedCachePolicy.decodeRadius],
  );

  const prewarmSequence = useCallback(
    (definition: FrameSequenceDefinition, anticipatedProgress = 0) => {
      const route = routeSequencePrewarm(getRepositoryPool(), definition, {
        sequenceId: currentSequenceRef.current.id,
        repository: repositoryRef.current,
        progress: progressRef.current,
        visual: renderedVisualRef.current,
      });
      const repository = route.repository;
      if (repository.isFullyLoaded()) return;
      const target = prefersReducedMotion
        ? resolveReducedFrame(definition)
        : frameIndexForProgress(anticipatedProgress, definition.frameCount);
      repository.scheduleDecode(
        frameWindow(
          target,
          resolvedCachePolicy.decodeRadius,
          definition.frameCount,
          anticipatedProgress >= 0.5 ? -1 : 1,
        ),
        true,
      );
    },
    [getRepositoryPool, prefersReducedMotion, resolvedCachePolicy.decodeRadius],
  );

  const redraw = useCallback(() => {
    const visual = renderedVisualRef.current;
    if (
      visual &&
      paint(visual.frame, visual.definition, visual.entranceBase)
    ) {
      return;
    }
    const repository = repositoryRef.current;
    const decoded = repository?.getDecoded(targetFrameRef.current);
    if (decoded && draw(decoded)) return;
    requestForeground();
  }, [draw, paint, requestForeground]);

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
      activateSequence,
      prewarm,
      prewarmSequence,
      setPortalOffset,
      redraw,
      getSequenceId: () => currentSequenceRef.current.id,
    }),
    [
      activateSequence,
      prewarm,
      prewarmSequence,
      redraw,
      setPortalOffset,
      setProgress,
    ],
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
      sizedOnceRef.current = true;
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

    resize();
    const observer = new ResizeObserver(scheduleResize);
    observer.observe(canvas);
    window.visualViewport?.addEventListener("resize", scheduleResize);

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
      customPoolRef.current?.dispose();
      customPoolRef.current = null;
      loadLimiterRef.current = null;
      renderedVisualRef.current = null;
    };
  }, [resolvedCachePolicy]);

  useEffect(() => {
    activateSequence(sequence, initialProgressRef.current);
  }, [activateSequence, sequence]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
});
