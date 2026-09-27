import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from './db';
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession, type SessionPayload } from './session';

export async function createSession(user: { id: number; name: string; email: string; role: string }) {
  const token = await signSession({ uid: user.id, name: user.name, email: user.email, role: user.role });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/** Current session, re-checked against the database (user still active). */
export async function getSession(): Promise<SessionPayload | null> {
  const jar = await cookies();
  const s = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!s) return null;
  const u = await db.user.findUnique({ where: { id: s.uid }, select: { id: true, name: true, email: true, role: true, active: true } });
  if (!u || !u.active) return null;
  return { uid: u.id, name: u.name, email: u.email, role: u.role };
}

/** For admin pages: redirect to the login screen when signed out. */
export async function requirePageSession() {
  const s = await getSession();
  if (!s) redirect('/admin/login');
  return s;
}

/** For server actions and admin API routes: throw when signed out. */
export async function requireAdmin(opts: { role?: 'admin' } = {}) {
  const s = await getSession();
  if (!s) throw new Error('Your session has expired. Sign in again.');
  if (opts.role === 'admin' && s.role !== 'admin') throw new Error('Only administrators can do that.');
  return s;
}

/* Simple in-memory limiter for login attempts and public forms. */
const buckets = new Map<string, { n: number; reset: number }>();
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  b.n++;
  return b.n <= limit;
}

export async function logActivity(text: string, icon = 'i-doc', userName = '') {
  try {
    await db.activity.create({ data: { text, icon, userName } });
  } catch {
    /* activity feed is best-effort */
  }
}
