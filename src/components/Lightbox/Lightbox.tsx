import { useEffect } from 'react';
import styles from './Lightbox.module.css';

export function Lightbox({
  isOpen,
  title,
  src,
  alt,
  onClose,
}: {
  isOpen: boolean;
  title?: string;
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div className={styles.dialog} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.topbar}>
          <div className={styles.title}>{title ?? ''}</div>
          <button className={styles.btn} type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className={styles.media}>
          <img className={styles.img} src={src} alt={alt} />
        </div>
      </div>
    </div>
  );
}


