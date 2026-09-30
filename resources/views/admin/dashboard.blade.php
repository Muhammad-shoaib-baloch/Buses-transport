@extends('layouts.admin')
@section('title', 'Overview')

@use('App\Support\Charts')
@section('content')
@php
    $a = array_column($months, 'a');
    $done = count(array_filter($checks, fn ($c) => $c[0]));
    $totalViews = $posts->sum('views');
@endphp
<x-admin.topbar title="Overview" :sub="'Welcome back — here’s what’s happening on '.$s['general']['siteName']">
    <a class="btn btn-accent btn-sm" href="/admin/quotes">{!! ic('i-inbox') !!} Quote requests</a>
</x-admin.topbar>
<div class="body">
    <div class="tiles">
        {!! Charts::tile('New quote requests', num($newCount), 'i-inbox', $newCount ? 'waiting for a reply' : 'all caught up', $newCount ? 'up' : 'flat', $a) !!}
        {!! Charts::tile('Requests this month', num($monthCount), 'i-calendar', $months[5]['b'].' confirmed', 'flat', $a, true) !!}
        {!! Charts::tile('Blog article views', num($totalViews), 'i-eye', $posts->count().' published articles', 'flat', $posts->pluck('views')->reverse()->values()->all()) !!}
        {!! Charts::tile('Live on the site', $vehicleCount.' / '.$serviceCount, 'i-wheel', 'vehicles / services', 'flat', $cats->pluck('vehicles_count')->all(), true) !!}
    </div>

    <div class="cols">
        <div class="card">
            <div class="card-head"><h2>Quote requests</h2><span class="hint">Last 6 months</span></div>
            <div class="card-body">
                <div class="chart-wrap">{!! Charts::pair($months, ['Requests', 'Confirmed'], 'Quote requests and confirmed bookings per month, last six months') !!}</div>
                <div class="chart-legend"><span><i style="background:var(--c1)"></i>Requests received</span><span><i style="background:var(--c2)"></i>Marked confirmed</span></div>
            </div>
        </div>
        <div class="card">
            <div class="card-head"><h2>Launch checklist</h2><span class="hint">{{ $done }} of {{ count($checks) }} done</span></div>
            <div class="card-body"><div class="feed">
                @foreach ($checks as [$ok, $label, $href])
                    <a class="fitem" href="{{ $href }}">
                        <span class="fdot" @if ($ok) style="background:var(--ok-bg);color:var(--ok)" @endif>{!! ic($ok ? 'i-check' : 'i-plus') !!}</span>
                        <div><p @if ($ok) style="color:var(--muted);text-decoration:line-through" @endif>{{ $label }}</p></div>
                    </a>
                @endforeach
            </div></div>
        </div>
    </div>

    <div class="cols">
        <div class="card">
            <div class="card-head"><h2>Latest quote requests</h2><span class="top-spacer"></span><a class="btn btn-ghost btn-sm" href="/admin/quotes">View all {!! ic('i-arrow') !!}</a></div>
            @if ($latest->isEmpty())
                <div class="card-body"><div class="empty"><h3>No quote requests yet</h3><p>Requests from the website’s quote forms appear here instantly.</p></div></div>
            @else
                <div class="tbl-scroll"><table>
                    <thead><tr><th>Reference</th><th>Customer</th><th>Service</th><th>Received</th><th>Status</th></tr></thead>
                    <tbody>
                        @foreach ($latest as $q)
                            <tr>
                                <td class="num"><a href="/admin/quotes?open={{ $q->id }}" class="strip {{ $q->status === 'new' ? 'hot' : ($q->status === 'confirmed' ? 'ok' : 'soon') }}">{{ $q->ref }}</a></td>
                                <td>{{ $q->name }}<div class="muted mono" style="font-size:11px">{{ $q->phone }}</div></td>
                                <td>{{ $q->service ?: ($q->vehicle ?: '—') }}</td>
                                <td class="num">{{ rel_time($q->created_at) }}</td>
                                <td><span class="pill {{ $q->status }}">{{ ucfirst($q->status) }}</span></td>
                            </tr>
                        @endforeach
                    </tbody>
                </table></div>
            @endif
        </div>
        <div class="card">
            <div class="card-head"><h2>Recent activity</h2></div>
            <div class="card-body">
                @if ($activity->isEmpty())
                    <p class="muted">Changes you make in the dashboard will be listed here.</p>
                @else
                    <div class="feed">
                        @foreach ($activity as $act)
                            <div class="fitem"><span class="fdot">{!! ic($act->icon) !!}</span>
                                <div><p>{!! $act->text !!}</p><time>{{ rel_time($act->created_at) }}{{ $act->user_name ? ' · '.$act->user_name : '' }}</time></div></div>
                        @endforeach
                    </div>
                @endif
            </div>
        </div>
    </div>

    <div class="cols">
        <div class="card">
            <div class="card-head"><h2>Fleet by category</h2><span class="hint">{{ $vehicleCount }} active vehicles</span></div>
            <div class="card-body">{!! Charts::barList($cats->values()->map(fn ($c, $i) => ['name' => $c->name, 'value' => $c->vehicles_count, 'accent' => $i === 0])->all()) !!}</div>
        </div>
        <div class="card">
            <div class="card-head"><h2>Most read articles</h2><span class="hint">Lifetime views</span></div>
            <div class="card-body">
                @if ($posts->count())
                    {!! Charts::barList($posts->take(5)->values()->map(fn ($p, $i) => ['name' => $p->title, 'value' => $p->views, 'accent' => $i === 0])->all()) !!}
                @else
                    <p class="muted">No published articles yet.</p>
                @endif
            </div>
        </div>
    </div>
</div>
@endsection
