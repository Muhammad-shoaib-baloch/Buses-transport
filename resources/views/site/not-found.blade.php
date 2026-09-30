@extends('layouts.site')

@section('content')
<x-page-head :crumbs="[['Not found']]" title="That page does not exist" sub="The link may be out of date. The fleet and the services are both a click away." />
<section class="sec">
    <div class="wrap">
        <div class="empty">
            <h3>Nothing here</h3>
            <p style="margin-bottom:16px">Try the fleet, the services, or tell our team what you need.</p>
            <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
                <a class="btn btn-primary" href="/">Back to home {!! ic('i-arrow') !!}</a>
                <a class="btn btn-ghost" href="/fleet">Browse the fleet</a>
                <a class="btn btn-ghost" href="/services">Our services</a>
            </div>
        </div>
    </div>
</section>
@endsection
