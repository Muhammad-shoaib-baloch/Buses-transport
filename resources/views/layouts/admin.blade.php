@php
    $path = '/'.ltrim(request()->path(), '/');
    $groups = [
        'Workspace' => [
            ['/admin', 'Overview', 'i-grid', null, null],
            ['/admin/quotes', 'Quote requests', 'i-inbox', $counts['newQuotes'], null],
        ],
        'Content' => [
            ['/admin/services', 'Services', 'i-route', null, $counts['services']],
            ['/admin/fleet', 'Fleet', 'i-wheel', null, $counts['vehicles']],
            ['/admin/posts', 'Blog posts', 'i-doc', null, $counts['posts']],
            ['/admin/pages', 'Pages', 'i-layers', null, $counts['pages']],
            ['/admin/faqs', 'FAQs', 'i-help', null, $counts['faqs']],
            ['/admin/testimonials', 'Testimonials', 'i-quote', null, $counts['testimonials']],
            ['/admin/coverage', 'Coverage & routes', 'i-map', null, null],
            ['/admin/media', 'Media library', 'i-image', null, $counts['media']],
        ],
        'Configuration' => array_values(array_filter([
            $me->isAdmin() ? ['/admin/settings', 'Site settings', 'i-settings', null, null] : null,
            $me->isAdmin() ? ['/admin/users', 'Users', 'i-users', null, null] : null,
            ['/admin/account', 'My account', 'i-user', null, null],
        ])),
    ];
    $active = fn ($href) => $href === '/admin' ? $path === '/admin' : str_starts_with($path, $href);
@endphp
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Dashboard') · Admin</title>
    <link rel="icon" href="{{ site('general.favicon') ?: '/favicon.svg' }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
    <link rel="stylesheet" href="{{ asset_v('assets/css/site.css') }}">
    <link rel="stylesheet" href="{{ asset_v('assets/css/admin.css') }}">
    <link rel="stylesheet" href="{{ asset_v('assets/css/admin-extra.css') }}">
</head>
<body>
@include('partials.sprite')
<div class="dash">
    <aside class="side">
        <div class="side-brand"><span><b>{{ $brand['first'] }}<em>{{ $brand['second'] }}</em></b><span>Admin dashboard</span></span></div>
        <nav class="side-nav" aria-label="Dashboard">
            @foreach ($groups as $label => $items)
                <span class="side-lbl">{{ $label }}</span>
                @foreach ($items as [$href, $text, $icon, $badge, $count])
                    <a class="snav{{ $active($href) ? ' on' : '' }}" href="{{ $href }}">{!! ic($icon) !!} {{ $text }}
                        @if ($badge)<span class="snav-badge">{{ $badge }}</span>@elseif ($count)<span class="snav-count">{{ $count }}</span>@endif
                    </a>
                @endforeach
            @endforeach
            <span class="side-lbl">Public site</span>
            <a class="snav" href="/" target="_blank" rel="noopener">{!! ic('i-globe') !!} View website</a>
        </nav>
        <div class="side-foot">
            <div class="side-user">
                <span class="av">{{ initials($me->name) }}</span>
                <span style="min-width:0"><b>{{ $me->name }}</b><span>{{ $me->isAdmin() ? 'Administrator' : 'Editor' }}</span></span>
                <form action="/admin/logout" method="post" style="margin-left:auto">@csrf<button type="submit" title="Sign out" aria-label="Sign out">{!! ic('i-logout') !!}</button></form>
            </div>
        </div>
    </aside>
    <div class="main">
        @yield('content')
    </div>
</div>
<div class="toast{{ session('status') ? ' show' : '' }}" id="toast" role="status" aria-live="polite">{!! ic('i-check') !!}<span>{{ session('status') }}</span></div>
@if (session('error') && ! request()->query('edit') && ! request()->query('new'))
    <div class="toast show err-toast" role="alert" style="background:var(--crit)">{!! ic('i-close') !!}<span>{{ session('error') }}</span></div>
@endif
<script src="{{ asset_v('assets/js/admin.js') }}" defer></script>
</body>
</html>
