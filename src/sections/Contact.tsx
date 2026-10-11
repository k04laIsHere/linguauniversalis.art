import { contactData } from '../content/contactData';
import { useViewMode } from '../contexts/ViewModeContext';
import { useI18n } from '../i18n/useI18n';
import styles from './Contact.module.css';

const correspondenceUi = {
  ru: 'Связаться с проектом',
  en: 'Project correspondence',
  es: 'Correspondencia del proyecto',
} as const;

export function Contact() {
  const { t, lang } = useI18n();
  const { mode } = useViewMode();

  const emailHref = `mailto:${contactData.email}`;

  if (mode === 'gallery') {
    return (
      <section id="contact" className={styles.archiveContact} aria-labelledby="contact-title">
        <span className={styles.sectionLabel}>05 · {t.header.contact}</span>
        <div className={styles.contactBody}>
          <div>
            <p className={styles.correspondence}>{correspondenceUi[lang]}</p>
            <h2 id="contact-title">{t.contact.title}</h2>
          </div>
          <p>{t.contact.subtitle}</p>
        </div>
        <div className={styles.contactLinks}>
          <a href={emailHref}>
            {contactData.email}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
        <footer className={styles.archiveFooter}>
          <span>Lingua Universalis</span>
          <span>{t.cave.subtitle}</span>
          <span>2024—2026</span>
        </footer>
      </section>
    );
  }

  return (
    <section id="contact" className={styles.signal} aria-labelledby="signal-title">
      <div className={styles.signalCore} aria-hidden="true">
        <span />
      </div>
      <div className={styles.signalContent}>
        <span className={styles.signalLabel}>07 · {t.header.contact}</span>
        <h2 id="signal-title" className={styles.signalTitle}>
          {t.contact.title}
        </h2>
        <p className={styles.signalSubtitle}>{t.contact.subtitle}</p>
        <a className={styles.signalLink} href={emailHref}>
          {contactData.email} ↗
        </a>
      </div>
    </section>
  );
}
