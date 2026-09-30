<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>Sign in · Admin</title>
    <link rel="icon" href="{{ site('general.favicon') ?: '/favicon.svg' }}">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
    <link rel="stylesheet" href="{{ asset_v('assets/css/site.css') }}">
    <link rel="stylesheet" href="{{ asset_v('assets/css/admin-extra.css') }}">
</head>
<body>
@include('partials.sprite')
<div class="login">
    <div class="login-card">
        <div class="brand"><strong>{{ site('general.brandFirst') }}<em>{{ site('general.brandSecond') }}</em></strong><small>Admin dashboard</small></div>
        <h1>Sign in</h1>
        <p class="sub">Manage bookings, fleet, content and site settings.</p>
        <form method="post" action="/admin/login">
            @csrf
            <div class="fld"><label for="email">Email</label><input id="email" name="email" type="email" value="{{ old('email') }}" autocomplete="username" required autofocus></div>
            <div class="fld"><label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required></div>
            @if (session('error'))<p class="form-err">{{ session('error') }}</p>@endif
            <button class="btn btn-primary btn-block" type="submit">Sign in {!! ic('i-arrow') !!}</button>
        </form>
    </div>
</div>
</body>
</html>
