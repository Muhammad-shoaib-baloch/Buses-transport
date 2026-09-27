import { after } from 'next/server';
import { logActivity, rateLimit } from '@/lib/auth';
import { db } from '@/lib/db';
import { notifyNewQuote, quoteLines } from '@/lib/notify';
import { getSettings } from '@/lib/settings';
import { clamp, waHref } from '@/lib/utils';

const FIELDS: [string, number][] = [
  ['name', 120],
  ['phone', 40],
  ['email', 160],
  ['company', 160],
  ['service', 120],
  ['vehicle', 160],
  ['pickup', 200],
  ['dropoff', 200],
  ['date', 20],
  ['time', 10],
  ['passengers', 20],
  ['driverOption', 80],
  ['message', 3000],
  ['source', 40],
  ['pageUrl', 300],
];

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  // honeypot: bots fill every field
  if (typeof body.website === 'string' && body.website.trim()) {
    return Response.json({ ok: true, ref: 'BT-00000', message: 'Thank you.' });
  }

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'local';
  if (!rateLimit(`quote:${ip}`, 8, 10 * 60 * 1000)) {
    return Response.json({ ok: false, error: 'Too many requests. Please call or WhatsApp us instead.' }, { status: 429 });
  }

  const data = Object.fromEntries(FIELDS.map(([k, max]) => [k, clamp(body[k], max)])) as Record<string, string> & { name: string; phone: string };
  if (!data.name) return Response.json({ ok: false, error: 'Please add your name.' }, { status: 422 });
  if (!/[0-9]{6,}/.test(data.phone.replace(/[\s()+-]/g, ''))) {
    return Response.json({ ok: false, error: 'Please add a valid phone or WhatsApp number.' }, { status: 422 });
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    return Response.json({ ok: false, error: 'That email address does not look right.' }, { status: 422 });
  }

  const created = await db.quoteRequest.create({
    data: { ...data, ref: `TMP-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ip, userAgent: clamp(req.headers.get('user-agent'), 300) },
  });
  const q = await db.quoteRequest.update({ where: { id: created.id }, data: { ref: `BT-${String(10000 + created.id)}` } });

  const s = await getSettings();
  after(async () => {
    await logActivity(`New quote request <b>${q.ref}</b> from ${escapeHtml(q.name)}${q.service ? ` · ${escapeHtml(q.service)}` : ''}`, 'i-inbox');
    try {
      await notifyNewQuote(q);
    } catch (e) {
      console.error('Quote email failed:', e);
    }
  });

  const text = `Hello, I just sent a quote request (${q.ref}) on your website.\n\n${quoteLines(q)
    .filter(([k]) => k !== 'Reference')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')}`;
  return Response.json({
    ok: true,
    ref: q.ref,
    message: s.forms.successMessage,
    whatsappUrl: s.forms.offerWhatsapp && s.contact.whatsapp ? waHref(s.contact.whatsapp, text) : undefined,
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
