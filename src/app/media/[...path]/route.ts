import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { MIME, resolveUpload } from '@/lib/uploads';

/* Serves files uploaded from the admin (stored outside /public so they
   work after `next build` and survive redeploys). */
export async function GET(_req: Request, ctx: RouteContext<'/media/[...path]'>) {
  const { path: parts } = await ctx.params;
  const full = resolveUpload(parts.join('/'));
  if (!full) return new Response('Not found', { status: 404 });
  try {
    const info = await stat(full);
    if (!info.isFile()) return new Response('Not found', { status: 404 });
    const body = await readFile(full);
    const type = MIME[path.extname(full).toLowerCase()] || 'application/octet-stream';
    const headers: Record<string, string> = {
      'Content-Type': type,
      'Content-Length': String(info.size),
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
    };
    // uploaded SVGs are served as images only, never as active documents
    if (type === 'image/svg+xml') headers['Content-Security-Policy'] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
    return new Response(body, { headers });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
