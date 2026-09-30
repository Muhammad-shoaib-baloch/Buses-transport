@extends('layouts.site')

@section('content')
@php
    $h = $s['home'];
    $c = $s['contact'];
    $emirates = $areas->where('kind', 'emirate')->values();
    $homeServices = $services->where('featured', true)->values();
@endphp

<section class="hero">
    @if ($h['heroImage'])<img class="hero-img" src="{{ $h['heroImage'] }}" alt="" aria-hidden="true" width="1800" height="1012" fetchpriority="high">@endif
    <div class="wrap hero-in">
        <div>
            @if ($h['heroKicker'])<div class="hero-kicker"><span class="eyebrow eyebrow-night">{{ $h['heroKicker'] }}</span></div>@endif
            <h1>
                @if ($h['heroLine1'])<span class="ln"><span>{{ $h['heroLine1'] }}</span></span>@endif
                @if ($h['heroLine2'])<span class="ln"><span>{{ $h['heroLine2'] }}</span></span>@endif
                @if ($h['heroHighlight'])<span class="ln"><span><em>{{ $h['heroHighlight'] }}</em></span></span>@endif
            </h1>
            @if ($h['heroSub'])<p class="hero-sub">{{ $h['heroSub'] }}</p>@endif
            <div class="hero-acts">
                @if ($h['heroPrimaryLabel'])<a class="btn btn-primary btn-lg" href="{{ $h['heroPrimaryHref'] ?: '/fleet' }}">{{ $h['heroPrimaryLabel'] }} {!! ic('i-arrow') !!}</a>@endif
                @if ($h['heroSecondaryLabel'])<a class="btn btn-onnight btn-lg" href="{{ $h['heroSecondaryHref'] ?: '/services' }}">{{ $h['heroSecondaryLabel'] }}</a>@endif
            </div>
            @if ($h['trust'])
                <div class="hero-trust">
                    @foreach ($h['trust'] as $t)<span class="ht"><b>{{ $t['value'] }}</b><span>{{ $t['label'] }}</span></span>@endforeach
                </div>
            @endif
        </div>
        @include('site.partials.quote-card')
    </div>
</section>

@if ($h['showTicker'])
    @include('site.partials.ticker', ['routes' => $routes->where('show_in_ticker', true), 'extras' => $h['tickerExtras']])
@endif

@if ($h['showServices'] && $homeServices->count())
    <section class="sec">
        <div class="wrap">
            <x-sec-head :eyebrow="$h['servicesEyebrow']" :title="$h['servicesTitle']" :sub="$h['servicesSub']" />
            <div class="grid {{ grid_class($homeServices->count()) }}">
                @foreach ($homeServices as $i => $sv) @include('site.partials.service-card', ['sv' => $sv, 'i' => $i]) @endforeach
            </div>
        </div>
    </section>
@endif

@if ($h['showFleet'] && $featured->count())
    <section class="sec sec-alt">
        <div class="wrap">
            <x-sec-head :eyebrow="$h['fleetEyebrow']" :title="$h['fleetTitle']" :sub="$h['fleetSub']">
                <div class="rail-nav">
                    <button class="rail-btn prev" type="button" data-rail="fleetRail" data-dir="-1" aria-label="Previous">{!! ic('i-chev') !!}</button>
                    <button class="rail-btn next" type="button" data-rail="fleetRail" data-dir="1" aria-label="Next">{!! ic('i-chev') !!}</button>
                </div>
            </x-sec-head>
            <div class="rail-shell"><div class="rail" id="fleetRail">
                @foreach ($featured as $i => $v) @include('site.partials.fleet-card', ['v' => $v, 'i' => $i]) @endforeach
            </div></div>
            <div style="margin-top:26px"><a class="btn btn-ghost" href="/fleet">View full fleet {!! ic('i-arrow') !!}</a></div>
        </div>
    </section>
@endif

@if ($h['showWhy'] && $h['why'])
    <section class="sec sec-alt" @if ($h['showFleet']) style="padding-top:0" @endif>
        <div class="wrap">
            <x-sec-head :eyebrow="$h['whyEyebrow']" :title="$h['whyTitle']" :sub="$h['whySub']" />
            <div class="grid g-3">
                @foreach ($h['why'] as $i => $w)
                    <div class="feat reveal" data-d="{{ $i % 3 }}"><span class="feat-ico">{!! ic($w['icon']) !!}</span><div><h3>{{ $w['title'] }}</h3><p>{{ $w['body'] }}</p></div></div>
                @endforeach
            </div>
        </div>
    </section>
@endif

@if ($h['showCoverage'])
    <section class="sec">
        <div class="wrap">
            <x-sec-head :eyebrow="$h['coverageEyebrow']" :title="$h['coverageTitle']" :sub="$h['coverageSub']" />
            @include('site.partials.map-card', ['areas' => $emirates])
            <div class="grid g-2 lists reveal" data-d="1" style="margin-top:20px">
                <div class="rt-list">
                    @foreach ($routes->take(6) as $r)
                        <a class="rt" href="/coverage">
                            <span class="rt-name">{!! ic('i-route') !!} {{ $r->from }} <span style="color:var(--muted)">&rarr;</span> {{ $r->to }}</span>
                            <span class="rt-km">{{ $r->km ? $r->km.' km' : '' }}</span>
                            <span class="rt-time">{{ mins($r->mins) }}</span>
                        </a>
                    @endforeach
                </div>
                <div class="em-list">
                    @foreach ($emirates as $e)
                        <div class="em"><span class="em-code">{{ $e->code }}</span><span><b>{{ $e->name }}</b><span>{{ $e->note }}</span></span><span class="em-dep">{{ $e->badge }}</span></div>
                    @endforeach
                </div>
            </div>
        </div>
    </section>
