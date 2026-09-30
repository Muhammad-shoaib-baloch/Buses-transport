@php
    $items = [];
    foreach ($routes as $r) {
        $items[] = ['i-route', $r->from.' → '.$r->to, implode(' · ', array_filter([$r->km ? $r->km.' km' : '', $r->mins ? mins($r->mins) : '']))];
    }
    foreach ($extras as $e) {
        $parts = explode('|', $e, 2);
        $items[] = ['i-check', trim($parts[0] ?? ''), trim($parts[1] ?? '')];
    }
@endphp
@if ($items)
    <div class="ticker" aria-hidden="true">
        <div class="ticker-track">
            @for ($k = 0; $k < 2; $k++)
                @foreach ($items as [$icon, $text, $bold])
                    <span class="tk">{!! ic($icon) !!} {{ $text }} @if ($bold)<b>{{ $bold }}</b>@endif</span>
                @endforeach
            @endfor
        </div>
    </div>
@endif
