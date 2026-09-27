'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { Ic } from '@/components/Sprite';
import { flash } from '@/components/admin/Manager';
import { deleteQuote, updateQuote } from '@/lib/actions/admin';
import { dateTimeFmt, telHref, waHref } from '@/lib/utils';

type Q = {
  id: number;
  ref: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  service: string;
  vehicle: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  passengers: string;
  driverOption: string;
  message: string;
  source: string;
  pageUrl: string;
  status: string;
  notes: string;
  createdAt: string;
};

const STATUSES = ['new', 'contacted', 'quoted', 'confirmed', 'closed', 'spam'];
const label = (s: string) => s[0].toUpperCase() + s.slice(1);

export function QuotesClient({ quotes, openId, siteName }: { quotes: Q[]; openId: number | null; siteName: string }) {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Q | null>(() => (openId ? quotes.find((x) => x.id === openId) || null : null));
  const [notes, setNotes] = useState(open?.notes || '');
  const [pending, start] = useTransition();
  const openRow = (x: Q) => {
    setOpen(x);
    setNotes(x.notes || '');
  };
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const counts = useMemo(() => Object.fromEntries(STATUSES.map((s) => [s, quotes.filter((x) => x.status === s).length])), [quotes]);
  const shown = quotes.filter((x) => (filter === 'all' || x.status === filter) && (!q || `${x.ref} ${x.name} ${x.phone} ${x.email} ${x.service} ${x.vehicle} ${x.pickup} ${x.dropoff}`.toLowerCase().includes(q.toLowerCase())));

  const setStatus = (row: Q, status: string) =>
    start(async () => {
      const r = await updateQuote(row.id, { status });
      if (r.ok) {
        flash(`${row.ref} marked ${status}.`);
        if (open?.id === row.id) setOpen({ ...row, status });
        router.refresh();
      } else alert(r.error);
    });

  const saveNotes = () =>
    open &&
    start(async () => {
      const r = await updateQuote(open.id, { notes });
      if (r.ok) {
        flash('Notes saved.');
        setOpen({ ...open, notes });
        router.refresh();
      } else alert(r.error);
    });

  const remove = (row: Q) => {
    if (!confirm(`Delete quote request ${row.ref}? This cannot be undone.`)) return;
    start(async () => {
      const r = await deleteQuote(row.id);
      if (r.ok) {
        setOpen(null);
        flash(`${row.ref} deleted.`);
        router.refresh();
      } else alert(r.error);
    });
  };

  const reply = (x: Q) =>
    `Hello ${x.name.split(' ')[0]}, thank you for your request ${x.ref} with ${siteName}${x.service ? ` for ${x.service}` : ''}${x.date ? ` on ${x.date}` : ''}. `;

  return (
    <>
      <div className="card">
        <div className="card-head">
          <h2>Requests</h2>
          <div className="dfilters">
            <button className={`dfilter${filter === 'all' ? ' on' : ''}`} type="button" onClick={() => setFilter('all')}>
              All<span className="n">{quotes.length}</span>
            </button>
            {STATUSES.map((s) => (
              <button key={s} className={`dfilter${filter === s ? ' on' : ''}`} type="button" onClick={() => setFilter(s)}>
                {label(s)}
                <span className="n">{counts[s]}</span>
              </button>
            ))}
          </div>
          <span className="top-spacer" />
          <div className="search">
            <Ic n="i-search" />
            <input type="search" placeholder="Search name, phone, ref…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search requests" />
          </div>
          <a className="btn btn-ghost btn-sm" href={`/api/admin/quotes/export?status=${filter}`}>
            <Ic n="i-download" /> Export CSV
          </a>
        </div>
        {shown.length === 0 ? (
          <div className="card-body">
            <div className="empty">
              <h3>{quotes.length ? 'Nothing matches' : 'No quote requests yet'}</h3>
              <p>{quotes.length ? 'Try another filter or search.' : 'Requests from the website’s forms will appear here instantly.'}</p>
            </div>
          </div>
        ) : (
          <div className="tbl-scroll">
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Trip</th>
                  <th>Travel date</th>
                  <th>Received</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {shown.map((x) => (
                  <tr key={x.id} className="clickable" onClick={(e) => !(e.target as HTMLElement).closest('a,button,select') && openRow(x)}>
                    <td className="num">
                      <span className={`strip ${x.status === 'new' ? 'hot' : x.status === 'confirmed' ? 'ok' : 'soon'}`}>{x.ref}</span>
                    </td>
                    <td>
                      <b style={{ fontWeight: 600 }}>{x.name}</b>
                      <div className="muted mono" style={{ fontSize: 11 }}>
                        {x.phone}
                      </div>
                    </td>
                    <td style={{ minWidth: 220 }}>
                      {x.service || x.vehicle || '—'}
                      {(x.pickup || x.dropoff) && (
                        <div className="muted" style={{ fontSize: 12 }}>
                          {x.pickup || '?'} → {x.dropoff || '?'}
                        </div>
                      )}
                    </td>
                    <td className="num">{[x.date, x.time].filter(Boolean).join(' ') || '—'}</td>
                    <td className="num">{dateTimeFmt(x.createdAt)}</td>
                    <td>
                      <select className="stat-select" value={x.status} onChange={(e) => setStatus(x, e.target.value)} disabled={pending} aria-label={`Status of ${x.ref}`}>
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {label(s)}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="row-acts">
                        <a className="ibtn" href={waHref(x.phone, reply(x))} target="_blank" rel="noopener" title="Reply on WhatsApp" aria-label="Reply on WhatsApp">
                          <Ic n="i-whats" />
                        </a>
                        <a className="ibtn" href={telHref(x.phone)} title="Call" aria-label="Call">
                          <Ic n="i-phone" />
                        </a>
                        <button className="ibtn" type="button" title="Open" aria-label="Open" onClick={() => openRow(x)}>
                          <Ic n="i-eye" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && (
        <>
          <div className="dash-scrim" onClick={() => setOpen(null)} />
          <aside className="editor" role="dialog" aria-label={`Quote request ${open.ref}`}>
            <div className="editor-head">
              <div style={{ flex: 1 }}>
                <h2>
                  {open.ref} · {open.name}
                </h2>
                <div className="sub">
                  Received {dateTimeFmt(open.createdAt)} · from {open.source || 'website'}
                  {open.pageUrl ? ` (${open.pageUrl})` : ''}
                </div>
              </div>
              <button className="icon-btn" type="button" aria-label="Close" onClick={() => setOpen(null)}>
                <Ic n="i-close" />
              </button>
            </div>
            <div className="editor-body">
              <div className="row">
                <span className={`pill ${open.status}`}>{label(open.status)}</span>
                <select className="stat-select" value={open.status} onChange={(e) => setStatus(open, e.target.value)} disabled={pending}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      Mark as {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="row">
                <a className="btn btn-whats btn-sm" href={waHref(open.phone, reply(open))} target="_blank" rel="noopener">
                  <Ic n="i-whats" /> Reply on WhatsApp
                </a>
                <a className="btn btn-ghost btn-sm" href={telHref(open.phone)}>
                  <Ic n="i-phone" /> Call {open.phone}
                </a>
                {open.email && (
                  <a className="btn btn-ghost btn-sm" href={`mailto:${open.email}?subject=${encodeURIComponent(`Your quote request ${open.ref}`)}`}>
                    <Ic n="i-mail" /> Email
                  </a>
                )}
              </div>
              <div className="card" style={{ padding: 18 }}>
                <dl className="kvs">
                  {(
                    [
                      ['Name', open.name],
                      ['Phone / WhatsApp', open.phone],
                      ['Email', open.email],
                      ['Company', open.company],
                      ['Service', open.service],
                      ['Vehicle', open.vehicle],
                      ['Pick-up', open.pickup],
                      ['Drop-off', open.dropoff],
                      ['Date', open.date],
                      ['Time', open.time],
                      ['Passengers', open.passengers],
                      ['Driver', open.driverOption],
                    ] as [string, string][]
                  )
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k} style={{ display: 'contents' }}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                </dl>
                {open.message && (
                  <>
                    <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', margin: '16px 0 6px', fontWeight: 600 }}>
                      Details from the customer
                    </div>
                    <div className="msg" style={{ whiteSpace: 'pre-wrap', fontSize: 'var(--t-sm)', background: 'var(--surface-2)', padding: 12, borderRadius: 8 }}>
                      {open.message}
                    </div>
                  </>
                )}
              </div>
              <div className="aform">
                <div className="fld fld-full">
                  <label className="lbl">
                    Internal notes <span className="help">only visible in the dashboard</span>
                  </label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Price quoted, driver assigned, follow-up date…" />
                </div>
              </div>
            </div>
            <div className="editor-foot">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => remove(open)} disabled={pending}>
                <Ic n="i-trash" /> Delete
              </button>
              <span className="grow" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setOpen(null)}>
                Close
              </button>
              <button className="btn btn-primary btn-sm" type="button" onClick={saveNotes} disabled={pending || notes === (open.notes || '')}>
                Save notes <Ic n="i-check" />
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
}
