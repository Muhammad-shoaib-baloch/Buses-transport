'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Ic } from '@/components/Sprite';
import { mins, telHref, waHref } from '@/lib/utils';

export type HeaderProps = {
  brand: { first: string; second: string; tagline: string; logo: string; logoHeight: number; withWordmark: boolean; siteName: string };
  strip: { location: string; hours: string; phone: string; whatsapp: string; waText: string; email: string };
  services: { slug: string; name: string; icon: string; meta: string }[];
  vehicles: { slug: string; name: string; seatsLabel: string; driverOption: string; image: string }[];
  feature: { slug: string; name: string; image: string; text: string } | null;
  emirates: { name: string; note: string }[];
  airports: { name: string; code: string; note: string }[];
  routes: { from: string; to: string; km: number | null; mins: number | null }[];
  steps: { t: string; b: string }[];
  showBlog: boolean;
};

type MegaKey = 'services' | 'fleet' | 'coverage';

export function Brand({ brand }: { brand: HeaderProps['brand'] }) {
  if (brand.logo) {
    return (
      <Link className="brand-logo" href="/" aria-label={`${brand.siteName}, home`} style={{ ['--logo-h' as string]: `${brand.logoHeight}px` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brand.logo} alt={brand.siteName} />
        {brand.withWordmark && (
          <span className="brand">
            <strong>
              {brand.first}
              <em>{brand.second}</em>
            </strong>
            {brand.tagline && <small>{brand.tagline}</small>}
          </span>
        )}
      </Link>
    );
  }
  return (
    <Link className="brand" href="/" aria-label={`${brand.siteName}, home`}>
      <strong>
        {brand.first}
        <em>{brand.second}</em>
      </strong>
      {brand.tagline && <small>{brand.tagline}</small>}
    </Link>
  );
}

const driverText = (d: string) => (d === 'either' ? 'With or without driver' : 'Chauffeur-driven');

export function Header(p: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState<MegaKey | null>(null);
  const [drawer, setDrawer] = useState(false);
  const [drawerGroup, setDrawerGroup] = useState<string | null>(null);
  const [stuck, setStuck] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const closeT = useRef<ReturnType<typeof setTimeout> | null>(null);

  const NAV: { label: string; href: string; mega?: MegaKey }[] = [
    { label: 'Services', href: '/services', mega: 'services' },
    { label: 'Fleet', href: '/fleet', mega: 'fleet' },
    { label: 'Coverage', href: '/coverage', mega: 'coverage' },
    ...(p.showBlog ? [{ label: 'Blog', href: '/blog' }] : []),
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const openMega = (k: MegaKey) => {
    if (closeT.current) clearTimeout(closeT.current);
    setOpen(k);
  };
  const closeMega = useCallback((now = false) => {
    if (closeT.current) clearTimeout(closeT.current);
    closeT.current = setTimeout(() => setOpen(null), now ? 0 : 160);
  }, []);

  // close menus on navigation (adjust state during render, not in an effect)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(null);
    setDrawer(false);
  }

  // scroll: sticky shadow + progress bar
  useEffect(() => {
    let tick = false;
    const onScroll = () => {
      if (tick) return;
      tick = true;
      requestAnimationFrame(() => {
        const y = window.scrollY || 0;
        setStuck(y > 24);
        const h = document.documentElement.scrollHeight - window.innerHeight;
        if (barRef.current) barRef.current.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
        tick = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // keyboard + outside click
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(null);
        setDrawer(false);
      }
    };
    const onDoc = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.head-main')) setOpen(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onDoc);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onDoc);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawer]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const row = (key: string, href: string, media: React.ReactNode, name: string, note: string) => (
    <Link key={key} className="mega-row" href={href} onClick={() => closeMega(true)}>
      {media}
      <span style={{ minWidth: 0 }}>
        <b>{name}</b>
        <span>{note}</span>
      </span>
      <span className="mega-row-go">
        <Ic n="i-arrow" />
      </span>
    </Link>
  );
  const iconBox = (n: string) => (
    <span className="mr-ico">
      <Ic n={n} />
    </span>
  );
  const thumb = (src: string) => (
    <span className="mr-thumb">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt="" loading="lazy" /> : <span className="mr-ico" style={{ width: '100%', height: '100%', borderRadius: 0 }}><Ic n="i-car" /></span>}
    </span>
  );

  const half = Math.ceil(p.services.length / 2);
  const vA = p.vehicles.slice(0, 3);
  const vB = p.vehicles.slice(3, 6);
  const vC = p.vehicles.slice(6, 9);

  const panels: Record<MegaKey, React.ReactNode> = {
    services: (
      <div className="wrap mega-in">
        <div className="mega-col">
          <div className="mega-eyebrow">Transfers &amp; tours</div>
          <div className="mega-list">{p.services.slice(0, half).map((s) => row(s.slug, `/services/${s.slug}`, iconBox(s.icon), s.name, s.meta))}</div>
        </div>
        <div className="mega-col">
          <div className="mega-eyebrow">Rental &amp; hire</div>
          <div className="mega-list">{p.services.slice(half).map((s) => row(s.slug, `/services/${s.slug}`, iconBox(s.icon), s.name, s.meta))}</div>
        </div>
        <div className="mega-col">
          <div className="mega-eyebrow">How booking works</div>
          <div className="mega-list">
            {p.steps.map((s, i) =>
              row(
                'st' + i,
                '/contact',
                <span className="mr-ico mono" style={{ fontSize: 13, color: 'var(--r-600)' }}>
                  0{i + 1}
                </span>,
                s.t,
                s.b,
              ),
            )}
          </div>
        </div>
        <div className="mega-feat">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/band-services.jpg" alt="" loading="lazy" />
          <span className="mf-tag">Airport transfers</span>
          <h4>DXB, DWC, Abu Dhabi &amp; Sharjah</h4>
          <p>Meet-and-greet at arrivals with flight tracking included, so a delayed landing moves your pick-up automatically.</p>
          <Link className="btn btn-primary btn-sm" href="/services/airport-transfer" style={{ marginTop: 10, alignSelf: 'flex-start' }}>
            View service <Ic n="i-arrow" />
          </Link>
        </div>
      </div>
    ),
    fleet: (
      <div className="wrap mega-in">
        {[
          ['Cars & SUVs', vA],
          ['Vans', vB],
          ['Buses & coaches', vC],
        ].map(([title, arr]) => (
          <div className="mega-col" key={title as string}>
            <div className="mega-eyebrow">{title as string}</div>
            <div className="mega-list">
              {(arr as HeaderProps['vehicles']).map((v) => row(v.slug, `/fleet/${v.slug}`, thumb(v.image), v.name, `${v.seatsLabel} · ${driverText(v.driverOption)}`))}
            </div>
          </div>
        ))}
        {p.feature && (
          <div className="mega-feat">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {p.feature.image && <img src={p.feature.image} alt="" loading="lazy" />}
            <span className="mf-tag">Most requested</span>
            <h4>{p.feature.name}</h4>
            <p>{p.feature.text}</p>
            <Link className="btn btn-primary btn-sm" href="/fleet" style={{ marginTop: 10, alignSelf: 'flex-start' }}>
              View full fleet <Ic n="i-arrow" />
            </Link>
          </div>
        )}
      </div>
    ),
    coverage: (
      <div className="wrap mega-in">
        <div className="mega-col">
          <div className="mega-eyebrow">Emirates</div>
          <div className="mega-list">{p.emirates.slice(0, 8).map((e) => row(e.name, '/coverage', iconBox('i-pin'), e.name, e.note))}</div>
        </div>
        <div className="mega-col">
          <div className="mega-eyebrow">Popular routes</div>
          <div className="mega-list">
            {p.routes.slice(0, 5).map((r, i) =>
              row('r' + i, '/coverage', iconBox('i-route'), `${r.from} → ${r.to}`, [r.km ? `${r.km} km` : '', r.mins ? `approx. ${mins(r.mins)}` : ''].filter(Boolean).join(' · ')),
            )}
          </div>
        </div>
        <div className="mega-col">
          <div className="mega-eyebrow">Airports served</div>
          <div className="mega-list">{p.airports.map((a) => row(a.name, '/services/airport-transfer', iconBox('i-plane'), a.name, [a.code, a.note].filter(Boolean).join(' · ')))}</div>
        </div>
        <div className="mega-feat">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/band-dest.jpg" alt="" loading="lazy" />
          <span className="mf-tag">All seven emirates</span>
          <h4>Inter-emirate travel, every day</h4>
          <p>Dubai to Abu Dhabi, Sharjah, Ras Al Khaimah, Fujairah, Al Ain and beyond — for individual trips and group transport.</p>
          <Link className="btn btn-primary btn-sm" href="/coverage" style={{ marginTop: 10, alignSelf: 'flex-start' }}>
            See coverage <Ic n="i-arrow" />
          </Link>
        </div>
      </div>
    ),
  };

  const drawerSub = (k: MegaKey) => {
    const link = (href: string, t: string, s?: string) => (
      <Link key={href + t} href={href} onClick={() => setDrawer(false)}>
        {t}
        {s ? <span style={{ color: 'var(--muted)', fontSize: 11 }}> · {s}</span> : null}
      </Link>
    );
    if (k === 'fleet') return p.vehicles.map((v) => link(`/fleet/${v.slug}`, v.name, v.seatsLabel));
    if (k === 'services') return p.services.map((s) => link(`/services/${s.slug}`, s.name));
    return p.emirates.map((e) => link('/coverage', e.name, e.note));
  };

  return (
    <>
      <header className={`site-head${stuck ? ' stuck' : ''}`} id="siteHead" onMouseLeave={() => closeMega()}>
        <div className="head-strip">
          <div className="wrap head-strip-in">
            {p.strip.location && (
              <span className="hs-item">
                <Ic n="i-pin" /> {p.strip.location}
              </span>
            )}
            {p.strip.location && p.strip.hours && <span className="hs-sep" />}
            {p.strip.hours && (
              <span className="hs-item">
                <Ic n="i-clock" /> {p.strip.hours}
              </span>
            )}
            <span className="hs-grow" />
            {p.strip.phone && (
              <a className="hs-item hs-keep" href={telHref(p.strip.phone)}>
                <Ic n="i-phone" /> <span className="mono">{p.strip.phone}</span>
              </a>
            )}
            {p.strip.whatsapp && (
              <a className="hs-item hs-whats hs-keep" href={waHref(p.strip.whatsapp, p.strip.waText)} target="_blank" rel="noopener">
                <Ic n="i-whats" /> WhatsApp
              </a>
            )}
            {p.strip.email && (
              <a className="hs-item" href={`mailto:${p.strip.email}`}>
                <Ic n="i-mail" /> {p.strip.email}
              </a>
            )}
          </div>
        </div>

        <div
          className="head-main"
          onMouseOver={(e) => {
            const t = e.target as HTMLElement;
            const item = t.closest('.nav-item[data-mega]') as HTMLElement | null;
            if (item) return openMega(item.dataset.mega as MegaKey);
            if (t.closest('.mega')) {
              if (closeT.current) clearTimeout(closeT.current);
              return;
            }
            if (open) closeMega();
          }}
        >
          <div className="wrap head-main-in">
            <Brand brand={p.brand} />
            <nav className="mainnav" aria-label="Primary">
              {NAV.map((n) => (
                <span key={n.href} className={`nav-item${n.mega && open === n.mega ? ' open' : ''}`} data-mega={n.mega}>
                  <Link
                    className={`nav-link${isActive(n.href) ? ' active' : ''}`}
                    href={n.href}
                    aria-haspopup={n.mega ? 'true' : undefined}
                    aria-expanded={n.mega ? open === n.mega : undefined}
                    onFocus={() => (n.mega ? openMega(n.mega) : closeMega(true))}
                  >
                    {n.label}
                    {n.mega && <Ic n="i-chev" />}
                  </Link>
                </span>
              ))}
            </nav>
            <div className="head-act">
              <Link className="btn btn-primary btn-sm" href="/contact">
                Get a quote <Ic n="i-arrow" />
              </Link>
              <button className="burger" type="button" aria-label="Open menu" aria-expanded={drawer} onClick={() => setDrawer(true)}>
                <Ic n="i-menu" />
              </button>
            </div>
          </div>
          <div className="mega-host">
            {(Object.keys(panels) as MegaKey[]).map((k) => (
              <div key={k} className={`mega${open === k ? ' show' : ''}`} data-panel={k}>
                {panels[k]}
              </div>
            ))}
          </div>
        </div>
        <div className="head-progress" ref={barRef} />
      </header>

      {drawer && (
        <>
          <div className="drawer" role="dialog" aria-label="Menu">
            <div className="drawer-head">
              <strong>Menu</strong>
              <button className="icon-btn" type="button" aria-label="Close menu" onClick={() => setDrawer(false)}>
                <Ic n="i-close" />
              </button>
            </div>
            <div className="drawer-body">
              <div className="dr-group">
                <Link className="dr-top" href="/" onClick={() => setDrawer(false)}>
                  Home
                </Link>
              </div>
              {NAV.map((n) =>
                n.mega ? (
                  <div key={n.href} className={`dr-group${drawerGroup === n.mega ? ' open' : ''}`}>
                    <button className="dr-top" type="button" onClick={() => setDrawerGroup(drawerGroup === n.mega ? null : n.mega!)}>
                      {n.label}
                      <Ic n="i-chev" />
                    </button>
                    <div className="dr-sub">
                      <Link href={n.href} onClick={() => setDrawer(false)}>
                        <strong>All {n.label.toLowerCase()}</strong>
                      </Link>
                      {drawerSub(n.mega)}
                    </div>
                  </div>
                ) : (
                  <div key={n.href} className="dr-group">
                    <Link className="dr-top" href={n.href} onClick={() => setDrawer(false)}>
                      {n.label}
                    </Link>
                  </div>
                ),
              )}
              <div className="dr-group">
                <Link className="dr-top" href="/faq" onClick={() => setDrawer(false)}>
                  FAQ
                </Link>
              </div>
              <div className="dr-cta">
                <Link className="btn btn-primary btn-block" href="/contact" onClick={() => setDrawer(false)}>
                  Get a Quote <Ic n="i-arrow" />
                </Link>
                {p.strip.whatsapp && (
                  <a className="btn btn-whats btn-block" href={waHref(p.strip.whatsapp, p.strip.waText)} target="_blank" rel="noopener">
                    <Ic n="i-whats" /> WhatsApp
                  </a>
                )}
                {p.strip.phone && (
                  <a className="btn btn-ghost btn-block" href={telHref(p.strip.phone)}>
                    <Ic n="i-phone" /> Call Now
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="scrim" onClick={() => setDrawer(false)} />
        </>
      )}
    </>
  );
}
