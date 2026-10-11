"use client";

import { useEffect, useRef, type RefObject } from "react";
import {
  continuousSceneState,
  elementScrollProgress,
  selectActiveSequenceScene,
  type ContinuousSceneState,
} from "./math";
import type { FrameSequenceDefinition } from "./types";

export interface ElementScrollProgressOptions {
  enabled?: boolean;
  onProgress: (progress: number) => void;
}

export interface SequenceSceneBinding {
  targetRef: RefObject<HTMLElement | null>;
  sequence: FrameSequenceDefinition;
}

export interface SequenceSceneSelection {
  sceneIndex: number;
  sequence: FrameSequenceDefinition;
  state: ContinuousSceneState;
}

/**
 * Passive, rAF-coalesced scroll driver. It feeds the imperative canvas API so
 * scrubbing does not cause React to reconcile the page at scroll frequency.
 */
export function useElementScrollProgress(
  targetRef: RefObject<HTMLElement | null>,
  { enabled = true, onProgress }: ElementScrollProgressOptions,
): void {
  const onProgressRef = useRef(onProgress);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    if (!enabled) return;
    let raf: number | null = null;

    const update = () => {
      raf = null;
      const element = targetRef.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      onProgressRef.current(
        elementScrollProgress(rect.top, rect.height, viewportHeight),
      );
    };

    const schedule = () => {
      if (raf == null) raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.visualViewport?.addEventListener("resize", schedule);
    schedule();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [enabled, targetRef]);
}

export function useProximityPrewarm(
  targetRef: RefObject<HTMLElement | null>,
  onPrewarm: () => void,
  rootMargin = "150% 0px",
): void {
  const onPrewarmRef = useRef(onPrewarm);

  useEffect(() => {
    onPrewarmRef.current = onPrewarm;
  }, [onPrewarm]);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;
    let wasIntersecting = false;

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((entry) => entry.isIntersecting);
        if (isIntersecting && !wasIntersecting) onPrewarmRef.current();
        wasIntersecting = isIntersecting;
      },
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, targetRef]);
}

/**
 * Resolves an ordered set of passages in one rAF. Later pinned/released scenes
 * own the stage; an approaching scene cannot steal it before its top reaches 0.
 */
export function useSequenceSceneController(
  scenes: readonly SequenceSceneBinding[],
  onSelection: (selection: SequenceSceneSelection) => void,
  enabled = true,
): void {
  const onSelectionRef = useRef(onSelection);

  useEffect(() => {
    onSelectionRef.current = onSelection;
  }, [onSelection]);

  useEffect(() => {
    if (!enabled || scenes.length === 0) return;
    let raf: number | null = null;

    const update = () => {
      raf = null;
      const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
      const states: ContinuousSceneState[] = [];
      for (const scene of scenes) {
        const element = scene.targetRef.current;
        if (!element) return;
        const rect = element.getBoundingClientRect();
        states.push(
          continuousSceneState(rect.top, rect.height, viewportHeight),
        );
      }

      const sceneIndex = selectActiveSequenceScene(states);
      const scene = scenes[sceneIndex];
      const state = states[sceneIndex];
      if (!scene || !state) return;
      onSelectionRef.current({
        sceneIndex,
        sequence: scene.sequence,
        state,
      });
    };

    const schedule = () => {
      if (raf == null) raf = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.visualViewport?.addEventListener("resize", schedule);
    schedule();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.visualViewport?.removeEventListener("resize", schedule);
      if (raf != null) cancelAnimationFrame(raf);
    };
  }, [enabled, scenes]);
}
