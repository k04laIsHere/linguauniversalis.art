import { useEffect } from 'react';
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

  useEffect(() => {
    if (!isOpen) return;
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

  if (!isOpen || !work) return null;

  const displayTitle = lang === 'ru' ? work.titleRu : work.titleEn;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div className={styles.dialog} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.topbar}>
          <div className={styles.meta}>
            <div className={styles.artist}>{work.artist}</div>
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
        <div className={styles.stage}>
          <button className={`${styles.navBtn} ${styles.prev}`} type="button" onClick={onPrev}>
            ‹
          </button>
          <img className={styles.img} src={work.src} alt={`${work.artist} — ${displayTitle}`} />
          <button className={`${styles.navBtn} ${styles.next}`} type="button" onClick={onNext}>
            ›
          </button>
        </div>
      </div>
    </div>
  );
}


