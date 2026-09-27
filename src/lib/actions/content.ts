'use server';

import { logActivity, requireAdmin } from '@/lib/auth';
import { db } from '@/lib/db';
import { readMinutes } from '@/lib/utils';
import { RESERVED_SLUGS, bool, ids, int, optInt, optStr, run, slugFrom, str, strings, text, type ActionResult } from './helpers';

type V = Record<string, unknown>;

const seo = (v: V) => ({
  seoTitle: optStr(v, 'seoTitle', 200),
  seoDescription: optStr(v, 'seoDescription', 400),
  seoKeywords: optStr(v, 'seoKeywords', 400),
  ogImage: optStr(v, 'ogImage', 500),
});

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/* ---------------- blog posts ---------------- */
export async function savePost(v: V): Promise<ActionResult> {
  return run(async () => {
    const me = await requireAdmin();
    const title = str(v, 'title', 200);
    if (!title) throw new Error('Give the article a headline.');
    const body = text(v, 'body');
    const status = ['draft', 'review', 'published', 'archived'].includes(str(v, 'status')) ? str(v, 'status') : 'draft';
    const date = str(v, 'publishedAt');
    const data = {
      title,
      slug: slugFrom(v, 'title'),
      excerpt: str(v, 'excerpt', 600),
      body,
      category: str(v, 'category', 60) || 'General',
      tags: str(v, 'tags', 400),
      coverImage: optStr(v, 'coverImage'),
      theme: str(v, 'theme', 20) || 'ember',
      author: str(v, 'author', 120),
      status,
      publishedAt: date ? new Date(date.length <= 10 ? `${date}T09:00:00+04:00` : date) : new Date(),
      readMinutes: readMinutes(body),
      ...seo(v),
    };
    const id = optInt(v, 'id');
    const row = id ? await db.post.update({ where: { id }, data }) : await db.post.create({ data });
    await logActivity(`${id ? 'Updated' : 'Created'} article <b>${esc(row.title)}</b>${status === 'published' ? ' (published)' : ` (${status})`}`, 'i-doc', me.name);
    return { ok: true, id: row.id };
  });
}

export async function deletePost(id: number): Promise<ActionResult> {
  return run(async () => {
    const me = await requireAdmin();
    const row = await db.post.delete({ where: { id } });
    await logActivity(`Deleted article <b>${esc(row.title)}</b>`, 'i-trash', me.name);
  });
}

/* ---------------- services ---------------- */
export async function saveService(v: V): Promise<ActionResult> {
  return run(async () => {
    const me = await requireAdmin();
    const name = str(v, 'name', 120);
    if (!name) throw new Error('Add a service name.');
    const steps = Array.isArray(v.steps)
      ? (v.steps as { t?: string; b?: string }[]).map((s) => ({ t: String(s?.t || '').trim(), b: String(s?.b || '').trim() })).filter((s) => s.t)
      : [];
    const data = {
      name,
      slug: slugFrom(v),
      icon: str(v, 'icon', 40) || 'i-route',
      meta: str(v, 'meta', 120),
      blurb: str(v, 'blurb', 400),
      heroTitle: str(v, 'heroTitle', 200),
      heroSub: str(v, 'heroSub', 600),
      body: text(v, 'body'),
      included: text(v, 'included', 4000),
      steps: JSON.stringify(steps),
      image: optStr(v, 'image'),
      order: int(v, 'order'),
      active: bool(v, 'active'),
      featured: bool(v, 'featured'),
      ...seo(v),
    };
    const vehicleIds = ids(v, 'vehicleIds').map((id) => ({ id }));
    const faqIds = ids(v, 'faqIds').map((id) => ({ id }));
    const id = optInt(v, 'id');
    const row = id
      ? await db.service.update({ where: { id }, data: { ...data, vehicles: { set: vehicleIds }, faqs: { set: faqIds } } })
      : await db.service.create({ data: { ...data, vehicles: { connect: vehicleIds }, faqs: { connect: faqIds } } });
    await logActivity(`${id ? 'Updated' : 'Added'} service <b>${esc(row.name)}</b>`, 'i-route', me.name);
    return { ok: true, id: row.id };
  });
}

