import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { GalleryWork } from '../../content/galleryManifest';
import { useI18n } from '../../i18n/useI18n';
import styles from './GalleryLightbox.module.css';

export function GalleryLightbox({
  isOpen,
  work,
  onClose,
  onPrev,
  onNext,
}: {
  isOpen: boolean;
  work: GalleryWork | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { t, lang } = useI18n();
  const [displayWork, setDisplayWork] = useState<GalleryWork | null>(work);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const transitionRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (work && work.id !== displayWork?.id) {
      if (!displayWork) {
        setDisplayWork(work);
        return;
      }

      if (transitionRef.current) {
        transitionRef.current.kill();
      }

      const tl = gsap.timeline({
        onComplete: () => {
          setDisplayWork(work);
          // Small delay to ensure the new image has swapped in before animating in
          requestAnimationFrame(() => {
            transitionRef.current = gsap.timeline()
              .fromTo(imgRef.current, 
                { y: 100, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
              );
          });
        }
      });

      transitionRef.current = tl;

      tl.to(imgRef.current, {
        y: -100,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.in'
      });
    }
  }, [work, displayWork?.id]);

  useEffect(() => {
    if (!isOpen) {
      setDisplayWork(null);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, onPrev, onNext]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    const prevHeight = document.body.style.height;
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    return () => {
      document.body.style.overflow = prev;
      document.body.style.height = prevHeight;
    };
  }, [isOpen]);

  if (!isOpen || !displayWork) return null;

  const displayTitle = lang === 'ru' ? displayWork.titleRu : displayWork.titleEn;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div className={styles.dialog} onMouseDown={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} type="button" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className={styles.stage} ref={containerRef}>
          <div className={styles.imgWrapper}>
            <img 
              ref={imgRef}
              key={displayWork.id}
              className={styles.img} 
              src={displayWork.src} 
              alt={`${displayWork.artist} — ${displayTitle}`} 
            />
          </div>
        </div>

        <div className={styles.info}>
          <div className={styles.artist}>{displayWork.artist}</div>
          <div className={styles.title}>{displayTitle}</div>
          <div className={styles.details}>
            {displayWork.year && <span>{displayWork.year}</span>}
            {displayWork.medium && <span>{displayWork.medium}</span>}
            {displayWork.size && <span>{displayWork.size}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
