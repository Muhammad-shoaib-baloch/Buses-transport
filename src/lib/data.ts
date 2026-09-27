import 'server-only';
import { cache } from 'react';
import type { Prisma, Service } from '@prisma/client';
import { db } from './db';
import { parseJSON, splitLines, splitList } from './utils';

/* ---------- shapes passed to components ---------- */
export type VehicleView = {
  id: number;
  slug: string;
  name: string;
  classLabel: string;
  seatsLabel: string;
  capacity: number;
  driverOption: string;
  tags: string[];
  description: string;
  body: string;
  luggage: string;
  bestFor: string;
  features: string[];
  images: string[];
  alt: string;
  featured: boolean;
  category: { id: number; name: string; slug: string } | null;
};

export type ServiceView = {
  id: number;
  slug: string;
  name: string;
  icon: string;
  meta: string;
  blurb: string;
  heroTitle: string;
  heroSub: string;
  body: string;
  included: string[];
  steps: { t: string; b: string }[];
  image: string | null;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImage: string | null;
};

type VehicleRow = Prisma.VehicleGetPayload<{ include: { category: true } }>;
type ServiceRow = Service;

export const toVehicle = (v: VehicleRow): VehicleView => ({
  id: v.id,
  slug: v.slug,
  name: v.name,
  classLabel: v.classLabel,
  seatsLabel: v.seatsLabel,
  capacity: v.capacity,
  driverOption: v.driverOption,
  tags: splitList(v.tags),
  description: v.description,
  body: v.body,
  luggage: v.luggage,
  bestFor: v.bestFor,
  features: splitLines(v.features),
  images: parseJSON<string[]>(v.images, []).filter(Boolean),
  alt: v.alt || v.name,
  featured: v.featured,
  category: v.category ? { id: v.category.id, name: v.category.name, slug: v.category.slug } : null,
});

export const toService = (s: ServiceRow): ServiceView => ({
  id: s.id,
  slug: s.slug,
  name: s.name,
  icon: s.icon,
  meta: s.meta,
  blurb: s.blurb,
  heroTitle: s.heroTitle || s.name,
  heroSub: s.heroSub || s.blurb,
  body: s.body,
  included: splitLines(s.included),
  steps: parseJSON<{ t: string; b: string }[]>(s.steps, []),
  image: s.image,
  featured: s.featured,
  seoTitle: s.seoTitle,
  seoDescription: s.seoDescription,
  seoKeywords: s.seoKeywords,
  ogImage: s.ogImage,
});

/* ---------- queries (deduped per request) ---------- */
export const getServices = cache(async () => {
  const rows = await db.service.findMany({ where: { active: true }, orderBy: [{ order: 'asc' }, { id: 'asc' }] });
  return rows.map(toService);
});

export const getService = cache(async (slug: string) => {
  const s = await db.service.findFirst({
    where: { slug, active: true },
    include: {
      vehicles: { where: { active: true }, include: { category: true }, orderBy: [{ order: 'asc' }] },
      faqs: { where: { active: true }, orderBy: [{ order: 'asc' }] },
    },
  });
  if (!s) return null;
  return { ...toService(s), vehicles: s.vehicles.map(toVehicle), faqs: s.faqs };
});

export const getVehicles = cache(async () => {
  const rows = await db.vehicle.findMany({
    where: { active: true },
    include: { category: true },
    orderBy: [{ category: { order: 'asc' } }, { capacity: 'asc' }, { order: 'asc' }],
  });
  return rows.map(toVehicle);
});

export const getFeaturedVehicles = cache(async () => {
  const rows = await db.vehicle.findMany({
    where: { active: true, featured: true },
    include: { category: true },
    orderBy: [{ order: 'asc' }, { id: 'asc' }],
  });
  return rows.map(toVehicle);
});

export const getVehicle = cache(async (slug: string) => {
  const v = await db.vehicle.findFirst({
    where: { slug, active: true },
    include: { category: true, services: { where: { active: true }, orderBy: { order: 'asc' } } },
  });
  if (!v) return null;
  return { ...toVehicle(v), services: v.services.map(toService), seoTitle: v.seoTitle, seoDescription: v.seoDescription, seoKeywords: v.seoKeywords, ogImage: v.ogImage };
});

export const getCategories = cache(async () =>
  db.fleetCategory.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] }),
);

export const getFaqs = cache(async (homeOnly = false) =>
  db.faq.findMany({ where: { active: true, ...(homeOnly ? { showOnHome: true } : {}) }, orderBy: [{ order: 'asc' }, { id: 'asc' }] }),
);

export const getTestimonials = cache(async () =>
  db.testimonial.findMany({ where: { active: true }, orderBy: [{ order: 'asc' }, { id: 'asc' }] }),
);

export const getAreas = cache(async () => db.area.findMany({ where: { active: true }, orderBy: [{ order: 'asc' }, { id: 'asc' }] }));

export const getRoutes = cache(async () => db.route.findMany({ where: { active: true }, orderBy: [{ order: 'asc' }, { id: 'asc' }] }));

export const getPosts = cache(async (limit?: number) =>
  db.post.findMany({
    where: { status: 'published', publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: 'desc' },
    ...(limit ? { take: limit } : {}),
  }),
);

export const getPost = cache(async (slug: string) => db.post.findUnique({ where: { slug } }));

export const getFooterPages = cache(async () =>
  db.page.findMany({ where: { status: 'published', showInFooter: true }, orderBy: [{ order: 'asc' }, { id: 'asc' }], select: { slug: true, title: true } }),
);

export const getPage = cache(async (slug: string) => db.page.findFirst({ where: { slug, status: 'published' } }));

/** Select options for the quote forms. */
export const getFormOptions = cache(async () => {
  const [services, vehicles] = await Promise.all([getServices(), getVehicles()]);
  return {
    services: services.map((s) => ({ value: s.slug, label: s.name })),
    vehicles: vehicles.map((v) => ({ value: v.slug, label: `${v.name} (${v.seatsLabel})` })),
  };
});

/** Everything the header + footer need, in one call. */
export const getChrome = cache(async () => {
  const [services, featured, areas, routes, footerPages] = await Promise.all([
    getServices(),
    getFeaturedVehicles(),
    getAreas(),
    getRoutes(),
    getFooterPages(),
  ]);
  return { services, featured, areas, routes, footerPages };
});
