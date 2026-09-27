import 'server-only';
import path from 'node:path';

export const UPLOAD_ROOT = path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.UPLOAD_DIR || './storage/uploads');

export const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
  '.pdf': 'application/pdf',
};

/** Resolve a /media/... relative path safely inside the upload root. */
export function resolveUpload(rel: string) {
  const full = path.resolve(/*turbopackIgnore: true*/ UPLOAD_ROOT, rel);
  if (!full.startsWith(UPLOAD_ROOT + path.sep)) return null;
  return full;
}
