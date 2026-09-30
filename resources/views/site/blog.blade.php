@extends('layouts.site')

@section('content')
@php $cats = $posts->pluck('category')->unique()->values(); @endphp
<x-page-head :crumbs="$tag ? [['Blog', '/blog'], ['#'.$tag]] : [['Blog']]" :title="$tag ? 'Articles tagged “'.$tag.'”' : 'Guides for moving around the UAE'"
    sub="Practical notes on airport transfers, choosing the right vehicle and renting by the day or month — written by our team.">
    @if ($tag)<div><a class="btn btn-ghost btn-sm" href="/blog">Show all articles</a></div>@endif
</x-page-head>
<section class="sec">
    <div class="wrap">
        @if ($cats->count() > 1)
            <div class="filters" id="blogFilters">
                <button class="fbtn on" type="button" data-cat="All">All</button>
                @foreach ($cats as $c)<button class="fbtn" type="button" data-cat="{{ $c }}">{{ $c }}</button>@endforeach
            </div>
        @endif
        <div class="grid g-3" id="blogGrid">
            @forelse ($posts as $i => $p)
                @include('site.partials.post-card', ['p' => $p, 'i' => $i])
            @empty
                <div class="empty" style="grid-column:1/-1"><h3>No articles yet</h3><p>New guides will appear here soon.</p></div>
            @endforelse
        </div>
    </div>
</section>
@endsection
