import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

const COLS = ['ref', 'createdAt', 'status', 'name', 'phone', 'email', 'company', 'service', 'vehicle', 'pickup', 'dropoff', 'date', 'time', 'passengers', 'driverOption', 'message', 'notes', 'source', 'pageUrl'] as const;

const cell = (v: unknown) => {
  const s = v instanceof Date ? v.toISOString() : String(v ?? '');
  // neutralise spreadsheet formulas and quote everything
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET(req: Request) {
  if (!(await getSession())) return new Response('Unauthorized', { status: 401 });
  const status = new URL(req.url).searchParams.get('status');
  const rows = await db.quoteRequest.findMany({ where: status && status !== 'all' ? { status } : {}, orderBy: { createdAt: 'desc' } });
  const csv = [COLS.join(','), ...rows.map((r) => COLS.map((c) => cell(r[c])).join(','))].join('\r\n');
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response('﻿' + csv, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="quote-requests-${stamp}.csv"`, 'Cache-Control': 'no-store' },
  });
}
