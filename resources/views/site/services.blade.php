@extends('layouts.site')

@section('content')
<x-page-head :crumbs="[['Services']]" title="Transportation services across the UAE"
    sub="From airport pick-ups to monthly corporate contracts — transfers and daily hire are booked per journey; shuttles, staff transport and monthly rental run on a standing plan with dedicated vehicles." />
<section class="sec">
    <div class="wrap">
        <div class="grid {{ grid_class($services->count()) }}">
            @foreach ($services as $i => $sv) @include('site.partials.service-card', ['sv' => $sv, 'i' => $i]) @endforeach
        </div>
    </div>
</section>
@if ($faqs->count())
    <section class="sec sec-alt">
        <div class="wrap">
            <x-sec-head eyebrow="Common questions" title="Frequently asked questions" />
            <div class="grid g-2" style="gap:12px">
                @foreach ($faqs as $i => $f)
                    <div class="panel reveal" data-d="{{ $i % 4 }}"><h3 style="font-size:var(--t-md)">{{ $f->question }}</h3><p class="note" style="margin-top:8px;font-size:var(--t-sm)">{{ $f->answer }}</p></div>
                @endforeach
            </div>
        </div>
    </section>
@endif
@include('site.partials.cta-band')
@endsection
