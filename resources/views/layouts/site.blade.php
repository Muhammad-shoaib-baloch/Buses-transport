@php
    $g = $s['general'];
    $seo = $s['seo'];
    $t = $s['tracking'];
    $gtm = preg_match('/^GTM-[A-Z0-9]+$/i', trim($t['gtmId'])) ? trim($t['gtmId']) : '';
    $ga = preg_match('/^G-[A-Z0-9]+$/i', trim($t['ga4Id'])) ? trim($t['ga4Id']) : '';
    $px = preg_match('/^\d{5,20}$/', trim($t['metaPixelId'])) ? trim($t['metaPixelId']) : '';
    $hex = fn ($v, $d) => preg_match('/^#[0-9a-f]{6}$/i', (string) $v) ? $v : $d;
    $th = $s['theme'];
    [$tl, $tm, $td, $ta] = [$hex($th['brandLight'], '#C9391F'), $hex($th['brand'], '#B32C1C'), $hex($th['brandDark'], '#9A2317'), $hex($th['accent'], '#3983D8')];
    $customTheme = [$tl, $tm, $td, $ta] !== ['#C9391F', '#B32C1C', '#9A2317', '#3983D8'];
@endphp
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $meta['title'] }}</title>
    <meta name="description" content="{{ $meta['description'] }}">
    @if ($meta['keywords'])<meta name="keywords" content="{{ $meta['keywords'] }}">@endif
    <link rel="canonical" href="{{ $meta['canonical'] }}">
    <meta name="robots" content="{{ $meta['noindex'] ? 'noindex, nofollow' : 'index, follow' }}">
    <meta property="og:type" content="{{ $meta['type'] }}">
    <meta property="og:site_name" content="{{ $g['siteName'] }}">
    <meta property="og:title" content="{{ $meta['shortTitle'] }}">
    <meta property="og:description" content="{{ $meta['description'] }}">
    <meta property="og:url" content="{{ $meta['canonical'] }}">
    <meta property="og:locale" content="en_AE">
    @if ($meta['ogImage'])<meta property="og:image" content="{{ $meta['ogImage'] }}">@endif
    @if ($meta['publishedTime'])<meta property="article:published_time" content="{{ $meta['publishedTime'] }}">@endif
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $meta['shortTitle'] }}">
    <meta name="twitter:description" content="{{ $meta['description'] }}">
    @if ($meta['ogImage'])<meta name="twitter:image" content="{{ $meta['ogImage'] }}">@endif
    @if ($seo['googleVerification'])<meta name="google-site-verification" content="{{ $seo['googleVerification'] }}">@endif
    @if ($seo['bingVerification'])<meta name="msvalidate.01" content="{{ $seo['bingVerification'] }}">@endif
    <meta name="theme-color" content="#FFFFFF">
    @if ($g['favicon'])
        <link rel="icon" href="{{ $g['favicon'] }}">
        <link rel="apple-touch-icon" href="{{ $g['favicon'] }}">
    @else
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    @endif
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
    <link rel="stylesheet" href="{{ asset_v('assets/css/site.css') }}">
    @if ($customTheme)
        <style>:root{--r-400:{{ $tl }};--r-500:{{ $tm }};--r-600:{{ $td }};--r-wash:color-mix(in srgb,{{ $td }} 8%,transparent);--grad-brand:linear-gradient(135deg,{{ $tl }} 0%,{{ $tm }} 45%,{{ $td }} 100%);--grad-accent-text:linear-gradient(135deg,{{ $tm }} 0%,{{ $td }} 100%);--glow-brand:0 18px 44px -20px color-mix(in srgb,{{ $td }} 55%,transparent);--accent:{{ $ta }};--accent-ink:color-mix(in srgb,{{ $ta }} 80%,#000);--accent-wash:color-mix(in srgb,{{ $ta }} 10%,transparent);--c1:{{ $td }};--c2:{{ $ta }}}</style>
    @endif
    <script>try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('anim')}catch(e){}</script>
    @if ($gtm)
        <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','{{ $gtm }}');</script>
    @endif
    @if ($ga)
        <script async src="https://www.googletagmanager.com/gtag/js?id={{ $ga }}"></script>
        <script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','{{ $ga }}');</script>
    @endif
    @if ($px)
        <script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','{{ $px }}');fbq('track','PageView');</script>
    @endif
    {!! $t['headCode'] !!}
</head>
<body>
@if ($gtm)
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id={{ $gtm }}" height="0" width="0" style="display:none;visibility:hidden" title="gtm"></iframe></noscript>
@endif
@include('partials.sprite')
<a class="skip-link" href="#main">Skip to content</a>

@include('site.partials.header')

<main id="main" class="view">
    @yield('content')
</main>

@include('site.partials.footer')

@if ($g['showFloatingWhatsApp'] && $s['contact']['whatsapp'])
    <a class="wa-float" href="{{ wa_href($s['contact']['whatsapp'], $s['contact']['whatsappMessage']) }}" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">{!! ic('i-whats') !!}</a>
@endif
<button class="to-top" id="toTop" type="button" aria-label="Back to top">{!! ic('i-chev') !!}</button>
<div class="toast" id="toast" role="status" aria-live="polite">{!! ic('i-check') !!}<span></span></div>

{!! \App\Support\Seo::jsonLd(\App\Support\Seo::business()) !!}
@stack('jsonld')
<script src="{{ asset_v('assets/js/site.js') }}" defer></script>
{!! $t['bodyCode'] !!}
</body>
</html>
