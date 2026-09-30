@extends('layouts.site')

@section('content')
@php $c = $s['contact']; @endphp
<x-page-head :crumbs="[['Contact']]" :title="$c['contactTitle']" :sub="$c['contactSub']">
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px">
        @if ($c['whatsapp'])<a class="btn btn-whats" href="{{ wa_href($c['whatsapp'], $c['whatsappMessage']) }}" target="_blank" rel="noopener">{!! ic('i-whats') !!} WhatsApp Us</a>@endif
        @if (! empty($c['phones'][0]))<a class="btn btn-ghost" href="{{ tel_href($c['phones'][0]) }}">{!! ic('i-phone') !!} Call Now</a>@endif
    </div>
</x-page-head>
<section class="sec">
    <div class="wrap map-wrap">
        <div class="panel reveal" id="quote">
            <h3>Request a free quote</h3>
            <p class="note" style="margin:6px 0 20px">Rough details are fine — we’ll come back with questions if we need them.</p>
            @include('site.partials.contact-form', ['source' => 'contact', 'initialService' => $initialService, 'initialVehicle' => $initialVehicle])
        </div>
        <div class="reveal" data-d="1" style="display:flex;flex-direction:column;gap:14px">
            <div class="panel">
                <h3>Speak to our team</h3>
                <div class="foot-contact" style="margin-top:12px;color:var(--text-2)">
                    @foreach ($c['phones'] as $ph)
                        <a class="fc" href="{{ tel_href($ph) }}">{!! ic('i-phone') !!}<span><b class="mono">{{ $ph }}</b><br><span class="note">Call, 24 hours</span></span></a>
                    @endforeach
                    @if ($c['whatsapp'])
                        <a class="fc" href="{{ wa_href($c['whatsapp'], $c['whatsappMessage']) }}" target="_blank" rel="noopener">{!! ic('i-whats') !!}<span><b class="mono">{{ $c['whatsapp'] }}</b><br><span class="note">WhatsApp, 24 hours</span></span></a>
                    @endif
                    @foreach ($c['emails'] as $em)
                        <a class="fc" href="mailto:{{ $em }}">{!! ic('i-mail') !!}<span><b style="overflow-wrap:anywhere">{{ $em }}</b><br><span class="note">Email</span></span></a>
                    @endforeach
                    @if ($c['address'])
                        <span class="fc">{!! ic('i-pin') !!}<span><b>Based in</b><br><span class="note">{{ $c['address'] }}</span></span></span>
                    @endif
                </div>
            </div>
            @if ($c['hoursRows'])
                <div class="panel"><h3>Hours</h3>
                    @foreach ($c['hoursRows'] as $h)<div class="kv"><span>{{ $h['label'] }}</span><b>{{ $h['value'] }}</b></div>@endforeach
                </div>
            @endif
            @if ($c['mapEmbedUrl'] && preg_match('~^https://(www\.)?google\.[a-z.]+/maps/embed~i', $c['mapEmbedUrl']))
                <div class="map-embed"><iframe src="{{ $c['mapEmbedUrl'] }}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Office location" allowfullscreen></iframe></div>
            @endif
        </div>
    </div>
</section>
@if ($areas->count())
    <section class="sec-tight sec-alt">
        <div class="wrap">
            <span class="eyebrow">Coverage</span>
            <h2 style="font-size:var(--t-2xl);margin:12px 0 18px">Areas we serve</h2>
            <div class="chips">
                @foreach ($areas as $p)<span>{!! ic($p->kind === 'airport' ? 'i-plane' : 'i-pin') !!} {{ $p->name }}{{ $p->kind === 'airport' && $p->code ? ' ('.$p->code.')' : '' }}</span>@endforeach
            </div>
        </div>
    </section>
@endif
@endsection
