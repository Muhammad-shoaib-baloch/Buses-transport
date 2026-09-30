@php
    $either = $v->selfDrive();
    $phone = $s['contact']['phones'][0] ?? '';
    $wa = $s['contact']['whatsapp'];
@endphp
<article class="fcard reveal" data-d="{{ ($i ?? 0) % 4 }}" id="v-{{ $v->slug }}" data-cat="{{ $v->category->slug ?? '' }}" data-self="{{ $either ? 1 : 0 }}">
    <a class="fcard-art" href="/fleet/{{ $v->slug }}" aria-label="{{ $v->name }}" style="display:block">
        <span class="fcard-seats">{{ $v->seats_label }}</span>
        @include('site.partials.vehicle-media', ['v' => $v])
        <span class="fcard-cat">{{ $v->class_label }}</span>
    </a>
    <div class="fcard-body">
        <h3><a href="/fleet/{{ $v->slug }}">{{ $v->name }}</a></h3>
        <span class="drv {{ $either ? 'either' : 'only' }}">{!! ic($either ? 'i-wheel' : 'i-shield') !!}{{ $either ? 'With or without driver' : 'Chauffeur-driven only' }}</span>
        <p class="fcard-desc">{{ $v->description }}</p>
        @if ($v->tagList())
            <div class="tag-row">@foreach ($v->tagList() as $t)<span class="tag">{{ $t }}</span>@endforeach</div>
        @endif
        @if ($v->luggage || $v->best_for)
            <div class="fcard-meta">
                @if ($v->luggage)<span>{!! ic('i-bag') !!}{{ $v->luggage }}</span>@endif
                @if ($v->best_for)<span>{!! ic('i-seat') !!}{{ $v->best_for }}</span>@endif
            </div>
        @endif
        <div class="fcard-acts">
            <a class="btn btn-ghost" href="{{ tel_href($phone) }}">{!! ic('i-phone') !!}Call Now</a>
            <a class="btn btn-whats" href="{{ wa_href($wa, 'Hello, I would like a quote for the '.$v->name.'.') }}" target="_blank" rel="noopener">{!! ic('i-whats') !!}WhatsApp</a>
            <a class="btn btn-primary" href="/contact?vehicle={{ $v->slug }}">Get a Quote {!! ic('i-arrow') !!}</a>
        </div>
    </div>
</article>
