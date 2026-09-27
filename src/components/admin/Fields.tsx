'use client';

import { useEffect, useRef, useState } from 'react';
import { ICON_CHOICES, Ic } from '@/components/Sprite';
import { renderMarkdown } from '@/lib/markdown';
import { slugify } from '@/lib/utils';

/* ============================================================
   Generic admin form fields
   ============================================================ */
export type Opt = { value: string | number; label: string };
type Base = { k: string; label: string; help?: string; full?: boolean };
export type FieldDef =
  | (Base & { type: 'text' | 'number' | 'date' | 'datetime' | 'email' | 'url' | 'password'; placeholder?: string })
  | (Base & { type: 'textarea' | 'code'; placeholder?: string; rows?: number })
  | (Base & { type: 'markdown' })
  | (Base & { type: 'select'; options: Opt[] })
  | (Base & { type: 'toggle' })
  | (Base & { type: 'image' })
  | (Base & { type: 'images' })
  | (Base & { type: 'multi'; options: Opt[] })
  | (Base & { type: 'icon' })
  | (Base & { type: 'color' })
  | (Base & { type: 'slug'; from: string; prefix?: string })
  | (Base & { type: 'strings'; placeholder?: string })
  | (Base & { type: 'steps' | 'kv' | 'features' | 'stats' })
  | { type: 'section'; title: string; desc?: string; k?: undefined };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Values = Record<string, any>;

/* ---------- uploads ---------- */
export type MediaRow = { id: number; url: string; filename: string; originalName: string; mime: string; size: number; width: number | null; height: number | null; alt: string };

export async function uploadFiles(files: FileList | File[]): Promise<MediaRow[]> {
  const fd = new FormData();
  Array.from(files).forEach((f) => fd.append('files', f));
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
  const data = await res.json().catch(() => ({ ok: false, error: 'Upload failed.' }));
  if (!data.ok) throw new Error(data.error || 'Upload failed.');
  return data.files;
}

