import { forwardRef } from 'react';
import styles from './NatureUrbanPlaceholder.module.css';

export const NatureUrbanPlaceholder = forwardRef<HTMLElement>(function NatureUrbanPlaceholder(_props, ref) {
  return (
    <section id="natureUrban" ref={ref} className={styles.root} aria-label="Nature to Urban" />
  );
});

