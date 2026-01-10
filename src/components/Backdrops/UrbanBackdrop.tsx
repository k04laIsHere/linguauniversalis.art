import { useRef } from 'react';
import styles from './UrbanBackdrop.module.css';

export function UrbanBackdrop() {
  const ref = useRef<HTMLDivElement | null>(null);

  return <div id="urbanBackdrop" ref={ref} className={styles.root} aria-hidden="true" />;
}


