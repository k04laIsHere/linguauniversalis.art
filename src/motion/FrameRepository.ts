import type {
  DecodedFrame,
  FrameSequenceDefinition,
  SequenceCachePolicy,
} from "./types";

type QueuedJob = () => Promise<void>;

export class FrameLoadLimiter {
  private active = 0;
  private readonly queue: Array<() => void> = [];
  private readonly limit: number;

  constructor(limit: number) {
    this.limit = limit;
  }

  run<T>(job: () => Promise<T>, priority = false): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const start = () => {
        this.active += 1;
        void job()
          .then(resolve, reject)
          .finally(() => {
            this.active -= 1;
            this.pump();
          });
      };
      if (priority) {
        this.queue.unshift(start);
      } else {
        this.queue.push(start);
      }
      this.pump();
    });
  }

  private pump(): void {
    while (this.active < Math.max(1, this.limit) && this.queue.length > 0) {
      this.queue.shift()?.();
    }
  }
}

function assertFrameIndex(index: number, frameCount: number): void {
  if (!Number.isInteger(index) || index < 0 || index >= frameCount) {
    throw new RangeError(`frame ${index} is outside 0..${frameCount - 1}`);
  }
}

function loadDecodedImage(
  index: number,
  url: string,
  signal: AbortSignal,
): Promise<DecodedFrame> {
  const attemptLoad = (attempt: number): Promise<DecodedFrame> =>
    new Promise<DecodedFrame>((resolve, reject) => {
      if (signal.aborted) {
        reject(new DOMException("Aborted", "AbortError"));
        return;
      }

      const image = new Image();
      image.decoding = "async";

      const cleanup = () => {
        signal.removeEventListener("abort", onAbort);
        image.onload = null;
        image.onerror = null;
      };

      const onAbort = () => {
        cleanup();
        image.src = "";
        reject(new DOMException("Aborted", "AbortError"));
      };

      const finalize = () => {
        if (signal.aborted) {
          reject(new DOMException("Aborted", "AbortError"));
          return;
        }
        const width = image.naturalWidth || image.width || 1280;
        const height = image.naturalHeight || image.height || 1280;
        resolve({
          index,
          source: image,
          width,
          height,
          estimatedBytes: 0,
          release: () => undefined,
        });
      };

      signal.addEventListener("abort", onAbort, { once: true });

      image.onload = () => {
        cleanup();
        if (typeof image.decode === "function") {
          image.decode().then(finalize, finalize);
        } else {
          finalize();
        }
      };

      image.onerror = () => {
        cleanup();
        if (attempt < 2 && !signal.aborted) {
          setTimeout(() => {
            attemptLoad(attempt + 1).then(resolve, reject);
          }, 150);
          return;
        }
        reject(new Error(`frame ${index} failed to load from ${url}`));
      };

      image.src = url;
      if (image.complete && image.naturalWidth > 0) {
        cleanup();
        if (typeof image.decode === "function") {
          image.decode().then(finalize, finalize);
        } else {
          finalize();
        }
      }
    });

  return attemptLoad(1);
}

/**
 * Retains preloaded HTMLImageElement frames in memory so scrubbing across
 * transition sequences is synchronous and never blocks on network/decode.
 */
export class FrameRepository {
  readonly sequence: FrameSequenceDefinition;

  private readonly policy: SequenceCachePolicy;
  private readonly abortController = new AbortController();
  private readonly decoded = new Map<number, DecodedFrame>();
  private readonly decodedPending = new Map<number, Promise<DecodedFrame>>();
  private readonly queuedDecoded = new Set<number>();
  private queue: QueuedJob[] = [];
  private activeJobs = 0;
  private disposed = false;
  private protectedFrames = new Set<number>();
  private readonly loadLimiter: FrameLoadLimiter;

  constructor(
    sequence: FrameSequenceDefinition,
    policy: SequenceCachePolicy,
    loadLimiter = new FrameLoadLimiter(policy.concurrency),
  ) {
    if (!Number.isInteger(sequence.frameCount) || sequence.frameCount < 1) {
      throw new RangeError("sequence.frameCount must be a positive integer");
    }

    this.sequence = sequence;
    this.policy = policy;
    this.loadLimiter = loadLimiter;
  }

