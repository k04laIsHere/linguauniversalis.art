import { useEffect, useMemo, useRef } from 'react';
import { ScrollTrigger, initGsap, gsap } from '../animation/gsap';
import styles from './NatureUrbanPlaceholder.module.css';

const FRAME_COUNT = 172;

export function NatureUrbanPlaceholder() {
  const rootRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const noiseRef = useRef<HTMLDivElement | null>(null);

  const reduced = useMemo(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false,
    [],
  );

  useEffect(() => {
    if (reduced) return;
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const noise = noiseRef.current;
    if (!root || !canvas || !noise) return;

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return;

    initGsap();

    let lastWidth = window.innerWidth;
    const lockHeight = () => {
      if (window.innerWidth !== lastWidth || !root.style.height) {
        root.style.height = `${window.innerHeight}px`;
        lastWidth = window.innerWidth;
        if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh) {
          ScrollTrigger.refresh();
        }
      }
    };
    lockHeight();
    window.addEventListener('resize', lockHeight);

    canvas.width = 1920;
    canvas.height = 1080;

    const images: HTMLImageElement[] = [];
    const airplay = { frame: 0 };

    const getFramePath = (index: number) => {
      return `/assets/videos/sky_to_city_frames/frame_${index.toString().padStart(3, '0')}.webp`;
    };

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      images.push(img);
    }

    const render = () => {
      const img = images[airplay.frame];
      if (img && img.complete) {
        const canvasAspect = canvas.width / canvas.height;
        const imgAspect = img.width / img.height;
        let drawWidth, drawHeight, offsetX, offsetY;

        if (imgAspect > canvasAspect) {
          drawHeight = canvas.height;
          drawWidth = canvas.height * imgAspect;
          offsetX = (canvas.width - drawWidth) / 2;
          offsetY = 0;
        } else {
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgAspect;
          offsetX = 0;
          offsetY = (canvas.height - drawHeight) / 2;
        }

        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
    };

    images[0].onload = render;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
        },
      });

      tl.to(airplay, {
        frame: FRAME_COUNT - 1,
        snap: 'frame',
        ease: 'none',
        duration: 1,
        onUpdate: render,
      }, 0);

      tl.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.01);
      tl.to(canvas, { opacity: 0, duration: 0.05 }, 0.95);

      tl.to(noise, { opacity: 0.3, duration: 0.3 }, 0.1)
        .to(noise, { opacity: 0, duration: 0.3 }, 0.7);
    }, root);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', lockHeight);
    };
  }, [reduced]);

  return (
    <section id="natureUrban" ref={rootRef} className={styles.root} aria-label="Nature to Urban">
      <canvas ref={canvasRef} className={styles.canvas} />
      <div ref={noiseRef} className={styles.noise} aria-hidden="true" />
    </section>
  );
}
