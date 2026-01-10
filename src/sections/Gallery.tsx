import { useEffect, useMemo, useState } from 'react';
import { galleryWorks } from '../content/galleryManifest';
import { GalleryLightbox } from '../components/GalleryLightbox/GalleryLightbox';
import { useI18n } from '../i18n/useI18n';
import styles from './Gallery.module.css';

function setGalleryHash(params: { workId?: string | null; artist?: string | null }) {
  const hash = window.location.hash || '#gallery';
  const [anchor, query] = hash.split('?');
  const searchParams = new URLSearchParams(query || '');

  if (params.workId !== undefined) {
    if (params.workId) searchParams.set('work', params.workId);
    else searchParams.delete('work');
  }

  if (params.artist !== undefined) {
    if (params.artist && params.artist !== '__all__') searchParams.set('artist', params.artist);
    else searchParams.delete('artist');
  }

  const qs = searchParams.toString();
  window.location.hash = qs ? `${anchor}?${qs}` : anchor;
}

function getGalleryParamsFromHash() {
  const hash = window.location.hash || '';
  const [anchor, query] = hash.split('?');
  const p = new URLSearchParams(query || '');
  
  // If we are at #gallery, or if we have gallery-specific params even on another anchor
  // (though usually they only come with #gallery)
  const isGallery = anchor.startsWith('#gallery');
  
  return {
    workId: p.get('work'),
    artist: p.get('artist') || (isGallery ? '__all__' : null),
  };
}

export function Gallery() {
  const { t, lang } = useI18n();
  const [artist, setArtist] = useState<string>('__all__');
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const onHash = () => {
      const { workId, artist: hashArtist } = getGalleryParamsFromHash();
      setOpenId(workId);
      if (hashArtist) {
        setArtist(hashArtist);
      } else if (window.location.hash === '' || window.location.hash === '#') {
        // Reset only if hash is completely cleared
        setArtist('__all__');
      }
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
    let arr = galleryWorks.slice();
    if (artist !== '__all__') arr = arr.filter((w) => w.artist === artist);
    
    // Always sort by title
    arr.sort((a, b) => {
      const titleA = lang === 'ru' ? a.titleRu : a.titleEn;
      const titleB = lang === 'ru' ? b.titleRu : b.titleEn;
      return titleA.localeCompare(titleB);
    });
    return arr;
  }, [artist, lang]);

  const currentIndex = useMemo(() => filtered.findIndex((w) => w.id === openId), [filtered, openId]);
  const current = currentIndex >= 0 ? filtered[currentIndex] : null;

  const open = (id: string) => setGalleryHash({ workId: id });
  const close = () => setGalleryHash({ workId: null });
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

  const handleArtistClick = (a: string) => {
    setGalleryHash({ artist: a });
  };

  return (
    <section id="gallery" className={styles.root} aria-label="Gallery">
      <div className={styles.inner}>
        <h2 className={styles.title}>{t.gallery.title}</h2>
        
        <div className={styles.toolbar}>
          <div className={styles.filterGroup}>
            <div className={styles.artistTags}>
              <button
                type="button"
                className={`${styles.tag} ${styles.allArtistsTag} ${artist === '__all__' ? styles.tagActive : ''}`}
                onClick={() => handleArtistClick('__all__')}
              >
                {t.gallery.artistFilterAll}
              </button>
              
              <div className={styles.artistList}>
                {artists.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={`${styles.tag} ${artist === a ? styles.tagActive : ''}`}
                    onClick={() => handleArtistClick(a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
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


