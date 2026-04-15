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

    const sections = Array.from(pin.querySelectorAll<HTMLElement>('[data-event-section]'));
    if (sections.length === 0) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: `+=${sections.length * 150}%`, 
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
        const carousel = section.querySelector(`.${styles.imageCarousel}`);
        const images = Array.from(section.querySelectorAll<HTMLElement>(`.${styles.carouselItem}`));
        
        const sectionStartTime = i * 2;
        
        gsap.set(section, { autoAlpha: 0 });
        gsap.set(infoBox, { autoAlpha: 0, y: 30 });
        gsap.set(images, { x: 100, autoAlpha: 0 });

        // Section Fade In
        tl.to(section, { autoAlpha: 1, duration: 0.2 }, sectionStartTime);

        // Horizontal Carousel Reveal
        tl.to(images, {
          x: 0,
          autoAlpha: 1,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power2.out'
        }, sectionStartTime + 0.1);

        // Horizontal Auto-Scroll logic
        if (images.length > 1 && carousel) {
          const carouselEl = carousel as HTMLElement;
          
          // Force a small delay to ensure DOM dimensions are settled
          tl.to(carouselEl, {
            x: () => {
              // totalWidth is the entire length of the internal flex track
              const totalWidth = carouselEl.scrollWidth;
              // viewportWidth is the visible 630px / 85vw container
              const viewportWidth = (carouselEl.parentElement as HTMLElement).offsetWidth;
              // We need to move exactly the hidden distance
              return -(totalWidth - viewportWidth);
            },
            duration: 1.8,
            ease: 'none'
          }, sectionStartTime);
        }

        // Info box reveal
        tl.to(infoBox, {
          autoAlpha: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out'
        }, sectionStartTime + 0.2);

        // Section Fade Out (except last)
        if (i < sections.length - 1) {
          tl.to(section, {
            autoAlpha: 0,
            scale: 0.95,
            duration: 0.6,
            ease: 'power2.inOut'
          }, sectionStartTime + 1.4);
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
          {events.map((event, idx) => (
            <div 
              key={event.id} 
              className={`${styles.eventSection} ${activeIndex === idx ? styles.active : ''}`}
              data-event-section
            >
              <div className={styles.carouselContainer}>
                <div className={styles.imageCarousel}>
                  {event.images.map((img, imgIdx) => (
                    <div 
                      key={`${event.id}-img-${imgIdx}`} 
                      className={styles.carouselItem}
                    >
                      <img src={img} alt="" className={styles.eventImage} loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.infoBox}>
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
          ))}
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
                  
                  {selectedEvent.links && selectedEvent.links.length > 0 && (
                    <div className={styles.linksSection}>
                      <h4 className={styles.linksTitle}>{lang === 'ru' ? 'Источники' : 'Sources'}</h4>
                      <nav className={styles.blueLinksList}>
                        {selectedEvent.links.map((link, i) => (
                          <a 
                            key={i} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={styles.blueLink}
                          >
                            {lang === 'ru' ? link.titleRu : link.titleEn}
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