export async function deleteService(id: number): Promise<ActionResult> {
  return run(async () => {
    const me = await requireAdmin();
    const row = await db.service.delete({ where: { id } });
    await logActivity(`Deleted service <b>${esc(row.name)}</b>`, 'i-trash', me.name);
  });
}

/* ---------------- fleet ---------------- */
export async function saveVehicle(v: V): Promise<ActionResult> {
  return run(async () => {
    const me = await requireAdmin();
    const name = str(v, 'name', 120);
    if (!name) throw new Error('Add a vehicle name.');
    const data = {
      name,
      slug: slugFrom(v),
      classLabel: str(v, 'classLabel', 60),
      seatsLabel: str(v, 'seatsLabel', 60),
      capacity: Math.max(1, int(v, 'capacity', 4)),
      driverOption: str(v, 'driverOption') === 'either' ? 'either' : 'chauffeur',
      tags: str(v, 'tags', 400),
      description: str(v, 'description', 1200),
      body: text(v, 'body'),
      luggage: str(v, 'luggage', 80),
      bestFor: str(v, 'bestFor', 120),
      features: text(v, 'features', 3000),
      images: JSON.stringify(strings(v, 'images').slice(0, 40)),
      alt: str(v, 'alt', 200),
      order: int(v, 'order'),
      active: bool(v, 'active'),
      featured: bool(v, 'featured'),
      categoryId: optInt(v, 'categoryId'),
      ...seo(v),
    };
    const serviceIds = ids(v, 'serviceIds').map((id) => ({ id }));
    const id = optInt(v, 'id');
    const row = id
      ? await db.vehicle.update({ where: { id }, data: { ...data, services: { set: serviceIds } } })
      : await db.vehicle.create({ data: { ...data, services: { connect: serviceIds } } });
    await logActivity(`${id ? 'Updated' : 'Added'} vehicle <b>${esc(row.name)}</b>`, 'i-wheel', me.name);
    return { ok: true, id: row.id };
  });
}

export async function deleteVehicle(id: number): Promise<ActionResult> {
  return run(async () => {
    const me = await requireAdmin();
    const row = await db.vehicle.delete({ where: { id } });
    await logActivity(`Deleted vehicle <b>${esc(row.name)}</b>`, 'i-trash', me.name);
  });
}

export async function saveCategory(v: V): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    const name = str(v, 'name', 80);
    if (!name) throw new Error('Add a category name.');
    const data = { name, slug: slugFrom(v), order: int(v, 'order') };
    const id = optInt(v, 'id');
    const row = id ? await db.fleetCategory.update({ where: { id }, data }) : await db.fleetCategory.create({ data });
    return { ok: true, id: row.id };
  });
}

export async function deleteCategory(id: number): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    await db.fleetCategory.delete({ where: { id } });
  });
}

/* ---------------- FAQs ---------------- */
export async function saveFaq(v: V): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    const question = str(v, 'question', 300);
    const answer = text(v, 'answer', 4000).trim();
    if (!question || !answer) throw new Error('Add both a question and an answer.');
    const data = { question, answer, order: int(v, 'order'), active: bool(v, 'active'), showOnHome: bool(v, 'showOnHome') };
    const id = optInt(v, 'id');
    const row = id ? await db.faq.update({ where: { id }, data }) : await db.faq.create({ data });
    return { ok: true, id: row.id };
  });
}

export async function deleteFaq(id: number): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    await db.faq.delete({ where: { id } });
  });
}

