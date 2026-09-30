<article class="post-card reveal" data-d="{{ ($i ?? 0) % 4 }}" data-cat="{{ $p->category }}">
    <a class="post-art" href="/blog/{{ $p->slug }}" aria-label="{{ $p->title }}">
        <span class="post-cat">{{ $p->category }}</span>
        @include('site.partials.post-cover', ['p' => $p])
    </a>
    <div class="post-body">
        <div class="post-meta"><span>{{ date_fmt($p->published_at) }}</span><i></i><span>{{ $p->read_minutes }} min read</span></div>
        <h3><a href="/blog/{{ $p->slug }}">{{ $p->title }}</a></h3>
        <p>{{ $p->excerpt }}</p>
        <a class="post-foot" href="/blog/{{ $p->slug }}">Read article {!! ic('i-arrow') !!}</a>
    </div>
</article>
