@props(['title', 'sub' => null])
<div class="topbar">
    <div>
        <h1>{{ $title }}</h1>
        @if ($sub)<div class="sub">{{ $sub }}</div>@endif
    </div>
    <span class="top-spacer"></span>
    {{ $slot }}
</div>
