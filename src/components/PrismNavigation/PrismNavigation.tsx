import { useViewMode } from '../../contexts/ViewModeContext';
import styles from './PrismNavigation.module.css';

interface PrismNavigationProps {
  onWander: () => void;
}

export function PrismNavigation({ onWander }: PrismNavigationProps) {
  const { setMode } = useViewMode();

  const handleCurate = () => {
    setMode('gallery');
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {/* Left: Wander - Nature/Forest Preview */}
        <button
          className={`${styles.panel} ${styles.wanderPanel}`}
          onClick={onWander}
          aria-label="Continue immersive journey through nature"
        >
          <div className={styles.preview}></div>
          <div className={styles.content}>
            <h2 className={styles.title}>Wander</h2>
            <p className={styles.subtitle}>Continue the journey</p>
          </div>
        </button>

        {/* Right: Curate - White Gallery Preview */}
        <button
          className={`${styles.panel} ${styles.curatePanel}`}
          onClick={handleCurate}
          aria-label="Switch to gallery mode"
        >
          <div className={styles.preview}></div>
          <div className={styles.content}>
            <h2 className={styles.title}>Curate</h2>
            <p className={styles.subtitle}>View the collection</p>
          </div>
        </button>
      </div>

      <div className={styles.hint}>
        Choose your path
      </div>
    </div>
  );
}