@endif

@if ($h['showStats'] && $h['stats'])
    <section class="sec-tight sec-alt">
        <div class="wrap"><div class="stats reveal">
            @foreach ($h['stats'] as $st)
                @php $dec = (int) ($st['dec'] ?? 0); @endphp
                <div class="stat">
                    <b class="count" data-to="{{ $st['n'] }}" data-dec="{{ $dec }}" data-suffix="{{ $st['suffix'] }}">{{ number_format((float) $st['n'], $dec) }}{{ $st['suffix'] }}</b>
                    <span>{{ $st['label'] }}</span><small>{{ $st['sub'] }}</small>
                </div>
            @endforeach
        </div></div>
    </section>
@endif

@if ($h['showSteps'] && $h['steps'])
    <section class="sec">
        <div class="wrap">
            <x-sec-head :eyebrow="$h['stepsEyebrow']" :title="$h['stepsTitle']" :sub="$h['stepsSub']" />
            <div class="steps">
                @foreach ($h['steps'] as $i => $st)
                    <div class="step reveal" data-d="{{ $i }}"><div class="step-bar"><i></i></div>
                        <span class="step-n">Step {{ str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) }}</span><h3>{{ $st['t'] }}</h3><p>{{ $st['b'] }}</p></div>
                @endforeach
            </div>
        </div>
    </section>
@endif

@if ($h['showReviews'])
    <section class="sec sec-alt">
        <div class="wrap">
            <x-sec-head :eyebrow="$h['reviewsEyebrow']" :title="$h['reviewsTitle']" :sub="$testimonials->count() ? null : $h['reviewsSub']" />
            @if ($testimonials->count())
                <div class="tsl" id="tsl">
                    <div class="tsl-track" id="tslTrack">
                        @foreach ($testimonials as $t)
                            <div class="tsl-item"><div class="tq" @unless ($t->stat) style="grid-template-columns:1fr" @endunless>
                                @if ($t->stat)<div class="tq-side"><b>{{ $t->stat }}</b><span>{{ $t->stat_label }}</span></div>@endif
                                <div>
                                    <div class="tq-stars" aria-label="{{ $t->rating }} out of 5">@for ($k = 0; $k < max(0, min(5, $t->rating)); $k++){!! ic('i-star') !!}@endfor</div>
                                    <blockquote>{{ $t->quote }}</blockquote>
                                    <div class="tq-who"><span class="tq-av">{{ $t->avatar ?: initials($t->name) }}</span><span><b>{{ $t->name }}</b><span>{{ $t->role }}</span></span></div>
                                </div>
                            </div></div>
                        @endforeach
                    </div>
                    @if ($testimonials->count() > 1)
                        <div class="tsl-ctrl">
                            <button class="rail-btn prev" type="button" id="tslPrev" aria-label="Previous">{!! ic('i-chev') !!}</button>
                            <button class="rail-btn next" type="button" id="tslNext" aria-label="Next">{!! ic('i-chev') !!}</button>
                            <span class="tsl-dots" id="tslDots"></span>
                        </div>
                    @endif
                </div>
            @else
                @php $waReview = wa_href($c['whatsapp'], 'Hello, I would like to share a review of my trip.'); @endphp
                <div class="grid g-3">
                    <a class="rv-card reveal" href="{{ $s['social']['googleReviews'] ?: $waReview }}" target="_blank" rel="noopener">
                        <span class="rv-ico">{!! ic('i-google') !!}</span><h3>Google reviews</h3>
                        <p>Read what travellers say about us on our Google Business Profile — and leave your own review after your trip.</p>
                        <span class="svc-go">{{ $s['social']['googleReviews'] ? 'Open Google reviews' : 'Ask us for the link' }} {!! ic('i-arrow') !!}</span>
                    </a>
                    <a class="rv-card reveal" data-d="1" href="{{ $s['social']['facebook'] ?: $waReview }}" target="_blank" rel="noopener">
                        <span class="rv-ico">{!! ic('i-facebook') !!}</span><h3>Facebook reviews</h3>
                        <p>Follow our page for updates, and share a recommendation for the next family or company booking with us.</p>
                        <span class="svc-go">{{ $s['social']['facebook'] ? 'Visit our page' : 'Message us' }} {!! ic('i-arrow') !!}</span>
                    </a>
                    <a class="rv-card reveal" data-d="2" href="{{ wa_href($c['whatsapp'], 'Hello, I would like to send a testimonial about my trip with Buses Transport UAE.') }}" target="_blank" rel="noopener">
                        <span class="rv-ico">{!! ic('i-quote') !!}</span><h3>Send us a testimonial</h3>
                        <p>Corporate and hotel partners: send us a short testimonial and we’ll feature it here with your permission.</p>
                        <span class="svc-go">Send on WhatsApp {!! ic('i-arrow') !!}</span>
                    </a>
                </div>
            @endif
        </div>
    </section>
@endif

@if ($h['showBlog'] && $posts->count())
    <section class="sec">
        <div class="wrap">
            <x-sec-head :eyebrow="$h['blogEyebrow']" :title="$h['blogTitle']" :sub="$h['blogSub']">
                <a class="btn btn-ghost btn-sm" href="/blog">All articles {!! ic('i-arrow') !!}</a>
            </x-sec-head>
            <div class="grid g-3">
                @foreach ($posts as $i => $p) @include('site.partials.post-card', ['p' => $p, 'i' => $i]) @endforeach
            </div>
        </div>
    </section>
@endif

@if ($h['showCta'])
    @include('site.partials.cta-band')
@endif
@endsection
