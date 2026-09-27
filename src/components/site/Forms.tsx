'use client';

import { useState } from 'react';
import { Ic } from '@/components/Sprite';
import { toast } from './Toast';

export type Opt = { value: string; label: string };

type Result = { ok: true; ref: string; whatsappUrl?: string; message: string } | { ok: false; error: string };

async function submitQuote(payload: Record<string, string>): Promise<Result> {
  try {
    const res = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, pageUrl: window.location.pathname }),
    });
    const data = (await res.json()) as Result;
    return data;
  } catch {
    return { ok: false, error: 'Could not send your request. Check your connection, or call / WhatsApp us instead.' };
  }
}

function track(event: string, data: Record<string, string>) {
  const w = window as unknown as { dataLayer?: unknown[]; fbq?: (...a: unknown[]) => void };
  w.dataLayer?.push({ event, ...data });
  w.fbq?.('track', 'Lead');
}

function Success({ r, onReset }: { r: Extract<Result, { ok: true }>; onReset: () => void }) {
  return (
    <div className="form-ok" role="status">
      <h3>
        <Ic n="i-check" /> Request received
      </h3>
      <p>{r.message}</p>
      <p>
        Your reference: <span className="mono">{r.ref}</span>
      </p>
      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
        {r.whatsappUrl && (
          <a className="btn btn-whats btn-sm" href={r.whatsappUrl} target="_blank" rel="noopener">
            <Ic n="i-whats" /> Also send on WhatsApp
          </a>
        )}
        <button className="btn btn-ghost btn-sm" type="button" onClick={onReset}>
          Send another request
        </button>
      </div>
    </div>
  );
}

