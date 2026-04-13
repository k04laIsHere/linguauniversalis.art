import { useRef } from 'react';
import styles from './CityBackdrop.module.css';

export function CityBackdrop() {
  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <div id="cityBackdrop" ref={ref} className={styles.root} aria-hidden="true" />
  );
}
