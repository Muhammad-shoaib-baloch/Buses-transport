@extends('layouts.site')

@section('content')
@php
    $selfDrive = $vehicles->filter(fn ($v) => $v->selfDrive())->count();
    $usedCats = $categories->filter(fn ($c) => $vehicles->contains(fn ($v) => $v->fleet_category_id === $c->id));
@endphp
<x-page-head :crumbs="[['Fleet']]" title="Our vehicles — sedan to 50-seater luxury bus"
    sub="A full range of vehicle classes covering every group size — from a private executive sedan and luxury SUV to a 50-seat luxury coach. Most vehicles travel with a professional driver, with self-drive available on selected cars, vans and buses." />
<section class="sec">
    <div class="wrap">
        <div class="filters" id="fleetFilters" role="toolbar" aria-label="Filter vehicles">
            <button class="fbtn on" type="button" data-cat="all">All vehicles</button>
            @foreach ($usedCats as $c)<button class="fbtn" type="button" data-cat="{{ $c->slug }}">{{ $c->name }}</button>@endforeach
            <button class="fbtn" type="button" data-cat="__self">Self-drive available</button>
        </div>
        <div class="grid g-3" id="fleetGrid">
            @foreach ($vehicles as $i => $v) @include('site.partials.fleet-card', ['v' => $v, 'i' => $i]) @endforeach
        </div>
    </div>
</section>

<section class="sec sec-alt">
    <div class="wrap">
        <x-sec-head eyebrow="Quick compare" title="Fleet at a glance"
            sub="Vehicles marked “With or without driver” can be booked as a self-drive hire; vehicles marked “Chauffeur-driven only” always come with a professional driver. Rates are always confirmed in AED." />
        <div class="compare table-scroll reveal">
            <table>
                <thead><tr><th>Vehicle</th><th>Capacity</th><th>Class</th><th>Driver option</th><th>Best for</th></tr></thead>
                <tbody>
                    @foreach ($vehicles as $v)
                        <tr><td><a href="/fleet/{{ $v->slug }}">{{ $v->name }}</a></td><td class="mono">{{ $v->seats_label }}</td><td>{{ $v->class_label }}</td><td>{{ $v->driverText() }}</td><td>{{ $v->best_for }}</td></tr>
                    @endforeach
                </tbody>
            </table>
        </div>
    </div>
</section>

<section class="sec-tight">
    <div class="wrap">
        <div class="grid g-3">
            <div class="panel reveal">
                <h3>Every booking includes</h3>
                <div class="kv"><span>Professional, licensed driver</span><b>Included</b></div>
                <div class="kv"><span>Clean, air-conditioned vehicle</span><b>Included</b></div>
                <div class="kv"><span>Commercial passenger insurance</span><b>Included</b></div>
                <div class="kv"><span>Flight tracking on airport runs</span><b>Included</b></div>
                <div class="kv"><span>24/7 phone &amp; WhatsApp support</span><b>Included</b></div>
            </div>
            <div class="panel reveal" data-d="1">
                <h3>Ways to book</h3>
                <div class="kv"><span>Point-to-point transfer</span><b>Any vehicle</b></div>
                <div class="kv"><span>Hourly or daily hire</span><b>Any vehicle</b></div>
                <div class="kv"><span>Monthly rental</span><b>Dedicated driver</b></div>
                <div class="kv"><span>Self-drive hire</span><b>{{ $selfDrive }} of {{ $vehicles->count() }} vehicles</b></div>
                <div class="kv"><span>Pricing</span><b>Quoted in AED</b></div>
            </div>
            <div class="panel reveal" data-d="2">
                <h3>Not sure which vehicle you need?</h3>
                <p class="note" style="margin-top:8px;font-size:var(--t-sm)">Tell us your group size, luggage and route and we’ll recommend the right vehicle — or several for large groups and events. Every vehicle in the fleet is regularly serviced and insured for commercial passenger transport.</p>
                <div style="margin-top:16px;display:grid;gap:9px"><a class="btn btn-primary btn-sm btn-block" href="/contact">Ask about a vehicle {!! ic('i-arrow') !!}</a></div>
            </div>
        </div>
    </div>
</section>
@include('site.partials.cta-band')
@endsection
