'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ic } from '@/components/Sprite';
import { logout } from '@/lib/actions/auth';

type Item = { href: string; label: string; icon: string; badge?: number; count?: number; adminOnly?: boolean };

export function Sidebar({ user, counts, brand }: { user: { name: string; email: string; role: string }; counts: Record<string, number>; brand: { first: string; second: string } }) {
  const pathname = usePathname();
  const groups: [string, Item[]][] = [
    [
      'Workspace',
      [
        { href: '/admin', label: 'Overview', icon: 'i-grid' },
        { href: '/admin/quotes', label: 'Quote requests', icon: 'i-inbox', badge: counts.newQuotes },
      ],
    ],
    [
      'Content',
      [
        { href: '/admin/services', label: 'Services', icon: 'i-route', count: counts.services },
        { href: '/admin/fleet', label: 'Fleet', icon: 'i-wheel', count: counts.vehicles },
        { href: '/admin/posts', label: 'Blog posts', icon: 'i-doc', count: counts.posts },
        { href: '/admin/pages', label: 'Pages', icon: 'i-layers', count: counts.pages },
        { href: '/admin/faqs', label: 'FAQs', icon: 'i-help', count: counts.faqs },
        { href: '/admin/testimonials', label: 'Testimonials', icon: 'i-quote', count: counts.testimonials },
        { href: '/admin/coverage', label: 'Coverage & routes', icon: 'i-map' },
        { href: '/admin/media', label: 'Media library', icon: 'i-image', count: counts.media },
      ],
    ],
    [
      'Configuration',
      [
        { href: '/admin/settings', label: 'Site settings', icon: 'i-settings', adminOnly: true },
        { href: '/admin/users', label: 'Users', icon: 'i-users', adminOnly: true },
        { href: '/admin/account', label: 'My account', icon: 'i-user' },
      ],
    ],
  ];
  const active = (href: string) => (href === '/admin' ? pathname === '/admin' : pathname.startsWith(href));
  const initials = user.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside className="side">
      <div className="side-brand">
        <span>
          <b>
            {brand.first}
            <em>{brand.second}</em>
          </b>
          <span>Admin dashboard</span>
        </span>
      </div>
      <nav className="side-nav" aria-label="Dashboard">
        {groups.map(([label, items]) => (
          <div key={label} style={{ display: 'contents' }}>
            <span className="side-lbl">{label}</span>
            {items
              .filter((i) => !i.adminOnly || user.role === 'admin')
              .map((i) => (
                <Link key={i.href} className={`snav${active(i.href) ? ' on' : ''}`} href={i.href}>
                  <Ic n={i.icon} /> {i.label}
                  {i.badge ? <span className="snav-badge">{i.badge}</span> : i.count ? <span className="snav-count">{i.count}</span> : null}
                </Link>
              ))}
          </div>
        ))}
        <span className="side-lbl">Public site</span>
        <a className="snav" href="/" target="_blank" rel="noopener">
          <Ic n="i-globe" /> View website
        </a>
      </nav>
      <div className="side-foot">
        <div className="side-user">
          <span className="av">{initials}</span>
          <span style={{ minWidth: 0 }}>
            <b>{user.name}</b>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{user.role === 'admin' ? 'Administrator' : 'Editor'}</span>
          </span>
          <form action={logout} style={{ marginLeft: 'auto' }}>
            <button type="submit" title="Sign out" aria-label="Sign out">
              <Ic n="i-logout" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

export function Topbar({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="topbar">
      <div>
        <h1>{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      <span className="top-spacer" />
      {children}
    </div>
  );
}
