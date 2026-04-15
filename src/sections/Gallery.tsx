import { useEffect, useMemo, useState } from 'react';
import { galleryWorks } from '../content/galleryManifest';
import { teamMembers } from '../content/teamData';
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
  
  // CRITICAL: Always preserve the #gallery anchor to prevent ViewModeContext 
  // from seeing an naked #archive hash and switching modes.
  const newHash = qs ? `#gallery?${qs}` : '#gallery';
  
  if (window.location.hash !== newHash) {
    // Use replaceState to update hash without triggering scroll or mode switch logic redundantly
    window.history.replaceState(null, '', newHash);
  }
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
    const teamOrder = teamMembers.map(m => m.name);
    const existingArtists = Array.from(new Set(galleryWorks.map((w) => w.artist)));
    
    return existingArtists.sort((a, b) => {
      const indexA = teamOrder.indexOf(a);
      const indexB = teamOrder.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, []);

  const groupedWorks = useMemo(() => {
    return artists.map(a => ({
      artist: a,
      works: galleryWorks.filter(w => w.artist === a).sort((w1, w2) => {
        const t1 = lang === 'ru' ? w1.titleRu : lang === 'es' ? w1.titleEs : w1.titleEn;
        const t2 = lang === 'ru' ? w2.titleRu : lang === 'es' ? w2.titleEs : w2.titleEn;
        return t1.localeCompare(t2);
      })
    }));
  }, [artists, lang]);

  const displayGroups = useMemo(() => {
    if (artist === '__all__') return groupedWorks;
    return groupedWorks.filter(g => g.artist === artist);
  }, [groupedWorks, artist]);

  const filtered = useMemo(() => {
    let arr = galleryWorks.slice();
    if (artist !== '__all__') arr = arr.filter((w) => w.artist === artist);
    
    // Always sort by title
    arr.sort((a, b) => {
      const titleA = lang === 'ru' ? a.titleRu : lang === 'es' ? a.titleEs : a.titleEn;
      const titleB = lang === 'ru' ? b.titleRu : lang === 'es' ? b.titleEs : b.titleEn;
      return titleA.localeCompare(titleB);
    });
    return arr;
  }, [artist, lang]);

  const currentIndex = useMemo(() => filtered.findIndex((w) => w.id === openId), [filtered, openId]);
  const current = currentIndex >= 0 ? filtered[currentIndex] : null;

  const open = (id: string) => {
    setOpenId(id);
    setGalleryHash({ workId: id });
  };
  const close = () => {
    setOpenId(null);
    setGalleryHash({ workId: null });
  };
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

  const handleArtistClick = (a: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (artist === a) return;
    setArtist(a); // Update state immediately
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
                onClick={(e) => handleArtistClick('__all__', e)}
              >
                {t.gallery.artistFilterAll}
              </button>
              
              <div className={styles.artistList}>
                {artists.map((a) => {
                  const member = teamMembers.find(m => m.name === a);
                  const label = lang === 'ru' ? member?.nameRu : lang === 'es' ? member?.nameEs : a;
                  return (
                    <button
                      key={a}
                      type="button"
                      className={`${styles.tag} ${artist === a ? styles.tagActive : ''}`}
                      onClick={(e) => handleArtistClick(a, e)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.contentArea}>
          {displayGroups.map((group) => {
            const member = teamMembers.find(m => m.name === group.artist);
            return (
              <div key={group.artist} className={styles.artistSection}>
                <div className={styles.divider}>
                  <div className={styles.dividerLine} />
                  <div className={styles.artistHeader}>
                    {member && (
                      <div className={styles.artistAvatar}>
                        <img src={member.photoSrc} alt={lang === 'ru' ? member.nameRu : lang === 'es' ? member.nameEs : member.name} />
                      </div>
                    )}
                    <span className={styles.artistName}>{lang === 'ru' ? member?.nameRu : lang === 'es' ? member?.nameEs : group.artist}</span>
                  </div>
                  <div className={styles.dividerLine} />
                </div>
                <div className={styles.grid}>
                  {group.works.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      className={styles.card}
                      onClick={() => open(w.id)}
                      aria-label={`${lang === 'ru' ? member?.nameRu : lang === 'es' ? member?.nameEs : w.artist} — ${lang === 'ru' ? w.titleRu : lang === 'es' ? w.titleEs : w.titleEn}`}
                    >
                      <img className={styles.thumb} src={w.src} alt="" loading="lazy" decoding="async" />
                      <div className={styles.meta}>
                        <div className={styles.artist}>{lang === 'ru' ? member?.nameRu : lang === 'es' ? member?.nameEs : w.artist}</div>
                        <div className={styles.workTitle}>{lang === 'ru' ? w.titleRu : lang === 'es' ? w.titleEs : w.titleEn}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <GalleryLightbox isOpen={current != null} work={current} onClose={close} onPrev={prev} onNext={next} />
    </section>
  );
}


