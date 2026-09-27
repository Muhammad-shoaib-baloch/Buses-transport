import { JsonLd } from '@/components/JsonLd';
import { Footer } from '@/components/site/Footer';
import { Header, type HeaderProps } from '@/components/site/Header';
import { FloatingButtons, RevealObserver } from '@/components/site/SiteEffects';
import { ThemeStyle, Tracking } from '@/components/site/Tracking';
import { ToastHost } from '@/components/site/Toast';
import { getChrome } from '@/lib/data';
import { businessJsonLd } from '@/lib/seo';
import { getSettings } from '@/lib/settings';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [s, chrome] = await Promise.all([getSettings(), getChrome()]);
  const g = s.general;
  const c = s.contact;
  const emirates = chrome.areas.filter((a) => a.kind === 'emirate');
  const airports = chrome.areas.filter((a) => a.kind === 'airport');
  const feature = chrome.featured.find((v) => v.images.length > 0 && v.slug === 'v-class') || chrome.featured.find((v) => v.images.length > 0) || null;

  const header: HeaderProps = {
    brand: { first: g.brandFirst, second: g.brandSecond, tagline: g.tagline, logo: g.logo, logoHeight: g.logoHeight, withWordmark: g.showWordmarkWithLogo, siteName: g.siteName },
    strip: { location: c.headStripLocation, hours: c.hours, phone: c.phones[0] || '', whatsapp: c.whatsapp, waText: c.whatsappMessage, email: c.emails[0] || '' },
    services: chrome.services.map((x) => ({ slug: x.slug, name: x.name, icon: x.icon, meta: x.meta })),
    vehicles: chrome.featured.map((v) => ({ slug: v.slug, name: v.name, seatsLabel: v.seatsLabel, driverOption: v.driverOption, image: v.images[0] || '' })),
    feature: feature ? { slug: feature.slug, name: feature.name, image: feature.images[0], text: feature.description } : null,
    emirates: emirates.map((e) => ({ name: e.name, note: e.note })),
    airports: airports.map((a) => ({ name: a.name, code: a.code, note: a.note })),
    routes: chrome.routes.map((r) => ({ from: r.from, to: r.to, km: r.km, mins: r.mins })),
    steps: s.home.steps,
    showBlog: g.showBlogInNav,
  };

  return (
    <>
      <ThemeStyle theme={s.theme} />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header {...header} />
      <main id="main" className="view">
        {children}
      </main>
      <Footer s={s} services={chrome.services} vehicles={chrome.featured} pages={chrome.footerPages} />
      <FloatingButtons whatsapp={c.whatsapp} waText={c.whatsappMessage} showWhatsapp={g.showFloatingWhatsApp} />
      <RevealObserver />
      <ToastHost />
      <Tracking t={s.tracking} />
      <JsonLd data={businessJsonLd(s)} />
    </>
  );
}
