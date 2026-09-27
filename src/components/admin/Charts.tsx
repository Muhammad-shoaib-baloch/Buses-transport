import { Ic } from '@/components/Sprite';
import { num } from '@/lib/utils';

export function Spark({ series, accent = false }: { series: number[]; accent?: boolean }) {
  const s = series.length > 1 ? series : [0, ...(series.length ? series : [0])];
  const w = 120;
  const h = 34;
  const pad = 3;
  const max = Math.max(...s);
  const min = Math.min(...s);
  const span = max - min || 1;
  const pts = s.map((v, i) => [pad + (i * (w - pad * 2)) / (s.length - 1), h - pad - ((v - min) / span) * (h - pad * 2)]);
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const last = pts[pts.length - 1];
  const c = accent ? 'var(--c2)' : 'var(--c1)';
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`${d} L${w - pad} ${h} L${pad} ${h} Z`} fill={c} opacity=".12" />
      <path d={d} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <path d={`M${last[0].toFixed(1)} ${(last[1] - 4).toFixed(1)} V${(last[1] + 4).toFixed(1)}`} stroke={c} strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function Tile({ label, value, icon, delta, dir = 'flat', series, accent }: { label: string; value: string; icon: string; delta: string; dir?: 'up' | 'down' | 'flat'; series: number[]; accent?: boolean }) {
  return (
    <div className="tile">
      <div className="tile-top">
        <span className="tile-lbl">{label}</span>
        <span className="tile-ico">
          <Ic n={icon} />
        </span>
      </div>
      <b>{value}</b>
      <span className={`tile-delta ${dir}`}>
        {dir === 'up' ? '▲' : dir === 'down' ? '▼' : '—'} {delta}
      </span>
      <Spark series={series} accent={accent} />
    </div>
  );
}

/** Paired monthly bars (e.g. requests vs confirmed). */
export function PairChart({ data, labels, ariaLabel }: { data: { m: string; a: number; b: number }[]; labels: [string, string]; ariaLabel: string }) {
  const w = 720;
  const h = 190;
  const L = 40;
  const R = 8;
  const T = 16;
  const B = 26;
  const peak = Math.max(4, ...data.map((d) => Math.max(d.a, d.b)));
  const step = Math.ceil(peak / 4);
  const max = step * 4;
  const ticks = [0, step, step * 2, step * 3, max];
  const iw = w - L - R;
  const ih = h - T - B;
  const gw = iw / data.length;
  const bw = Math.min(26, (gw - 16) / 2);
  const y = (v: number) => T + ih - (v / max) * ih;
  return (
    <svg className="chart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={ariaLabel}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} y1={y(t)} x2={w - R} y2={y(t)} stroke="var(--line)" strokeWidth="1" />
          <text x={L - 8} y={y(t) + 3.5} textAnchor="end" fontSize="10" fontFamily="var(--mono)" fill="var(--muted)">
            {t}
          </text>
        </g>
      ))}
      {data.map((d, i) => {
        const cx = L + gw * i + gw / 2;
        const bars: [number, number, string, string][] = [
          [d.a, cx - bw - 1, 'var(--c1)', labels[0]],
          [d.b, cx + 1, 'var(--c2)', labels[1]],
        ];
        return (
          <g key={d.m}>
            {bars.map(([v, x, c, lab]) => (
              <g className="bar" key={lab}>
                <rect x={x} y={y(v)} width={bw} height={Math.max(2, T + ih - y(v))} rx="4" fill={c} />
                <title>{`${d.m} · ${lab}: ${num(v)}`}</title>
                {v > 0 && (
                  <text x={x + bw / 2} y={y(v) - 5} textAnchor="middle" fontSize="10" fontWeight="600" fontFamily="var(--mono)" fill="var(--text-2)">
                    {v}
                  </text>
                )}
              </g>
            ))}
            <text x={cx} y={h - 8} textAnchor="middle" fontSize="10.5" fontFamily="var(--body)" fill="var(--muted)">
              {d.m}
            </text>
          </g>
        );
      })}
      <line x1={L} y1={y(0)} x2={w - R} y2={y(0)} stroke="var(--line-2)" strokeWidth="1.5" />
    </svg>
  );
}

export function BarList({ items }: { items: { name: string; value: number; label?: string; accent?: boolean }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <div className="bar-list">
      {items.map((it) => (
        <div className="bl" key={it.name}>
          <span className="bl-name">{it.name}</span>
          <span className="bl-val">{it.label ?? num(it.value)}</span>
          <span className="bl-track">
            <i className={it.accent ? 'accent' : undefined} style={{ width: `${Math.round((it.value / max) * 100)}%` }} />
          </span>
        </div>
      ))}
    </div>
  );
}
