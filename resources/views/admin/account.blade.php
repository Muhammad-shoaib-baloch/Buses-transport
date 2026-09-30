@extends('layouts.admin')
@section('title', 'My account')

@section('content')
<x-admin.topbar title="My account" :sub="'Signed in as '.auth()->user()->email" />
<div class="body" style="max-width:720px">
    <form class="card" method="post" action="/admin/account">
        @csrf
        <div class="card-head"><h2>Change password</h2><span class="hint">Use at least 8 characters — a short sentence is easy to remember and hard to guess.</span></div>
        <div class="card-body">
            @if (session('error'))<p class="form-msg err" style="margin-bottom:12px">{{ session('error') }}</p>@endif
            <div class="aform">
                <div class="fld fld-full"><label class="lbl" for="cur">Current password</label><input id="cur" type="password" name="current" autocomplete="current-password" required></div>
                <div class="fld"><label class="lbl" for="nw">New password</label><input id="nw" type="password" name="next" autocomplete="new-password" required minlength="8"></div>
                <div class="fld"><label class="lbl" for="cf">Repeat new password</label><input id="cf" type="password" name="confirm" autocomplete="new-password" required minlength="8"></div>
            </div>
        </div>
        <div class="form-bar"><span class="grow"></span><button class="btn btn-primary btn-sm" type="submit">Update password {!! ic('i-check') !!}</button></div>
    </form>
</div>
@endsection
