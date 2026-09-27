'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { Ic } from '@/components/Sprite';
import type { ActionResult } from '@/lib/actions/helpers';
import { FormFields, type FieldDef, type Values } from './Fields';

export type Column<T> = { label: string; render: (row: T) => React.ReactNode; className?: string };

type Props<T extends { id: number }> = {
  title: string;
  hint?: string;
  rows: T[];
  columns: Column<T>[];
  fields: FieldDef[] | ((values: Values) => FieldDef[]);
  blank: Values;
  toForm: (row: T) => Values;
  save: (v: Values) => Promise<ActionResult>;
  remove?: (id: number) => Promise<ActionResult>;
  searchText?: (row: T) => string;
  filters?: { key: string; label: string; test: (row: T) => boolean }[];
  newLabel?: string;
  entity: string;
  viewHref?: (row: T) => string | null;
  editorWide?: boolean;
  openId?: number | null;
  preview?: (values: Values) => React.ReactNode;
  toolbar?: React.ReactNode;
};

export function flash(msg: string) {
  window.dispatchEvent(new CustomEvent('bt:admin-toast', { detail: msg }));
}

export function AdminToast() {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      setMsg(String((e as CustomEvent).detail));
      setShow(true);
      clearTimeout(t);
      t = setTimeout(() => setShow(false), 3600);
    };
    window.addEventListener('bt:admin-toast', on);
    return () => window.removeEventListener('bt:admin-toast', on);
  }, []);
  return (
    <div className={`toast${show ? ' show' : ''}`} role="status" aria-live="polite">
      <Ic n="i-check" />
      <span>{msg}</span>
    </div>
  );
}

export function Manager<T extends { id: number }>(p: Props<T>) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState<Values | null>(() => {
    const row = p.openId ? p.rows.find((r) => r.id === p.openId) : null;
    return row ? p.toForm(row) : null;
  });
  const [err, setErr] = useState('');
  const [pending, start] = useTransition();

  useEffect(() => {
    if (!editing) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !document.querySelector('.amodal')) setEditing(null);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [editing]);

  const shown = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const f = p.filters?.find((x) => x.key === filter);
    return p.rows.filter((r) => (!f || f.test(r)) && (!ql || (p.searchText ? p.searchText(r) : JSON.stringify(r)).toLowerCase().includes(ql)));
  }, [p, q, filter]);

  const isNew = editing ? !editing.id : false;
  const fields = editing ? (typeof p.fields === 'function' ? p.fields(editing) : p.fields) : [];

  function save(extra?: Values) {
    if (!editing) return;
    setErr('');
    const values = { ...editing, ...extra };
    start(async () => {
      const r = await p.save(values);
      if (r.ok) {
        setEditing(null);
        flash(r.message || `${p.entity} saved.`);
        router.refresh();
      } else setErr(r.error);
    });
  }

  function del(id: number, name: string) {
    if (!p.remove) return;
    if (!confirm(`Delete “${name}”? This cannot be undone.`)) return;
    start(async () => {
      const r = await p.remove!(id);
      if (r.ok) {
        setEditing(null);
        flash(`${p.entity} deleted.`);
        router.refresh();
      } else alert(r.error);
    });
  }

  return (
    <>
      <div className="card">
        <div className="card-head">
          <h2>{p.title}</h2>
          {p.filters && (
            <div className="dfilters">
              <button className={`dfilter${filter === 'all' ? ' on' : ''}`} type="button" onClick={() => setFilter('all')}>
                All<span className="n">{p.rows.length}</span>
              </button>
              {p.filters.map((f) => (
                <button key={f.key} className={`dfilter${filter === f.key ? ' on' : ''}`} type="button" onClick={() => setFilter(f.key)}>
                  {f.label}
                  <span className="n">{p.rows.filter(f.test).length}</span>
                </button>
              ))}
            </div>
          )}
          <span className="top-spacer" />
          <div className="search">
            <Ic n="i-search" />
            <input type="search" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} aria-label={`Search ${p.title}`} />
          </div>
          {p.toolbar}
          <button className="btn btn-primary btn-sm" type="button" onClick={() => setEditing({ ...p.blank })}>
            <Ic n="i-plus" /> {p.newLabel || `New ${p.entity.toLowerCase()}`}
          </button>
        </div>
        {p.hint && <div style={{ padding: '10px 18px 0' }} className="muted">{p.hint}</div>}
        {shown.length === 0 ? (
          <div style={{ padding: 18 }}>
            <div className="empty">
              <h3>Nothing here yet</h3>
              <p>{q ? 'Try a different search.' : `Add your first ${p.entity.toLowerCase()}.`}</p>
            </div>
          </div>
        ) : (
          <div className="tbl-scroll">
            <table>
              <thead>
                <tr>
                  {p.columns.map((c) => (
                    <th key={c.label}>{c.label}</th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.id} className="clickable" onClick={(e) => !(e.target as HTMLElement).closest('a,button') && setEditing(p.toForm(r))}>
                    {p.columns.map((c) => (
                      <td key={c.label} className={c.className}>
                        {c.render(r)}
                      </td>
                    ))}
                    <td>
                      <div className="row-acts">
                        {p.viewHref?.(r) && (
                          <a className="ibtn" href={p.viewHref(r)!} target="_blank" rel="noopener" title="View on site" aria-label="View on site">
                            <Ic n="i-eye" />
                          </a>
                        )}
                        <button className="ibtn" type="button" title="Edit" aria-label="Edit" onClick={() => setEditing(p.toForm(r))}>
                          <Ic n="i-edit" />
                        </button>
                        {p.remove && (
                          <button
                            className="ibtn danger"
                            type="button"
                            title="Delete"
                            aria-label="Delete"
                            onClick={() => del(r.id, String((r as unknown as Values).name || (r as unknown as Values).title || (r as unknown as Values).question || p.entity))}
                          >
                            <Ic n="i-trash" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <>
          <div className="dash-scrim" onClick={() => !pending && setEditing(null)} />
          <aside className={`editor${p.editorWide ? ' wide' : ''}`} role="dialog" aria-label={isNew ? `New ${p.entity}` : `Edit ${p.entity}`}>
            <div className="editor-head">
              <div style={{ flex: 1 }}>
                <h2>{isNew ? `New ${p.entity.toLowerCase()}` : `Edit ${p.entity.toLowerCase()}`}</h2>
                <div className="sub">{isNew ? 'Fill in the details and save.' : 'Changes go live on the website as soon as you save.'}</div>
              </div>
              <button className="icon-btn" type="button" aria-label="Close editor" onClick={() => setEditing(null)}>
                <Ic n="i-close" />
              </button>
            </div>
            <div className="editor-body">
              {p.preview?.(editing)}
              <FormFields fields={fields} values={editing} isNew={isNew} onChange={(k, v) => setEditing((cur) => ({ ...(cur || {}), [k]: v }))} />
            </div>
            <div className="editor-foot">
              {!isNew && p.remove && (
                <button className="btn btn-ghost btn-sm" type="button" disabled={pending} onClick={() => del(editing.id, String(editing.name || editing.title || editing.question || p.entity))}>
                  <Ic n="i-trash" /> Delete
                </button>
              )}
              {err && <span className="form-msg err">{err}</span>}
              <span className="grow" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditing(null)} disabled={pending}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => save()} disabled={pending}>
                {pending ? 'Saving…' : 'Save'} <Ic n="i-check" />
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
