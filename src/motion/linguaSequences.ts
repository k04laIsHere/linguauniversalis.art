import { defaultCachePolicy } from "./defaults";
import { FrameLoadLimiter, FrameRepository } from "./FrameRepository";
import { SequenceRepositoryPool } from "./SequenceRepositoryPool";
import type { FrameSequenceDefinition } from "./types";

const frameUrl = (folder: string) => (index: number) =>
  `/assets/videos/${folder}/frame_${index.toString().padStart(3, "0")}.webp`;

export const NATURE_TO_SKY: FrameSequenceDefinition = {
  id: "nature-to-sky",
  frameCount: 121,
  frameUrl: frameUrl("nature_to_sky_frames"),
  focus: { x: 0.5, y: 0.15 },
  fallbackUrl: "/assets/videos/nature_to_sky_frames/frame_000.webp",
  reducedMotionFrame: "end",
};

const natureSkyBoundary = NATURE_TO_SKY.frameUrl(
  NATURE_TO_SKY.frameCount - 1,
);
const skyToCityFrame = frameUrl("sky_to_city_frames");

export const SKY_TO_CITY: FrameSequenceDefinition = {
  id: "sky-to-city",
  frameCount: 172,
  // Reuse the exact Nature exit asset. Frames 1..6 reconcile into the second
  // source sequence in the canvas renderer, so the shared Sky hold cannot pop.
  frameUrl: (index) => index === 0 ? natureSkyBoundary : skyToCityFrame(index),
  focus: { x: 0.5, y: 0.5 },
  entranceFocus: NATURE_TO_SKY.focus,
  fallbackUrl: natureSkyBoundary,
  entranceBlendFrames: 6,
  reducedMotionFrame: "end",
};

export const IMMERSION_SEQUENCES: readonly FrameSequenceDefinition[] = [
  NATURE_TO_SKY,
  SKY_TO_CITY,
];

let sharedPool: SequenceRepositoryPool<FrameRepository> | null = null;
let sharedLimiter: FrameLoadLimiter | null = null;

export function getSharedSequenceRepositoryPool(): SequenceRepositoryPool<FrameRepository> {
  if (!sharedPool) {
    const policy = defaultCachePolicy();
    sharedLimiter ??= new FrameLoadLimiter(policy.concurrency);
    const limiter = sharedLimiter;
    sharedPool = new SequenceRepositoryPool(
      (definition) => new FrameRepository(definition, policy, limiter),
      (repository) => repository.dispose(),
    );
  }
  return sharedPool;
}

export function areImmersionSequencesLoaded(): boolean {
  const pool = getSharedSequenceRepositoryPool();
  return IMMERSION_SEQUENCES.every((seq) =>
    pool.prewarm(seq).repository.isFullyLoaded(),
  );
}

export async function preloadImmersionSequences(
  onFrameLoaded?: () => void,
): Promise<void> {
  const pool = getSharedSequenceRepositoryPool();
  await Promise.all(
    IMMERSION_SEQUENCES.map((seq) =>
      pool.prewarm(seq).repository.preloadAll(onFrameLoaded),
    ),
  );
}
