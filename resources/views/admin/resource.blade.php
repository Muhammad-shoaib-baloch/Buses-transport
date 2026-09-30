@extends('layouts.admin')
@section('title', $title)

@section('content')
<x-admin.topbar :title="$title" :sub="$sub" />
<div class="body">
    @foreach ($managers as $m)
        @include('admin.partials.manager', ['m' => $m])
    @endforeach
</div>
@endsection
