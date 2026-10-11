import type { CanvasQualityPolicy, SequenceCachePolicy } from "./types";

const MEBIBYTE = 1024 * 1024;

export function defaultCachePolicy(): SequenceCachePolicy {
  const narrow =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 760px)").matches;

  return narrow
    ? {
        maxEncodedBytes: 36 * MEBIBYTE,
        // Leaves headroom for an inactive sequence's endpoint prewarm.
        maxDecodedBytes: 36 * MEBIBYTE,
        concurrency: 2,
        decodeRadius: 3,
        networkRadius: 16,
      }
    : {
        maxEncodedBytes: 48 * MEBIBYTE,
        // Leaves headroom for an inactive sequence's endpoint prewarm.
        maxDecodedBytes: 88 * MEBIBYTE,
        concurrency: 4,
        decodeRadius: 7,
        networkRadius: 32,
      };
}

export function defaultCanvasQuality(): CanvasQualityPolicy {
  const narrow =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 760px)").matches;

  return {
    maxDevicePixelRatio: narrow ? 1.75 : 2,
    maxCanvasPixels: narrow ? 3_000_000 : 4_000_000,
  };
}
