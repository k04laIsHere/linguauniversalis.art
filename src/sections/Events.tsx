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

    // Lock height on mobile to prevent address bar resize jump
    let lastWidth = window.innerWidth;
    const lockHeight = () => {
      if (window.innerWidth !== lastWidth || !root.style.height) {
        root.style.height = `${window.innerHeight}px`;
        pin.style.height = `${window.innerHeight}px`;
        lastWidth = window.innerWidth;
        if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh) {
          ScrollTrigger.refresh();
        }
      }
    };
    lockHeight();
    window.addEventListener('resize', lockHeight);

    const sections = Array.from(pin.querySelectorAll<HTMLElement>('[data-event-section]'));
    if (sections.length === 0) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: `+=${sections.length * 100}%`, 
          scrub: true,
          pin: root,
          pinSpacing: true,
          snap: {
            snapTo: 1 / (sections.length - 1),
            duration: { min: 0.2, max: 0.5 },
            delay: 0.05,
            ease: 'power1.inOut'
          },
          onUpdate: (self) => {
            const idx = Math.min(sections.length - 1, Math.max(0, Math.round(self.progress * (sections.length - 1))));
            setActiveIndex(idx);
          },
        },
      });

      sections.forEach((section, i) => {
        const infoBox = section.querySelector(`.${styles.infoBox}`);
        const images = Array.from(section.querySelectorAll<HTMLElement>(`.${styles.imageWrapper}`));
        
        // Initial hidden state - Opaque by default once revealed
        gsap.set(section, { autoAlpha: 0 });
        gsap.set(images, { autoAlpha: 0 });
        gsap.set(infoBox, { autoAlpha: 0, y: 20 });

        const startTime = i;

        // Reveal section
        tl.to(section, { autoAlpha: 1, duration: 0.1 }, startTime);

        // Crossfade images if multiple, or just reveal first
        images.forEach((img, imgIdx) => {
          const imgStart = startTime + (imgIdx * 0.2);
          tl.to(img, {
            autoAlpha: 1,
            duration: 0.5,
            ease: 'none'
          }, imgStart);
        });

        // Reveal info box
        tl.to(infoBox, {
          autoAlpha: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out'
        }, startTime + 0.1);

        // Hide section (except last)
        if (i < sections.length - 1) {
          tl.to(section, {
            autoAlpha: 0,
            duration: 0.4,
            ease: 'none'
          }, startTime + 0.6);
        }
      });
    }, root);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', lockHeight);
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

        {/* Section Header */}
        <div className={styles.sectionHeader}>
           <span className={styles.sectionLabel}>
             {lang === 'ru' ? 'Прошедшие события' : lang === 'es' ? 'Eventos pasados' : 'Past events'}
           </span>
           <div className={styles.sectionLine}></div>
        </div>

        <div className={styles.content}>
          {events.map((event, idx) => (
            <div 
              key={event.id} 
              className={`${styles.eventSection} ${activeIndex === idx ? styles.active : ''}`}
              data-event-section
            >
              <div className={styles.mediaContainer}>
                {event.images.map((img, imgIdx) => (
                  <div 
                    key={`${event.id}-img-${imgIdx}`} 
                    className={styles.imageWrapper}
                  >
                    <img src={img} alt="" className={styles.eventImage} loading="lazy" />
                  </div>
                ))}
              </div>

              <div className={styles.infoBox}>
                <div className={styles.infoContent}>
                  <div className={styles.eventMeta}>
                    <span className={styles.metaItem}>
                      {lang === 'ru' ? event.dateRu : event.dateEn}
                    </span>
                    <span className={styles.metaDivider}>•</span>
                    <span className={styles.metaItem}>
                      {lang === 'ru' ? event.locationRu : event.locationEn}
                    </span>
                  </div>
                  
                  <h3 className={styles.eventTitle}>
                    {lang === 'ru' ? event.titleRu : event.titleEn}
                  </h3>
                  
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
