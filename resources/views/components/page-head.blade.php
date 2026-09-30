@props(['crumbs' => [], 'title', 'sub' => null, 'titleStyle' => null])
<div class="phead">
    <div class="wrap phead-in">
        <nav class="crumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            @foreach ($crumbs as $cr)
                / @if (! empty($cr[1]))<a href="{{ $cr[1] }}">{{ $cr[0] }}</a>@else<span>{{ $cr[0] }}</span>@endif
            @endforeach
        </nav>
        <h1 @if ($titleStyle) style="{{ $titleStyle }}" @endif>{{ $title }}</h1>
        @if ($sub)<p>{{ $sub }}</p>@endif
        {{ $slot }}
    </div>
</div>