export function MediaPicker({ onPick, onClose, multiple = false }: { onPick: (urls: string[]) => void; onClose: () => void; multiple?: boolean }) {
  const [items, setItems] = useState<MediaRow[] | null>(null);
  const [err, setErr] = useState('');
  const [sel, setSel] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    fetch('/api/admin/media')
      .then((r) => r.json())
      .then((d) => (d.ok ? setItems(d.media) : setErr(d.error)))
      .catch(() => setErr('Could not load the media library.'));
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  async function up(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErr('');
    try {
      const rows = await uploadFiles(files);
      setItems((cur) => [...rows, ...(cur || [])]);
      if (!multiple && rows[0]) onPick([rows[0].url]);
      else setSel((s) => [...s, ...rows.map((r) => r.url)]);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const images = (items || []).filter((m) => m.mime.startsWith('image/'));
  return (
    <>
      <div className="amodal-scrim" onClick={onClose} />
      <div className="amodal" role="dialog" aria-label="Media library">
        <div className="amodal-head">
          <h2>Media library</h2>
          <button className="btn btn-primary btn-sm" type="button" onClick={() => fileRef.current?.click()} disabled={busy}>
            <Ic n="i-upload" /> {busy ? 'Uploading…' : 'Upload'}
          </button>
          <input ref={fileRef} type="file" hidden multiple accept="image/*" onChange={(e) => up(e.target.files)} />
          <button className="icon-btn" type="button" aria-label="Close" onClick={onClose}>
            <Ic n="i-close" />
          </button>
        </div>
        <div className="amodal-body">
          {err && <p className="form-msg err" style={{ marginBottom: 12 }}>{err}</p>}
          {!items ? (
            <p className="muted">Loading…</p>
          ) : images.length === 0 ? (
            <div className="empty">
              <h3>No images yet</h3>
              <p>Upload one to get started.</p>
            </div>
          ) : (
            <div className="media-grid">
              {images.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="media-item"
                  style={sel.includes(m.url) ? { borderColor: 'var(--r-400)', boxShadow: '0 0 0 2px var(--r-wash)' } : undefined}
                  onClick={() => (multiple ? setSel((s) => (s.includes(m.url) ? s.filter((x) => x !== m.url) : [...s, m.url])) : onPick([m.url]))}
                >
                  <span className="mi-img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt={m.alt} loading="lazy" />
                  </span>
                  <span className="mi-meta">
                    <span>{m.originalName || m.filename}</span>
                    {m.width ? <span>{m.width}×{m.height}</span> : null}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        {multiple && (
          <div className="form-bar">
            <span className="muted" style={{ fontSize: 'var(--t-xs)' }}>{sel.length} selected</span>
            <span className="grow" />
            <button className="btn btn-ghost btn-sm" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-primary btn-sm" type="button" disabled={!sel.length} onClick={() => onPick(sel)}>
              Add selected
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function ImageField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [picker, setPicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  async function up(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErr('');
    try {
      const [m] = await uploadFiles(files);
      if (m) onChange(m.url);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }
  return (
    <div className="imgf">
      <span className="imgf-prev">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {value ? <img src={value} alt="" /> : <Ic n="i-image" />}
      </span>
      <div className="imgf-side">
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="/media/… or https://…" />
        <div className="row">
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => fileRef.current?.click()} disabled={busy}>
            <Ic n="i-upload" /> {busy ? 'Uploading…' : 'Upload'}
          </button>
          <button className="btn btn-ghost btn-sm" type="button" onClick={() => setPicker(true)}>
            <Ic n="i-image" /> Library
          </button>
          {value && (
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => onChange('')}>
              Remove
            </button>
          )}
        </div>
        {err && <span className="form-msg err">{err}</span>}
        <input ref={fileRef} type="file" hidden accept="image/*" onChange={(e) => up(e.target.files)} />
      </div>
      {picker && (
        <MediaPicker
          onClose={() => setPicker(false)}
          onPick={(urls) => {
            onChange(urls[0] || '');
            setPicker(false);
          }}
        />
      )}
    </div>
  );
}

function ImagesField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const list = Array.isArray(value) ? value : [];
  const [picker, setPicker] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  async function up(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErr('');
    try {
      const rows = await uploadFiles(files);
      onChange([...list, ...rows.map((r) => r.url)]);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }
  return (
    <div>
      <div className="imgs-grid">
        {list.map((u, i) => (
          <div className="imgs-item" key={u + i}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" />
            {i === 0 && <span className="imgs-badge">Cover</span>}
            <div className="imgs-acts">
              <button type="button" title="Move left" disabled={i === 0} onClick={() => move(i, -1)}>
                <Ic n="i-chev" className="rot90" />
              </button>
              <button type="button" title="Move right" disabled={i === list.length - 1} onClick={() => move(i, 1)}>
                <Ic n="i-chev" className="rot-90" />
              </button>
              <button type="button" title="Remove" onClick={() => onChange(list.filter((_, k) => k !== i))}>
                <Ic n="i-trash" />
              </button>
            </div>
          </div>
        ))}
        <button className="imgs-add" type="button" onClick={() => fileRef.current?.click()} disabled={busy}>
          <Ic n="i-upload" />
          {busy ? 'Uploading…' : 'Upload photos'}
        </button>
        <button className="imgs-add" type="button" onClick={() => setPicker(true)}>
          <Ic n="i-image" />
          From library
        </button>
      </div>
      {err && <p className="form-msg err" style={{ marginTop: 8 }}>{err}</p>}
      <input ref={fileRef} type="file" hidden multiple accept="image/*" onChange={(e) => up(e.target.files)} />
      {picker && (
        <MediaPicker
          multiple
          onClose={() => setPicker(false)}
          onPick={(urls) => {
            onChange([...list, ...urls.filter((u) => !list.includes(u))]);
            setPicker(false);
          }}
        />
      )}
    </div>
  );
}

function MarkdownField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  return (
    <div>
      <div className="row" style={{ marginBottom: 6 }}>
        <span className="help" style={{ fontSize: 11, color: 'var(--muted)' }}>
          ## heading · **bold** · *italic* · - list · 1. list · &gt; quote · [link](url) · ![image](url) · | table |
        </span>
        <span className="md-tabs">
          <button type="button" className={tab === 'write' ? 'on' : ''} onClick={() => setTab('write')}>
            Write
          </button>
          <button type="button" className={tab === 'preview' ? 'on' : ''} onClick={() => setTab('preview')}>
            Preview
          </button>
        </span>
      </div>
      {tab === 'write' ? (
        <textarea className="tall" value={value || ''} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <div className="md-preview prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(value || '') || '<p style="color:var(--muted)">Nothing to preview yet.</p>' }} />
      )}
    </div>
  );
}

type Col = { k: string; ph: string; type?: 'text' | 'textarea' | 'number' | 'icon' };
function ListEditor({ value, onChange, cols, blank, addLabel }: { value: Values[]; onChange: (v: Values[]) => void; cols: Col[]; blank: Values; addLabel: string }) {
  const list = Array.isArray(value) ? value : [];
  const set = (i: number, k: string, v: unknown) => onChange(list.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const plain = cols.filter((c) => c.type !== 'textarea' && c.type !== 'icon');
  return (
    <div className="le">
      {list.map((row, i) => (
        <div className="le-row" key={i}>
          <div className="le-fields" style={{ ['--cols' as string]: String(Math.min(plain.length, 3) || 1) }}>
            {cols.map((c) =>
              c.type === 'textarea' ? (
                <textarea key={c.k} style={{ gridColumn: '1/-1' }} placeholder={c.ph} value={row[c.k] ?? ''} onChange={(e) => set(i, c.k, e.target.value)} />
              ) : c.type === 'icon' ? (
                <div key={c.k} style={{ gridColumn: '1/-1' }}>
                  <IconField value={row[c.k] || ''} onChange={(v) => set(i, c.k, v)} />
                </div>
              ) : (
                <input
                  key={c.k}
                  type={c.type === 'number' ? 'number' : 'text'}
                  step="any"
                  placeholder={c.ph}
                  value={row[c.k] ?? ''}
                  onChange={(e) => set(i, c.k, c.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
                />
              ),
            )}
          </div>
          <div className="le-acts">
            <button className="ibtn" type="button" title="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
              <Ic n="i-chev" className="rot180" />
            </button>
            <button className="ibtn" type="button" title="Move down" onClick={() => move(i, 1)} disabled={i === list.length - 1}>
              <Ic n="i-chev" />
            </button>
            <button className="ibtn danger" type="button" title="Remove" onClick={() => onChange(list.filter((_, j) => j !== i))}>
              <Ic n="i-trash" />
            </button>
          </div>
        </div>
      ))}
      <button className="btn btn-ghost btn-sm le-add" type="button" onClick={() => onChange([...list, { ...blank }])}>
        <Ic n="i-plus" /> {addLabel}
      </button>
    </div>
  );
}

function IconField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="icon-pick">
      {ICON_CHOICES.map((n) => (
        <button key={n} type="button" className={value === n ? 'on' : ''} title={n.replace('i-', '')} onClick={() => onChange(n)}>
          <Ic n={n} />
        </button>
      ))}
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="tk" />
      {label}
    </label>
  );
}

/* ---------- renderer ---------- */
export function FormFields({ fields, values, onChange, isNew = false }: { fields: FieldDef[]; values: Values; onChange: (k: string, v: unknown) => void; isNew?: boolean }) {
  const touched = useRef<Set<string>>(new Set());
  const change = (k: string, v: unknown) => {
    onChange(k, v);
    if (isNew) {
      for (const f of fields) {
        if (f.type === 'slug' && f.from === k && !touched.current.has(f.k)) onChange(f.k, slugify(String(v)));
      }
    }
  };
  return (
    <div className="aform">
      {fields.map((f, idx) => {
        if (f.type === 'section')
          return (
            <div className="f-section" key={'s' + idx}>
              <h3>{f.title}</h3>
              {f.desc && <p>{f.desc}</p>}
            </div>
          );
        const wide = f.full || ['textarea', 'code', 'markdown', 'images', 'multi', 'icon', 'strings', 'steps', 'kv', 'features', 'stats', 'image'].includes(f.type);
        const v = values[f.k];
        let control: React.ReactNode;
        switch (f.type) {
          case 'textarea':
          case 'code':
            control = <textarea className={f.type === 'code' ? 'code' : undefined} rows={f.rows} placeholder={f.placeholder} value={v ?? ''} onChange={(e) => change(f.k, e.target.value)} />;
            break;
          case 'markdown':
            control = <MarkdownField value={v ?? ''} onChange={(x) => change(f.k, x)} />;
            break;
          case 'select':
            control = (
              <select value={v ?? ''} onChange={(e) => change(f.k, e.target.value)}>
                {f.options.map((o) => (
                  <option key={String(o.value)} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            );
            break;
          case 'toggle':
            control = <Toggle checked={!!v} onChange={(x) => change(f.k, x)} label={f.help || (v ? 'On' : 'Off')} />;
            break;
          case 'image':
            control = <ImageField value={v ?? ''} onChange={(x) => change(f.k, x)} />;
            break;
          case 'images':
            control = <ImagesField value={v ?? []} onChange={(x) => change(f.k, x)} />;
            break;
          case 'multi': {
            const arr: (string | number)[] = Array.isArray(v) ? v : [];
            control = (
              <div className="msel">
                {f.options.map((o) => {
                  const on = arr.includes(o.value);
                  return (
                    <label key={String(o.value)} className={on ? 'on' : ''}>
                      <input type="checkbox" checked={on} onChange={() => change(f.k, on ? arr.filter((x) => x !== o.value) : [...arr, o.value])} />
                      {o.label}
                    </label>
                  );
                })}
              </div>
            );
            break;
          }
          case 'icon':
            control = <IconField value={v ?? ''} onChange={(x) => change(f.k, x)} />;
            break;
          case 'color':
            control = (
              <div className="color-row">
                <input type="color" value={/^#[0-9a-f]{6}$/i.test(v || '') ? v : '#000000'} onChange={(e) => change(f.k, e.target.value.toUpperCase())} />
                <input value={v ?? ''} onChange={(e) => change(f.k, e.target.value)} placeholder="#B32C1C" />
              </div>
            );
            break;
          case 'slug':
            control = (
              <input
                value={v ?? ''}
                placeholder="auto-generated from the name"
                onChange={(e) => {
                  touched.current.add(f.k);
                  onChange(f.k, e.target.value);
                }}
                onBlur={(e) => onChange(f.k, slugify(e.target.value))}
              />
            );
            break;
          case 'strings':
            control = (
              <textarea
                placeholder={f.placeholder || 'One per line'}
                value={Array.isArray(v) ? v.join('\n') : ''}
                onChange={(e) => change(f.k, e.target.value.split('\n'))}
                onBlur={(e) => change(f.k, e.target.value.split('\n').map((x) => x.trim()).filter(Boolean))}
              />
            );
            break;
          case 'steps':
            control = <ListEditor value={v} onChange={(x) => change(f.k, x)} cols={[{ k: 't', ph: 'Title' }, { k: 'b', ph: 'Description', type: 'textarea' }]} blank={{ t: '', b: '' }} addLabel="Add step" />;
            break;
          case 'kv':
            control = <ListEditor value={v} onChange={(x) => change(f.k, x)} cols={[{ k: 'label', ph: 'Label' }, { k: 'value', ph: 'Value' }]} blank={{ label: '', value: '' }} addLabel="Add row" />;
            break;
          case 'features':
            control = (
              <ListEditor
                value={v}
                onChange={(x) => change(f.k, x)}
                cols={[{ k: 'title', ph: 'Title' }, { k: 'body', ph: 'Description', type: 'textarea' }, { k: 'icon', ph: 'Icon', type: 'icon' }]}
                blank={{ icon: 'i-check', title: '', body: '' }}
                addLabel="Add item"
              />
            );
            break;
          case 'stats':
            control = (
              <ListEditor
                value={v}
                onChange={(x) => change(f.k, x)}
                cols={[
                  { k: 'n', ph: 'Number', type: 'number' },
                  { k: 'suffix', ph: 'Suffix (e.g. /7, %)' },
                  { k: 'dec', ph: 'Decimals', type: 'number' },
                  { k: 'label', ph: 'Label' },
                  { k: 'sub', ph: 'Small caption' },
                ]}
                blank={{ n: 0, suffix: '', dec: 0, label: '', sub: '' }}
                addLabel="Add stat"
              />
            );
            break;
          default:
            control = (
              <input
                type={f.type === 'datetime' ? 'datetime-local' : f.type}
                placeholder={'placeholder' in f ? f.placeholder : undefined}
                value={v ?? ''}
                onChange={(e) => change(f.k, f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
                autoComplete={f.type === 'password' ? 'new-password' : undefined}
              />
            );
        }
        return (
          <div className={`fld${wide ? ' fld-full' : ''}`} key={f.k}>
            <label className="lbl">
              {f.label}
              {f.help && f.type !== 'toggle' && <span className="help">{f.help}</span>}
            </label>
            {control}
          </div>
        );
      })}
    </div>
  );
}
