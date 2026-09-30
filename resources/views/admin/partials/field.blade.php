@php
    /** @var array $f  field definition   @var mixed $v  current value */
    $type = $f['type'];
    $k = $f['k'];
    $parts = explode('.', $k);
    $name = array_shift($parts).implode('', array_map(fn ($p) => '['.$p.']', $parts));
    $id = 'f-'.preg_replace('/[^a-z0-9]+/i', '-', $k).'-'.($uid ?? 'x');
    $wide = ! empty($f['full']) || in_array($type, ['textarea', 'code', 'markdown', 'images', 'multi', 'icon', 'strings', 'steps', 'kv', 'features', 'stats', 'image'], true);
    $help = $f['help'] ?? null;
    $truthy = fn ($x) => $x === true || $x === 1 || $x === '1' || $x === 'on';
    $listCols = [
        'steps' => [['t', 'Title', 'text'], ['b', 'Description', 'textarea']],
        'kv' => [['label', 'Label', 'text'], ['value', 'Value', 'text']],
        'features' => [['title', 'Title', 'text'], ['body', 'Description', 'textarea'], ['icon', 'Icon', 'icon']],
        'stats' => [['n', 'Number', 'number'], ['suffix', 'Suffix (e.g. /7, %)', 'text'], ['dec', 'Decimals', 'number'], ['label', 'Label', 'text'], ['sub', 'Small caption', 'text']],
    ];
    $iconPicker = function (string $inputName, string $current) {
        $h = '<div class="icon-pick" data-icon-pick><input type="hidden" name="'.e($inputName).'" value="'.e($current).'">';
        foreach (icon_choices() as $n) {
            $h .= '<button type="button" class="'.($current === $n ? 'on' : '').'" data-icon="'.$n.'" title="'.e(str_replace('i-', '', $n)).'">'.ic($n).'</button>';
        }

        return $h.'</div>';
    };
