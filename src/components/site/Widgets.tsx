import { Ic } from '@/components/Sprite';
import { mins } from '@/lib/utils';

type RouteLite = { from: string; to: string; km: number | null; mins: number | null };

export function Ticker({ routes, extras }: { routes: RouteLite[]; extras: string[] }) {
  const items: [string, string, string][] = [
    ...routes.map((r): [string, string, string] => [
      'i-route',
      `${r.from} → ${r.to}`,
      [r.km ? `${r.km} km` : '', r.mins ? mins(r.mins) : ''].filter(Boolean).join(' · '),
    ]),
    ...extras.map((e): [string, string, string] => {
      const [a, b] = e.split('|');
      return ['i-check', a?.trim() || '', b?.trim() || ''];
    }),
  ];
  if (!items.length) return null;
  const row = (k: string) =>
    items.map(([icon, t, b], i) => (
      <span className="tk" key={k + i}>
        <Ic n={icon} /> {t} {b && <b>{b}</b>}
      </span>
    ));
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track">
        {row('a')}
        {row('b')}
      </div>
    </div>
  );
}

/* ============================================================
   UAE coverage map — outline plotted from real coordinates
   (lon 51.5–56.4E, lat 22.6–26.1N); callout labels in a right gutter.
   ============================================================ */
const LAND =
  'M74 264 L129 266 Q171 260 213 255 L310 261 Q359 245 407 230 L463 214 Q505 196 546 178 L588 145 L615 137 L622 130 L636 117 Q657 104 678 91 L699 65 L719 96 L733 137 L733 161 L737 178 Q715 189 692 199 L664 240 L650 250 L622 281 L594 322 L574 399 L407 415 Q310 397 213 379 L74 327 Z';
export const MAP_NODES: Record<string, [number, number]> = {
  'Ras Al Khaimah': [676, 92],
  'Umm Al Quwain': [626, 120],
  Ajman: [607, 132],
  Sharjah: [601, 137],
  Dubai: [583, 153],
  Fujairah: [730, 160],
  Hatta: [690, 196],
  'Abu Dhabi': [458, 230],
  'Al Ain': [651, 254],
};

type AreaLite = { name: string; note: string; isHub: boolean; mapKey: string | null };

export function UaeMap({ areas }: { areas: AreaLite[] }) {
  const placed = areas
    .filter((a) => a.mapKey && MAP_NODES[a.mapKey])
    .map((a) => ({ ...a, p: MAP_NODES[a.mapKey!] }))
    .sort((a, b) => a.p[1] - b.p[1]);
  const n = Math.max(1, placed.length);
  const gap = Math.min(50, 360 / n);
  const top = 235 - ((n - 1) * gap) / 2;
  const callouts = placed.map((a, i) => ({ ...a, ly: Math.round(top + i * gap) }));

  return (
    <svg viewBox="0 0 1000 470" role="img" aria-label="Map of the United Arab Emirates showing the areas we cover">
      <defs>
        <linearGradient id="seaG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#EEF4F9" />
          <stop offset="1" stopColor="#E5ECF4" />
        </linearGradient>
        <linearGradient id="landG" x1=".2" y1="0" x2=".8" y2="1">
          <stop offset="0" stopColor="#F0F2F7" />
          <stop offset="1" stopColor="#E4E9F1" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="760" height="470" fill="url(#seaG)" />
      <g opacity=".8" stroke="#D3E2EC" strokeWidth="1.2" fill="none">
        <path d="M0 60 Q120 96 210 84" />
        <path d="M0 110 Q110 146 196 134" />
        <path d="M0 160 Q96 192 168 182" />
      </g>
      <text x="96" y="140" fontFamily="var(--body)" fontSize="13" letterSpacing="3" fill="#8CA5BA">
        ARABIAN GULF
      </text>
      <text x="300" y="452" fontFamily="var(--body)" fontSize="13" letterSpacing="3" fill="#A3ACBB">
        SAUDI ARABIA
      </text>
      <text x="690" y="310" fontFamily="var(--body)" fontSize="13" letterSpacing="3" fill="#A3ACBB">
        OMAN
      </text>
      <path d={LAND} fill="url(#landG)" stroke="#A7B3C4" strokeWidth="2" />
      <path
        d="M737 178 Q715 189 692 199 L664 240 L650 250 L622 281 L594 322 L574 399 L407 415 Q310 397 213 379 L74 327"
        fill="none"
        stroke="#96A2B4"
        strokeWidth="1.8"
        strokeDasharray="8 7"
        opacity=".95"
      />
      <g className="uae-road">
        <path d="M458 230 Q520 200 583 153 Q610 138 626 120 Q652 104 676 92" />
        <path d="M583 153 Q640 174 690 196" />
        <path d="M583 153 Q625 208 651 254" />
        <path d="M690 196 Q712 178 730 160" />
        <path d="M458 230 Q400 290 336 348" />
      </g>
      {callouts.map((c) => (
        <path key={'l' + c.name} d={`M${c.p[0]} ${c.p[1]} L756 ${c.p[1]} L784 ${c.ly} L794 ${c.ly}`} fill="none" stroke="#B2BCCB" strokeWidth="1" strokeDasharray="3 4" opacity=".95" />
      ))}
      {callouts.map((c) => (
        <g className="emirate-node" key={'n' + c.name}>
          {c.isHub && <circle className="pulse-dot" cx={c.p[0]} cy={c.p[1]} r="5" fill="none" stroke="var(--r-500)" strokeWidth="2" />}
          <circle className="dot" cx={c.p[0]} cy={c.p[1]} r={c.isHub ? 7 : 5} fill={c.isHub ? 'var(--r-500)' : 'var(--accent)'} />
          <circle className="hit" cx={c.p[0]} cy={c.p[1]} r="14" />
        </g>
      ))}
      {callouts.map((c) => (
        <g key={'t' + c.name}>
          <text x="804" y={c.ly + 1} fontFamily="var(--body)" fontSize="16" fontWeight={c.isHub ? 700 : 500} fill={c.isHub ? '#0C1220' : '#3F4A5F'}>
            {c.name}
          </text>
          <text x="804" y={c.ly + 19} fontFamily="var(--mono)" fontSize="11.5" fill={c.isHub ? 'var(--r-600)' : '#66718A'}>
            {c.note.length > 26 ? c.note.slice(0, 25) + '…' : c.note}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function MapCard({ areas }: { areas: AreaLite[] }) {
  return (
    <div className="map-card reveal">
      <span className="map-badge">
        <Ic n="i-pin" /> All 7 emirates
      </span>
      <UaeMap areas={areas} />
      <div className="map-legend">
        <span>
          <i style={{ background: 'var(--r-500)' }} />
          Head office
        </span>
        <span>
          <i style={{ background: 'var(--accent)' }} />
          Emirates and cities we serve
        </span>
        <span>Dashed line marks the national border</span>
      </div>
    </div>
  );
}
