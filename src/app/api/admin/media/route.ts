import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  if (!(await getSession())) return Response.json({ ok: false, error: 'Sign in again.' }, { status: 401 });
  const media = await db.media.findMany({ orderBy: { createdAt: 'desc' }, take: 500 });
  return Response.json({ ok: true, media });
}
