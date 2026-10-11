import type {
  DecodedFrame,
  FrameSequenceDefinition,
  SequenceCachePolicy,
} from "./types";

interface EncodedFrame {
  blob: Blob;
  bytes: number;
}

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

async function decodeBlob(index: number, blob: Blob): Promise<DecodedFrame> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(blob);
    return {
      index,
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      estimatedBytes: bitmap.width * bitmap.height * 4,
      release: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = "async";
  image.src = objectUrl;

  try {
    await image.decode();
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }

  return {
    index,
    source: image,
    width: image.naturalWidth,
    height: image.naturalHeight,
    estimatedBytes: image.naturalWidth * image.naturalHeight * 4,
    release: () => URL.revokeObjectURL(objectUrl),
  };
}

/**
 * Keeps compressed sequence data separate from the much larger decoded-frame
 * cache. The browser HTTP cache remains the final fallback after LRU eviction.
 */
export class FrameRepository {
  readonly sequence: FrameSequenceDefinition;

  private readonly policy: SequenceCachePolicy;
  private readonly abortController = new AbortController();
  private readonly encoded = new Map<number, EncodedFrame>();
  private readonly decoded = new Map<number, DecodedFrame>();
  private readonly encodedPending = new Map<number, Promise<EncodedFrame>>();
  private readonly decodedPending = new Map<number, Promise<DecodedFrame>>();
  private readonly queuedEncoded = new Set<number>();
  private readonly queuedDecoded = new Set<number>();
  private encodedBytes = 0;
  private decodedBytes = 0;
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

  getDecoded(index: number): DecodedFrame | undefined {
    const frame = this.decoded.get(index);
    if (!frame) return undefined;

    this.decoded.delete(index);
    this.decoded.set(index, frame);
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
    const { direction, rendered, maxDistance = 16 } = options ?? {};

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
    this.evictDecoded();
  }

  async load(index: number, priority = false): Promise<DecodedFrame> {
    assertFrameIndex(index, this.sequence.frameCount);
    if (this.disposed) throw new Error("frame repository is disposed");

    const cached = this.getDecoded(index);
    if (cached) return cached;

    const pending = this.decodedPending.get(index);
    if (pending) return pending;

    const promise = this.loadEncoded(index, priority)
      .then(({ blob }) => decodeBlob(index, blob))
      .then((frame) => {
        if (this.disposed) {
          frame.release();
          throw new Error("frame repository was disposed during decode");
        }

        this.decoded.set(index, frame);
        this.decodedBytes += frame.estimatedBytes;
        this.evictDecoded();
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
    const ordered = Array.from(indices);
    if (priority) ordered.reverse();
    for (const index of ordered) {
      if (
        index < 0 ||
        index >= this.sequence.frameCount ||
        this.encoded.has(index) ||
        this.encodedPending.has(index) ||
        this.queuedEncoded.has(index)
      ) {
        continue;
      }

      this.queuedEncoded.add(index);
      const job = async () => {
        try {
          await this.loadEncoded(index);
        } finally {
          this.queuedEncoded.delete(index);
        }
      };
      if (priority) this.queue.unshift(job);
      else this.queue.push(job);
    }

    this.pump();
  }

  /** Release inactive decoded frames while keeping compressed data warm. */
  compact(keepDecoded: Iterable<number>): void {
    const keep = new Set(keepDecoded);
    this.protectedFrames = keep;
    for (const [index, frame] of this.decoded) {
      if (keep.has(index)) continue;
      this.decoded.delete(index);
      this.decodedBytes -= frame.estimatedBytes;
      frame.release();
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.abortController.abort();
    this.queue = [];

    for (const frame of this.decoded.values()) frame.release();
    this.decoded.clear();
    this.encoded.clear();
    this.encodedPending.clear();
    this.decodedPending.clear();
    this.queuedEncoded.clear();
    this.queuedDecoded.clear();
    this.encodedBytes = 0;
    this.decodedBytes = 0;
  }

  private async loadEncoded(index: number, priority = false): Promise<EncodedFrame> {
    const cached = this.encoded.get(index);
    if (cached) {
      this.encoded.delete(index);
      this.encoded.set(index, cached);
      return cached;
    }

    const pending = this.encodedPending.get(index);
    if (pending) return pending;

    const promise = this.loadLimiter
      .run(async () => {
        const response = await fetch(this.sequence.frameUrl(index), {
          cache: "force-cache",
          signal: this.abortController.signal,
        });
        if (!response.ok) {
          throw new Error(
            `frame ${index} failed with HTTP ${response.status}`,
          );
        }
        return response.blob();
      }, priority)
      .then((blob) => {
        if (this.disposed) throw new Error("frame repository is disposed");
        const frame = { blob, bytes: blob.size };
        this.encoded.set(index, frame);
        this.encodedBytes += frame.bytes;
        this.evictEncoded();
        return frame;
      })
      .finally(() => this.encodedPending.delete(index));

    this.encodedPending.set(index, promise);
    return promise;
  }

  private pump(): void {
    // Reserve one slot for the actively requested frame. SequenceCanvas keeps
    // exactly one foreground request in flight.
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

  private evictEncoded(): void {
    for (const [index, frame] of this.encoded) {
      if (this.encodedBytes <= this.policy.maxEncodedBytes) return;
      if (this.protectedFrames.has(index)) continue;
      this.encoded.delete(index);
      this.encodedBytes -= frame.bytes;
    }
  }

  private evictDecoded(): void {
    for (const [index, frame] of this.decoded) {
      if (this.decodedBytes <= this.policy.maxDecodedBytes) return;
      if (this.protectedFrames.has(index)) continue;
      this.decoded.delete(index);
      this.decodedBytes -= frame.estimatedBytes;
      frame.release();
    }
  }
}
