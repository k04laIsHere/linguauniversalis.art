import { useRef } from 'react';
import styles from './NatureBackdrop.module.css';

export function NatureBackdrop() {
  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <div id="natureBackdrop" ref={ref} className={styles.root} aria-hidden="true">
      <div className={styles.veil} />
    </div>
  );
}


