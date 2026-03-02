import { useEffect, useState, useRef } from 'react';
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
  ...teamMembers.map(m => m.photoSrc),
  ...events.flatMap(e => e.images),
  ...Array.from({ length: 4 }, (_, i) => `/assets/art/art-${i + 1}.jpg`)
];

export function Loader({ onLoaded }: { onLoaded: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showChoice, setShowChoice] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const { setMode } = useViewMode();
  const choiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let loadedCount = 0;
    const totalCount = ASSETS_TO_LOAD.length;

    const updateProgress = () => {
      loadedCount++;
      const p = Math.floor((loadedCount / totalCount) * 100);
      setProgress(p);

      if (loadedCount === totalCount) {
        setTimeout(() => {
          setIsLoaded(true);
          // Show choice after assets are ready
          setTimeout(() => setShowChoice(true), 600);
        }, 500);
      }
    };

    if (totalCount === 0) {
      setProgress(100);
      setIsLoaded(true);
      setShowChoice(true);
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
  }, []);

  const handleSelectMode = (mode: 'immersive' | 'gallery') => {
    setMode(mode);
    setIsDone(true);
    // Notify App that the threshold is passed
    setTimeout(onLoaded, 800);
  };

  // Handle scroll to auto-select immersive
  useEffect(() => {
    if (!showChoice || isDone) return;

    const handleScrollChoice = () => {
      if (window.scrollY > 20) {
        handleSelectMode('immersive');
        window.removeEventListener('scroll', handleScrollChoice);
      }
    };

    window.addEventListener('scroll', handleScrollChoice);
    return () => window.removeEventListener('scroll', handleScrollChoice);
  }, [showChoice, isDone]);

  useEffect(() => {
    if (isDone) {
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
      {/* 1. Loading Phase */}
      {!showChoice && (
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
      )}

      {/* 2. Choice Phase */}
      {showChoice && !isDone && (
        <div ref={choiceRef} className={styles.choiceOverlay}>
          <div className={styles.choiceSplit}>
            <div 
              className={styles.choiceCard} 
              onClick={() => handleSelectMode('immersive')}
            >
              <div 
                className={styles.choiceBg} 
                style={{ backgroundImage: 'url(/assets/images/backgrounds/cave-exit-landscape.webp)' }} 
              />
              <div className={styles.content}>
                <h2 className={styles.choiceTitle}>Journey</h2>
                <p className={styles.choiceDesc}>
                  Experience the narrative, symbols, and sensory path. A slow descent into the universal language.
                </p>
                <div className={styles.choiceAction}>Experience</div>
              </div>
            </div>
            <div 
              className={styles.choiceCard} 
              onClick={() => handleSelectMode('gallery')}
            >
              <div 
                className={styles.choiceBg} 
                style={{ backgroundImage: 'url(/assets/images/backgrounds/skyscraper-rooftop.jpg)' }} 
              />
              <div className={styles.choiceContent}>
                <h2 className={styles.choiceTitle}>Archive</h2>
                <p className={styles.choiceDesc}>
                  Direct access to the results. View the portfolio and curated artifacts.
                </p>
                <div className={styles.choiceAction}>View Works</div>
              </div>
            </div>
          </div>
          <div className={styles.choiceHint}>Scroll or select to begin</div>
        </div>
      )}
    </div>
  );
}

