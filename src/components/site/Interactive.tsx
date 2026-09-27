'use client';

import { useEffect, useRef, useState } from 'react';
import { Ic } from '@/components/Sprite';
import { FleetCard, PostCard, type ContactInfo, type PostCardData, type VehicleCardData } from './Cards';

/* reveal new cards after a filter change (the observer only sees the first render) */
function revealAll(root: HTMLElement | null) {
  if (!root) return;
  requestAnimationFrame(() => root.querySelectorAll('.reveal').forEach((el) => el.classList.add('in')));
}

export function FleetBrowser({ vehicles, categories, contact }: { vehicles: VehicleCardData[]; categories: { slug: string; name: string }[]; contact: ContactInfo }) {
  const [cat, setCat] = useState('all');
  const grid = useRef<HTMLDivElement>(null);
  const list = cat === 'all' ? vehicles : cat === '__self' ? vehicles.filter((v) => v.driverOption === 'either') : vehicles.filter((v) => v.category?.slug === cat);
  useEffect(() => {
    if (cat !== 'all') revealAll(grid.current);
  }, [cat]);
  const cats = categories.filter((c) => vehicles.some((v) => v.category?.slug === c.slug));
  return (
    <>
      <div className="filters" role="toolbar" aria-label="Filter vehicles">
        <button className={`fbtn${cat === 'all' ? ' on' : ''}`} type="button" onClick={() => setCat('all')}>
          All vehicles
        </button>
        {cats.map((c) => (
          <button key={c.slug} className={`fbtn${cat === c.slug ? ' on' : ''}`} type="button" onClick={() => setCat(c.slug)}>
            {c.name}
          </button>
        ))}
        <button className={`fbtn${cat === '__self' ? ' on' : ''}`} type="button" onClick={() => setCat('__self')}>
          Self-drive available
        </button>
      </div>
      <div className="grid g-3" ref={grid}>
        {list.map((v, i) => (
          <FleetCard key={v.slug} v={v} i={i} contact={contact} />
        ))}
      </div>
    </>
  );
}

export function BlogBrowser({ posts }: { posts: PostCardData[] }) {
  const cats = ['All', ...Array.from(new Set(posts.map((p) => p.category)))];
  const [cat, setCat] = useState('All');
  const grid = useRef<HTMLDivElement>(null);
  const list = cat === 'All' ? posts : posts.filter((p) => p.category === cat);
  useEffect(() => {
    if (cat !== 'All') revealAll(grid.current);
  }, [cat]);
  return (
    <>
      {cats.length > 2 && (
        <div className="filters">
          {cats.map((c) => (
            <button key={c} className={`fbtn${cat === c ? ' on' : ''}`} type="button" onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
        </div>
      )}
      <div className="grid g-3" ref={grid}>
        {list.length ? (
          list.map((p, i) => <PostCard key={p.id} p={p} i={i} />)
        ) : (
          <div className="empty" style={{ gridColumn: '1/-1' }}>
            <h3>No articles yet</h3>
            <p>New guides will appear here soon.</p>
          </div>
        )}
      </div>
    </>
  );
}

export function RailNav({ target }: { target: string }) {
  const go = (dir: number) => {
    const rail = document.getElementById(target);
    if (!rail) return;
    const card = rail.firstElementChild as HTMLElement | null;
    const step = card ? card.getBoundingClientRect().width + 20 : 300;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rail.scrollBy({ left: step * dir, behavior: reduced ? 'auto' : 'smooth' });
  };
  return (
    <div className="rail-nav">
      <button className="rail-btn prev" type="button" aria-label="Previous" onClick={() => go(-1)}>
        <Ic n="i-chev" />
      </button>
      <button className="rail-btn next" type="button" aria-label="Next" onClick={() => go(1)}>
        <Ic n="i-chev" />
      </button>
    </div>
  );
}

type T = { id: number; quote: string; name: string; role: string; avatar: string; stat: string; statLabel: string; rating: number };

export function TestimonialSlider({ items }: { items: T[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;
  useEffect(() => {
    if (paused || n < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((k) => (k + 1) % n), 7000);
    return () => clearInterval(t);
  }, [paused, n]);
  const go = (k: number) => setI(((k % n) + n) % n);
  return (
    <div className="tsl" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="tsl-track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {items.map((t) => (
          <div className="tsl-item" key={t.id}>
            <div className="tq" style={t.stat ? undefined : { gridTemplateColumns: '1fr' }}>
              {t.stat && (
                <div className="tq-side">
                  <b>{t.stat}</b>
                  <span>{t.statLabel}</span>
                </div>
              )}
              <div>
                <div className="tq-stars" aria-label={`${t.rating} out of 5`}>
                  {Array.from({ length: Math.max(0, Math.min(5, t.rating)) }, (_, k) => (
                    <Ic key={k} n="i-star" />
                  ))}
                </div>
                <blockquote>{t.quote}</blockquote>
                <div className="tq-who">
                  <span className="tq-av">{t.avatar}</span>
                  <span>
                    <b>{t.name}</b>
                    <span>{t.role}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {n > 1 && (
        <div className="tsl-ctrl">
          <button className="rail-btn prev" type="button" aria-label="Previous" onClick={() => go(i - 1)}>
            <Ic n="i-chev" />
          </button>
          <button className="rail-btn next" type="button" aria-label="Next" onClick={() => go(i + 1)}>
            <Ic n="i-chev" />
          </button>
          <span className="tsl-dots">
            {items.map((t, k) => (
              <button key={t.id} className={`tsl-dot${k === i ? ' on' : ''}`} type="button" aria-label={`Testimonial ${k + 1}`} onClick={() => go(k)} />
            ))}
          </span>
        </div>
      )}
    </div>
  );
}

export function Gallery({ images, alt, fallback }: { images: string[]; alt: string; fallback: string }) {
  const [i, setI] = useState(0);
  const n = images.length;
  if (!n) return <div className="gal-main"><span className="vart" dangerouslySetInnerHTML={{ __html: fallback }} /></div>;
  return (
    <div>
      <div className="gal-main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[i]} alt={`${alt}${n > 1 ? ` — photo ${i + 1} of ${n}` : ''}`} />
        {n > 1 && (
          <>
            <button className="rail-btn prev gal-nav" type="button" aria-label="Previous photo" onClick={() => setI((i - 1 + n) % n)}>
              <Ic n="i-chev" />
            </button>
            <button className="rail-btn next gal-nav" type="button" aria-label="Next photo" onClick={() => setI((i + 1) % n)}>
              <Ic n="i-chev" />
            </button>
            <span className="gal-count">
              {i + 1} / {n}
            </span>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="gal-thumbs">
          {images.map((src, k) => (
            <button key={src + k} type="button" className={k === i ? 'on' : ''} aria-label={`Show photo ${k + 1}`} onClick={() => setI(k)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Counts one view per article per browser session. */
export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const k = `bt.view.${slug}`;
    try {
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, '1');
    } catch {
      /* storage blocked: still count */
    }
    fetch(`/api/views/${encodeURIComponent(slug)}`, { method: 'POST', keepalive: true }).catch(() => {});
  }, [slug]);
  return null;
}
