import type { CanvasQualityPolicy, SequenceCachePolicy } from "./types";

const MEBIBYTE = 1024 * 1024;

export function defaultCachePolicy(): SequenceCachePolicy {
  const narrow =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 760px)").matches;

  return narrow
    ? {
        maxEncodedBytes: 256 * MEBIBYTE,
        maxDecodedBytes: 1024 * MEBIBYTE,
        concurrency: 10,
        decodeRadius: 12,
        networkRadius: 64,
      }
    : {
        maxEncodedBytes: 512 * MEBIBYTE,
        maxDecodedBytes: 2048 * MEBIBYTE,
        concurrency: 16,
        decodeRadius: 24,
        networkRadius: 128,
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
