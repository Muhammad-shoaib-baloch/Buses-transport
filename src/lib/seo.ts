import 'server-only';
import type { Metadata } from 'next';
import { getSettings, siteUrl } from './settings';
import type { Settings } from './settings-defaults';

type SeoInput = {
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
  ogImage?: string | null;
  path: string;
  type?: 'website' | 'article';
  noindex?: boolean;
  publishedTime?: string;
};

/** Metadata for a page: explicit values win, then Settings → SEO → per-page overrides. */
export async function pageMetadata(pageKey: string | null, input: SeoInput): Promise<Metadata> {
  const s = await getSettings();
  const over = pageKey ? s.seo.pages[pageKey] : undefined;
  const title = (over?.title || input.title || '').trim();
  const description = (over?.description || input.description || s.seo.description).trim();
  const keywords = (over?.keywords || input.keywords || s.seo.keywords).trim();
  const og = over?.ogImage || input.ogImage || s.seo.ogImage || undefined;
  const url = input.path;
  return {
    ...(title ? { title } : {}),
    description,
    keywords,
    alternates: { canonical: url },
    robots: input.noindex || !s.seo.robotsIndex ? { index: false, follow: !input.noindex } : undefined,
    openGraph: {
      type: input.type || 'website',
      url,
      siteName: s.general.siteName,
      title: title || s.seo.defaultTitle,
      description,
      images: og ? [{ url: og }] : undefined,
      locale: 'en_AE',
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
    },
    twitter: { card: 'summary_large_image', title: title || s.seo.defaultTitle, description, images: og ? [og] : undefined },
  };
}

export function businessJsonLd(s: Settings) {
  const base = siteUrl(s);
  return {
    '@context': 'https://schema.org',
    '@type': s.seo.businessType || 'LocalBusiness',
    '@id': `${base}/#business`,
    name: s.general.siteName,
    url: base,
    ...(s.general.logo ? { logo: absolute(base, s.general.logo), image: absolute(base, s.general.logo) } : { image: absolute(base, s.seo.ogImage || '/images/hero.jpg') }),
    description: s.seo.description,
    telephone: s.contact.phones[0] || s.contact.whatsapp,
    email: s.contact.emails[0],
    address: { '@type': 'PostalAddress', streetAddress: s.contact.address, addressLocality: 'Dubai', addressCountry: 'AE' },
    areaServed: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah', 'Al Ain'].map((name) => ({ '@type': 'City', name })),
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '00:00', closes: '23:59' },
    ],
    priceRange: 'AED',
    sameAs: Object.values(s.social).filter(Boolean),
  };
}

export const absolute = (base: string, u: string) => (/^https?:\/\//i.test(u) ? u : `${base}${u.startsWith('/') ? '' : '/'}${u}`);
