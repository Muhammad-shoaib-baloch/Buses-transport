@extends('layouts.admin')
@section('title', 'Quote requests')

@section('content')
@php
    $statuses = \App\Models\QuoteRequest::STATUSES;
    $reply = fn ($x) => 'Hello '.explode(' ', $x->name)[0].', thank you for your request '.$x->ref.' with '.$siteName.($x->service ? ' for '.$x->service : '').($x->date ? ' on '.$x->date : '').'. ';
@endphp
<x-admin.topbar title="Quote requests" sub="Every request sent from the website’s quote and contact forms" />
<div class="body">
    <div class="card" data-manager>
        <div class="card-head">
            <h2>Requests</h2>
            <div class="dfilters">
                <button class="dfilter on" type="button" data-filter="all">All<span class="n">{{ $counts['all'] }}</span></button>
                @foreach ($statuses as $st)
                    <button class="dfilter" type="button" data-filter="{{ $st }}">{{ ucfirst($st) }}<span class="n">{{ $counts[$st] }}</span></button>
                @endforeach
            </div>
            <span class="top-spacer"></span>
            <div class="search">{!! ic('i-search') !!}<input type="search" placeholder="Search name, phone, ref…" data-search aria-label="Search requests"></div>
            <a class="btn btn-ghost btn-sm" href="/admin/quotes/export" data-export>{!! ic('i-download') !!} Export CSV</a>
        </div>
        @if ($quotes->isEmpty())
            <div class="card-body"><div class="empty"><h3>No quote requests yet</h3><p>Requests from the website’s forms will appear here instantly.</p></div></div>
        @else
            <div class="tbl-scroll"><table>
                <thead><tr><th>Reference</th><th>Customer</th><th>Trip</th><th>Travel date</th><th>Received</th><th>Status</th><th></th></tr></thead>
                <tbody>
                    @foreach ($quotes as $x)
                        <tr class="clickable" data-href="/admin/quotes?open={{ $x->id }}" data-filters="{{ $x->status }}"
                            data-text="{{ mb_strtolower($x->ref.' '.$x->name.' '.$x->phone.' '.$x->email.' '.$x->service.' '.$x->vehicle.' '.$x->pickup.' '.$x->dropoff) }}">
                            <td class="num"><span class="strip {{ $x->status === 'new' ? 'hot' : ($x->status === 'confirmed' ? 'ok' : 'soon') }}">{{ $x->ref }}</span></td>
                            <td><b style="font-weight:600">{{ $x->name }}</b><div class="muted mono" style="font-size:11px">{{ $x->phone }}</div></td>
                            <td style="min-width:220px">{{ $x->service ?: ($x->vehicle ?: '—') }}
                                @if ($x->pickup || $x->dropoff)<div class="muted" style="font-size:12px">{{ $x->pickup ?: '?' }} → {{ $x->dropoff ?: '?' }}</div>@endif</td>
                            <td class="num">{{ trim($x->date.' '.$x->time) ?: '—' }}</td>
                            <td class="num">{{ datetime_fmt($x->created_at) }}</td>
                            <td>
                                <form method="post" action="/admin/quotes/{{ $x->id }}">@csrf
                                    <select class="stat-select" name="status" data-autosubmit aria-label="Status of {{ $x->ref }}">
                                        @foreach ($statuses as $st)<option value="{{ $st }}" @selected($x->status === $st)>{{ ucfirst($st) }}</option>@endforeach
                                    </select>
                                </form>
                            </td>
                            <td><div class="row-acts">
                                <a class="ibtn" href="{{ wa_href($x->phone, $reply($x)) }}" target="_blank" rel="noopener" title="Reply on WhatsApp" aria-label="Reply on WhatsApp">{!! ic('i-whats') !!}</a>
                                <a class="ibtn" href="{{ tel_href($x->phone) }}" title="Call" aria-label="Call">{!! ic('i-phone') !!}</a>
                                <a class="ibtn" href="/admin/quotes?open={{ $x->id }}" title="Open" aria-label="Open">{!! ic('i-eye') !!}</a>
                            </div></td>
                        </tr>
                    @endforeach
                </tbody>
            </table></div>
            <div style="padding:18px" class="js-noresults" hidden><div class="empty"><h3>Nothing matches</h3><p>Try another filter or search.</p></div></div>
        @endif
    </div>
