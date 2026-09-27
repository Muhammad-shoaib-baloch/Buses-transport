/* Generated artwork: blog covers and a placeholder for vehicles that
   do not have a photo yet. Deterministic per seed, so SSR and client
   render the same SVG. */

export const ART_THEMES: Record<string, [string, string, string]> = {
  ember: ['#9A2315', '#2A0A06', '#E0705A'],
  dusk: ['#B22D1D', '#2A1008', '#F09C84'],
  azure: ['#2360A8', '#0C1A2B', '#7FB4EA'],
  steel: ['#35566F', '#111A21', '#A3C6DC'],
  night: ['#2A3138', '#12161A', '#8A98A3'],
};

function hashOf(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

export function coverSvg(seed: string, theme: string) {
  const p = ART_THEMES[theme] || ART_THEMES.ember;
  let h = hashOf(String(seed));
  const id = `cg${h % 99991}`;
  const rnd = (n: number) => (h = (h * 1664525 + 1013904223) >>> 0) % n;
  let dots = '';
  let bars = '';
  for (let i = 0; i < 5; i++) {
    const bx = 26 + i * 68;
    const bh = 20 + rnd(78);
    bars += `<rect x="${bx}" y="${170 - bh}" width="${18 + rnd(20)}" height="${bh}" rx="3" fill="${p[2]}" opacity="${(0.1 + i * 0.045).toFixed(2)}"/>`;
  }
  for (let i = 0; i < 16; i++)
    dots += `<circle cx="${12 + rnd(376)}" cy="${10 + rnd(90)}" r="${1 + rnd(2)}" fill="${p[2]}" opacity="${(0.2 + rnd(50) / 100).toFixed(2)}"/>`;
  const hills = `<path d="M0 148 q60 -${24 + rnd(26)} 122 -6 q70 -${18 + rnd(30)} 150 4 q70 ${10 + rnd(16)} 128 -10 v54 H0 z" fill="${p[2]}" opacity=".14"/>`;
  const ry = 128 + rnd(14);
  return `<svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p[0]}"/><stop offset="1" stop-color="${p[1]}"/></linearGradient></defs>
<rect width="400" height="200" fill="url(#${id})"/>
<circle cx="${300 + rnd(60)}" cy="${34 + rnd(24)}" r="${26 + rnd(16)}" fill="${p[2]}" opacity=".2"/>
${dots}${bars}${hills}
<path d="M0 ${ry} H400" stroke="${p[2]}" stroke-width="2" opacity=".5"/>
<path d="M0 ${ry + 14} H400" stroke="#fff" stroke-width="1.5" stroke-dasharray="16 14" opacity=".28"/>
<rect x="${40 + rnd(180)}" y="${ry - 26}" width="86" height="24" rx="6" fill="#fff" opacity=".9"/>
<rect x="${46 + rnd(180)}" y="${ry - 21}" width="60" height="9" rx="2" fill="${p[1]}" opacity=".55"/>
</svg>`;
}

/** Side-profile silhouette sized to the vehicle's capacity. */
export function vehicleArtSvg(seed: string, capacity: number, label: string) {
  const h = hashOf(seed);
  const themes = Object.values(ART_THEMES);
  const p = themes[h % themes.length];
  const id = `va${h % 99991}`;
  const safe = label.replace(/[&<>"']/g, '');
  let body: string;
  if (capacity >= 20) {
    // coach
    body = `<rect x="52" y="78" width="300" height="84" rx="14" fill="#fff" opacity=".92"/>
<rect x="66" y="90" width="236" height="30" rx="5" fill="${p[1]}" opacity=".55"/>
<rect x="312" y="90" width="28" height="44" rx="5" fill="${p[1]}" opacity=".55"/>
<rect x="52" y="140" width="300" height="6" fill="${p[0]}" opacity=".6"/>
<circle cx="112" cy="164" r="17" fill="${p[1]}"/><circle cx="112" cy="164" r="7" fill="#fff" opacity=".7"/>
<circle cx="300" cy="164" r="17" fill="${p[1]}"/><circle cx="300" cy="164" r="7" fill="#fff" opacity=".7"/>`;
  } else if (capacity >= 8) {
    // van
    body = `<path d="M70 158 V104 Q70 86 88 84 L262 84 Q282 84 294 100 L330 130 Q342 136 342 150 V158 Z" fill="#fff" opacity=".92"/>
<rect x="88" y="96" width="150" height="28" rx="5" fill="${p[1]}" opacity=".55"/>
<path d="M250 96 H266 Q276 96 284 106 L302 126 H250 Z" fill="${p[1]}" opacity=".55"/>
<circle cx="120" cy="160" r="16" fill="${p[1]}"/><circle cx="120" cy="160" r="6.5" fill="#fff" opacity=".7"/>
<circle cx="296" cy="160" r="16" fill="${p[1]}"/><circle cx="296" cy="160" r="6.5" fill="#fff" opacity=".7"/>`;
  } else {
    // car / suv / mpv
    body = `<path d="M64 156 V134 Q64 122 78 120 L118 116 L152 92 Q160 86 172 86 H250 Q262 86 272 94 L300 116 L330 122 Q344 126 344 140 V156 Z" fill="#fff" opacity=".92"/>
<path d="M160 98 H206 V118 H134 Z" fill="${p[1]}" opacity=".55"/><path d="M214 98 H252 Q258 98 264 104 L278 118 H214 Z" fill="${p[1]}" opacity=".55"/>
<circle cx="118" cy="158" r="16" fill="${p[1]}"/><circle cx="118" cy="158" r="6.5" fill="#fff" opacity=".7"/>
<circle cx="292" cy="158" r="16" fill="${p[1]}"/><circle cx="292" cy="158" r="6.5" fill="#fff" opacity=".7"/>`;
  }
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${safe}">
<defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p[0]}"/><stop offset="1" stop-color="${p[1]}"/></linearGradient></defs>
<rect width="400" height="300" fill="url(#${id})"/>
<circle cx="330" cy="54" r="34" fill="${p[2]}" opacity=".22"/>
<path d="M0 200 H400" stroke="${p[2]}" stroke-width="2" opacity=".45"/>
<path d="M0 214 H400" stroke="#fff" stroke-width="1.5" stroke-dasharray="16 14" opacity=".25"/>
<g transform="translate(0,30)">${body}</g>
<text x="200" y="268" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="13" letter-spacing="2" fill="#fff" opacity=".7">PHOTO COMING SOON</text>
</svg>`;
}
