import 'server-only';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { slugify } from '@/lib/utils';

export type ActionResult = { ok: true; id?: number; message?: string } | { ok: false; error: string };

/** Run an admin mutation and turn thrown errors into a friendly result. */
export async function run(fn: () => Promise<ActionResult | void>): Promise<ActionResult> {
  try {
    const r = await fn();
    revalidatePath('/', 'layout');
    return r || { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return { ok: false, error: 'That URL slug (or email) is already used. Choose a different one.' };
    }
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return { ok: false, error: 'That item no longer exists. Refresh the page.' };
    }
    const msg = e instanceof Error ? e.message : 'Something went wrong.';
    console.error('[admin action]', e);
    return { ok: false, error: msg };
  }
}

type V = Record<string, unknown>;

export const str = (v: V, k: string, max = 500) => String(v[k] ?? '').trim().slice(0, max);
export const text = (v: V, k: string, max = 100000) => String(v[k] ?? '').replace(/\r\n/g, '\n').slice(0, max);
export const optStr = (v: V, k: string, max = 500) => {
  const s = str(v, k, max);
  return s ? s : null;
};
export const int = (v: V, k: string, def = 0) => {
  const n = parseInt(String(v[k] ?? ''), 10);
  return Number.isFinite(n) ? n : def;
};
export const optInt = (v: V, k: string) => {
  const raw = String(v[k] ?? '').trim();
  if (!raw) return null;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : null;
};
export const bool = (v: V, k: string) => v[k] === true || v[k] === 'true' || v[k] === 'on' || v[k] === 1;
export const ids = (v: V, k: string) => (Array.isArray(v[k]) ? (v[k] as unknown[]).map((x) => parseInt(String(x), 10)).filter(Number.isFinite) : []);
export const strings = (v: V, k: string) => (Array.isArray(v[k]) ? (v[k] as unknown[]).map((x) => String(x ?? '').trim()).filter(Boolean) : []);

export function slugFrom(v: V, fallbackKey = 'name') {
  const s = slugify(str(v, 'slug') || str(v, fallbackKey));
  if (!s) throw new Error('Add a name (or URL slug) first.');
  return s;
}

export const RESERVED_SLUGS = ['admin', 'api', 'media', 'images', 'services', 'fleet', 'coverage', 'blog', 'about', 'contact', 'faq', 'sitemap.xml', 'robots.txt'];
