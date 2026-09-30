<?php

namespace App\View;

use App\Models\Faq;
use App\Models\Media;
use App\Models\Page;
use App\Models\Post;
use App\Models\QuoteRequest;
use App\Models\Service;
use App\Models\Testimonial;
use App\Models\Vehicle;
use App\Support\Settings;
use Illuminate\View\View;

/** Sidebar counts and branding for the admin layout. */
class AdminChrome
{
    public function compose(View $view): void
    {
        $g = Settings::group('general');
        $view->with([
            'brand' => ['first' => $g['brandFirst'], 'second' => $g['brandSecond']],
            'counts' => [
                'newQuotes' => QuoteRequest::where('status', 'new')->count(),
                'services' => Service::count(),
                'vehicles' => Vehicle::count(),
                'posts' => Post::count(),
                'pages' => Page::count(),
                'faqs' => Faq::count(),
                'testimonials' => Testimonial::count(),
                'media' => Media::count(),
            ],
            'me' => auth()->user(),
        ]);
    }
}
