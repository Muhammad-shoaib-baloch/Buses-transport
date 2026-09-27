import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { getSettings, siteUrl } from '@/lib/settings';

// Always reflect the latest content and the Search engines switch in Settings.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const s = await getSettings();
  const base = siteUrl(s);
  const [services, vehicles, posts, pages] = await Promise.all([
    db.service.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    db.vehicle.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    db.post.findMany({ where: { status: 'published', publishedAt: { lte: new Date() } }, select: { slug: true, updatedAt: true } }),
    db.page.findMany({ where: { status: 'published' }, select: { slug: true, updatedAt: true } }),
  ]);
  const now = new Date();
  const statics: [string, number][] = [
    ['', 1],
    ['/services', 0.9],
    ['/fleet', 0.9],
    ['/coverage', 0.7],
    ['/about', 0.6],
    ['/contact', 0.8],
    ['/faq', 0.6],
    ...(s.general.showBlogInNav ? ([['/blog', 0.6]] as [string, number][]) : []),
  ];
  return [
    ...statics.map(([p, priority]) => ({ url: `${base}${p}`, lastModified: now, changeFrequency: 'weekly' as const, priority })),
    ...services.map((x) => ({ url: `${base}/services/${x.slug}`, lastModified: x.updatedAt, changeFrequency: 'monthly' as const, priority: 0.8 })),
    ...vehicles.map((x) => ({ url: `${base}/fleet/${x.slug}`, lastModified: x.updatedAt, changeFrequency: 'monthly' as const, priority: 0.7 })),
    ...posts.map((x) => ({ url: `${base}/blog/${x.slug}`, lastModified: x.updatedAt, changeFrequency: 'monthly' as const, priority: 0.5 })),
    ...pages.map((x) => ({ url: `${base}/${x.slug}`, lastModified: x.updatedAt, changeFrequency: 'yearly' as const, priority: 0.3 })),
  ];
}
