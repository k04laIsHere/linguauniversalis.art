import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap, initGsap } from '../animation/gsap';
import { events, EventItem } from '../content/eventsData';
import { useI18n } from '../i18n/useI18n';
import styles from './Events.module.css';

export function Events() {
  const { t, lang } = useI18n();
  const rootRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const reduced = useMemo(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false,
    [],
  );

  // Scroll Trigger setup
  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    const pin = pinRef.current;
    if (!root || !pin) return;

    initGsap();

    const sections = Array.from(pin.querySelectorAll<HTMLElement>('[data-event-section]'));
    if (sections.length === 0) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: `+=${sections.length * 200}%`, // Increased duration for smoother staggered reveals
          scrub: 1,
          pin: root,
          pinSpacing: true,
          onUpdate: (self) => {
            const idx = Math.min(sections.length - 1, Math.max(0, Math.floor(self.progress * sections.length * 0.99)));
            setActiveIndex(idx);
          },
        },
      });

      sections.forEach((section, i) => {
        const infoBox = section.querySelector(`.${styles.infoBox}`);
        const hoverTarget = section.querySelector(`.${styles.hoverTarget}`);
        const images = Array.from(section.querySelectorAll<HTMLElement>(`.${styles.imageWrapper}`));
        
        const sectionStartTime = i * 2;
        
        // Mouse tilt effect
        if (hoverTarget) {
          hoverTarget.addEventListener('mousemove', (e: any) => {
            const rect = hoverTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xc = rect.width / 2;
            const yc = rect.height / 2;
            const dx = x - xc;
            const dy = y - yc;

            images.forEach((img, idx) => {
              // Extremely subtle factors for very low sensitivity
              const rotateFactor = (idx + 1) * 0.005;
              const moveFactor = 2; // Low multiplier for movement

              gsap.to(img, {
                rotateY: dx * rotateFactor,
                rotateX: -dy * rotateFactor,
                x: dx * rotateFactor * moveFactor,
                y: dy * rotateFactor * moveFactor,
                duration: 0.8,
                ease: 'power2.out'
              });
            });
          });

          hoverTarget.addEventListener('mouseleave', () => {
            images.forEach((img) => {
              gsap.to(img, {
                rotateY: 0,
                rotateX: 0,
                x: 0,
                y: 0,
                duration: 1.2,
                ease: 'expo.out'
              });
            });
          });
        }

        // Initial hidden state
        gsap.set(section, { opacity: 0, pointerEvents: 'none' });
        // Images reveal from further "in front" (positive Z) to their base position
        gsap.set(images, { opacity: 0, scale: 1.1, z: 200 });
        gsap.set(infoBox, { opacity: 0, y: 50 });

        // Section Fade In
        tl.to(section, { 
          opacity: 1, 
          duration: 0.2
        }, sectionStartTime);

        // STAGGERED REVEAL: Each image reveals one by one as user scrolls
        images.forEach((img, imgIdx) => {
          const imgRevealStart = sectionStartTime + 0.1 + (imgIdx * 0.4);
          tl.to(img, {
            opacity: 1,
            scale: 1,
            // Increased Z separation to prevent intersection on rotation
            z: (imgIdx - 1) * 80,
            duration: 0.8,
            ease: 'expo.out'
          }, imgRevealStart);
        });

        // Info box appears together with the first image
        tl.to(infoBox, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'expo.out'
        }, sectionStartTime + 0.1);

        // Section Fade Out (except last one)
        if (i < sections.length - 1) {
          tl.to(section, {
            opacity: 0,
            y: -80, // Increased for clearer movement
            scale: 0.9,
            duration: 0.8, // Increased duration for smoother exit
            ease: 'power2.inOut' // Smoother transition out
          }, sectionStartTime + 1.4);
        }
      });
    }, root);

    return () => {
      ctx.revert();
    };
  }, [reduced]);

  const handleExplore = (e: React.MouseEvent, event: EventItem) => {
    e.stopPropagation();
    setSelectedEvent(event);
  };

  const closeDetails = () => setSelectedEvent(null);

  return (
    <section id="events" ref={rootRef} className={styles.root} aria-label="Events">
      <div ref={pinRef} className={styles.pin}>
        <div className={styles.backgroundText} aria-hidden="true">
          {t.events.title}
        </div>

        <div className={styles.content}>
          {events.map((event, idx) => (
            <div 
              key={event.id} 
              className={`${styles.eventSection} ${activeIndex === idx ? styles.active : ''}`}
              data-event-section
            >
              <div className={styles.mediaContainer}>
                <div className={styles.hoverTarget}>
                  {event.images.map((img, imgIdx) => (
                    <div 
                      key={`${event.id}-img-${imgIdx}`} 
                      className={styles.imageWrapper}
                      data-image-index={imgIdx}
                    >
                      <img src={img} alt="" className={styles.eventImage} loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.infoBox}>
                <h3 className={styles.eventTitle}>
                  {lang === 'ru' ? event.titleRu : event.titleEn}
                </h3>
                <div className={styles.eventMeta}>
                  {event.dateEn && (
                    <span className={styles.metaItem}>
                      {lang === 'ru' ? event.dateRu : event.dateEn}
                    </span>
                  )}
                  {event.locationEn && (
                    <span className={styles.metaItem}>
                      {lang === 'ru' ? event.locationRu : event.locationEn}
                    </span>
                  )}
                </div>
                <p className={styles.eventDesc}>
                  {lang === 'ru' ? event.descRu : event.descEn}
                </p>
                <button 
                  className={styles.exploreBtn}
                  onClick={(e) => handleExplore(e, event)}
                >
                  {t.events.explore}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deep Dive Overlay */}
      {selectedEvent && (
        <div className={styles.overlay} onClick={closeDetails}>
          <div className={styles.detailsModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeDetails} aria-label="Close">×</button>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>{lang === 'ru' ? selectedEvent.titleRu : selectedEvent.titleEn}</h2>
                <p className={styles.modalMeta}>
                  {lang === 'ru' ? selectedEvent.dateRu : selectedEvent.dateEn} | {lang === 'ru' ? selectedEvent.locationRu : selectedEvent.locationEn}
                </p>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.modalImages}>
                  {selectedEvent.images.map((img, i) => (
                    <img key={i} src={img} alt="" className={styles.modalImg} />
                  ))}
                </div>
                <div className={styles.modalText}>
                  <p>{lang === 'ru' ? selectedEvent.fullStoryRu : selectedEvent.fullStoryEn}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
