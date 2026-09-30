@extends('layouts.site')

@section('content')
@php
    $c = $s['contact'];
    $phone = $c['phones'][0] ?? '';
@endphp
<x-page-head :crumbs="[['Services', '/services'], [$svc->name]]" :title="$svc->heroTitle()" :sub="$svc->heroSub()">
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px">
        <a class="btn btn-primary" href="/contact?service={{ $svc->slug }}">Get a Quote {!! ic('i-arrow') !!}</a>
        @if ($c['whatsapp'])<a class="btn btn-whats" href="{{ wa_href($c['whatsapp'], 'Hello, I would like a quote for '.$svc->name.'.') }}" target="_blank" rel="noopener">{!! ic('i-whats') !!} WhatsApp Us</a>@endif
        @if ($phone)<a class="btn btn-ghost" href="{{ tel_href($phone) }}">{!! ic('i-phone') !!} Call Now</a>@endif
    </div>
</x-page-head>

<section class="sec">
    <div class="wrap">
        <div class="map-wrap">
            <div class="reveal">
                @if ($svc->image)
                    <div class="article-hero" style="aspect-ratio:16/9"><img src="{{ $svc->image }}" alt="{{ $svc->name }}" style="width:100%;height:100%;object-fit:cover"></div>
                @endif
                <div class="prose">{!! md($svc->body) !!}</div>
                @if ($svc->includedList())
                    <div style="margin-top:34px">
                        <span class="eyebrow">What’s included</span>
                        <h2 style="font-size:var(--t-xl);margin:10px 0 16px">Every booking includes</h2>
                        <ul class="check-list">@foreach ($svc->includedList() as $it)<li>{!! ic('i-check') !!}{{ $it }}</li>@endforeach</ul>
                    </div>
                @endif
            </div>
            <div class="reveal" data-d="1" style="display:flex;flex-direction:column;gap:14px">
                <div class="panel">
                    <h3>At a glance</h3>
                    <div class="kv"><span>Service</span><b>{{ $svc->name }}</b></div>
                    @if ($svc->meta)<div class="kv"><span>Typical booking</span><b>{{ $svc->meta }}</b></div>@endif
                    <div class="kv"><span>Coverage</span><b>All 7 emirates</b></div>
                    <div class="kv"><span>Bookings &amp; support</span><b>24 / 7</b></div>
                    <div class="kv"><span>Pricing</span><b>Quoted in AED</b></div>
                </div>
                <div class="panel">
                    <h3>Get a quote for {{ $svc->name }}</h3>
                    <p class="note" style="margin:4px 0 16px">Send us your trip details — we’ll confirm an AED price by phone or WhatsApp.</p>
                    @include('site.partials.contact-form', ['compact' => true, 'source' => 'service:'.$svc->slug, 'initialService' => $svc->name])
                </div>
            </div>
        </div>
    </div>
</section>

@if ($svc->stepList())
    <section class="sec sec-alt">
        <div class="wrap">
            <x-sec-head eyebrow="Process" title="How it works" />
            <div class="nsteps">
                @foreach ($svc->stepList() as $i => $st)
                    <div class="nstep reveal" data-d="{{ $i }}"><b>{{ str_pad((string) ($i + 1), 2, '0', STR_PAD_LEFT) }}</b><h3>{{ $st['t'] }}</h3><p>{{ $st['b'] }}</p></div>
                @endforeach
            </div>
        </div>
    </section>
@endif

@if ($vehicles->count())
    <section class="sec">
        <div class="wrap">
            <x-sec-head eyebrow="Recommended vehicles" :title="'Vehicles for '.strtolower($svc->name)">
                <a class="btn btn-ghost btn-sm" href="/fleet">View full fleet {!! ic('i-arrow') !!}</a>
            </x-sec-head>
            <div class="grid g-3">
                @foreach ($vehicles as $i => $v) @include('site.partials.fleet-card', ['v' => $v, 'i' => $i]) @endforeach
            </div>
        </div>
    </section>
@endif

@if ($faqs->count())
    <section class="sec sec-alt">
        <div class="wrap" style="max-width:900px">
            <x-sec-head eyebrow="FAQ" title="Common questions" />
            @include('site.partials.faq-list', ['faqs' => $faqs])
        </div>
    </section>
@endif

@if ($others->count())
    <section class="sec">
        <div class="wrap">
            <x-sec-head eyebrow="Related" title="Other services you may need" />
            <div class="grid g-4">
                @foreach ($others as $i => $sv) @include('site.partials.service-card', ['sv' => $sv, 'i' => $i]) @endforeach
            </div>
        </div>
    </section>
@endif

@include('site.partials.cta-band')
@push('jsonld')@foreach ($ld as $x){!! \App\Support\Seo::jsonLd($x) !!}@endforeach @endpush
@endsection
