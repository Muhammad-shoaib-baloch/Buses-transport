@extends('layouts.site')

@section('content')
<x-page-head :crumbs="[['Blog', '/blog'], [$p->category]]" :title="$p->title" :sub="$p->excerpt" titleStyle="max-width:22ch">
    <div class="post-meta" style="color:var(--muted)">
        <span>{{ $p->author ?: $s['general']['siteName'] }}</span><i></i><span>{{ date_fmt($p->published_at) }}</span><i></i><span>{{ $p->read_minutes }} min read</span>
        @if ($preview)<i></i><span style="color:var(--r-600)">Preview — {{ $p->status }}</span>@endif
    </div>
</x-page-head>
<section class="sec">
    <div class="wrap">
        <article class="article">
            <div class="article-hero">@include('site.partials.post-cover', ['p' => $p])</div>
            <div class="prose">{!! md($p->body) !!}</div>
            @if ($p->tagList())
                <div class="tag-row" style="margin-top:30px">
                    @foreach ($p->tagList() as $t)<a class="tag" href="/blog?tag={{ urlencode(mb_strtolower($t)) }}">#{{ $t }}</a>@endforeach
                </div>
            @endif
            <div class="cta" style="margin-top:44px">
                <div><h2>Need a car, van or bus in Dubai?</h2><p>Send us your route, date and group size — we’ll confirm your vehicle and an AED price by phone or WhatsApp.</p></div>
                <div class="cta-acts"><a class="btn btn-primary" href="/contact">Get a quote {!! ic('i-arrow') !!}</a></div>
            </div>
        </article>
    </div>
</section>
@if ($others->count())
    <section class="sec sec-alt">
        <div class="wrap">
            <x-sec-head eyebrow="Keep reading" title="More from our team" />
            <div class="grid g-3">
                @foreach ($others as $i => $x) @include('site.partials.post-card', ['p' => $x, 'i' => $i]) @endforeach
            </div>
        </div>
    </section>
@endif
@unless ($preview)<span hidden class="js-view" data-slug="{{ $p->slug }}"></span>@endunless
@push('jsonld'){!! \App\Support\Seo::jsonLd($ld) !!}@endpush
@endsection
