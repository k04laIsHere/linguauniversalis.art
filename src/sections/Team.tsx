import { useEffect, useRef } from 'react';
import { gsap, initGsap } from '../animation/gsap';
import { teamMembers } from '../content/teamData';
import { useI18n } from '../i18n/useI18n';
import { scrollToId } from '../utils/scroll';
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
      // 1. Header Animations
      const header = root.querySelector(`.${styles.header}`);
      if (header) {
        gsap.from(header.querySelectorAll(`.${styles.title}, .${styles.subtitle}, .${styles.chip}`), {
          scrollTrigger: {
            trigger: header,
            start: 'top 65%', // Starts a bit earlier (closer to bottom)
            toggleActions: 'play reverse play reverse' // Plays backwards when scrolling up
          },
          scale: 0.6, // Starts from 60% scale
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: 'power3.out'
        });
      }

      // 2. Card Entrance Animations
      cards.forEach((card, index) => {
        const photoWrapper = card.querySelector(`.${styles.photoWrapper}`);
        const textBack = card.querySelector(`.${styles.textBack}`);
        const textFront = card.querySelector(`.${styles.textFront}`);
        
        // Ensure cards later in the grid have a higher z-index to stack naturally
        gsap.set(card, { zIndex: index + 1 });

        // Initial state for the fly-in
        gsap.set(card, { opacity: 0, scale: 0.1, z: -1000, y: 0 }); // Removed y: 150 to keep it centered
        gsap.set(textBack, { opacity: 0, z: -150 });
        gsap.set(textFront, { opacity: 0, z: 150, y: 0 }); 
        
        // Initial state for photo
        const photo = card.querySelector(`.${styles.photo}`);
        if (photo) gsap.set(photo, { scale: 1, z: 1 });

        // Triggered Entrance (Not Scrubbed)
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: index < 2 ? 'top bottom' : 'top 90%', // First row reveals immediately, others slightly later
            toggleActions: 'play reverse play reverse' // Plays backwards when scrolling up
          }
        });

        tl
          .to(card, { 
            opacity: 1, 
            scale: 1, 
            z: 0,
            y: 0,
            duration: 1.2,
            ease: 'power4.out',
            force3D: true
          }, 0)
          .to(textBack, { 
            opacity: 0.2, 
            z: -50, 
            duration: 0.8,
            ease: 'power2.out',
            force3D: true
          }, 0.2)
          .to(textFront, { 
            opacity: 1, 
            z: 150, 
            duration: 0.8,
            ease: 'power2.out',
            force3D: true
          }, 0.2);

        // Fly-out animation for last row stays separate as it triggers at the bottom
        const isLastRow = teamMembers.length % 2 === 0 
          ? index >= teamMembers.length - 2 
          : index >= teamMembers.length - 1;

        if (isLastRow) {
          gsap.timeline({
            scrollTrigger: {
              trigger: card,
              start: 'bottom 15%',
              end: 'bottom -30%',
              scrub: 1.5
            }
          })
          .to(card, {
            opacity: 0,
            scale: 1.5,
            z: 1000,
            y: -200,
            ease: 'none'
          });
        }

        // Mouse hover interaction
        let cardRect: DOMRect | null = null;

        card.addEventListener('mouseenter', () => {
          cardRect = card.getBoundingClientRect();
        });

        card.addEventListener('mousemove', (e) => {
          if (!cardRect) cardRect = card.getBoundingClientRect();
          
          const x = e.clientX - cardRect.left;
          const y = e.clientY - cardRect.top;
          const xc = cardRect.width / 2;
          const yc = cardRect.height / 2;
          const dx = x - xc;
          const dy = y - yc;

          const tiltX = Math.max(-10, Math.min(10, -dy / 20));
          const tiltY = Math.max(-10, Math.min(10, dx / 20));

          gsap.to(card, {
            scale: 1.02,
            y: 0,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto'
          });

          gsap.to(photoWrapper, {
            rotationY: tiltY,
            rotationX: tiltX,
            x: dx / 40,
            y: dy / 40,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto'
          });

          gsap.to(textBack, {
            x: -dx / 20,
            y: -dy / 40, 
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto'
          });

          gsap.to(textFront, {
            x: dx / 30,
            y: dy / 50,
            z: 300,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto'
          });

          gsap.to(photo, {
            scale: 1.05,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        });

        card.addEventListener('mouseleave', () => {
          cardRect = null;
          gsap.to(card, {
            scale: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            overwrite: 'auto'
          });

          gsap.to([photoWrapper, textBack], {
            rotationY: 0,
            rotationX: 0,
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            overwrite: 'auto'
          });

          gsap.to(textFront, {
            x: 0,
            y: 0,
            z: 150, 
            duration: 0.6,
            ease: 'power2.out',
            overwrite: 'auto'
          });

          gsap.to(photo, {
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
            overwrite: 'auto'
          });
        });
      });
    }, root);

    return () => {
      ctx.revert();
    };
  }, []);

  const handleArtistClick = (name: string) => {
    // 1. Update hash first so Gallery filters its content
    window.location.hash = `#gallery?artist=${encodeURIComponent(name)}`;
    
    // 2. Wait a tiny bit for React to update Gallery height, then scroll
    setTimeout(() => {
      scrollToId('gallery');
    }, 50);
  };

  return (
    <section id="team" ref={rootRef} className={styles.root} aria-label="Team">
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>{t.team.title}</h2>
            <p className={styles.subtitle}>Команда проекта / Project Team</p>
          </div>
          <div className={styles.chip}>Click member to view works</div>
        </header>

        <div ref={containerRef} className={styles.grid}>
          {teamMembers.map((m) => (
            <div key={m.id} className={styles.card} onClick={() => handleArtistClick(m.name)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleArtistClick(m.name)}>
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