@endphp
<div class="fld{{ $wide ? ' fld-full' : '' }}">
    <label class="lbl" for="{{ $id }}">{{ $f['label'] }}@if ($help && $type !== 'toggle')<span class="help">{{ $help }}</span>@endif</label>

    @switch($type)
        @case('textarea')
        @case('code')
            <textarea id="{{ $id }}" name="{{ $name }}" @if ($type === 'code') class="code" @endif>{{ is_array($v) ? implode("\n", $v) : $v }}</textarea>
            @break

        @case('markdown')
            <div class="md-field">
                <div class="row" style="margin-bottom:6px">
                    <span class="help" style="font-size:11px;color:var(--muted)">## heading · **bold** · *italic* · - list · 1. list · &gt; quote · [link](url) · ![image](url) · | table |</span>
                    <span class="md-tabs"><button type="button" class="on" data-md="write">Write</button><button type="button" data-md="preview">Preview</button></span>
                </div>
                <textarea id="{{ $id }}" class="tall" name="{{ $name }}">{{ $v }}</textarea>
                <div class="md-preview prose" hidden></div>
            </div>
            @break

        @case('select')
            <select id="{{ $id }}" name="{{ $name }}">
                @foreach ($f['options'] as [$ov, $ol])
                    <option value="{{ $ov }}" @selected((string) $ov === (string) $v)>{{ $ol }}</option>
                @endforeach
            </select>
            @break

        @case('toggle')
            <input type="hidden" name="{{ $name }}" value="0">
            <label class="toggle"><input id="{{ $id }}" type="checkbox" name="{{ $name }}" value="1" @checked($truthy($v))><span class="tk"></span>{{ $help ?: 'On' }}</label>
            @break

        @case('image')
            <div class="imgf" data-image-field>
                <span class="imgf-prev">@if ($v)<img src="{{ $v }}" alt="">@else{!! ic('i-image') !!}@endif</span>
                <div class="imgf-side">
                    <input id="{{ $id }}" name="{{ $name }}" value="{{ $v }}" placeholder="/uploads/… or https://…" data-image-input>
                    <div class="row">
                        <button class="btn btn-ghost btn-sm" type="button" data-upload>{!! ic('i-upload') !!} Upload</button>
                        <button class="btn btn-ghost btn-sm" type="button" data-library>{!! ic('i-image') !!} Library</button>
                        <button class="btn btn-ghost btn-sm" type="button" data-clear>Remove</button>
                    </div>
                    <span class="form-msg err" hidden></span>
                    <input type="file" hidden accept="image/*" data-file>
                </div>
            </div>
            @break

        @case('images')
            <div data-images-field data-name="{{ $name }}[]">
                <div class="imgs-grid">
                    @foreach ((array) $v as $u)
                        <div class="imgs-item"><img src="{{ $u }}" alt=""><input type="hidden" name="{{ $name }}[]" value="{{ $u }}">
                            <div class="imgs-acts"><button type="button" data-move="-1" title="Move left">{!! ic('i-chev', 'rot90') !!}</button><button type="button" data-move="1" title="Move right">{!! ic('i-chev', 'rot-90') !!}</button><button type="button" data-remove title="Remove">{!! ic('i-trash') !!}</button></div>
                        </div>
                    @endforeach
                    <button class="imgs-add" type="button" data-upload>{!! ic('i-upload') !!}<span>Upload photos</span></button>
                    <button class="imgs-add" type="button" data-library>{!! ic('i-image') !!}<span>From library</span></button>
                </div>
                <p class="form-msg err" hidden style="margin-top:8px"></p>
                <input type="file" hidden multiple accept="image/*" data-file>
            </div>
            @break

        @case('multi')
            @php $sel = array_map('strval', (array) $v); @endphp
            <div class="msel">
                @foreach ($f['options'] as [$ov, $ol])
                    @php $on = in_array((string) $ov, $sel, true); @endphp
                    <label class="{{ $on ? 'on' : '' }}"><input type="checkbox" name="{{ $name }}[]" value="{{ $ov }}" @checked($on)> {{ $ol }}</label>
                @endforeach
            </div>
            @break

        @case('icon')
            {!! $iconPicker($name, (string) $v) !!}
            @break

        @case('color')
            <div class="color-row" data-color>
                <input type="color" value="{{ preg_match('/^#[0-9a-f]{6}$/i', (string) $v) ? $v : '#000000' }}">
                <input id="{{ $id }}" name="{{ $name }}" value="{{ $v }}" placeholder="#B32C1C">
            </div>
            @break

        @case('slug')
            <input id="{{ $id }}" name="{{ $name }}" value="{{ $v }}" placeholder="auto-generated from the name" data-slug-from="{{ $f['from'] }}" @if (! empty($isNew) && ! $v) data-slug-auto @endif>
            @break

        @case('strings')
            <textarea id="{{ $id }}" name="{{ $name }}" placeholder="One per line">{{ implode("\n", (array) $v) }}</textarea>
            @break

        @case('steps')
        @case('kv')
        @case('features')
        @case('stats')
            @php $cols = $listCols[$type]; $rows = array_values((array) $v); @endphp
            <div class="le" data-list data-name="{{ $name }}">
                <div class="le-rows">
                    @foreach ($rows as $ri => $row)
                        @include('admin.partials.list-row', ['cols' => $cols, 'name' => $name, 'i' => $ri, 'row' => (array) $row, 'iconPicker' => $iconPicker])
                    @endforeach
                </div>
                <template>@include('admin.partials.list-row', ['cols' => $cols, 'name' => $name, 'i' => '__i__', 'row' => [], 'iconPicker' => $iconPicker])</template>
                <button class="btn btn-ghost btn-sm le-add" type="button" data-add>{!! ic('i-plus') !!} Add {{ ['steps' => 'step', 'kv' => 'row', 'features' => 'item', 'stats' => 'stat'][$type] }}</button>
            </div>
            @break

        @default
            <input id="{{ $id }}" name="{{ $name }}" type="{{ $type === 'datetime' ? 'datetime-local' : $type }}" value="{{ $type === 'password' ? '' : $v }}" @if ($type === 'number') step="any" @endif @if ($type === 'password') autocomplete="new-password" @endif>
    @endswitch
</div>
