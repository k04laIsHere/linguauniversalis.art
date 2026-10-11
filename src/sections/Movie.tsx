import { useState } from 'react';
import { useViewMode } from '../contexts/ViewModeContext';
import { useI18n } from '../i18n/useI18n';
import styles from './Movie.module.css';

const movieTitles = {
  ru: 'Lingua Universalis. Искусство творения. Фильм.',
  en: 'Lingua Universalis. The art of creation. The film.',
  es: 'Lingua Universalis. El arte de la creación. La película.',
} as const;

const playLabels = {
  ru: 'Смотреть фильм',
  en: 'Watch the film',
  es: 'Ver la película',
} as const;

export function Movie() {
  const { lang } = useI18n();
  const { mode } = useViewMode();
  const [isPlaying, setIsPlaying] = useState(false);

  const isRu = lang === 'ru';
  const ccLang = isRu ? 'ru' : 'en';
  const videoSrc = `https://www.youtube-nocookie.com/embed/bugdiiVDZCc?autoplay=1&cc_load_policy=1&cc_lang_pref=${ccLang}&hl=${ccLang}`;

  return (
    <section
      id="movie"
      className={`${styles.movieSection} ${mode === 'gallery' ? styles.galleryMode : ''}`}
    >
      <h2 className={styles.movieTitle}>{movieTitles[lang]}</h2>
      <div className={styles.videoWrapper}>
        {isPlaying ? (
          <iframe
            src={videoSrc}
            className={styles.videoFrame}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            title={movieTitles[lang]}
          />
        ) : (
          <button
            type="button"
            className={styles.posterButton}
            onClick={() => setIsPlaying(true)}
            aria-label={`${playLabels[lang]}: ${movieTitles[lang]}`}
          >
            <img
              src="/assets/images/backgrounds/movie-poster.jpg"
              alt={movieTitles[lang]}
              className={styles.posterImage}
              loading="lazy"
              decoding="async"
            />
            <span className={styles.playOverlay} aria-hidden="true">
              <span className={styles.playIcon}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
    </section>
  );
}