/* ---------------- testimonials ---------------- */
export async function saveTestimonial(v: V): Promise<ActionResult> {
  return run(async () => {
    const me = await requireAdmin();
    const quote = text(v, 'quote', 1500).trim();
    const name = str(v, 'name', 120);
    if (!quote || !name) throw new Error('Add the quote and the client name.');
    const data = {
      quote,
      name,
      role: str(v, 'role', 160),
      avatar: (str(v, 'avatar', 3) || name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2)).toUpperCase(),
      stat: str(v, 'stat', 20),
      statLabel: str(v, 'statLabel', 40),
      rating: Math.min(5, Math.max(0, int(v, 'rating', 5))),
      order: int(v, 'order'),
      active: bool(v, 'active'),
    };
    const id = optInt(v, 'id');
    const row = id ? await db.testimonial.update({ where: { id }, data }) : await db.testimonial.create({ data });
    await logActivity(`${id ? 'Updated' : 'Added'} testimonial from <b>${esc(row.name)}</b>`, 'i-quote', me.name);
    return { ok: true, id: row.id };
  });
}

export async function deleteTestimonial(id: number): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    await db.testimonial.delete({ where: { id } });
  });
}

/* ---------------- coverage ---------------- */
export async function saveArea(v: V): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    const name = str(v, 'name', 120);
    if (!name) throw new Error('Add an area name.');
    const kind = ['emirate', 'airport', 'area'].includes(str(v, 'kind')) ? str(v, 'kind') : 'area';
    const data = {
      name,
      code: str(v, 'code', 8).toUpperCase(),
      note: str(v, 'note', 160),
      badge: str(v, 'badge', 40),
      kind,
      isHub: bool(v, 'isHub'),
      mapKey: optStr(v, 'mapKey', 60),
      order: int(v, 'order'),
      active: bool(v, 'active'),
    };
    const id = optInt(v, 'id');
    const row = id ? await db.area.update({ where: { id }, data }) : await db.area.create({ data });
    return { ok: true, id: row.id };
  });
}

export async function deleteArea(id: number): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    await db.area.delete({ where: { id } });
  });
}

export async function saveRoute(v: V): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    const from = str(v, 'from', 80);
    const to = str(v, 'to', 80);
    if (!from || !to) throw new Error('Add where the route starts and ends.');
    const data = { from, to, km: optInt(v, 'km'), mins: optInt(v, 'mins'), note: str(v, 'note', 120), order: int(v, 'order'), active: bool(v, 'active'), showInTicker: bool(v, 'showInTicker') };
    const id = optInt(v, 'id');
    const row = id ? await db.route.update({ where: { id }, data }) : await db.route.create({ data });
    return { ok: true, id: row.id };
  });
}

export async function deleteRoute(id: number): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    await db.route.delete({ where: { id } });
  });
}

/* ---------------- CMS pages ---------------- */
export async function savePage(v: V): Promise<ActionResult> {
  return run(async () => {
    const me = await requireAdmin();
    const title = str(v, 'title', 200);
    if (!title) throw new Error('Add a page title.');
    const slug = slugFrom(v, 'title');
    if (RESERVED_SLUGS.includes(slug)) throw new Error(`“${slug}” is used by the site. Pick another URL slug.`);
    const data = {
      title,
      slug,
      subtitle: str(v, 'subtitle', 400),
      body: text(v, 'body'),
      status: str(v, 'status') === 'draft' ? 'draft' : 'published',
      showInFooter: bool(v, 'showInFooter'),
      order: int(v, 'order'),
      ...seo(v),
    };
    const id = optInt(v, 'id');
    const row = id ? await db.page.update({ where: { id }, data }) : await db.page.create({ data });
    await logActivity(`${id ? 'Updated' : 'Created'} page <b>${esc(row.title)}</b>`, 'i-layers', me.name);
    return { ok: true, id: row.id };
  });
}

export async function deletePage(id: number): Promise<ActionResult> {
  return run(async () => {
    await requireAdmin();
    await db.page.delete({ where: { id } });
  });
}