  isFullyLoaded(): boolean {
    return this.decoded.size >= this.sequence.frameCount;
  }

  async preloadAll(onFrameLoaded?: () => void): Promise<void> {
    const tasks: Promise<void>[] = [];
    for (let i = 0; i < this.sequence.frameCount; i += 1) {
      if (this.decoded.has(i)) {
        onFrameLoaded?.();
        continue;
      }
      tasks.push(
        this.load(i, false)
          .then(() => {
            onFrameLoaded?.();
          })
          .catch(() => {
            onFrameLoaded?.();
          }),
      );
    }
    await Promise.all(tasks);
  }

  getDecoded(index: number): DecodedFrame | undefined {
    const frame = this.decoded.get(index);
    if (!frame) return undefined;
    return frame;
  }

  getNearestDecoded(
    index: number,
    options?: {
      direction?: number;
      rendered?: number | null;
      maxDistance?: number;
    },
  ): DecodedFrame | undefined {
    let nearest: DecodedFrame | undefined;
    let nearestDistance = Number.POSITIVE_INFINITY;
    const {
      direction,
      rendered,
      maxDistance = this.sequence.frameCount,
    } = options ?? {};

    for (const frame of this.decoded.values()) {
      if (rendered != null && direction != null) {
        if (direction > 0 && frame.index < rendered) continue;
        if (direction < 0 && frame.index > rendered) continue;
      }

      const distance = Math.abs(index - frame.index);
      if (distance <= maxDistance && distance < nearestDistance) {
        nearest = frame;
        nearestDistance = distance;
      }
    }

    return nearest ? this.getDecoded(nearest.index) : undefined;
  }

  protect(indices: Iterable<number>): void {
    this.protectedFrames = new Set(indices);
  }

  async load(index: number, priority = false): Promise<DecodedFrame> {
    assertFrameIndex(index, this.sequence.frameCount);
    if (this.disposed) throw new Error("frame repository is disposed");

    const cached = this.getDecoded(index);
    if (cached) return cached;

    const pending = this.decodedPending.get(index);
    if (pending) return pending;

    const promise = this.loadLimiter
      .run(
        () =>
          loadDecodedImage(
            index,
            this.sequence.frameUrl(index),
            this.abortController.signal,
          ),
        priority,
      )
      .then((frame) => {
        if (this.disposed) {
          frame.release();
          throw new Error("frame repository was disposed during decode");
        }

        this.decoded.set(index, frame);
        return frame;
      })
      .finally(() => this.decodedPending.delete(index));

    this.decodedPending.set(index, promise);
    return promise;
  }

  scheduleDecode(indices: Iterable<number>, priority = false): void {
    const ordered = Array.from(indices);
    if (priority) ordered.reverse();
    for (const index of ordered) {
      if (
        index < 0 ||
        index >= this.sequence.frameCount ||
        this.decoded.has(index) ||
        this.decodedPending.has(index) ||
        this.queuedDecoded.has(index)
      ) {
        continue;
      }

      this.queuedDecoded.add(index);
      const job = async () => {
        try {
          await this.load(index);
        } finally {
          this.queuedDecoded.delete(index);
        }
      };
      if (priority) this.queue.unshift(job);
      else this.queue.push(job);
    }

    this.pump();
  }

  scheduleEncoded(indices: Iterable<number>, priority = false): void {
    this.scheduleDecode(indices, priority);
  }

  /** Keep preloaded frames in memory so scrubbing never re-fetches or stalls. */
  compact(keepDecoded: Iterable<number>): void {
    this.protectedFrames = new Set(keepDecoded);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.abortController.abort();
    this.queue = [];

    for (const frame of this.decoded.values()) frame.release();
    this.decoded.clear();
    this.decodedPending.clear();
    this.queuedDecoded.clear();
  }

  private pump(): void {
    const backgroundLimit = Math.max(1, this.policy.concurrency - 1);
    while (
      !this.disposed &&
      this.activeJobs < backgroundLimit &&
      this.queue.length > 0
    ) {
      const job = this.queue.shift();
      if (!job) return;
      this.activeJobs += 1;
      void job()
        .catch(() => {
          // Foreground loads report failures. Background prefetch is best effort.
        })
        .finally(() => {
          this.activeJobs -= 1;
          this.pump();
        });
    }
  }
}
