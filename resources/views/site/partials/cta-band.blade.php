@php
    $c = $s['contact'];
    $phone = $c['phones'][0] ?? '';
    $img = $image ?? $s['home']['ctaImage'];
@endphp
<section class="band">
    @if ($img)<img src="{{ $img }}" alt="" aria-hidden="true" width="1600" height="685" loading="lazy">@endif
    <div class="wrap band-in">
        <div>
            <h2>{{ $title ?? $s['home']['ctaTitle'] }}</h2>
            <p>{{ $sub ?? $s['home']['ctaSub'] }}</p>
        </div>
        <div class="band-acts">
            <a class="btn btn-primary btn-lg" href="/contact">Get a free quote {!! ic('i-arrow') !!}</a>
            @if ($c['whatsapp'])<a class="btn btn-onnight btn-lg" href="{{ wa_href($c['whatsapp'], $c['whatsappMessage']) }}" target="_blank" rel="noopener">{!! ic('i-whats') !!} WhatsApp us</a>@endif
            @if ($phone)<a class="btn btn-onnight btn-lg" href="{{ tel_href($phone) }}">{!! ic('i-phone') !!} Call now</a>@endif
        </div>
    </div>
</section>
