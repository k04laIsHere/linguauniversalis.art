import { useEffect, useMemo, useRef, useState } from 'react';
import { gsap, ScrollTrigger, initGsap } from '../animation/gsap';
import { events, EventItem } from '../content/eventsData';
import { useI18n } from '../i18n/useI18n';
import styles from './Events.module.css';

// Combined 3D Z-Axis Portal & Persistent InfoBox Events Section (v4)

type DepthBeat =
  | {
      kind: 'frame';
      eventIdx: number;
      frameIdx: number;
      totalInEvent: number;
      src: string;
      event: EventItem;
    }
  | {
      kind: 'portalGate';
      toEventIdx: number;
      nextEvent: EventItem;
    };

function getLocalizedEvent(event: EventItem, lang: string) {
  const isRu = lang === 'ru';
  const isEs = lang === 'es';
  return {
    id: event.id,
    title: isRu ? event.titleRu : isEs ? event.titleEs : event.titleEn,
    desc: isRu ? event.descRu : isEs ? event.descEs : event.descEn,
    date: isRu ? event.dateRu : isEs ? event.dateEs : event.dateEn,
    location: isRu ? event.locationRu : isEs ? event.locationEs : event.locationEn,
    fullStory: isRu ? event.fullStoryRu : isEs ? event.fullStoryEs : event.fullStoryEn,
    images: event.images,
    raw: event,
  };
}

function splitTwoLineDate(dateStr?: string): [string, string] {
  if (!dateStr) return ['', ''];
  const cleaned = dateStr.replace(/\s+de\s+/i, ' ').trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length >= 2) {
    const year = parts[parts.length - 1];
    const month = parts.slice(0, -1).join(' ');
    return [month, year];
  }
  return [cleaned, ''];
}

function splitTwoLineLocation(locStr?: string): [string, string] {
  if (!locStr) return ['', ''];
  const words = locStr.trim().split(/\s+/);
  if (words.length <= 2) return [locStr, ''];
  return [words.slice(0, 2).join(' '), words.slice(2).join(' ')];
}

