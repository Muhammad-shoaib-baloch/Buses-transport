@php
    /** @var \App\Admin\Resource $res */
    $res = $m['res'];
    $rows = $m['rows'];
    $editing = $m['editing'];
    $base = '/admin/'.$m['section'];
    $filters = $res->filters();
@endphp
<div class="card" data-manager>
    <div class="card-head">
        <h2>{{ $res->title }}</h2>
        @if ($filters)
            <div class="dfilters">
                <button class="dfilter on" type="button" data-filter="all">All<span class="n">{{ $rows->count() }}</span></button>
                @foreach ($filters as [$fk, $fl, $test])
                    <button class="dfilter" type="button" data-filter="{{ $fk }}">{{ $fl }}<span class="n">{{ $rows->filter($test)->count() }}</span></button>
                @endforeach
            </div>
        @endif
        <span class="top-spacer"></span>
        <div class="search">{!! ic('i-search') !!}<input type="search" placeholder="Search" data-search aria-label="Search {{ $res->title }}"></div>
        <a class="btn btn-primary btn-sm" href="{{ $base }}?new={{ $res->key }}">{!! ic('i-plus') !!} {{ $res->newLabel ?? 'New '.strtolower($res->entity) }}</a>
    </div>
    @if ($res->hint)<div style="padding:10px 18px 0" class="muted">{{ $res->hint }}</div>@endif
    @if ($rows->isEmpty())
        <div style="padding:18px"><div class="empty"><h3>Nothing here yet</h3><p>Add your first {{ strtolower($res->entity) }}.</p></div></div>
    @else
        <div class="tbl-scroll">
            <table>
                <thead><tr>@foreach ($res->columns() as $col)<th>{{ $col[0] }}</th>@endforeach<th></th></tr></thead>
                <tbody>
                    @foreach ($rows as $row)
                        @php
                            $editUrl = $base.'?edit='.$res->key.':'.$row->id;
                            $keys = implode(' ', array_map(fn ($f) => $f[0], array_filter($filters, fn ($f) => ($f[2])($row))));
                        @endphp
                        <tr class="clickable" data-href="{{ $editUrl }}" data-text="{{ mb_strtolower($res->searchText($row) ?: $res->label($row)) }}" data-filters="{{ $keys }}">
                            @foreach ($res->columns() as $col)<td @isset($col[2]) class="{{ $col[2] }}" @endisset>{!! ($col[1])($row) !!}</td>@endforeach
                            <td>
                                <div class="row-acts">
                                    @if ($url = $res->viewUrl($row))<a class="ibtn" href="{{ $url }}" target="_blank" rel="noopener" title="View on site" aria-label="View on site">{!! ic('i-eye') !!}</a>@endif
                                    <a class="ibtn" href="{{ $editUrl }}" title="Edit" aria-label="Edit">{!! ic('i-edit') !!}</a>
                                    <form method="post" action="/admin/r/{{ $res->key }}/{{ $row->id }}" data-confirm="Delete “{{ $res->label($row) }}”? This cannot be undone.">
                                        @csrf @method('DELETE')
                                        <button class="ibtn danger" type="submit" title="Delete" aria-label="Delete">{!! ic('i-trash') !!}</button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        <div style="padding:18px" class="js-noresults" hidden><div class="empty"><h3>Nothing matches</h3><p>Try a different search or filter.</p></div></div>
    @endif
</div>

@if ($editing)
    @php $row = $editing['row']; $isNew = ! $row; @endphp
    <a class="dash-scrim" href="{{ $base }}" aria-label="Close editor"></a>
    <aside class="editor{{ $res->wide ? ' wide' : '' }}" role="dialog" aria-label="{{ $isNew ? 'New' : 'Edit' }} {{ strtolower($res->entity) }}" data-editor data-close="{{ $base }}">
        <form method="post" action="/admin/r/{{ $res->key }}{{ $row ? '/'.$row->id : '' }}" style="display:contents" data-dirty-check>
            @csrf
            @if ($row) @method('PUT') @endif
            <div class="editor-head">
                <div style="flex:1"><h2>{{ $isNew ? 'New' : 'Edit' }} {{ strtolower($res->entity) }}</h2>
                    <div class="sub">{{ $isNew ? 'Fill in the details and save.' : 'Changes go live on the website as soon as you save.' }}</div></div>
                <a class="icon-btn" href="{{ $base }}" aria-label="Close editor">{!! ic('i-close') !!}</a>
            </div>
            <div class="editor-body">
                @if (session('error'))<p class="form-msg err" style="background:var(--crit-bg);padding:10px 12px;border-radius:8px">{{ session('error') }}</p>@endif
                @include('admin.partials.fields', ['fields' => $editing['fields'], 'values' => $editing['values'], 'isNew' => $isNew])
            </div>
            <div class="editor-foot">
                @if ($row && ($url = $res->viewUrl($row)))<a class="btn btn-ghost btn-sm" href="{{ $url }}" target="_blank" rel="noopener">{!! ic('i-eye') !!} View</a>@endif
                <span class="grow"></span>
                <a class="btn btn-ghost btn-sm" href="{{ $base }}">Cancel</a>
                <button class="btn btn-primary btn-sm" type="submit">Save {!! ic('i-check') !!}</button>
            </div>
        </form>
    </aside>
@endif