</div>

@if ($open)
    <a class="dash-scrim" href="/admin/quotes" aria-label="Close"></a>
    <aside class="editor" role="dialog" aria-label="Quote request {{ $open->ref }}" data-editor data-close="/admin/quotes">
        <div class="editor-head">
            <div style="flex:1"><h2>{{ $open->ref }} · {{ $open->name }}</h2>
                <div class="sub">Received {{ datetime_fmt($open->created_at) }} · from {{ $open->source ?: 'website' }}{{ $open->page_url ? ' ('.$open->page_url.')' : '' }}</div></div>
            <a class="icon-btn" href="/admin/quotes" aria-label="Close">{!! ic('i-close') !!}</a>
        </div>
        <div class="editor-body">
            <div class="row">
                <span class="pill {{ $open->status }}">{{ ucfirst($open->status) }}</span>
                <form method="post" action="/admin/quotes/{{ $open->id }}">@csrf<input type="hidden" name="stay" value="1">
                    <select class="stat-select" name="status" data-autosubmit>
                        @foreach ($statuses as $st)<option value="{{ $st }}" @selected($open->status === $st)>Mark as {{ $st }}</option>@endforeach
                    </select>
                </form>
            </div>
            <div class="row">
                <a class="btn btn-whats btn-sm" href="{{ wa_href($open->phone, $reply($open)) }}" target="_blank" rel="noopener">{!! ic('i-whats') !!} Reply on WhatsApp</a>
                <a class="btn btn-ghost btn-sm" href="{{ tel_href($open->phone) }}">{!! ic('i-phone') !!} Call {{ $open->phone }}</a>
                @if ($open->email)<a class="btn btn-ghost btn-sm" href="mailto:{{ $open->email }}?subject={{ rawurlencode('Your quote request '.$open->ref) }}">{!! ic('i-mail') !!} Email</a>@endif
            </div>
            <div class="card" style="padding:18px">
                <dl class="kvs">
                    @foreach ($open->lines(false) as [$k, $v])
                        @if ($k !== 'Details')<div style="display:contents"><dt>{{ $k }}</dt><dd>{{ $v }}</dd></div>@endif
                    @endforeach
                </dl>
                @if ($open->message)
                    <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:.1em;margin:16px 0 6px;font-weight:600">Details from the customer</div>
                    <div style="white-space:pre-wrap;font-size:var(--t-sm);background:var(--surface-2);padding:12px;border-radius:8px">{{ $open->message }}</div>
                @endif
            </div>
            <form method="post" action="/admin/quotes/{{ $open->id }}" class="aform" id="notesForm">@csrf<input type="hidden" name="stay" value="1">
                <div class="fld fld-full">
                    <label class="lbl" for="qnotes">Internal notes <span class="help">only visible in the dashboard</span></label>
                    <textarea id="qnotes" name="notes" placeholder="Price quoted, driver assigned, follow-up date…">{{ $open->notes }}</textarea>
                </div>
            </form>
        </div>
        <div class="editor-foot">
            <form method="post" action="/admin/quotes/{{ $open->id }}" data-confirm="Delete quote request {{ $open->ref }}? This cannot be undone.">@csrf @method('DELETE')
                <button class="btn btn-ghost btn-sm" type="submit">{!! ic('i-trash') !!} Delete</button>
            </form>
            <span class="grow"></span>
            <a class="btn btn-ghost btn-sm" href="/admin/quotes">Close</a>
            <button class="btn btn-primary btn-sm" type="submit" form="notesForm">Save notes {!! ic('i-check') !!}</button>
        </div>
    </aside>
@endif
@endsection
