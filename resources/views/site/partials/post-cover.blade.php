@if ($p->cover_image)
    <img src="{{ $p->cover_image }}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover">
@else
    <span style="display:contents">{!! \App\Support\Art::cover('p-'.$p->slug, $p->theme) !!}</span>
@endif
