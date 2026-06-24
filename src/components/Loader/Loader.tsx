import { useEffect, useState, useRef } from "react";
import { useViewMode } from "../../contexts/ViewModeContext";
import { teamMembers } from "../../content/teamData";
import { events } from "../../content/eventsData";
import { gsap } from "gsap";
import styles from "./Loader.module.css";

const ASSETS_TO_LOAD = [
  "/assets/videos/background_video_frames/background_video_000048.webp",
  "/assets/images/backgrounds/cave-wall-texture.jpg",
  "/assets/images/backgrounds/skyscraper-rooftop.jpg",
  "/assets/images/backgrounds/cave-exit-landscape.webp",
  "/assets/images/backgrounds/cave-arch-mask.png",
  "/assets/images/backgrounds/archive-breach.webp",
  ...teamMembers.map((m) => m.photoSrc),
  ...events.flatMap((e) => e.images),
  ...Array.from({ length: 4 }, (_, i) => `/assets/art/art-${i + 1}.jpg`),
];

export function Loader({ onLoaded }: { onLoaded: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const { setMode } = useViewMode();
  const cleanupRefs = useRef<(() => void)[]>([]);

  const handleSelectMode = (mode: "immersive" | "gallery") => {
    setMode(mode);
    setIsDone(true);
    // Notify App that the threshold is passed
    setTimeout(onLoaded, 800);
  };

  useEffect(() => {
    // Prevent default scroll behavior
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

    // Lock scroll while loading
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.touchAction = "none";

    // Modern way to prevent scroll on wheel and touch
    window.addEventListener("wheel", preventDefault, { passive: false });
    window.addEventListener("touchmove", preventDefault, { passive: false });
    window.addEventListener("keydown", preventKeys, { passive: false });

    // Store cleanup function in ref so it can be called explicitly when isDone
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
    const totalCount = ASSETS_TO_LOAD.length;

    const updateProgress = () => {
      loadedCount++;
      const p = Math.floor((loadedCount / totalCount) * 100);
      setProgress(p);

      if (loadedCount === totalCount) {
        setTimeout(() => {
          handleSelectMode("gallery");
        }, 500);
      }
    };

    if (totalCount === 0) {
      setProgress(100);
      handleSelectMode("gallery");
    } else {
      ASSETS_TO_LOAD.forEach((src) => {
        const img = new Image();
        img.src = src;
        if (img.complete) {
          updateProgress();
        } else {
          img.onload = updateProgress;
          img.onerror = updateProgress;
        }
      });
    }

    return () => {
      // Run all stored cleanups on unmount
      cleanupRefs.current.forEach((fn) => fn());
      cleanupRefs.current = [];
    };
  }, []);

  useEffect(() => {
    if (isDone) {
      // Component doesn't unmount, so we must clean up manually here
      cleanupRefs.current.forEach((fn) => fn());
      cleanupRefs.current = [];
      
      gsap.to(`.${styles.root}`, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        pointerEvents: "none",
      });
    }
  }, [isDone]);

  return (
    <div className={`${styles.root} ${isDone ? styles.rootHidden : ''}`}>
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
