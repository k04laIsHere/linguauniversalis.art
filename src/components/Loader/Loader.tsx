import { useEffect, useState, useRef } from "react";
import { teamMembers } from "../../content/teamData";
import { events } from "../../content/eventsData";
import {
  IMMERSION_SEQUENCES,
  preloadImmersionSequences,
} from "../../motion";
import { gsap } from "gsap";
import styles from "./Loader.module.css";

const STATIC_IMMERSION_ASSETS = [
  "/assets/images/backgrounds/cave-wall-texture.jpg",
  "/assets/images/backgrounds/archiveEntrance3.webp",
  ...teamMembers.map((m) => m.photoSrc),
  ...events.flatMap((e) => e.images),
  ...Array.from({ length: 4 }, (_, i) => `/assets/art/art-${i + 1}.jpg`),
];

const TOTAL_SEQUENCE_FRAMES = IMMERSION_SEQUENCES.reduce(
  (sum, seq) => sum + seq.frameCount,
  0,
);

export function Loader({ onLoaded }: { onLoaded: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cleanupRefs = useRef<(() => void)[]>([]);
  const onLoadedRef = useRef(onLoaded);

  useEffect(() => {
    onLoadedRef.current = onLoaded;
  }, [onLoaded]);

  useEffect(() => {
    let cancelled = false;

    // Prevent default scroll behavior while loading
    const preventDefault = (e: Event) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      if (
        [
          "Space",
          "ArrowUp",
          "ArrowDown",
          "PageUp",
          "PageDown",
          "Home",
          "End",
        ].includes(e.code)
      ) {
        e.preventDefault();
      }
    };

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.touchAction = "none";

    window.addEventListener("wheel", preventDefault, { passive: false });
    window.addEventListener("touchmove", preventDefault, { passive: false });
    window.addEventListener("keydown", preventKeys, { passive: false });

    const cleanup = () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.documentElement.style.overflow = "";
      document.documentElement.style.touchAction = "";
      window.removeEventListener("wheel", preventDefault);
      window.removeEventListener("touchmove", preventDefault);
      window.removeEventListener("keydown", preventKeys);
    };
    cleanupRefs.current.push(cleanup);

    let loadedCount = 0;
    const totalCount = TOTAL_SEQUENCE_FRAMES + STATIC_IMMERSION_ASSETS.length;
    let finished = false;

    const completeLoading = () => {
      if (cancelled || finished) return;
      finished = true;
      setProgress(100);
      setTimeout(() => {
        if (cancelled) return;
        setIsDone(true);
        setTimeout(() => {
          if (!cancelled) onLoadedRef.current();
        }, 650);
      }, 250);
    };

    const updateProgress = () => {
      if (cancelled || finished) return;
      loadedCount += 1;
      const p = Math.min(100, Math.floor((loadedCount / totalCount) * 100));
      setProgress(p);

      if (loadedCount >= totalCount) {
        completeLoading();
      }
    };

    const loadStaticAsset = (src: string): Promise<void> =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          updateProgress();
          resolve();
        };
        img.onload = () => {
          if (typeof img.decode === "function") {
            img.decode().then(done, done);
          } else {
            done();
          }
        };
        img.onerror = done;
        img.src = src;
        if (img.complete && img.naturalWidth > 0) {
          if (typeof img.decode === "function") {
            img.decode().then(done, done);
          } else {
            done();
          }
        }
      });

    if (totalCount === 0) {
      completeLoading();
    } else {
      void Promise.all([
        preloadImmersionSequences(updateProgress),
        ...STATIC_IMMERSION_ASSETS.map(loadStaticAsset),
      ]).then(() => {
        completeLoading();
      });
    }

    return () => {
      cancelled = true;
      cleanupRefs.current.forEach((fn) => fn());
      cleanupRefs.current = [];
    };
  }, []);

  useEffect(() => {
    if (isDone) {
      cleanupRefs.current.forEach((fn) => fn());
      cleanupRefs.current = [];

      if (rootRef.current) {
        gsap.to(rootRef.current, {
          opacity: 0,
          duration: 0.65,
          ease: "power2.inOut",
          pointerEvents: "none",
        });
      }
    }
  }, [isDone]);

  return (
    <div
      ref={rootRef}
      className={`${styles.root} ${isDone ? styles.rootHidden : ""}`}
    >
      <div className={styles.content}>
        <div className={styles.brand}>
          <div className={styles.brandTitle}>Lingua Universalis</div>
          <div className={styles.brandHint}>
            Искусство Творения / Art of Creation
          </div>
        </div>

        <div className={styles.progressContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          />
          <div className={styles.progressText}>{progress}%</div>
        </div>

        <div className={styles.loadingPulse} />
      </div>
    </div>
  );
}
