'use client';

import { useRouter } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
import { Ic } from '@/components/Sprite';
import { uploadFiles, type MediaRow } from '@/components/admin/Fields';
import { flash } from '@/components/admin/Manager';
import { deleteMedia } from '@/lib/actions/admin';

const size = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

export function MediaClient({ media }: { media: (MediaRow & { createdAt: string })[] }) {
  const router = useRouter();
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [q, setQ] = useState('');
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  async function up(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErr('');
    try {
      const rows = await uploadFiles(files);
      flash(`${rows.length} file${rows.length > 1 ? 's' : ''} uploaded.`);
      router.refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const copy = async (url: string) => {
    const full = window.location.origin + url;
    try {
      await navigator.clipboard.writeText(full);
      flash('Link copied.');
    } catch {
      prompt('Copy this link:', full);
    }
  };

  const remove = (m: MediaRow) => {
    if (!confirm(`Delete ${m.originalName || m.filename}? Pages still using it will show a broken image.`)) return;
    start(async () => {
      const r = await deleteMedia(m.id);
      if (r.ok) {
        flash('File deleted.');
        router.refresh();
      } else alert(r.error);
    });
  };

  const shown = media.filter((m) => !q || `${m.originalName} ${m.filename} ${m.alt}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div
        className={`dropzone${over ? ' over' : ''}`}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setOver(false);
          up(e.dataTransfer.files);
        }}
      >
        <p style={{ marginBottom: 12 }}>Drag photos here, or</p>
        <button className="btn btn-primary btn-sm" type="button" onClick={() => fileRef.current?.click()} disabled={busy}>
          <Ic n="i-upload" /> {busy ? 'Uploading…' : 'Choose files'}
        </button>
        <p className="note" style={{ marginTop: 10 }}>
          JPG, PNG, WebP, GIF, SVG, ICO or PDF · up to 12 MB each
        </p>
        {err && <p className="form-msg err" style={{ marginTop: 8 }}>{err}</p>}
        <input ref={fileRef} type="file" hidden multiple accept="image/*,.ico,application/pdf" onChange={(e) => up(e.target.files)} />
      </div>
      <div className="card">
        <div className="card-head">
          <h2>Files</h2>
          <span className="hint">{media.length} uploaded</span>
          <span className="top-spacer" />
          <div className="search">
            <Ic n="i-search" />
            <input type="search" placeholder="Search files" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div className="card-body">
          {shown.length === 0 ? (
            <div className="empty">
              <h3>No files yet</h3>
              <p>Uploaded images can be used for the logo, vehicles, services, blog covers and pages.</p>
            </div>
          ) : (
            <div className="media-grid">
              {shown.map((m) => (
                <div className="media-item" key={m.id}>
                  <a className="mi-img" href={m.url} target="_blank" rel="noopener">
                    {m.mime.startsWith('image/') ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={m.url} alt={m.alt} loading="lazy" />
                    ) : (
                      <Ic n="i-doc" />
                    )}
                  </a>
                  <div className="mi-meta">
                    <span title={m.originalName}>{m.originalName || m.filename}</span>
                    <span>{size(m.size)}</span>
                  </div>
                  <div className="mi-meta" style={{ paddingTop: 0 }}>
                    <span>{m.width ? `${m.width}×${m.height}` : m.mime.split('/')[1]}</span>
                    <span className="row" style={{ gap: 4 }}>
                      <button className="ibtn" type="button" title="Copy link" aria-label="Copy link" onClick={() => copy(m.url)}>
                        <Ic n="i-copy" />
                      </button>
                      <button className="ibtn danger" type="button" title="Delete" aria-label="Delete" onClick={() => remove(m)} disabled={pending}>
                        <Ic n="i-trash" />
                      </button>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
