import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { UPLOAD_ROOT } from '@/lib/uploads';
import { slugify } from '@/lib/utils';

const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
  'image/svg+xml': '.svg',
  'image/x-icon': '.ico',
  'image/vnd.microsoft.icon': '.ico',
  'application/pdf': '.pdf',
};

/* Admin upload: resizes big photos (max 2400px), strips metadata, stores
   under UPLOAD_DIR/YYYY/MM and records the file in the media library. */
export async function POST(req: Request) {
  const me = await getSession();
  if (!me) return Response.json({ ok: false, error: 'Sign in again.' }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ ok: false, error: 'Upload failed.' }, { status: 400 });
  }
  const files = form.getAll('files').filter((f): f is File => typeof f === 'object' && f !== null && 'arrayBuffer' in f);
  if (!files.length) return Response.json({ ok: false, error: 'No files received.' }, { status: 400 });

  const now = new Date();
  const sub = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
  const dir = path.join(/*turbopackIgnore: true*/ UPLOAD_ROOT, sub);
  await mkdir(dir, { recursive: true });

  const out = [];
  for (const file of files) {
    const type = file.type || '';
    const ext = ALLOWED[type];
    if (!ext) return Response.json({ ok: false, error: `${file.name}: only images (JPG, PNG, WebP, GIF, SVG, ICO) and PDF are allowed.` }, { status: 415 });
    if (file.size > MAX_BYTES) return Response.json({ ok: false, error: `${file.name} is larger than 12 MB.` }, { status: 413 });

    let buf: Buffer = Buffer.from(await file.arrayBuffer());
    let width: number | null = null;
    let height: number | null = null;
    let mime = type;

    if (type === 'image/svg+xml') {
      const svg = buf.toString('utf8');
      if (/<script|on\w+\s*=|javascript:/i.test(svg)) {
        return Response.json({ ok: false, error: `${file.name}: SVG files with scripts are not allowed.` }, { status: 415 });
      }
    } else if (['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(type)) {
      try {
        let img = sharp(buf, { failOn: 'error' }).rotate();
        const meta = await img.metadata();
        if ((meta.width || 0) > 2400 || (meta.height || 0) > 2400) img = img.resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true });
        if (type === 'image/png') img = img.png({ compressionLevel: 9 });
        else if (type === 'image/webp') img = img.webp({ quality: 84 });
        else if (type === 'image/avif') img = img.avif({ quality: 60 });
        else img = img.jpeg({ quality: 84, mozjpeg: true });
        const res = await img.toBuffer({ resolveWithObject: true });
        buf = res.data;
        width = res.info.width;
        height = res.info.height;
      } catch {
        return Response.json({ ok: false, error: `${file.name} is not a valid image.` }, { status: 415 });
      }
    } else if (type === 'image/gif') {
      const meta = await sharp(buf).metadata().catch(() => null);
      width = meta?.width ?? null;
      height = meta?.height ?? null;
    }
    if (type === 'image/vnd.microsoft.icon') mime = 'image/x-icon';

    const base = slugify(path.parse(file.name).name) || 'file';
    const name = `${base.slice(0, 50)}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    await writeFile(path.join(/*turbopackIgnore: true*/ dir, name), buf);
    const url = `/media/${sub}/${name}`;
    const m = await db.media.create({
      data: { url, filename: name, originalName: file.name.slice(0, 200), mime, size: buf.length, width, height, alt: String(form.get('alt') || '').slice(0, 200) },
    });
    out.push(m);
  }
  return Response.json({ ok: true, files: out });
}
