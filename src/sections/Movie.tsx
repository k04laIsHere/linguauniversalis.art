import { useViewMode } from '../contexts/ViewModeContext';
import { useI18n } from '../i18n/useI18n';
import styles from './Movie.module.css';

const movieTitles = {
  ru: 'Lingua Universalis. Искусство творения. Фильм.',
  en: 'Lingua Universalis. The art of creation. The film.',
  es: 'Lingua Universalis. El arte de la creación. La película.',
} as const;

export function Movie() {
  const { lang } = useI18n();
  const { mode } = useViewMode();

  const isRu = lang === 'ru';
  const ccLang = isRu ? 'ru' : 'en';
  const videoSrc = `https://www.youtube-nocookie.com/embed/bugdiiVDZCc?cc_load_policy=1&cc_lang_pref=${ccLang}&hl=${ccLang}`;

  return (
    <section
      id="movie"
      className={`${styles.movieSection} ${mode === 'gallery' ? styles.galleryMode : ''}`}
    >
      <h2 className={styles.movieTitle}>{movieTitles[lang]}</h2>
      <div className={styles.videoWrapper}>
        <iframe
          src={videoSrc}
          className={styles.videoFrame}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          title={movieTitles[lang]}
        />
      </div>
    </section>
  );
}
