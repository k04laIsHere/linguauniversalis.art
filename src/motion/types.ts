export type MotionPreference = "auto" | "full" | "reduce";

export type ReducedMotionFrame = "start" | "end" | number;

export interface CropFocus {
  /** Horizontal focal position, where 0 is left and 1 is right. */
  x: number;
  /** Vertical focal position, where 0 is top and 1 is bottom. */
  y: number;
}

export interface FrameSequenceDefinition {
  id: string;
  frameCount: number;
  frameUrl: (index: number) => string;
  focus?: CropFocus;
  /** Crop used by canonical frame 0 before reconciliation to `focus`. */
  entranceFocus?: CropFocus;
  fallbackUrl?: string;
  /**
   * Reconcile a canonical frame 0 into this sequence over frames 1..N.
   * Frame 0 remains the exact shared boundary; later frames are composited
   * deterministically over it until opacity reaches one.
   */
  entranceBlendFrames?: number;
  reducedMotionFrame?: ReducedMotionFrame;
}

export interface SequenceCachePolicy {
  /** Encoded WebP/JPEG data retained in memory. */
  maxEncodedBytes: number;
  /** Decoded bitmap budget. A 1280 square RGBA frame is roughly 6.25 MiB. */
  maxDecodedBytes: number;
  /** Number of fetch/decode jobs allowed at once. */
  concurrency: number;
  /** Decoded frames kept around the currently requested frame. */
  decodeRadius: number;
  /** Encoded frames fetched around the currently requested frame. */
  networkRadius: number;
}

export interface CanvasQualityPolicy {
  maxDevicePixelRatio: number;
  /** Hard cap for backing-store pixels, independent of CSS viewport size. */
  maxCanvasPixels: number;
}

export type SequenceStatus =
  | "idle"
  | "loading"
  | "ready"
  | "degraded"
  | "error";

export interface SequenceStatusDetail {
  sequenceId: string;
  status: SequenceStatus;
  requestedFrame: number;
  renderedFrame: number | null;
  error?: Error;
}

export interface DecodedFrame {
  index: number;
  source: CanvasImageSource;
  width: number;
  height: number;
  estimatedBytes: number;
  release: () => void;
}
