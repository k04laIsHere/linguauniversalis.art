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


  const allImages = useMemo(() => {
    return events.flatMap((event, eventIdx) =>
      event.images.map(img => ({
        src: img,
        eventIdx,
        event
      }))
    );
  }, []);

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    const pin = pinRef.current;
    if (!root || !pin) return;

    initGsap();

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


    const carousel = pin.querySelector(`.${styles.imageCarousel}`);
    const infoBox = pin.querySelector(`.${styles.infoBox}`);
    if (!carousel || !infoBox) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: `+=${allImages.length * 50}%`, // Dynamic scroll length based on total images
          scrub: 1,
          pin: pin, anticipatePin: 1,
          pinSpacing: true,
          onUpdate: (self) => {
             // Calculate which image is currently centered based on scroll progress
             const idx = Math.min(allImages.length - 1, Math.max(0, Math.floor(self.progress * allImages.length * 0.99)));
             // Update the active event index based on the currently visible image
             if (allImages[idx]) {
               setActiveIndex(allImages[idx].eventIdx);
             }
          },
        },
      });

      gsap.set(infoBox, { autoAlpha: 1, y: 0 });

      // Horizontal Carousel scroll
      const carouselEl = carousel as HTMLElement;
      tl.to(carouselEl, {
        x: () => {
          const totalWidth = carouselEl.scrollWidth;
          const viewportWidth = (carouselEl.parentElement as HTMLElement).offsetWidth;
          // Only scroll if content is wider than viewport
          if (totalWidth <= viewportWidth) return 0;
          return -(totalWidth - viewportWidth);
        },
        ease: 'none'
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

  useEffect(() => {
    if (selectedEvent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedEvent]);

  const [overlayHeight, setOverlayHeight] = useState<string>('100dvh');

  useEffect(() => {
    if (!selectedEvent) return;

    const updateHeight = () => {
      const targetHeight = Math.max(window.innerHeight, window.screen.height || 0);
      setOverlayHeight(`${targetHeight}px`);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, [selectedEvent]);

  return (
    <section id="events" ref={rootRef} className={styles.root} aria-label="Events">
      <div ref={pinRef} className={styles.pin}>
        <div className={styles.backgroundText} aria-hidden="true">
          {t.events.title}
        </div>

        <div className={styles.sectionHeader}>
           <span className={styles.sectionLabel}>
             {lang === 'ru' ? 'Прошедшие события' : lang === 'es' ? 'Eventos pasados' : 'Past events'}
           </span>
           <div className={styles.sectionLine}></div>
        </div>

        <div className={styles.content}>
          <div
            className={`${styles.eventSection} ${styles.active}`}
            data-event-section
          >
            <div className={styles.carouselContainer}>
              <div className={styles.imageCarousel}>
                {allImages.map((item, i) => (
                  <div
                    key={`${item.event.id}-img-${i}`}
                    className={styles.carouselItem}
                  >
                    <img src={item.src} alt="" className={styles.eventImage} loading="lazy" />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.infoBox}>
              <div className={styles.eventMeta}>
                <span className={styles.metaItem}>
                  {lang === 'ru' ? events[activeIndex].dateRu : lang === 'es' ? events[activeIndex].dateEs : events[activeIndex].dateEn}
                </span>
                <span className={styles.metaDivider}>•</span>
                <span className={styles.metaItem}>
                  {lang === 'ru' ? events[activeIndex].locationRu : lang === 'es' ? events[activeIndex].locationEs : events[activeIndex].locationEn}
                </span>
              </div>

              <h3 className={styles.eventTitle}>
                {lang === 'ru' ? events[activeIndex].titleRu : lang === 'es' ? events[activeIndex].titleEs : events[activeIndex].titleEn}
              </h3>

              <p className={styles.eventDesc}>
                {lang === 'ru' ? events[activeIndex].descRu : lang === 'es' ? events[activeIndex].descEs : events[activeIndex].descEn}
              </p>

              <button
                className={styles.exploreBtn}
                onClick={(e) => handleExplore(e, events[activeIndex])}
              >
                {t.events.explore}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Dive Overlay */}
      {selectedEvent && (
        <div 
          className={styles.overlay} 
          onClick={closeDetails}
          style={{ height: overlayHeight }}
        >
          <div className={styles.detailsModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeDetails} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.closeIcon}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>{lang === 'ru' ? selectedEvent.titleRu : lang === 'es' ? selectedEvent.titleEs : selectedEvent.titleEn}</h2>
                <p className={styles.modalMeta}>
                  {lang === 'ru' ? selectedEvent.dateRu : lang === 'es' ? selectedEvent.dateEs : selectedEvent.dateEn} | {lang === 'ru' ? selectedEvent.locationRu : lang === 'es' ? selectedEvent.locationEs : selectedEvent.locationEn}
                </p>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.modalImages}>
                  {selectedEvent.images.map((img, i) => (
                    <img key={i} src={img} alt="" className={styles.modalImg} />
                  ))}
                </div>
                <div className={styles.modalText}>
                  <p>{lang === 'ru' ? selectedEvent.fullStoryRu : lang === 'es' ? selectedEvent.fullStoryEs : selectedEvent.fullStoryEn}</p>
                  
                  {selectedEvent.links && selectedEvent.links.length > 0 && (
                    <div className={styles.linksSection}>
                      <h4 className={styles.linksTitle}>{lang === 'ru' ? 'Источники' : lang === 'es' ? 'Fuentes' : 'Sources'}</h4>
                      <nav className={styles.blueLinksList}>
                        {selectedEvent.links.map((link, i) => (
                          <a 
                            key={i} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={styles.blueLink}
                          >
                            {lang === 'ru' ? link.titleRu : lang === 'es' ? link.titleEs : link.titleEn}
                          </a>
                        ))}
                      </nav>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
