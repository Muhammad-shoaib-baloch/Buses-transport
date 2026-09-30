@extends('layouts.site')

@section('content')
@php
    $emirates = $areas->where('kind', 'emirate')->values();
    $airports = $areas->where('kind', 'airport')->values();
    $places = $areas->where('kind', 'area')->values();
@endphp
<x-page-head :crumbs="[['Coverage']]" title="Transportation across the UAE" :sub="$s['home']['coverageSub']" />
<section class="sec">
    <div class="wrap">
        @include('site.partials.map-card', ['areas' => $emirates])
        <div class="reveal" data-d="1" style="margin-top:26px">
            <h2 style="font-size:var(--t-2xl);margin-bottom:16px">Emirates we cover</h2>
            <div class="em-list">
                @foreach ($emirates as $e)
                    <div class="em"><span class="em-code">{{ $e->code }}</span><span><b>{{ $e->name }}</b><span>{{ $e->note }}</span></span><span class="em-dep">{{ $e->badge }}</span></div>
                @endforeach
            </div>
        </div>
    </div>
</section>
@if ($routes->count())
    <section class="sec sec-alt">
        <div class="wrap">
            <x-sec-head eyebrow="Popular routes" title="Inter-emirate and city routes" sub="Approximate distances and drive times. Actual journey time depends on traffic and stops — your driver plans the route on the day." />
            <div class="rt-list reveal">
                @foreach ($routes as $r)
                    <div class="rt">
                        <span class="rt-name">{!! ic('i-route') !!} {{ $r->from }} <span style="color:var(--muted)">&rarr;</span> {{ $r->to }}@if ($r->note)<span class="note" style="margin-left:6px">{{ $r->note }}</span>@endif</span>
                        <span class="rt-km">{{ $r->km ? $r->km.' km' : '' }}</span>
                        <span class="rt-time">{{ mins($r->mins) }}</span>
                    </div>
                @endforeach
            </div>
        </div>
    </section>
@endif
@if ($airports->count() || $places->count())
    <section class="sec">
        <div class="wrap">
            <x-sec-head eyebrow="Coverage" title="Areas we serve" />
            <div class="grid g-2">
                @if ($airports->count())
                    <div class="panel reveal"><h3>Airports</h3>
                        @foreach ($airports as $a)<div class="kv"><span>{{ $a->name }}</span><b>{{ $a->code }}</b></div>@endforeach
                    </div>
                @endif
                @if ($places->count())
                    <div class="panel reveal" data-d="1"><h3>Popular areas</h3>
                        <div class="chips" style="margin-top:14px">
                            @foreach ($emirates->concat($places) as $p)<span>{!! ic('i-pin') !!} {{ $p->name }}</span>@endforeach
                        </div>
                    </div>
                @endif
            </div>
        </div>
    </section>
@endif
@include('site.partials.cta-band', ['image' => '/images/band-dest.jpg'])
@endsection
