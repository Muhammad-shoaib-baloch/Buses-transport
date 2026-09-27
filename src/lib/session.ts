/* JWT session helpers — no Node-only imports, so proxy.ts can use them. */
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'bt_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionPayload = { uid: number; name: string; email: string; role: string };

function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) throw new Error('AUTH_SECRET is missing or too short. Set it in .env');
  return new TextEncoder().encode(secret);
}

export async function signSession(p: SessionPayload) {
  return new SignJWT({ ...p })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key());
}

export async function verifySession(token?: string | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ['HS256'] });
    if (typeof payload.uid !== 'number') return null;
    return { uid: payload.uid, name: String(payload.name || ''), email: String(payload.email || ''), role: String(payload.role || 'admin') };
  } catch {
    return null;
  }
}
