@php $g = $s['general']; @endphp
@if ($g['logo'])
    <a class="brand-logo" href="/" aria-label="{{ $g['siteName'] }}, home" style="--logo-h:{{ (int) $g['logoHeight'] ?: 42 }}px">
        <img src="{{ $g['logo'] }}" alt="{{ $g['siteName'] }}">
        @if ($g['showWordmarkWithLogo'])
            <span class="brand"><strong>{{ $g['brandFirst'] }}<em>{{ $g['brandSecond'] }}</em></strong>@if ($g['tagline'])<small>{{ $g['tagline'] }}</small>@endif</span>
        @endif
    </a>
@else
    <a class="brand" href="/" aria-label="{{ $g['siteName'] }}, home"><strong>{{ $g['brandFirst'] }}<em>{{ $g['brandSecond'] }}</em></strong>@if ($g['tagline'])<small>{{ $g['tagline'] }}</small>@endif</a>
@endif
