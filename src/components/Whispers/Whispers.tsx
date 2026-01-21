import { useEffect, useState, useCallback } from 'react';
import styles from './Whispers.module.css';

const WHISPERS_EN = [
  'Art must be pure',
  'Language of Creation',
  'Meeting with oneself',
  'Connection of times',
  'The first handprint',
  'The last digital frame',
  'Silence is the grail',
  'Organic chaos',
  'Nature is not square',
  'Eroded by time',
  'Grown by spirit',
];

const WHISPERS_RU = [
  'Искусство должно быть чистым',
  'Язык Созидания',
  'Встреча с самим собой',
  'Связь времен',
  'Первый отпечаток руки',
  'Последний цифровой кадр',
  'Тишина — это грааль',
  'Органический хаос',
  'Природа не знает углов',
  'Размыто временем',
  'Взращено духом',
];

type Whisper = {
  id: number;
  text: string;
  x: number;
  y: number;
  size: number;
  duration: number;
};

export function Whispers({ lang }: { lang: 'ru' | 'en' }) {
  const [whispers, setWhispers] = useState<Whisper[]>([]);
  const phrases = lang === 'ru' ? WHISPERS_RU : WHISPERS_EN;

  const spawnWhisper = useCallback(() => {
    const id = Date.now();
    const text = phrases[Math.floor(Math.random() * phrases.length)];
    const x = 5 + Math.random() * 90; // 5-95%
    const y = 5 + Math.random() * 90; // 5-95%
    const size = 12 + Math.random() * 14; // 12-26px
    const duration = 8000 + Math.random() * 12000; // 8-20s

    const newWhisper: Whisper = { id, text, x, y, size, duration };
    setWhispers((prev) => [...prev, newWhisper]);

    setTimeout(() => {
      setWhispers((prev) => prev.filter((w) => w.id !== id));
    }, duration);
  }, [phrases]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7 && whispers.length < 5) {
        spawnWhisper();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [spawnWhisper, whispers.length]);

  return (
    <div className={styles.container} aria-hidden="true">
      {whispers.map((w) => (
        <div
          key={w.id}
          className={styles.whisper}
          style={{
            left: `${w.x}%`,
            top: `${w.y}%`,
            fontSize: `${w.size}px`,
            animationDuration: `${w.duration}ms`,
          } as React.CSSProperties}
        >
          {w.text}
        </div>
      ))}
    </div>
  );
}







