import { useEffect, useMemo, useRef, useState } from 'react';
import { contactData } from '../content/contactData';
import { useI18n } from '../i18n/useI18n';
import styles from './Contact.module.css';

export function Contact() {
  const { t } = useI18n();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const reduced = useMemo(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false,
    [],
  );

  const HOLD_MS = reduced ? 200 : 650;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty('--p', String(progress));
  }, [progress]);

  useEffect(() => {
    if (!copied) return;
    const to = window.setTimeout(() => setCopied(null), 1200);
    return () => window.clearTimeout(to);
  }, [copied]);

  const stop = (snapBackIfNotRevealed = false) => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    startRef.current = null;
    if (snapBackIfNotRevealed && !revealed) setProgress((p) => Math.min(p, 0.12));
  };

  const tick = (now: number) => {
    const start = startRef.current ?? now;
    startRef.current = start;
    const p = Math.min(1, (now - start) / HOLD_MS);
    setProgress(p);
    if (p >= 1) {
      setRevealed(true);
      stop(false);
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const begin = () => {
    if (revealed) return;
    if (rafRef.current != null) return;
    startRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
  };

  const copy = async (key: 'email' | 'telegram', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
    } catch {
      // Fallback: try selection
      try {
        window.prompt(t.contact.copy, value);
      } catch {
        // ignore
      }
    }
  };

  const email = contactData.email;
  const telegram = `@${contactData.telegramHandle}`;
  const telegramUrl = `https://t.me/${encodeURIComponent(contactData.telegramHandle)}`;

  return (
    <section id="contact" className={styles.root} aria-label="Contact">
      <div className={styles.inner}>
        <h2 className={styles.title}>{t.contact.title}</h2>
        <p className={styles.lede}>{t.contact.hint}</p>

        <div ref={stageRef} className={styles.stage}>
          <button
            type="button"
            className={styles.signalBtn}
            onPointerDown={begin}
            onPointerUp={() => stop(true)}
            onPointerCancel={() => stop(true)}
            onPointerLeave={() => stop(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setRevealed((v) => {
                  const next = !v;
                  setProgress(next ? 1 : 0);
                  return next;
                });
              }
            }}
            aria-label={t.contact.hint}
          >
            <div className={styles.spark} aria-hidden="true" />
            <p className={styles.signalTitle}>{t.contact.title}</p>
            <p className={styles.signalHint}>{revealed ? t.contact.revealedHint : t.contact.hint}</p>
          </button>

          <div className={`${styles.channels} ${revealed ? styles.channelsVisible : ''}`}>
            <div className={styles.card} aria-label={t.contact.emailLabel}>
              <div className={styles.cardTop}>
                <div className={styles.label}>{t.contact.emailLabel}</div>
                <div className={styles.value} title={email}>
                  {email}
                </div>
              </div>
              <div className={styles.actions}>
                <a className={`${styles.btn} ${styles.btnPrimary}`} href={`mailto:${email}`}>
                  {t.contact.mail}
                </a>
                <button className={styles.btn} type="button" onClick={() => copy('email', email)}>
                  {copied === 'email' ? t.contact.copied : t.contact.copy}
                </button>
              </div>
            </div>

            <div className={styles.card} aria-label={t.contact.telegramLabel}>
              <div className={styles.cardTop}>
                <div className={styles.label}>{t.contact.telegramLabel}</div>
                <div className={styles.value} title={telegram}>
                  {telegram}
                </div>
              </div>
              <div className={styles.actions}>
                <a className={`${styles.btn} ${styles.btnPrimary}`} href={telegramUrl} target="_blank" rel="noreferrer">
                  {t.contact.open}
                </a>
                <button className={styles.btn} type="button" onClick={() => copy('telegram', telegram)}>
                  {copied === 'telegram' ? t.contact.copied : t.contact.copy}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


