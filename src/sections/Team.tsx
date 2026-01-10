import { useEffect, useRef } from 'react';
import { gsap, initGsap } from '../animation/gsap';
import { teamMembers } from '../content/teamData';
import { useI18n } from '../i18n/useI18n';
import styles from './Team.module.css';

export function Team() {
  const { t, lang } = useI18n();
  const rootRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const container = containerRef.current;
    if (!root || !container) return;

    initGsap();

    const cards = Array.from(container.querySelectorAll<HTMLElement>(`.${styles.card}`));
    
    const ctx = gsap.context(() => {
      cards.forEach((card) => {
        const photoWrapper = card.querySelector(`.${styles.photoWrapper}`);
        const textBack = card.querySelector(`.${styles.textBack}`);
        const textFront = card.querySelector(`.${styles.textFront}`);

        // Initial state for the "fly-in" and "reveal" effect
        gsap.set(card, { opacity: 0, scale: 0.9, y: 100 });
        gsap.set(textBack, { z: -150, opacity: 0 });
        gsap.set(textFront, { z: 150, opacity: 0 });

        // Entrance animation
        const entranceTl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            end: 'top 20%',
            toggleActions: 'play reverse play reverse',
          }
        });

        entranceTl.to(card, { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          duration: 1.2, 
          ease: 'expo.out' 
        });

        // The "text behind to front" effect based on scroll progress
        const revealTl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: 'top 60%',
            end: 'top 30%',
            scrub: 1,
          }
        });

        revealTl
          .to(textBack, { opacity: 0.2, z: -50, duration: 1 })
          .to(textFront, { opacity: 1, z: 50, duration: 1 }, '<');

        // Mouse hover interaction for 3D tilt
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const xc = rect.width / 2;
          const yc = rect.height / 2;
          const dx = x - xc;
          const dy = y - yc;

          gsap.to(photoWrapper, {
            rotationY: dx / 15,
            rotationX: -dy / 15,
            x: dx / 25,
            y: dy / 25,
            duration: 0.5,
            ease: 'power2.out'
          });

          gsap.to(textBack, {
            x: -dx / 10,
            y: -dy / 10,
            duration: 0.5,
            ease: 'power2.out'
          });
        });

        card.addEventListener('mouseleave', () => {
          gsap.to([photoWrapper, textBack], {
            rotationY: 0,
            rotationX: 0,
            x: 0,
            y: 0,
            duration: 0.8,
            ease: 'power2.out'
          });
        });
      });
    }, root);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section id="team" ref={rootRef} className={styles.root} aria-label="Team">
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>{t.team.title}</h2>
            <p className={styles.subtitle}>Команда проекта / Project Team</p>
          </div>
          <div className={styles.chip}>Scroll to Explore</div>
        </header>

        <div ref={containerRef} className={styles.grid}>
          {teamMembers.map((m) => (
            <div key={m.id} className={styles.card}>
              <div className={styles.textBack} aria-hidden="true">
                {m.name.split(' ').map((word, i) => (
                  <span key={i}>{word}<br /></span>
                ))}
              </div>
              
              <div className={styles.photoWrapper}>
                <img
                  className={styles.photo}
                  src={m.photoSrc}
                  alt={m.name}
                  loading="lazy"
                />
              </div>

              <div className={styles.textFront}>
                <div className={styles.textContent}>
                  <h3 className={styles.name}>{m.name}</h3>
                  <div className={styles.divider} />
                  <p className={styles.blurb}>
                    {lang === 'ru' ? m.blurbRu : m.blurbEn}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


