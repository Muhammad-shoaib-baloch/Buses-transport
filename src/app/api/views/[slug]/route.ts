import { rateLimit } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: Request, ctx: RouteContext<'/api/views/[slug]'>) {
  const { slug } = await ctx.params;
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'local';
  if (!rateLimit(`view:${ip}:${slug}`, 3, 60 * 60 * 1000)) return Response.json({ ok: true });
  await db.post.updateMany({ where: { slug, status: 'published' }, data: { views: { increment: 1 } } });
  return Response.json({ ok: true });
}
