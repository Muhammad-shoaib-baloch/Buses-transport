@extends('layouts.site')

@section('content')
@php $a = $s['about']; @endphp
<x-page-head :crumbs="[['About']]" :title="$a['title']" :sub="$a['sub']" />
<section class="sec">
    <div class="wrap map-wrap">
        <div class="reveal"><div class="prose">{!! md($a['body']) !!}</div></div>
        <div class="reveal" data-d="1" style="display:flex;flex-direction:column;gap:14px">
            @if ($a['image'])
                <div class="article-hero" style="aspect-ratio:4/3;margin-bottom:0"><img src="{{ $a['image'] }}" alt="" style="width:100%;height:100%;object-fit:cover"></div>
            @endif
            @if ($a['facts'])
                <div class="panel"><h3>{{ $a['panelTitle'] }}</h3>
                    @foreach ($a['facts'] as $f)<div class="kv"><span>{{ $f['label'] }}</span><b>{{ $f['value'] }}</b></div>@endforeach
                </div>
            @endif
        </div>
    </div>
</section>
@if ($s['home']['why'])
    <section class="sec sec-alt">
        <div class="wrap">
            <x-sec-head eyebrow="Why choose us" :title="$a['valuesTitle']" />
            <div class="grid g-3">
                @foreach ($s['home']['why'] as $i => $w)
                    <div class="feat reveal" data-d="{{ $i % 3 }}"><span class="feat-ico">{!! ic($w['icon']) !!}</span><div><h3>{{ $w['title'] }}</h3><p>{{ $w['body'] }}</p></div></div>
                @endforeach
            </div>
        </div>
    </section>
@endif
@include('site.partials.cta-band')
@endsection
