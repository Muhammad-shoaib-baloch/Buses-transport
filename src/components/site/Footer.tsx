import Link from 'next/link';
import { Ic } from '@/components/Sprite';
import { telHref, waHref } from '@/lib/utils';
import type { Settings } from '@/lib/settings-defaults';
import { Brand } from './Header';

type Props = {
  s: Settings;
  services: { slug: string; name: string }[];
  vehicles: { slug: string; name: string }[];
  pages: { slug: string; title: string }[];
};

const SOCIALS: [keyof Settings['social'], string, string][] = [
  ['facebook', 'i-facebook', 'Facebook'],
  ['instagram', 'i-instagram', 'Instagram'],
  ['tiktok', 'i-tiktok', 'TikTok'],
  ['linkedin', 'i-linkedin', 'LinkedIn'],
  ['youtube', 'i-youtube', 'YouTube'],
  ['x', 'i-x', 'X'],
  ['googleReviews', 'i-google', 'Google reviews'],
];

export function Footer({ s, services, vehicles, pages }: Props) {
  const g = s.general;
  const c = s.contact;
  const col = (h: string, items: [string, string][]) => (
    <div className="foot-col">
      <h4>{h}</h4>
      <ul>
        {items.map(([label, href]) => (
          <li key={href + label}>
            <Link href={href}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
  const socials = SOCIALS.filter(([k]) => s.social[k]);
  const year = new Date().getFullYear();

  return (
    <footer className="site-foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Brand
              brand={{ first: g.brandFirst, second: g.brandSecond, tagline: g.tagline, logo: g.logo, logoHeight: g.logoHeight, withWordmark: g.showWordmarkWithLogo, siteName: g.siteName }}
            />
            {g.footerAbout && <p className="foot-about">{g.footerAbout}</p>}
            {g.footerLegal && <p className="foot-lic">{g.footerLegal}</p>}
            {socials.length > 0 && (
              <div className="social-row">
                {socials.map(([k, icon, label]) => (
                  <a key={k} href={s.social[k]} target="_blank" rel="noopener" aria-label={label} title={label}>
                    <Ic n={icon} />
                  </a>
                ))}
              </div>
            )}
          </div>
          {col(
            'Services',
            services.map((x) => [x.name, `/services/${x.slug}`]),
          )}
          {col('Fleet', [...vehicles.slice(0, 6).map((v): [string, string] => [v.name, `/fleet/${v.slug}`]), ['View full fleet', '/fleet']])}
          {col('Company', [
            ['About us', '/about'],
            ['Coverage', '/coverage'],
            ...(g.showBlogInNav ? ([['Blog', '/blog']] as [string, string][]) : []),
            ['FAQ', '/faq'],
            ['Contact', '/contact'],
          ])}
          <div className="foot-col">
            <h4>Get in touch · 24/7</h4>
            <div className="foot-contact">
              {c.phones.map((ph) => (
                <a key={ph} className="fc" href={telHref(ph)}>
                  <Ic n="i-phone" />
                  <span className="mono">{ph}</span>
                </a>
              ))}
              {c.whatsapp && (
                <a className="fc" href={waHref(c.whatsapp, c.whatsappMessage)} target="_blank" rel="noopener">
                  <Ic n="i-whats" />
                  <span className="mono">{c.whatsapp}</span>
                </a>
              )}
              {c.emails.map((e) => (
                <a key={e} className="fc" href={`mailto:${e}`}>
                  <Ic n="i-mail" />
                  <span style={{ overflowWrap: 'anywhere' }}>{e}</span>
                </a>
              ))}
              {c.address && (
                <span className="fc">
                  <Ic n="i-pin" />
                  <span>{c.address}</span>
                </span>
              )}
              {c.hours && (
                <span className="fc">
                  <Ic n="i-clock" />
                  <span>{c.hours}</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="foot-bar">
          <span>{g.copyright.replace('{year}', String(year))}</span>
          <nav>
            {pages.map((p) => (
              <Link key={p.slug} href={`/${p.slug}`}>
                {p.title}
              </Link>
            ))}
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
