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
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen || !displayWork) return null;

  const displayTitle = lang === 'ru' ? displayWork.titleRu : displayWork.titleEn;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div className={styles.dialog} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.topbar}>
          <div className={styles.meta}>
            <div className={styles.artist}>{displayWork.artist}</div>
            <div className={styles.title}>{displayTitle}</div>
          </div>
          <div className={styles.controls}>
            <button className={styles.btn} type="button" onClick={onPrev}>
              {t.gallery.lightboxPrev}
            </button>
            <button className={styles.btn} type="button" onClick={onNext}>
              {t.gallery.lightboxNext}
            </button>
            <button className={styles.btn} type="button" onClick={onClose}>
              {t.gallery.lightboxClose}
            </button>
          </div>
        </div>
        <div className={styles.stage} ref={containerRef}>
          <button className={`${styles.navBtn} ${styles.prev}`} type="button" onClick={onPrev}>
            ‹
          </button>
          <img 
            ref={imgRef}
            key={displayWork.id}
            className={styles.img} 
            src={displayWork.src} 
            alt={`${displayWork.artist} — ${displayTitle}`} 
          />
          <button className={`${styles.navBtn} ${styles.next}`} type="button" onClick={onNext}>
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
