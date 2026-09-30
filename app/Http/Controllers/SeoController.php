<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\Post;
use App\Models\Service;
use App\Models\Vehicle;
use App\Support\Settings;

class SeoController extends Controller
{
    public function sitemap()
    {
        $base = Settings::siteUrl();
        $now = now()->toAtomString();
        $urls = [];
        $static = [['', '1.0'], ['/services', '0.9'], ['/fleet', '0.9'], ['/coverage', '0.7'], ['/about', '0.6'], ['/contact', '0.8'], ['/faq', '0.6']];
        if (site('general.showBlogInNav')) {
            $static[] = ['/blog', '0.6'];
        }
        foreach ($static as [$p, $prio]) {
            $urls[] = [$base.($p ?: '/'), $now, 'weekly', $prio];
        }
        foreach (Service::where('active', true)->get(['slug', 'updated_at']) as $x) {
            $urls[] = [$base.'/services/'.$x->slug, $x->updated_at?->toAtomString() ?? $now, 'monthly', '0.8'];
        }
        foreach (Vehicle::where('active', true)->get(['slug', 'updated_at']) as $x) {
            $urls[] = [$base.'/fleet/'.$x->slug, $x->updated_at?->toAtomString() ?? $now, 'monthly', '0.7'];
        }
        foreach (Post::live()->get(['slug', 'updated_at']) as $x) {
            $urls[] = [$base.'/blog/'.$x->slug, $x->updated_at?->toAtomString() ?? $now, 'monthly', '0.5'];
        }
        foreach (Page::where('status', 'published')->get(['slug', 'updated_at']) as $x) {
            $urls[] = [$base.'/'.$x->slug, $x->updated_at?->toAtomString() ?? $now, 'yearly', '0.3'];
        }
        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n".'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";
        foreach ($urls as [$loc, $mod, $freq, $prio]) {
            $xml .= '<url><loc>'.e($loc).'</loc><lastmod>'.$mod.'</lastmod><changefreq>'.$freq.'</changefreq><priority>'.$prio.'</priority></url>'."\n";
        }
        $xml .= '</urlset>';

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    public function robots()
    {
        $base = Settings::siteUrl();
        $txt = site('seo.robotsIndex')
            ? "User-Agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nHost: {$base}\nSitemap: {$base}/sitemap.xml\n"
            : "User-Agent: *\nDisallow: /\n";

        return response($txt, 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }
}
