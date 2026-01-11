import { useEffect, useMemo, useRef } from 'react';
import { ScrollTrigger, initGsap, gsap } from '../animation/gsap';
import styles from './NatureUrbanPlaceholder.module.css';

const START_FRAME = 48;
const END_FRAME = 192;
const FRAME_COUNT = END_FRAME - START_FRAME + 1;

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

    // Setup canvas internal resolution
    canvas.width = 1920;
    canvas.height = 1080;

    const images: HTMLImageElement[] = [];
    const airplay = { frame: 0 };

    const getFramePath = (index: number) => {
      const frameNum = START_FRAME + index;
      return `/assets/videos/background_video_frames/background_video_${frameNum.toString().padStart(6, '0')}.webp`;
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

      // 1. Frame sequence animation
      tl.to(airplay, {
        frame: FRAME_COUNT - 1,
        snap: 'frame',
        ease: 'none',
        duration: 1,
        onUpdate: render,
      }, 0);

      // 2. Cross-fade with backdrops: Canvas handles the "in-between"
      tl.fromTo(canvas, { opacity: 0 }, { opacity: 1, duration: 0.02 }, 0.01);
      tl.to(canvas, { opacity: 0, duration: 0.02 }, 0.97);

      // 3. Noise animation
      tl.to(noise, { opacity: 0.3, duration: 0.3 }, 0.1)
        .to(noise, { opacity: 0, duration: 0.3 }, 0.7);
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section id="natureUrban" ref={rootRef} className={styles.root} aria-label="Nature to Urban">
      <canvas ref={canvasRef} className={styles.canvas} />
      <div ref={noiseRef} className={styles.noise} aria-hidden="true" />
    </section>
  );
}
