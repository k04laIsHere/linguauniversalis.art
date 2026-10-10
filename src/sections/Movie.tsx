import { useI18n } from '../i18n/useI18n';
import styles from './Movie.module.css';

export function Movie() {
  const { t, lang } = useI18n();

  const isRu = lang === 'ru';
  const ccLang = isRu ? 'ru' : 'en';
  const videoSrc = `https://www.youtube.com/embed/bugdiiVDZCc?si=aSMKeukfUgDUx4B_&cc_load_policy=1&cc_lang_pref=${ccLang}&hl=${ccLang}`;

  return (
    <section id="movie" className={styles.movieSection}>
      <span className={styles.movieLabel}>{t.header.movie}</span>
      <h2 className={styles.movieTitle}>Lingua Universalis</h2>
      <div className={styles.videoWrapper}>
        <iframe
          src={videoSrc}
          className={styles.videoFrame}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          title="Lingua Universalis Movie"
        />
      </div>
    </section>
  );
}
