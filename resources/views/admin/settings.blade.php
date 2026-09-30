@extends('layouts.admin')
@section('title', 'Site settings')

@section('content')
@php $t = $tabs[$tab]; @endphp
<x-admin.topbar title="Site settings" sub="Branding, logo, contact details, homepage content, SEO tags, tracking and email alerts" />
<div class="body">
    <div class="stabs" role="tablist">
        @foreach ($tabs as $key => $x)
            <a class="stab{{ $tab === $key ? ' on' : '' }}" href="/admin/settings?tab={{ $key }}" role="tab" aria-selected="{{ $tab === $key ? 'true' : 'false' }}">{!! ic($x['icon']) !!} {{ $x['label'] }}</a>
        @endforeach
    </div>
    <form class="card" method="post" action="/admin/settings/{{ $tab }}" data-dirty-check>
        @csrf
        <div class="card-head"><h2>{{ $t['label'] }}</h2><span class="hint">{{ $t['desc'] }}</span></div>
        <div class="card-body">
            @if (session('error'))<p class="form-msg err" style="background:var(--crit-bg);padding:10px 12px;border-radius:8px;margin-bottom:14px">{{ session('error') }}</p>@endif
            @if ($tab === 'email' && ! empty($values['hasSmtpPass']))<p class="note" style="margin-bottom:12px">An SMTP password is saved. Leave the password box empty to keep it.</p>@endif
            @include('admin.partials.fields', ['fields' => $t['fields'], 'values' => $values])
        </div>
        <div class="form-bar">
            @if ($tab === 'email')
                <button class="btn btn-ghost btn-sm" type="submit" formaction="/admin/settings/test-email">{!! ic('i-mail') !!} Send test email</button>
            @endif
            @if ($tab === 'theme')
                <button class="btn btn-ghost btn-sm" type="button" data-theme-reset>Reset to default colours</button>
            @endif
            <span class="grow"></span>
            <span class="muted js-dirty" style="font-size:var(--t-xs)" hidden>Unsaved changes</span>
            <button class="btn btn-primary btn-sm" type="submit">Save changes {!! ic('i-check') !!}</button>
        </div>
    </form>
</div>
@endsection
