@props(['eyebrow' => null, 'title', 'sub' => null])
<div class="sec-head">
    <div class="sec-head-txt">
        @if ($eyebrow)<span class="eyebrow">{{ $eyebrow }}</span>@endif
        <h2>{{ $title }}</h2>
        @if ($sub)<p>{{ $sub }}</p>@endif
    </div>
    {{ $slot }}
</div>
