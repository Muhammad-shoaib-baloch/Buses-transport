@php
    $c = $s['contact'];
    $phone = $c['phones'][0] ?? '';
    $email = $c['emails'][0] ?? '';
    $path = '/'.ltrim(request()->path(), '/');
    $nav = [
        ['Services', '/services', 'services'],
        ['Fleet', '/fleet', 'fleet'],
        ['Coverage', '/coverage', 'coverage'],
    ];
    if ($s['general']['showBlogInNav']) $nav[] = ['Blog', '/blog', null];
    $nav[] = ['About', '/about', null];
    $nav[] = ['Contact', '/contact', null];
    $active = fn ($href) => $path === $href || str_starts_with($path, $href.'/');
    $services = $chrome['services'];
    $half = (int) ceil($services->count() / 2);
    $veh = $chrome['featured'];
    $driverText = fn ($v) => $v->selfDrive() ? 'With or without driver' : 'Chauffeur-driven';
    $row = function (string $href, string $media, string $name, string $note) {
        return '<a class="mega-row" href="'.e($href).'">'.$media.'<span style="min-width:0"><b>'.e($name).'</b><span>'.e($note).'</span></span><span class="mega-row-go">'.ic('i-arrow').'</span></a>';
    };
    $iconBox = fn ($n) => '<span class="mr-ico">'.ic($n).'</span>';
    $thumb = fn ($src) => '<span class="mr-thumb">'.($src ? '<img src="'.e($src).'" alt="" loading="lazy">' : '<span class="mr-ico">'.ic('i-car').'</span>').'</span>';
@endphp
<header class="site-head" id="siteHead">
    <div class="head-strip">
        <div class="wrap head-strip-in">
            @if ($c['headStripLocation'])<span class="hs-item">{!! ic('i-pin') !!} {{ $c['headStripLocation'] }}</span>@endif
            @if ($c['headStripLocation'] && $c['hours'])<span class="hs-sep"></span>@endif
            @if ($c['hours'])<span class="hs-item">{!! ic('i-clock') !!} {{ $c['hours'] }}</span>@endif
            <span class="hs-grow"></span>
            @if ($phone)<a class="hs-item hs-keep" href="{{ tel_href($phone) }}">{!! ic('i-phone') !!} <span class="mono">{{ $phone }}</span></a>@endif
            @if ($c['whatsapp'])<a class="hs-item hs-whats hs-keep" href="{{ wa_href($c['whatsapp'], $c['whatsappMessage']) }}" target="_blank" rel="noopener">{!! ic('i-whats') !!} WhatsApp</a>@endif
            @if ($email)<a class="hs-item" href="mailto:{{ $email }}">{!! ic('i-mail') !!} {{ $email }}</a>@endif
        </div>
    </div>

    <div class="head-main">
        <div class="wrap head-main-in">
            @include('site.partials.brand')
            <nav class="mainnav" aria-label="Primary">
                @foreach ($nav as [$label, $href, $mega])
                    <span class="nav-item" @if ($mega) data-mega="{{ $mega }}" @endif>
                        <a class="nav-link{{ $active($href) ? ' active' : '' }}" href="{{ $href }}" @if ($mega) aria-haspopup="true" aria-expanded="false" @endif>{{ $label }}@if ($mega){!! ic('i-chev') !!}@endif</a>
                    </span>
                @endforeach
            </nav>
            <div class="head-act">
                <a class="btn btn-primary btn-sm" href="/contact">Get a quote {!! ic('i-arrow') !!}</a>
                <button class="burger" id="burger" type="button" aria-label="Open menu" aria-expanded="false">{!! ic('i-menu') !!}</button>
            </div>
        </div>
        <div class="mega-host" id="megaHost">
            {{-- Services --}}
            <div class="mega" data-panel="services">
                <div class="wrap mega-in">
                    <div class="mega-col"><div class="mega-eyebrow">Transfers &amp; tours</div><div class="mega-list">
                        @foreach ($services->slice(0, $half) as $sv){!! $row('/services/'.$sv->slug, $iconBox($sv->icon), $sv->name, $sv->meta) !!}@endforeach
                    </div></div>
                    <div class="mega-col"><div class="mega-eyebrow">Rental &amp; hire</div><div class="mega-list">
                        @foreach ($services->slice($half) as $sv){!! $row('/services/'.$sv->slug, $iconBox($sv->icon), $sv->name, $sv->meta) !!}@endforeach
                    </div></div>
                    <div class="mega-col"><div class="mega-eyebrow">How booking works</div><div class="mega-list">
                        @foreach ($s['home']['steps'] as $i => $st){!! $row('/contact', '<span class="mr-ico mono" style="font-size:13px;color:var(--r-600)">0'.($i + 1).'</span>', $st['t'], $st['b']) !!}@endforeach
                    </div></div>
                    <div class="mega-feat">
                        <img src="/images/band-services.jpg" alt="" loading="lazy">
                        <span class="mf-tag">Airport transfers</span>
                        <h4>DXB, DWC, Abu Dhabi &amp; Sharjah</h4>
                        <p>Meet-and-greet at arrivals with flight tracking included, so a delayed landing moves your pick-up automatically.</p>
                        <a class="btn btn-primary btn-sm" href="/services/airport-transfer" style="margin-top:10px;align-self:flex-start">View service {!! ic('i-arrow') !!}</a>
                    </div>
                </div>
            </div>
            {{-- Fleet --}}
            <div class="mega" data-panel="fleet">
                <div class="wrap mega-in">
                    @foreach ([['Cars & SUVs', $veh->slice(0, 3)], ['Vans', $veh->slice(3, 3)], ['Buses & coaches', $veh->slice(6, 3)]] as [$title, $list])
                        <div class="mega-col"><div class="mega-eyebrow">{{ $title }}</div><div class="mega-list">
                            @foreach ($list as $v){!! $row('/fleet/'.$v->slug, $thumb($v->cover()), $v->name, $v->seats_label.' · '.$driverText($v)) !!}@endforeach
                        </div></div>
                    @endforeach
                    @if ($chrome['feature'])
                        <div class="mega-feat">
                            <img src="{{ $chrome['feature']->cover() }}" alt="" loading="lazy">
                            <span class="mf-tag">Most requested</span>
                            <h4>{{ $chrome['feature']->name }}</h4>
                            <p>{{ $chrome['feature']->description }}</p>
                            <a class="btn btn-primary btn-sm" href="/fleet" style="margin-top:10px;align-self:flex-start">View full fleet {!! ic('i-arrow') !!}</a>
                        </div>
                    @endif
                </div>
            </div>
            {{-- Coverage --}}
            <div class="mega" data-panel="coverage">
                <div class="wrap mega-in">
                    <div class="mega-col"><div class="mega-eyebrow">Emirates</div><div class="mega-list">
                        @foreach ($chrome['emirates']->take(8) as $e){!! $row('/coverage', $iconBox('i-pin'), $e->name, $e->note) !!}@endforeach
                    </div></div>
                    <div class="mega-col"><div class="mega-eyebrow">Popular routes</div><div class="mega-list">
                        @foreach ($chrome['routes']->take(5) as $r){!! $row('/coverage', $iconBox('i-route'), $r->from.' → '.$r->to, implode(' · ', array_filter([$r->km ? $r->km.' km' : '', $r->mins ? 'approx. '.mins($r->mins) : '']))) !!}@endforeach
                    </div></div>
                    <div class="mega-col"><div class="mega-eyebrow">Airports served</div><div class="mega-list">
                        @foreach ($chrome['airports'] as $a){!! $row('/services/airport-transfer', $iconBox('i-plane'), $a->name, implode(' · ', array_filter([$a->code, $a->note]))) !!}@endforeach
                    </div></div>
                    <div class="mega-feat">
                        <img src="/images/band-dest.jpg" alt="" loading="lazy">
                        <span class="mf-tag">All seven emirates</span>
                        <h4>Inter-emirate travel, every day</h4>
                        <p>Dubai to Abu Dhabi, Sharjah, Ras Al Khaimah, Fujairah, Al Ain and beyond — for individual trips and group transport.</p>
                        <a class="btn btn-primary btn-sm" href="/coverage" style="margin-top:10px;align-self:flex-start">See coverage {!! ic('i-arrow') !!}</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="head-progress" id="headProgress"></div>