export function Events() {
  const { t, lang } = useI18n();
  const rootRef = useRef<HTMLElement | null>(null);
  const pinRef = useRef<HTMLDivElement | null>(null);
  const zSceneRef = useRef<HTMLDivElement | null>(null);

  const [beatCursor, setBeatCursor] = useState(0);
  const [activeBeatIdx, setActiveBeatIdx] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const selectedEventRef = useRef<EventItem | null>(null);
  selectedEventRef.current = selectedEvent;

  const reduced = useMemo(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false,
    [],
  );

  const beats = useMemo<DepthBeat[]>(() => {
    const arr: DepthBeat[] = [];
    events.forEach((ev, eIdx) => {
      if (eIdx > 0) {
        arr.push({
          kind: 'portalGate',
          toEventIdx: eIdx,
          nextEvent: ev,
        });
      }
      ev.images.forEach((src, fIdx) => {
        arr.push({
          kind: 'frame',
          eventIdx: eIdx,
          frameIdx: fIdx,
          totalInEvent: ev.images.length,
          src,
          event: ev,
        });
      });
    });
    return arr;
  }, []);

  const currentBeat = beats[activeBeatIdx] || beats[0];
  const activeEventIdx =
    currentBeat.kind === 'frame' ? currentBeat.eventIdx : currentBeat.toEventIdx;

  const portalGateIdx = useMemo(
    () => beats.findIndex((b) => b.kind === 'portalGate'),
    [beats],
  );

  useEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    if (!root || !pin) return;

    initGsap();

    const maxIndex = beats.length - 1;
    const visualProxy = { cursor: 0 };
    let currentStep = 0;
    let lastWidth = window.innerWidth;
    let stableHeight = Math.max(window.innerHeight, pin.offsetHeight || 0);

    const getStepDistance = () => {
      const isMobile = window.innerWidth <= 820;
      return isMobile
        ? Math.round(Math.max(460, Math.min(580, stableHeight * 0.56)))
        : Math.round(Math.max(580, Math.min(720, stableHeight * 0.62)));
    };

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: () => `+=${maxIndex * getStepDistance()}`,
        pin: pin,
        pinSpacing: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const nearest = Math.max(0, Math.min(maxIndex, Math.round(self.progress * maxIndex)));
          if (nearest !== currentStep) {
            currentStep = nearest;
            setActiveBeatIdx(nearest);

            if (reduced) {
              visualProxy.cursor = nearest;
              setBeatCursor(nearest);
              return;
            }

            const distanceToTarget = Math.abs(nearest - visualProxy.cursor);
            const duration =
              distanceToTarget <= 1.15
                ? 0.62
                : Math.min(0.76, Math.max(0.46, distanceToTarget * 0.22));

            gsap.to(visualProxy, {
              cursor: nearest,
              duration,
              ease: 'power2.out',
              overwrite: 'auto',
              onUpdate: () => {
                setBeatCursor(visualProxy.cursor);
              },
              onComplete: () => {
                setBeatCursor(nearest);
              },
            });
          }
        },
      });
    }, root);

    // Only refresh ScrollTrigger when viewport width changes; ignore mobile address bar height changes
    const handleResize = () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        stableHeight = Math.max(window.innerHeight, pin.offsetHeight || 0);
        ScrollTrigger.refresh();
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      ctx.revert();
    };
  }, [beats.length, reduced]);

  // Creators-style 3D hover effect (matching Team.tsx in Immersion Mode)
  useEffect(() => {
    const scene = zSceneRef.current;
    if (!scene || reduced) return;

    const plates = Array.from(scene.querySelectorAll<HTMLElement>('[data-hover-plate]'));
    const cleanups: Array<() => void> = [];

    plates.forEach((plate) => {
      const tiltInner = plate.querySelector<HTMLElement>('[data-tilt-inner]');
      const photo = plate.querySelector<HTMLElement>('[data-tilt-photo]');
      if (!tiltInner) return;

      let rect: DOMRect | null = null;

      const onEnter = () => {
        rect = plate.getBoundingClientRect();
      };

      const onMove = (e: MouseEvent) => {
        if (!rect) rect = plate.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        const dx = x - xc;
        const dy = y - yc;

        const tiltX = Math.max(-10, Math.min(10, -dy / 20));
        const tiltY = Math.max(-10, Math.min(10, dx / 20));

        gsap.to(tiltInner, {
          scale: 1.02,
          rotationY: tiltY,
          rotationX: tiltX,
          x: dx / 40,
          y: dy / 40,
          duration: 0.4,
          ease: 'power2.out',
          overwrite: 'auto',
        });

        if (photo) {
          gsap.to(photo, {
            scale: 1.05,
            duration: 0.4,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      };

      const onLeave = () => {
        rect = null;
        gsap.to(tiltInner, {
          scale: 1,
          rotationY: 0,
          rotationX: 0,
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: 'auto',
        });

        if (photo) {
          gsap.to(photo, {
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      };

      plate.addEventListener('mouseenter', onEnter);
      plate.addEventListener('mousemove', onMove);
      plate.addEventListener('mouseleave', onLeave);

      cleanups.push(() => {
        plate.removeEventListener('mouseenter', onEnter);
        plate.removeEventListener('mousemove', onMove);
        plate.removeEventListener('mouseleave', onLeave);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [lang, reduced]);

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

  const pastEventsHeading =
    lang === 'ru' ? 'Прошедшие события' : lang === 'es' ? 'Eventos pasados' : 'Past Events';
  const eventWord = lang === 'ru' ? 'Событие' : lang === 'es' ? 'Evento' : 'Event';

  return (
    <section id="events" ref={rootRef} className={styles.root} aria-label="Events">
      <div ref={pinRef} className={styles.pin}>
        <div className={styles.safeStage}>
          <div className={styles.workspace}>
            <div className={styles.leftColumn}>
              <h2 className={styles.sectionTitle}>{pastEventsHeading}</h2>

              {/* Persistent InfoBox Container (zero flash on transition, no background shadow bleed) */}
              <aside className={styles.infoBox}>
                <div className={styles.infoLayersGrid}>
                  {events.map((ev, eIdx) => {
                    const loc = getLocalizedEvent(ev, lang);
                    const isLayerActive = eIdx === activeEventIdx;
                    const [dateLine1, dateLine2] = splitTwoLineDate(loc.date);
                    const [locLine1, locLine2] = splitTwoLineLocation(loc.location);

                    return (
                      <div
                        key={ev.id}
                        className={`${styles.infoLayer} ${
                          isLayerActive ? styles.infoLayerActive : styles.infoLayerInactive
                        }`}
                        aria-hidden={!isLayerActive}
                      >
                        <div className={styles.eventMeta}>
                          <div className={styles.metaBlock}>
                            <span className={styles.metaLine}>{dateLine1}</span>
                            <span className={styles.metaLine}>{dateLine2}</span>
                          </div>
                          <span className={styles.metaDivider} aria-hidden="true">
                            •
                          </span>
                          <div className={styles.metaBlock}>
                            <span className={styles.metaLine}>{locLine1}</span>
                            <span className={styles.metaLine}>{locLine2}</span>
                          </div>
                        </div>

                        <h3 className={styles.eventTitle}>{loc.title}</h3>

                        <p className={styles.eventDesc}>{loc.desc}</p>

                        <button
                          type="button"
                          className={styles.exploreBtn}
                          tabIndex={isLayerActive ? 0 : -1}
                          onClick={(e) => handleExplore(e, ev)}
                        >
                          {t.events.explore}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </aside>
            </div>

            {/* Right Column: 3D Z-Axis Portals with Fixed Points of Interest & 3D Hover Tilt */}
            <div className={styles.zViewport}>
              <div ref={zSceneRef} className={styles.zScene}>
                {beats.map((beat, idx) => {
                  const delta = idx - beatCursor;
                  const isFocused = Math.abs(delta) < 0.08;

                  const translateZ = isFocused ? 0 : -delta * 340;
                  const translateX = isFocused ? 0 : delta > 0 ? delta * 38 : delta * -30;
                  const translateY = isFocused ? 0 : delta > 0 ? -delta * 18 : delta * 14;
                  const rotateY = isFocused ? 0 : delta * -4;

                  let opacity = isFocused
                    ? 1
                    : delta < 0
                      ? Math.max(0, 1 + delta * 1.35)
                      : Math.max(0, 1 - delta * 0.42);

                  if (portalGateIdx > 0) {
                    if (idx > portalGateIdx && beatCursor < portalGateIdx) {
                      const gateReveal = Math.max(
                        0,
                        Math.min(1, 1 - (portalGateIdx - beatCursor) * 1.15),
                      );
                      opacity *= gateReveal;
                    } else if (idx < portalGateIdx && beatCursor > portalGateIdx) {
                      const pastHide = Math.max(
                        0,
                        Math.min(1, 1 - (beatCursor - portalGateIdx) * 1.35),
                      );
                      opacity *= pastHide;
                    }
                  }

                  const blurPx = isFocused ? 0 : Math.min(7, Math.abs(delta) * 2.8);
                  const isVisible = opacity > 0.01;

                  if (beat.kind === 'portalGate') {
                    const nextEv = getLocalizedEvent(beat.nextEvent, lang);
                    return (
                      <div
                        key={`portal-gate-${idx}`}
                        data-hover-plate
                        className={styles.zPortalGate}
                        style={{
                          transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateY(${rotateY}deg)`,
                          opacity,
                          visibility: isVisible ? 'visible' : 'hidden',
                          filter: blurPx ? `blur(${blurPx}px)` : 'none',
                          zIndex: Math.round(100 - Math.abs(delta) * 20),
                          pointerEvents: isFocused ? 'auto' : 'none',
                        }}
                      >
                        <div data-tilt-inner className={styles.gateArch}>
                          <span className={styles.gateKicker}>
                            ✦ {eventWord} {beat.toEventIdx + 1} ✦
                          </span>
                          <h4 className={styles.gateHeading}>{nextEv.title}</h4>
                          <p className={styles.gateSub}>
                            {nextEv.date} — {nextEv.location}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <figure
                      key={`z-frame-${idx}`}
                      data-hover-plate
                      className={`${styles.zPlate} ${isFocused ? styles.zPlateFocused : ''}`}
                      style={{
                        transform: `translate3d(${translateX}px, ${translateY}px, ${translateZ}px) rotateY(${rotateY}deg)`,
                        opacity,
                        visibility: isVisible ? 'visible' : 'hidden',
                        filter: blurPx ? `blur(${blurPx}px)` : 'none',
                        zIndex: Math.round(100 - Math.abs(delta) * 20),
                        pointerEvents: isFocused ? 'auto' : 'none',
                      }}
                      onClick={(e) => handleExplore(e, beat.event)}
                    >
                      <div data-tilt-inner className={styles.zPlateTiltInner}>
                        <img
                          data-tilt-photo
                          src={beat.src}
                          alt=""
                          className={styles.zPlateImg}
                          loading="lazy"
                        />
                      </div>
                    </figure>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deep Dive Overlay — properly centered inside 100dvh safe zone on desktop & mobile */}
      {selectedEvent && (
        <div
          className={styles.overlay}
          data-event-modal="true"
          onClick={closeDetails}
          onWheel={(e) => e.stopPropagation()}
        >
          <div className={styles.detailsModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeDetails} aria-label="Close">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.closeIcon}
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <h2>
                  {lang === 'ru'
                    ? selectedEvent.titleRu
                    : lang === 'es'
                      ? selectedEvent.titleEs
                      : selectedEvent.titleEn}
                </h2>
                <p className={styles.modalMeta}>
                  {lang === 'ru'
                    ? selectedEvent.dateRu
                    : lang === 'es'
                      ? selectedEvent.dateEs
                      : selectedEvent.dateEn}{' '}
                  |{' '}
                  {lang === 'ru'
                    ? selectedEvent.locationRu
                    : lang === 'es'
                      ? selectedEvent.locationEs
                      : selectedEvent.locationEn}
                </p>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.modalImages}>
                  {selectedEvent.images.map((img, i) => (
                    <img key={i} src={img} alt="" className={styles.modalImg} />
                  ))}
                </div>
                <div className={styles.modalText}>
                  <p>
                    {lang === 'ru'
                      ? selectedEvent.fullStoryRu
                      : lang === 'es'
                        ? selectedEvent.fullStoryEs
                        : selectedEvent.fullStoryEn}
                  </p>

                  {selectedEvent.links && selectedEvent.links.length > 0 && (
                    <div className={styles.linksSection}>
                      <h4 className={styles.linksTitle}>
                        {lang === 'ru' ? 'Источники' : lang === 'es' ? 'Fuentes' : 'Sources'}
                      </h4>
                      <nav className={styles.blueLinksList}>
                        {selectedEvent.links.map((link, i) => (
                          <a
                            key={i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.blueLink}
                          >
                            {lang === 'ru'
                              ? link.titleRu
                              : lang === 'es'
                                ? link.titleEs
                                : link.titleEn}
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
