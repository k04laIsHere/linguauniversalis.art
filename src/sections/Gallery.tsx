import { useEffect, useMemo, useState } from 'react';
import { galleryWorks } from '../content/galleryManifest';
import { GalleryLightbox } from '../components/GalleryLightbox/GalleryLightbox';
import { useI18n } from '../i18n/useI18n';
import styles from './Gallery.module.css';

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function setGalleryHash(workId: string | null) {
  const base = '#gallery';
  if (!workId) {
    window.location.hash = base;
    return;
  }
  window.location.hash = `${base}?work=${encodeURIComponent(workId)}`;
}

function getWorkIdFromHash(): string | null {
  const hash = window.location.hash || '';
  const [anchor, query] = hash.split('?');
  if (anchor !== '#gallery' || !query) return null;
  const p = new URLSearchParams(query);
  const id = p.get('work');
  return id ? decodeURIComponent(id) : null;
}

export function Gallery() {
  const { t, lang } = useI18n();
  const [q, setQ] = useState('');
  const [artist, setArtist] = useState<string>('__all__');
  const [sort, setSort] = useState<'artist' | 'title'>('artist');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const onHash = () => {
      const id = getWorkIdFromHash();
      setOpenId(id);
    };
    onHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const artists = useMemo(() => {
    const set = new Set(galleryWorks.map((w) => w.artist));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, []);

  const filtered = useMemo(() => {
    const nq = norm(q);
    let arr = galleryWorks.slice();
    if (artist !== '__all__') arr = arr.filter((w) => w.artist === artist);
    if (nq) {
      arr = arr.filter((w) => {
        const hay = norm(
          [
            w.artist,
            w.titleEn,
            w.titleRu,
            ...(w.tags ?? []),
            lang === 'ru' ? w.titleRu : w.titleEn,
          ].join(' '),
        );
        return hay.includes(nq);
      });
    }
    arr.sort((a, b) => {
      if (sort === 'artist') return a.artist.localeCompare(b.artist) || a.titleEn.localeCompare(b.titleEn);
      return a.titleEn.localeCompare(b.titleEn) || a.artist.localeCompare(b.artist);
    });
    return arr;
  }, [artist, lang, q, sort]);

  const currentIndex = useMemo(() => filtered.findIndex((w) => w.id === openId), [filtered, openId]);
  const current = currentIndex >= 0 ? filtered[currentIndex] : null;

  const open = (id: string) => setGalleryHash(id);
  const close = () => setGalleryHash(null);
  const prev = () => {
    if (filtered.length === 0) return;
    const i = currentIndex <= 0 ? filtered.length - 1 : currentIndex - 1;
    open(filtered[i].id);
  };
  const next = () => {
    if (filtered.length === 0) return;
    const i = currentIndex >= filtered.length - 1 ? 0 : currentIndex + 1;
    open(filtered[i].id);
  };

  return (
    <section id="gallery" className={styles.root} aria-label="Gallery">
      <div className={styles.inner}>
        <h2 className={styles.title}>{t.gallery.title}</h2>
        <p className={styles.lede}>{t.gallery.lede}</p>

        <div className={styles.toolbar}>
          <input
            className={styles.input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.gallery.searchPlaceholder}
            aria-label="Search"
          />
          <select
            className={styles.select}
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            aria-label="Artist filter"
          >
            <option value="__all__">{t.gallery.artistFilterAll}</option>
            {artists.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={sort}
            onChange={(e) => setSort(e.target.value as 'artist' | 'title')}
            aria-label="Sort"
          >
            <option value="artist">{t.gallery.sortArtist}</option>
            <option value="title">{t.gallery.sortTitle}</option>
          </select>
          <div className={styles.count}>
            {filtered.length}/{galleryWorks.length}
          </div>
        </div>

        <div className={styles.grid}>
          {filtered.map((w) => (
            <button
              key={w.id}
              type="button"
              className={styles.card}
              onClick={() => open(w.id)}
              aria-label={`${w.artist} — ${lang === 'ru' ? w.titleRu : w.titleEn}`}
            >
              <img className={styles.thumb} src={w.src} alt="" loading="lazy" decoding="async" />
              <div className={styles.meta}>
                <div className={styles.artist}>{w.artist}</div>
                <div className={styles.workTitle}>{lang === 'ru' ? w.titleRu : w.titleEn}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <GalleryLightbox isOpen={current != null} work={current} onClose={close} onPrev={prev} onNext={next} />
    </section>
  );
}


