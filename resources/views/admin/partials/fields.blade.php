{{-- Renders a field schema. $fields, $values, $isNew --}}
<div class="aform">
    @foreach ($fields as $idx => $f)
        @if ($f['type'] === 'section')
            <div class="f-section"><h3>{{ $f['title'] }}</h3>@if (! empty($f['desc']))<p>{{ $f['desc'] }}</p>@endif</div>
        @else
            @include('admin.partials.field', ['f' => $f, 'v' => data_get($values, $f['k'], ''), 'isNew' => $isNew ?? false, 'uid' => $idx])
        @endif
    @endforeach
</div>
