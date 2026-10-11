import { forwardRef } from 'react';
import styles from './ExitFlight.module.css';

export const ExitFlight = forwardRef<HTMLElement>(function ExitFlight(_props, ref) {
  return (
    <section id="exitFlight" ref={ref} className={styles.root} aria-label="Nature to Sky" />
  );
});

