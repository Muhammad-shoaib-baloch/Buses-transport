@if ($v->cover())
    <img src="{{ $v->cover() }}" alt="{{ $v->altText() }}" loading="{{ ($eager ?? false) ? 'eager' : 'lazy' }}" width="1000" height="750">
@else
    <span class="vart">{!! \App\Support\Art::vehicle($v->slug, (int) $v->capacity, $v->name) !!}</span>
@endif
