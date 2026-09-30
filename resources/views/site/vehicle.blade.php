@extends('layouts.site')

@section('content')
@php
    $c = $s['contact'];
    $phone = $c['phones'][0] ?? '';
    $either = $v->selfDrive();
    $images = $v->imageList();
@endphp
<x-page-head :crumbs="[['Fleet', '/fleet'], [$v->name]]" :title="$v->name" :sub="$v->class_label.' · '.$v->seats_label.' · '.$v->driverText()" />

<section class="sec">
    <div class="wrap vd">
        <div class="reveal">
            <div class="js-gallery" data-count="{{ count($images) }}">
                <div class="gal-main">
                    @if ($images)
                        <img src="{{ $images[0] }}" alt="{{ $v->altText() }}" data-alt="{{ $v->altText() }}">
                        @if (count($images) > 1)
                            <button class="rail-btn prev gal-nav" type="button" data-gal="-1" aria-label="Previous photo">{!! ic('i-chev') !!}</button>
                            <button class="rail-btn next gal-nav" type="button" data-gal="1" aria-label="Next photo">{!! ic('i-chev') !!}</button>
                            <span class="gal-count">1 / {{ count($images) }}</span>
                        @endif
                    @else
                        <span class="vart">{!! \App\Support\Art::vehicle($v->slug, (int) $v->capacity, $v->name) !!}</span>
                    @endif
                </div>
                @if (count($images) > 1)
                    <div class="gal-thumbs">
                        @foreach ($images as $k => $src)
                            <button type="button" class="{{ $k === 0 ? 'on' : '' }}" data-src="{{ $src }}" aria-label="Show photo {{ $k + 1 }}"><img src="{{ $src }}" alt="" loading="lazy"></button>
                        @endforeach
                    </div>
                @endif
            </div>
        </div>
        <div class="reveal" data-d="1" style="display:flex;flex-direction:column;gap:16px">
            <span class="drv {{ $either ? 'either' : 'only' }}" style="font-size:12px">{!! ic($either ? 'i-wheel' : 'i-shield') !!}{{ $v->driverText() }}</span>
            <p style="font-size:var(--t-md);color:var(--text-2);line-height:1.7">{{ $v->description }}</p>
            @if ($v->tagList())<div class="tag-row">@foreach ($v->tagList() as $t)<span class="tag">{{ $t }}</span>@endforeach</div>@endif
            <div class="panel" style="padding:20px">
                <div class="kv"><span>Capacity</span><b>{{ $v->seats_label }}</b></div>
                <div class="kv"><span>Class</span><b>{{ $v->class_label }}</b></div>
                @if ($v->category)<div class="kv"><span>Category</span><b>{{ $v->category->name }}</b></div>@endif
                <div class="kv"><span>Driver option</span><b>{{ $v->driverText() }}</b></div>
                @if ($v->luggage)<div class="kv"><span>Luggage</span><b>{{ $v->luggage }}</b></div>@endif
                @if ($v->best_for)<div class="kv"><span>Best for</span><b>{{ $v->best_for }}</b></div>@endif
                <div class="kv"><span>Pricing</span><b>Quoted in AED</b></div>
            </div>
            @if ($v->featureList())
                <ul class="check-list">@foreach ($v->featureList() as $f)<li>{!! ic('i-check') !!}{{ $f }}</li>@endforeach</ul>
            @endif
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px">
                @if ($phone)<a class="btn btn-ghost" href="{{ tel_href($phone) }}">{!! ic('i-phone') !!} Call Now</a>@endif
                @if ($c['whatsapp'])<a class="btn btn-whats" href="{{ wa_href($c['whatsapp'], 'Hello, I would like a quote for the '.$v->name.'.') }}" target="_blank" rel="noopener">{!! ic('i-whats') !!} WhatsApp</a>@endif
                <a class="btn btn-primary" href="#vehicle-quote" style="grid-column:1/-1">Get a Quote {!! ic('i-arrow') !!}</a>
            </div>
        </div>
    </div>
</section>

<section class="sec sec-alt" id="vehicle-quote">
    <div class="wrap map-wrap">
        <div class="reveal">
            @if ($v->body)
                <div class="prose">{!! md($v->body) !!}</div>
            @else
                <div class="prose">
                    <h2 style="margin-top:0">Book the {{ $v->name }}</h2>
                    <p>The {{ $v->name }} is available for airport transfers, hotel transfers, city tours, events and daily or monthly hire across Dubai, Abu Dhabi and all seven emirates. Send your pick-up, destination, date and passenger count and we’ll confirm availability and an AED price.</p>
                </div>
            @endif
            @if ($v->services->count())
                <div style="margin-top:26px">
                    <span class="eyebrow">Popular for</span>
                    <div class="grid g-2" style="margin-top:14px">
                        @foreach ($v->services->take(4) as $i => $sv) @include('site.partials.service-card', ['sv' => $sv, 'i' => $i]) @endforeach
                    </div>
                </div>
            @endif
        </div>
        <div class="panel reveal" data-d="1">
            <h3>Get a quote for the {{ $v->name }}</h3>
            <p class="note" style="margin:4px 0 16px">We reply with an AED price by phone or WhatsApp.</p>
            @include('site.partials.contact-form', ['compact' => true, 'source' => 'vehicle:'.$v->slug, 'initialVehicle' => $v->name.' ('.$v->seats_label.')'])
        </div>
    </div>
</section>

@if ($related->count())
    <section class="sec">
        <div class="wrap">
            <x-sec-head eyebrow="Similar vehicles" title="You may also consider">
                <a class="btn btn-ghost btn-sm" href="/fleet">View full fleet {!! ic('i-arrow') !!}</a>
            </x-sec-head>
            <div class="grid g-3">
                @foreach ($related as $i => $x) @include('site.partials.fleet-card', ['v' => $x, 'i' => $i]) @endforeach
            </div>
        </div>
    </section>
@endif
@include('site.partials.cta-band')
@push('jsonld'){!! \App\Support\Seo::jsonLd(\App\Support\Seo::breadcrumbs([['Home', '/'], ['Fleet', '/fleet'], [$v->name, '/fleet/'.$v->slug]])) !!}@endpush
@endsection
