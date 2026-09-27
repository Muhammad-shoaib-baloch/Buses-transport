import 'server-only';
import nodemailer from 'nodemailer';
import type { QuoteRequest } from '@prisma/client';
import { getSettings } from './settings';

const esc = (s: string) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export function quoteLines(q: Pick<QuoteRequest, 'ref' | 'name' | 'phone' | 'email' | 'company' | 'service' | 'vehicle' | 'pickup' | 'dropoff' | 'date' | 'time' | 'passengers' | 'driverOption' | 'message'>) {
  return [
    ['Reference', q.ref],
    ['Name', q.name],
    ['Phone / WhatsApp', q.phone],
    ['Email', q.email],
    ['Company', q.company],
    ['Service', q.service],
    ['Vehicle', q.vehicle],
    ['Pick-up', q.pickup],
    ['Drop-off', q.dropoff],
    ['Date', q.date],
    ['Time', q.time],
    ['Passengers', q.passengers],
    ['Driver', q.driverOption],
    ['Details', q.message],
  ].filter(([, v]) => v && String(v).trim()) as [string, string][];
}

export async function sendMail(opts: { to: string; subject: string; html: string; text: string; replyTo?: string }) {
  const s = await getSettings();
  const e = s.email;
  if (!e.smtpHost || !e.smtpUser) throw new Error('SMTP is not configured.');
  const transport = nodemailer.createTransport({
    host: e.smtpHost,
    port: Number(e.smtpPort) || 587,
    secure: !!e.smtpSecure,
    auth: { user: e.smtpUser, pass: e.smtpPass },
  });
  await transport.sendMail({
    from: { name: e.fromName || s.general.siteName, address: e.fromEmail || e.smtpUser },
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    replyTo: opts.replyTo,
  });
}

/** Emails the team about a new quote request, if notifications are switched on. */
export async function notifyNewQuote(q: QuoteRequest) {
  const s = await getSettings();
  if (!s.email.notifyEnabled || !s.email.notifyTo) return;
  const lines = quoteLines(q);
  const rows = lines.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#66718A;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0;color:#0C1220">${esc(v)}</td></tr>`).join('');
  await sendMail({
    to: s.email.notifyTo,
    subject: `New quote request ${q.ref} — ${q.name}${q.service ? ` · ${q.service}` : ''}`,
    html: `<div style="font-family:Arial,sans-serif;font-size:14px"><h2 style="margin:0 0 12px">New quote request</h2><table>${rows}</table></div>`,
    text: lines.map(([k, v]) => `${k}: ${v}`).join('\n'),
    replyTo: q.email || undefined,
  });
}
