/* Shared helpers — safe for both server and client code. */

export const slugify = (s: string) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);

export const mins = (m?: number | null) => {
  if (m == null || isNaN(m)) return '';
  return m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : `${m}m`;
};

export const dateFmt = (d: Date | string) => {
  const t = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(t.getTime())) return String(d);
  return t.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Dubai' });
};

export const dateTimeFmt = (d: Date | string) => {
  const t = typeof d === 'string' ? new Date(d) : d;
  return t.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Dubai' });
};

export const num = (n: number) => Number(n || 0).toLocaleString('en-US');

/** Split a comma list into trimmed, non-empty items. */
export const splitList = (s?: string | null) =>
  String(s || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

/** Split a newline list into trimmed, non-empty lines. */
export const splitLines = (s?: string | null) =>
  String(s || '')
    .split(/\r?\n/)
    .map((x) => x.trim())
    .filter(Boolean);

export function parseJSON<T>(s: string | null | undefined, fallback: T): T {
  if (!s) return fallback;
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}

export const digits = (phone: string) => String(phone || '').replace(/[^\d+]/g, '');
export const telHref = (phone: string) => `tel:${digits(phone)}`;
export const waHref = (phone: string, text?: string) =>
  `https://wa.me/${digits(phone).replace(/^\+/, '')}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const initials = (name: string) =>
  String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');

export const readMinutes = (body: string) =>
  Math.max(1, Math.round(String(body || '').split(/\s+/).filter(Boolean).length / 200));

export const clamp = (s: unknown, max: number) => String(s ?? '').trim().slice(0, max);

export const escapeHtml = (s: string) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
