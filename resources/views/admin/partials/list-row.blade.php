@php $plain = count(array_filter($cols, fn ($c) => ! in_array($c[2], ['textarea', 'icon'], true))); @endphp
<div class="le-row">
    <div class="le-fields" style="--cols:{{ max(1, min($plain, 3)) }}">
        @foreach ($cols as [$ck, $ph, $ct])
            @php $n = $name.'['.$i.']['.$ck.']'; $val = $row[$ck] ?? ''; @endphp
            @if ($ct === 'textarea')
                <textarea style="grid-column:1/-1" name="{{ $n }}" placeholder="{{ $ph }}">{{ $val }}</textarea>
            @elseif ($ct === 'icon')
                <div style="grid-column:1/-1">{!! $iconPicker($n, (string) ($val ?: 'i-check')) !!}</div>
            @else
                <input type="{{ $ct === 'number' ? 'number' : 'text' }}" @if ($ct === 'number') step="any" @endif name="{{ $n }}" value="{{ $val }}" placeholder="{{ $ph }}">
            @endif
        @endforeach
    </div>
    <div class="le-acts">
        <button class="ibtn" type="button" data-up title="Move up">{!! ic('i-chev', 'rot180') !!}</button>
        <button class="ibtn" type="button" data-down title="Move down">{!! ic('i-chev') !!}</button>
        <button class="ibtn danger" type="button" data-del title="Remove">{!! ic('i-trash') !!}</button>
    </div>
</div>
