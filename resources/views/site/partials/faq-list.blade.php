<div class="faq-list">
    @foreach ($faqs as $i => $f)
        <details class="faq-item reveal" data-d="{{ $i % 4 }}" @if ($i === 0) open @endif>
            <summary>{{ $f->question }}{!! ic('i-chev') !!}</summary>
            <div class="faq-a">{{ $f->answer }}</div>
        </details>
    @endforeach
</div>
