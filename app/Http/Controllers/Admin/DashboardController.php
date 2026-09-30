<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\FleetCategory;
use App\Models\Post;
use App\Models\QuoteRequest;
use App\Models\Service;
use App\Models\Testimonial;
use App\Models\Vehicle;
use App\Support\Settings;

class DashboardController extends Controller
{
    public function index()
    {
        $s = Settings::all();
        $from = now()->startOfMonth()->subMonths(5);
        $quotes6 = QuoteRequest::where('created_at', '>=', $from)->get(['created_at', 'status']);
        $months = [];
        for ($i = 0; $i < 6; $i++) {
            $d = $from->copy()->addMonths($i);
            $items = $quotes6->filter(fn ($q) => $q->created_at->format('Y-m') === $d->format('Y-m'));
            $months[] = ['m' => $d->format('M'), 'a' => $items->count(), 'b' => $items->where('status', 'confirmed')->count()];
        }
        $posts = Post::where('status', 'published')->orderByDesc('views')->get(['title', 'views']);
        $cats = FleetCategory::withCount('vehicles')->orderBy('order')->get();
        $testimonials = Testimonial::where('active', true)->count();

        $checks = [
            [(bool) $s['general']['logo'], 'Upload your logo', '/admin/settings?tab=general'],
            [(bool) $s['general']['favicon'], 'Upload a favicon (browser tab icon)', '/admin/settings?tab=general'],
            [(bool) ($s['general']['siteUrl'] || str_starts_with((string) config('app.url'), 'https')), 'Set the live website URL (for sitemap & SEO)', '/admin/settings?tab=general'],
            [(bool) $s['seo']['googleVerification'], 'Verify the site in Google Search Console', '/admin/settings?tab=seo'],
            [(bool) ($s['tracking']['gtmId'] || $s['tracking']['ga4Id']), 'Connect Google Tag Manager or Analytics', '/admin/settings?tab=tracking'],
            [$s['email']['notifyEnabled'] && $s['email']['smtpHost'], 'Turn on email alerts for new quote requests', '/admin/settings?tab=email'],
            [(bool) array_filter($s['social']), 'Add your social media & Google reviews links', '/admin/settings?tab=social'],
            [(bool) $s['contact']['mapEmbedUrl'], 'Add a Google Maps embed of your office', '/admin/settings?tab=contact'],
            [$testimonials > 0, 'Add your first real client testimonial', '/admin/testimonials'],
        ];

        return view('admin.dashboard', [
            's' => $s,
            'months' => $months,
            'newCount' => QuoteRequest::where('status', 'new')->count(),
            'monthCount' => QuoteRequest::where('created_at', '>=', now()->startOfMonth())->count(),
            'latest' => QuoteRequest::latest()->take(6)->get(),
            'activity' => Activity::latest()->take(8)->get(),
            'posts' => $posts,
            'cats' => $cats,
            'vehicleCount' => Vehicle::where('active', true)->count(),
            'serviceCount' => Service::where('active', true)->count(),
            'checks' => $checks,
        ]);
    }
}
