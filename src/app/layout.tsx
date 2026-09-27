import type { Metadata, Viewport } from 'next';
import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import { Sprite } from '@/components/Sprite';
import { getSettings, siteUrl } from '@/lib/settings';
import './site.css';
import './admin.css';
import './admin-extra.css';

const display = Archivo({ subsets: ['latin'], weight: ['500', '600', '700', '800'], variable: '--font-display', display: 'swap' });
const body = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body', display: 'swap' });
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono', display: 'swap' });

export const dynamic = 'force-dynamic';

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const base = siteUrl(s);
  const og = s.seo.ogImage || undefined;
  return {
    metadataBase: new URL(base),
    title: { default: s.seo.defaultTitle, template: s.seo.titleTemplate || `%s · ${s.general.siteName}` },
    description: s.seo.description,
    keywords: s.seo.keywords,
    applicationName: s.general.siteName,
    icons: s.general.favicon ? { icon: s.general.favicon, apple: s.general.favicon } : { icon: '/favicon.ico' },
    robots: s.seo.robotsIndex ? { index: true, follow: true } : { index: false, follow: false },
    verification: {
      google: s.seo.googleVerification || undefined,
      other: s.seo.bingVerification ? { 'msvalidate.01': s.seo.bingVerification } : undefined,
    },
    openGraph: {
      type: 'website',
      siteName: s.general.siteName,
      title: s.seo.defaultTitle,
      description: s.seo.description,
      images: og ? [{ url: og }] : undefined,
      locale: 'en_AE',
    },
    twitter: { card: 'summary_large_image', title: s.seo.defaultTitle, description: s.seo.description, images: og ? [og] : undefined },
  };
}

/* Adds the `anim` class before first paint so reveal animations never flash. */
const ANIM_BOOT = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('anim')}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ANIM_BOOT }} />
      </head>
      <body>
        <Sprite />
        {children}
      </body>
    </html>
  );
}
