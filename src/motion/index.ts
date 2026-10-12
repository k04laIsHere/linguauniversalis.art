export { ImmersionMotionStage } from "./ImmersionMotionStage";
export {
  IMMERSION_SEQUENCES,
  NATURE_TO_SKY,
  SKY_TO_CITY,
  areImmersionSequencesLoaded,
  getSharedSequenceRepositoryPool,
  preloadImmersionSequences,
} from "./linguaSequences";
export {
  routeSequencePrewarm,
  SequenceRepositoryPool,
} from "./SequenceRepositoryPool";
export type {
  SequenceRepositoryActivation,
  SequenceRepositoryEntry,
  VisibleSequenceSnapshot,
} from "./SequenceRepositoryPool";
export { commitOrDeferSequenceProgress, type ProgressDelivery } from "./activation";
export {
  SequenceCanvas,
  type SequenceCanvasHandle,
  type SequenceCanvasProps,
} from "./SequenceCanvas";
export {
  useElementScrollProgress,
  useProximityPrewarm,
  useSequenceSceneController,
} from "./useElementScrollProgress";
export type {
  SequenceSceneBinding,
  SequenceSceneSelection,
} from "./useElementScrollProgress";
export {
  clamp,
  clamp01,
  computeBackingStore,
  continuousSceneState,
  coverSourceRect,
  elementScrollProgress,
  entranceBlendOpacity,
  frameIndexForProgress,
  frameWindow,
  sequenceFocusForFrame,
  selectActiveSequenceScene,
} from "./math";
export type { ContinuousScenePhase, ContinuousSceneState } from "./math";
export type {
  CanvasQualityPolicy,
  CropFocus,
  FrameSequenceDefinition,
  MotionPreference,
  ReducedMotionFrame,
  SequenceCachePolicy,
  SequenceStatus,
  SequenceStatusDetail,
} from "./types";
