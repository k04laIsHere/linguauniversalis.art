import { useRef, useState, useEffect } from 'react';
import { useI18n } from '../i18n/useI18n';
import styles from './Contact.module.css';
import { gsap } from '../animation/gsap';
import emailjs from '@emailjs/browser';

type SectionState = 'idle' | 'active' | 'sending' | 'success' | 'error';

export function Contact() {
  const { t } = useI18n();
  const [state, setState] = useState<SectionState>('idle');
  const stageRef = useRef<HTMLDivElement | null>(null);
  const coreRef = useRef<HTMLButtonElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleCoreClick = () => {
    if (state !== 'idle') return;
    
    setState('active');
    
    // GSAP Expansion Animation
    if (coreRef.current && stageRef.current) {
      const tl = gsap.timeline();
      tl.to(coreRef.current, {
        scale: 15,
        opacity: 0.1,
        duration: 0.8,
        ease: 'power2.inOut',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === 'sending') return;

    setState('sending');

    const formData = new FormData(e.currentTarget);
    const data = {
      from_name: formData.get('user_name'),
      user_email: formData.get('user_email'),
      message: formData.get('message'),
    };

    try {
      // NOTE: Go to https://www.emailjs.com/ to get these IDs
      // Target email (linguauniversalis@gmail.com) is configured in your EmailJS Template.
      // await emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', data, 'YOUR_PUBLIC_KEY');
      
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate delay
      setState('success');
      
      // Beam animation would trigger here
    } catch (err) {
      console.error('Signal transmission failed:', err);
      setState('error');
    }
  };

  const handleBack = () => {
    setState('idle');
    if (coreRef.current) {
      gsap.to(coreRef.current, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  };

  return (
    <section id="contact" className={styles.root} aria-label="Contact">
      <div className={styles.inner}>
        <div ref={stageRef} className={`${styles.stage} ${styles[state]}`}>
          {state === 'idle' && (
            <>
              <div className={styles.idleHeader}>
                <h2 className={styles.title}>{t.contact.title}</h2>
                <p className={styles.lede}>{t.contact.subtitle}</p>
              </div>
              <button
                ref={coreRef}
                type="button"
                className={styles.core}
                onClick={handleCoreClick}
                aria-label={t.contact.coreHint}
              >
                <div className={styles.coreInner} />
                <div className={styles.corePulse} />
                <span className={styles.coreText}>{t.contact.title}</span>
              </button>
            </>
          )}

          {(state === 'active' || state === 'sending' || state === 'error') && (
            <form 
              ref={formRef}
              className={styles.form} 
              onSubmit={handleSubmit}
            >
              <div className={styles.formHeader}>
                <h2 className={styles.title}>{t.contact.title}</h2>
                <p className={styles.lede}>{t.contact.subtitle}</p>
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="user_name">{t.contact.formName}</label>
                <input type="text" id="user_name" name="user_name" required placeholder="..." />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="user_email">{t.contact.formEmail}</label>
                <input type="email" id="user_email" name="user_email" required placeholder="..." />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="message">{t.contact.formMessage}</label>
                <textarea id="message" name="message" required rows={4} placeholder="..." />
              </div>
              
              <div className={styles.formActions}>
                <button type="submit" className={styles.submitBtn} disabled={state === 'sending'}>
                  {state === 'sending' ? t.contact.sending : t.contact.formSubmit}
                </button>
                <button type="button" className={styles.backBtn} onClick={handleBack}>
                  {t.contact.back}
                </button>
              </div>
              
              {state === 'error' && <p className={styles.errorMessage}>{t.contact.error}</p>}
            </form>
          )}

          {state === 'success' && (
            <div className={styles.successMessage}>
              <div className={styles.beam} />
              <p>{t.contact.success}</p>
              <button type="button" className={styles.backBtn} onClick={handleBack}>
                {t.contact.back}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
