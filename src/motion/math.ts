import type { CropFocus, FrameSequenceDefinition } from "./types";

export interface SourceRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export interface BackingStoreSize {
  width: number;
  height: number;
  effectiveDpr: number;
}

export type ContinuousScenePhase = "approach" | "pinned" | "released";

export interface ContinuousSceneState {
  phase: ContinuousScenePhase;
  progress: number;
  pinTravel: number;
  pinOffset: number;
  /** Document-attached entrance offset for the shared fixed canvas. */
  portalOffset: number;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clamp01(value: number): number {
  return clamp(Number.isFinite(value) ? value : 0, 0, 1);
}

export function frameIndexForProgress(
  progress: number,
  frameCount: number,
): number {
  if (!Number.isInteger(frameCount) || frameCount < 1) {
    throw new RangeError("frameCount must be a positive integer");
  }

  return Math.round(clamp01(progress) * (frameCount - 1));
}

export function entranceBlendOpacity(
  frameIndex: number,
  entranceBlendFrames = 0,
): number {
  const blendFrames = Math.max(0, Math.floor(entranceBlendFrames));
  if (blendFrames === 0 || frameIndex <= 0) return frameIndex <= 0 ? 0 : 1;
  return clamp01(frameIndex / blendFrames);
}

export function sequenceFocusForFrame(
  definition: FrameSequenceDefinition,
  frameIndex: number,
): CropFocus {
  const focus = definition.focus ?? { x: 0.5, y: 0.5 };
  const entranceFocus = definition.entranceFocus;
  if (!entranceFocus || (definition.entranceBlendFrames ?? 0) < 1) {
    return focus;
  }

  const amount = entranceBlendOpacity(
    frameIndex,
    definition.entranceBlendFrames,
  );
  return {
    x: entranceFocus.x + (focus.x - entranceFocus.x) * amount,
    y: entranceFocus.y + (focus.y - entranceFocus.y) * amount,
  };
}

export function frameWindow(
  target: number,
  radius: number,
  frameCount: number,
  direction = 1,
): number[] {
  if (!Number.isInteger(frameCount) || frameCount < 1) {
    throw new RangeError("frameCount must be a positive integer");
  }

  const center = Math.round(clamp(target, 0, frameCount - 1));
  const distanceLimit = Math.max(0, Math.floor(radius));
  const step = direction < 0 ? -1 : 1;
  const values = [center];
  for (let distance = 1; distance <= distanceLimit; distance += 1) {
    const forward = center + distance * step;
    const backward = center - distance * step;
    if (forward >= 0 && forward < frameCount) values.push(forward);
    if (backward >= 0 && backward < frameCount) values.push(backward);
  }
  return values;
}

/**
 * Returns the exact source crop for object-fit/background-size `cover`.
 * Drawing this source rectangle to the full canvas keeps endpoint frames and
 * animation frames on one geometry path.
 */
export function coverSourceRect(
  sourceWidth: number,
  sourceHeight: number,
  destinationWidth: number,
  destinationHeight: number,
  focus: CropFocus = { x: 0.5, y: 0.5 },
): SourceRect {
  if (
    sourceWidth <= 0 ||
    sourceHeight <= 0 ||
    destinationWidth <= 0 ||
    destinationHeight <= 0
  ) {
    throw new RangeError("source and destination dimensions must be positive");
  }

  const focalX = clamp01(focus.x);
  const focalY = clamp01(focus.y);
  const sourceAspect = sourceWidth / sourceHeight;
  const destinationAspect = destinationWidth / destinationHeight;

  if (sourceAspect > destinationAspect) {
    const sw = sourceHeight * destinationAspect;
    return {
      sx: (sourceWidth - sw) * focalX,
      sy: 0,
      sw,
      sh: sourceHeight,
    };
  }

  const sh = sourceWidth / destinationAspect;
  return {
    sx: 0,
    sy: (sourceHeight - sh) * focalY,
    sw: sourceWidth,
    sh,
  };
}

export function computeBackingStore(
  cssWidth: number,
  cssHeight: number,
  requestedDpr: number,
  maxDpr: number,
  maxPixels: number,
): BackingStoreSize {
  if (cssWidth <= 0 || cssHeight <= 0 || maxPixels < 1) {
    throw new RangeError("canvas dimensions and maxPixels must be positive");
  }

  const safeRequestedDpr = Math.max(1, requestedDpr || 1);
  const dprByPixelBudget = Math.sqrt(maxPixels / (cssWidth * cssHeight));
  const effectiveDpr = Math.max(
    1,
    Math.min(safeRequestedDpr, Math.max(1, maxDpr), dprByPixelBudget),
  );

  return {
    width: Math.max(1, Math.round(cssWidth * effectiveDpr)),
    height: Math.max(1, Math.round(cssHeight * effectiveDpr)),
    effectiveDpr,
  };
}

export function elementScrollProgress(
  elementTop: number,
  elementHeight: number,
  viewportHeight: number,
): number {
  return continuousSceneState(
    elementTop,
    elementHeight,
    viewportHeight,
  ).progress;
}

/**
 * Models a continuous scene whose first viewport approaches in normal flow,
 * pins at top: 0 for its declared travel, and releases on the exact endpoint.
 */
export function continuousSceneState(
  elementTop: number,
  elementHeight: number,
  viewportHeight: number,
): ContinuousSceneState {
  if (elementHeight <= 0 || viewportHeight <= 0) {
    throw new RangeError("scene and viewport heights must be positive");
  }

  const pinTravel = Math.max(1, elementHeight - viewportHeight);
  const pinOffset = elementTop === 0 ? 0 : -elementTop;
  if (pinOffset < 0) {
    return {
      phase: "approach",
      progress: 0,
      pinTravel,
      pinOffset,
      portalOffset: Math.min(viewportHeight, elementTop),
    };
  }
  if (pinOffset >= pinTravel) {
    return {
      phase: "released",
      progress: 1,
      pinTravel,
      pinOffset,
      portalOffset: 0,
    };
  }
  return {
    phase: "pinned",
    progress: pinOffset / pinTravel,
    pinTravel,
    pinOffset,
    portalOffset: 0,
  };
}

export function selectActiveSequenceScene(
  states: readonly ContinuousSceneState[],
): number {
  if (states.length === 0) {
    throw new RangeError("at least one scene state is required");
  }

  for (let index = states.length - 1; index >= 0; index -= 1) {
    if (states[index]?.phase !== "approach") return index;
  }
  return 0;
}
