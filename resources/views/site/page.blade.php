@extends('layouts.site')

@section('content')
<x-page-head :crumbs="[[$p->title]]" :title="$p->title" :sub="$p->subtitle" />
<section class="sec">
    <div class="wrap">
        <article class="article"><div class="prose">{!! md($p->body) !!}</div></article>
    </div>
</section>
@endsection
