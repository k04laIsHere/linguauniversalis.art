import { useEffect, useState } from 'react';
import { useViewMode } from '../../contexts/ViewModeContext';
import { teamMembers } from '../../content/teamData';
import { events } from '../../content/eventsData';
import { gsap } from 'gsap';
import styles from './Loader.module.css';

const ASSETS_TO_LOAD = [
  '/assets/videos/background_video_frames/background_video_000048.webp',
  '/assets/images/backgrounds/cave-wall-texture.jpg',
  '/assets/images/backgrounds/skyscraper-rooftop.jpg',
  '/assets/images/backgrounds/cave-exit-landscape.webp',
  '/assets/images/backgrounds/cave-arch-mask.png',
  '/assets/images/backgrounds/archive-breach.webp',
  ...teamMembers.map(m => m.photoSrc),
  ...events.flatMap(e => e.images),
  ...Array.from({ length: 4 }, (_, i) => `/assets/art/art-${i + 1}.jpg`)
];

export function Loader({ onLoaded }: { onLoaded: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const { setMode } = useViewMode();

  const handleSelectMode = (mode: 'immersive' | 'gallery') => {
    setMode(mode);
    setIsDone(true);
    // Notify App that the threshold is passed
    setTimeout(onLoaded, 800);
  };

  useEffect(() => {
    // Lock scroll while loading
    document.body.style.overflow = 'hidden';
    
    let loadedCount = 0;
    const totalCount = ASSETS_TO_LOAD.length;

    const updateProgress = () => {
      loadedCount++;
      const p = Math.floor((loadedCount / totalCount) * 100);
      setProgress(p);

      if (loadedCount === totalCount) {
        setTimeout(() => {
          handleSelectMode('gallery');
        }, 500);
      }
    };

    if (totalCount === 0) {
      setProgress(100);
      handleSelectMode('gallery');
      return;
    }

    ASSETS_TO_LOAD.forEach(src => {
      const img = new Image();
      img.src = src;
      if (img.complete) {
        updateProgress();
      } else {
        img.onload = updateProgress;
        img.onerror = updateProgress;
      }
    });

    return () => {
      // Cleanup: ensure overflow is restored if component unmounts unexpectedly
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (isDone) {
      // Restore scroll when loading is finished
      document.body.style.overflow = '';
      
      gsap.to(`.${styles.root}`, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',
        pointerEvents: 'none'
      });
    }
  }, [isDone]);

  return (
    <div className={`${styles.root} ${isDone ? styles.rootHidden : ''}`}>
      <div className={styles.content}>
        <div className={styles.brand}>
          <div className={styles.brandTitle}>Lingua Universalis</div>
          <div className={styles.brandHint}>Искусство Творения / Art of Creation</div>
        </div>
        
        <div className={styles.progressContainer}>
          <div className={styles.progressBar} style={{ width: `${progress}%` }} />
          <div className={styles.progressText}>{progress}%</div>
        </div>

        <div className={styles.loadingPulse} />
      </div>
    </div>
  );
}