</header>

<div class="drawer" id="drawer" role="dialog" aria-label="Menu" hidden>
    <div class="drawer-head">
        <strong>Menu</strong>
        <button class="icon-btn" id="drawerClose" type="button" aria-label="Close menu">{!! ic('i-close') !!}</button>
    </div>
    <div class="drawer-body">
        <div class="dr-group"><a class="dr-top" href="/">Home</a></div>
        @foreach ($nav as [$label, $href, $mega])
            @if ($mega)
                <div class="dr-group">
                    <button class="dr-top" type="button">{{ $label }}{!! ic('i-chev') !!}</button>
                    <div class="dr-sub">
                        <a href="{{ $href }}"><strong>All {{ strtolower($label) }}</strong></a>
                        @if ($mega === 'services')
                            @foreach ($services as $sv)<a href="/services/{{ $sv->slug }}">{{ $sv->name }}</a>@endforeach
                        @elseif ($mega === 'fleet')
                            @foreach ($veh as $v)<a href="/fleet/{{ $v->slug }}">{{ $v->name }} <span style="color:var(--muted);font-size:11px">· {{ $v->seats_label }}</span></a>@endforeach
                        @else
                            @foreach ($chrome['emirates'] as $e)<a href="/coverage">{{ $e->name }} <span style="color:var(--muted);font-size:11px">· {{ $e->note }}</span></a>@endforeach
                        @endif
                    </div>
                </div>
            @else
                <div class="dr-group"><a class="dr-top" href="{{ $href }}">{{ $label }}</a></div>
            @endif
        @endforeach
        <div class="dr-group"><a class="dr-top" href="/faq">FAQ</a></div>
        <div class="dr-cta">
            <a class="btn btn-primary btn-block" href="/contact">Get a Quote {!! ic('i-arrow') !!}</a>
            @if ($c['whatsapp'])<a class="btn btn-whats btn-block" href="{{ wa_href($c['whatsapp'], $c['whatsappMessage']) }}" target="_blank" rel="noopener">{!! ic('i-whats') !!} WhatsApp</a>@endif
            @if ($phone)<a class="btn btn-ghost btn-block" href="{{ tel_href($phone) }}">{!! ic('i-phone') !!} Call Now</a>@endif
        </div>
    </div>
</div>
<div class="scrim" id="scrim" hidden></div>
