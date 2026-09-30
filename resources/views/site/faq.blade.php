@extends('layouts.site')

@section('content')
<x-page-head :crumbs="[['FAQ']]" title="Frequently asked questions" sub="Answers to the questions we hear most often about booking, pricing, coverage and our fleet." />
<section class="sec">
    <div class="wrap" style="max-width:900px">
        @include('site.partials.faq-list', ['faqs' => $faqs])
    </div>
</section>
@include('site.partials.cta-band', ['title' => 'Still have a question?', 'sub' => 'Our team is available 24/7 by phone and WhatsApp to help with anything not covered here.'])
@push('jsonld'){!! \App\Support\Seo::jsonLd(\App\Support\Seo::faqPage($faqs)) !!}@endpush
@endsection
