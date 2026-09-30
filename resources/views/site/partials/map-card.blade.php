@php
    /* UAE outline plotted from real coordinates (lon 51.5–56.4E, lat 22.6–26.1N); callouts in a right gutter. */
    $nodes = \App\Support\MapNodes::ALL;
    $placed = collect($areas)->filter(fn ($a) => $a->map_key && isset($nodes[$a->map_key]))
        ->map(fn ($a) => ['name' => $a->name, 'note' => $a->note, 'hub' => $a->is_hub, 'p' => $nodes[$a->map_key]])
        ->sortBy(fn ($a) => $a['p'][1])->values();
    $n = max(1, $placed->count());
    $gap = min(50, 360 / $n);
    $top = 235 - (($n - 1) * $gap) / 2;
    $callouts = $placed->map(fn ($a, $i) => $a + ['ly' => (int) round($top + $i * $gap)]);
@endphp
<div class="map-card reveal">
    <span class="map-badge">{!! ic('i-pin') !!} All 7 emirates</span>
    <svg viewBox="0 0 1000 470" role="img" aria-label="Map of the United Arab Emirates showing the areas we cover">
        <defs>
            <linearGradient id="seaG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#EEF4F9"/><stop offset="1" stop-color="#E5ECF4"/></linearGradient>
            <linearGradient id="landG" x1=".2" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#F0F2F7"/><stop offset="1" stop-color="#E4E9F1"/></linearGradient>
        </defs>
        <rect x="0" y="0" width="760" height="470" fill="url(#seaG)"/>
        <g opacity=".8" stroke="#D3E2EC" stroke-width="1.2" fill="none"><path d="M0 60 Q120 96 210 84"/><path d="M0 110 Q110 146 196 134"/><path d="M0 160 Q96 192 168 182"/></g>
        <text x="96" y="140" font-family="IBM Plex Sans, sans-serif" font-size="13" letter-spacing="3" fill="#8CA5BA">ARABIAN GULF</text>
        <text x="300" y="452" font-family="IBM Plex Sans, sans-serif" font-size="13" letter-spacing="3" fill="#A3ACBB">SAUDI ARABIA</text>
        <text x="690" y="310" font-family="IBM Plex Sans, sans-serif" font-size="13" letter-spacing="3" fill="#A3ACBB">OMAN</text>
        <path d="M74 264 L129 266 Q171 260 213 255 L310 261 Q359 245 407 230 L463 214 Q505 196 546 178 L588 145 L615 137 L622 130 L636 117 Q657 104 678 91 L699 65 L719 96 L733 137 L733 161 L737 178 Q715 189 692 199 L664 240 L650 250 L622 281 L594 322 L574 399 L407 415 Q310 397 213 379 L74 327 Z" fill="url(#landG)" stroke="#A7B3C4" stroke-width="2"/>
        <path d="M737 178 Q715 189 692 199 L664 240 L650 250 L622 281 L594 322 L574 399 L407 415 Q310 397 213 379 L74 327" fill="none" stroke="#96A2B4" stroke-width="1.8" stroke-dasharray="8 7" opacity=".95"/>
        <g class="uae-road">
            <path d="M458 230 Q520 200 583 153 Q610 138 626 120 Q652 104 676 92"/><path d="M583 153 Q640 174 690 196"/><path d="M583 153 Q625 208 651 254"/><path d="M690 196 Q712 178 730 160"/><path d="M458 230 Q400 290 336 348"/>
        </g>
        @foreach ($callouts as $c)
            <path d="M{{ $c['p'][0] }} {{ $c['p'][1] }} L756 {{ $c['p'][1] }} L784 {{ $c['ly'] }} L794 {{ $c['ly'] }}" fill="none" stroke="#B2BCCB" stroke-width="1" stroke-dasharray="3 4" opacity=".95"/>
        @endforeach
        @foreach ($callouts as $c)
            <g class="emirate-node">
                @if ($c['hub'])<circle class="pulse-dot" cx="{{ $c['p'][0] }}" cy="{{ $c['p'][1] }}" r="5" fill="none" stroke="var(--r-500)" stroke-width="2"/>@endif
                <circle class="dot" cx="{{ $c['p'][0] }}" cy="{{ $c['p'][1] }}" r="{{ $c['hub'] ? 7 : 5 }}" fill="{{ $c['hub'] ? 'var(--r-500)' : 'var(--accent)' }}"/>
                <circle class="hit" cx="{{ $c['p'][0] }}" cy="{{ $c['p'][1] }}" r="14"/>
            </g>
        @endforeach
        @foreach ($callouts as $c)
            <text x="804" y="{{ $c['ly'] + 1 }}" font-family="IBM Plex Sans, sans-serif" font-size="16" font-weight="{{ $c['hub'] ? 700 : 500 }}" fill="{{ $c['hub'] ? '#0C1220' : '#3F4A5F' }}">{{ $c['name'] }}</text>
            <text x="804" y="{{ $c['ly'] + 19 }}" font-family="IBM Plex Mono, monospace" font-size="11.5" fill="{{ $c['hub'] ? 'var(--r-600)' : '#66718A' }}">{{ mb_strlen($c['note']) > 26 ? mb_substr($c['note'], 0, 25).'…' : $c['note'] }}</text>
        @endforeach
    </svg>
    <div class="map-legend">
        <span><i style="background:var(--r-500)"></i>Head office</span>
        <span><i style="background:var(--accent)"></i>Emirates and cities we serve</span>
        <span>Dashed line marks the national border</span>
    </div>
</div>