/* ---------- hero quote card ---------- */
export function QuoteCard({ title, badge, note, vehicles }: { title: string; badge: string; note: string; vehicles: Opt[] }) {
  const [tab, setTab] = useState<'transfer' | 'hire'>('transfer');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState<Extract<Result, { ok: true }> | null>(null);
  const hire = tab === 'hire';

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = Object.fromEntries([...f.entries()].map(([k, v]) => [k, String(v)]));
    if (!payload.name?.trim() || !payload.phone?.trim()) {
      setErr('Add your name and a phone / WhatsApp number so we can confirm your quote.');
      return;
    }
    setBusy(true);
    setErr('');
    const r = await submitQuote({ ...payload, service: hire ? 'Daily Rental' : 'Transfer', source: 'home-hero' });
    setBusy(false);
    if (r.ok) {
      setDone(r);
      toast('Request sent. We will confirm your AED quote shortly.');
      track('quote_request', { source: 'home-hero' });
    } else setErr(r.error);
  }

  return (
    <form className="quote-card" onSubmit={onSubmit} noValidate>
      <div className="qc-head">
        <h3>{title}</h3>
        {badge && (
          <span className="chip">
            <Ic n="i-clock" /> {badge}
          </span>
        )}
      </div>
      {note && <p className="qc-note">{note}</p>}
      {done ? (
        <Success r={done} onReset={() => setDone(null)} />
      ) : (
        <>
          <div className="qc-tabs" role="tablist">
            <button className={`qc-tab${!hire ? ' on' : ''}`} type="button" role="tab" aria-selected={!hire} onClick={() => setTab('transfer')}>
              Transfer
            </button>
            <button className={`qc-tab${hire ? ' on' : ''}`} type="button" role="tab" aria-selected={hire} onClick={() => setTab('hire')}>
              Daily hire
            </button>
          </div>
          <div className="qc-grid">
            <div className="fld">
              <label htmlFor="qFrom">Pick-up</label>
              <input id="qFrom" name="pickup" placeholder={hire ? 'Business Bay, Dubai' : 'DXB Terminal 3'} autoComplete="off" />
            </div>
            <div className="fld">
              <label htmlFor="qTo">{hire ? 'Return to' : 'Drop-off'}</label>
              <input id="qTo" name="dropoff" placeholder={hire ? 'Same address' : 'Dubai Marina'} autoComplete="off" />
            </div>
            <div className="fld">
              <label htmlFor="qDate">Date</label>
              <input id="qDate" name="date" type="date" />
            </div>
            <div className="fld">
              <label htmlFor="qTime">Time</label>
              <input id="qTime" name="time" type="time" />
            </div>
            <div className="fld fld-full">
              <label htmlFor="qVeh">Vehicle / passengers</label>
              <select id="qVeh" name="vehicle" defaultValue="">
                <option value="">Not sure — recommend one</option>
                {vehicles.map((v) => (
                  <option key={v.value} value={v.label}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="fld">
              <label htmlFor="qName">
                Full name <span className="req">*</span>
              </label>
              <input id="qName" name="name" placeholder="Your name" autoComplete="name" required />
            </div>
            <div className="fld">
              <label htmlFor="qPhone">
                Phone / WhatsApp <span className="req">*</span>
              </label>
              <input id="qPhone" name="phone" type="tel" placeholder="+971 50 000 0000" autoComplete="tel" required />
            </div>
            <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
          </div>
          <div className="qc-foot">
            <button className="btn btn-primary btn-block" type="submit" disabled={busy}>
              {busy ? 'Sending…' : 'Get a quote'} <Ic n="i-arrow" />
            </button>
          </div>
          {err && <p className="form-err">{err}</p>}
        </>
      )}
    </form>
  );
}

/* ---------- full / compact request form ---------- */
export function ContactForm({
  services,
  vehicles,
  initial = {},
  compact = false,
  source = 'contact',
}: {
  services: Opt[];
  vehicles: Opt[];
  initial?: { service?: string; vehicle?: string };
  compact?: boolean;
  source?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState<Extract<Result, { ok: true }> | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const payload = Object.fromEntries([...f.entries()].map(([k, v]) => [k, String(v)]));
    if (!payload.name?.trim()) {
      setErr('Add your name so our team knows who to call back.');
      return;
    }
    if (!payload.phone?.trim()) {
      setErr('Add a phone or WhatsApp number so we can confirm your quote.');
      return;
    }
    setBusy(true);
    setErr('');
    const r = await submitQuote({ ...payload, source });
    setBusy(false);
    if (r.ok) {
      setDone(r);
      (e.target as HTMLFormElement).reset?.();
      toast('Request sent. We will confirm your AED quote shortly.');
      track('quote_request', { source });
    } else setErr(r.error);
  }

  if (done) return <Success r={done} onReset={() => setDone(null)} />;

  return (
    <form className="form-grid" onSubmit={onSubmit} noValidate>
      <div className="fld">
        <label htmlFor={`${source}-name`}>
          Full name <span className="req">*</span>
        </label>
        <input id={`${source}-name`} name="name" placeholder="Your name" autoComplete="name" required />
      </div>
      <div className="fld">
        <label htmlFor={`${source}-phone`}>
          Phone / WhatsApp <span className="req">*</span>
        </label>
        <input id={`${source}-phone`} name="phone" type="tel" placeholder="+971 50 000 0000" autoComplete="tel" required />
      </div>
      {!compact && (
        <>
          <div className="fld">
            <label htmlFor={`${source}-email`}>Email</label>
            <input id={`${source}-email`} name="email" type="email" placeholder="you@company.ae" autoComplete="email" />
          </div>
          <div className="fld">
            <label htmlFor={`${source}-company`}>Company</label>
            <input id={`${source}-company`} name="company" placeholder="Optional" autoComplete="organization" />
          </div>
        </>
      )}
      <div className="fld">
        <label htmlFor={`${source}-service`}>Service needed</label>
        <select id={`${source}-service`} name="service" defaultValue={initial.service || ''}>
          <option value="">Select a service</option>
          {services.map((s) => (
            <option key={s.value} value={s.label}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div className="fld">
        <label htmlFor={`${source}-vehicle`}>Preferred vehicle</label>
        <select id={`${source}-vehicle`} name="vehicle" defaultValue={initial.vehicle || ''}>
          <option value="">Not sure — recommend one</option>
          {vehicles.map((v) => (
            <option key={v.value} value={v.label}>
              {v.label}
            </option>
          ))}
        </select>
      </div>
      <div className="fld">
        <label htmlFor={`${source}-pickup`}>Pick-up location</label>
        <input id={`${source}-pickup`} name="pickup" placeholder="DXB Terminal 3" />
      </div>
      <div className="fld">
        <label htmlFor={`${source}-dropoff`}>Drop-off location</label>
        <input id={`${source}-dropoff`} name="dropoff" placeholder="Dubai Marina" />
      </div>
      <div className="fld">
        <label htmlFor={`${source}-date`}>Date</label>
        <input id={`${source}-date`} name="date" type="date" />
      </div>
      <div className="fld">
        <label htmlFor={`${source}-time`}>Time</label>
        <input id={`${source}-time`} name="time" type="time" />
      </div>
      <div className="fld">
        <label htmlFor={`${source}-pax`}>Passengers</label>
        <input id={`${source}-pax`} name="passengers" inputMode="numeric" placeholder="e.g. 12" />
      </div>
      <div className="fld">
        <label htmlFor={`${source}-driver`}>With / without driver</label>
        <select id={`${source}-driver`} name="driverOption" defaultValue="With a professional driver">
          <option>With a professional driver</option>
          <option>Without a driver (self-drive, selected vehicles)</option>
        </select>
      </div>
      {!compact && (
        <div className="fld fld-full">
          <label htmlFor={`${source}-msg`}>Additional details</label>
          <textarea id={`${source}-msg`} name="message" placeholder="Flight number, luggage, return trip, number of days…" />
        </div>
      )}
      <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="fld fld-full">
        <button className="btn btn-primary btn-lg btn-block" type="submit" disabled={busy}>
          {busy ? 'Sending…' : 'Send request'} <Ic n="i-arrow" />
        </button>
        {err ? <p className="form-err">{err}</p> : <p className="note" style={{ marginTop: 10 }}>We reply with an AED price by phone or WhatsApp. No fixed online prices, no hidden charges.</p>}
      </div>
    </form>
  );
}
