import type { MetadataRoute } from 'next';
import { getSettings, siteUrl } from '@/lib/settings';

// Always reflect the latest content and the Search engines switch in Settings.
export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const s = await getSettings();
  const base = siteUrl(s);
  if (!s.seo.robotsIndex) return { rules: [{ userAgent: '*', disallow: '/' }] };
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
