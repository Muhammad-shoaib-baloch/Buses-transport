<?php

namespace App\Http\Controllers;

use App\Models\Page;
use App\Models\Post;
use App\Models\Service;
use App\Models\Vehicle;
use App\Support\Markdown;
use App\Support\Seo;
use App\Support\Settings;
use App\Support\SiteData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SiteController extends Controller
{
    private function page(string $view, array $meta, array $data = [])
    {
        return response()->view($view, ['s' => Settings::all(), 'meta' => $meta] + $data);
    }

    public function home()
    {
        return $this->page('site.home', Seo::meta('home', ['path' => '/']), [
            'services' => SiteData::services(),
            'featured' => SiteData::featuredVehicles(),
            'areas' => SiteData::areas(),
            'routes' => SiteData::routes(),
            'testimonials' => SiteData::testimonials(),
            'posts' => SiteData::posts(3),
            'opts' => SiteData::formOptions(),
        ]);
    }

    public function services()
    {
        return $this->page('site.services', Seo::meta('services', ['title' => 'Transportation Services in Dubai & the UAE', 'path' => '/services']), [
            'services' => SiteData::services(),
            'faqs' => SiteData::faqs(),
        ]);
    }

    public function service(string $slug)
    {
        $svc = Service::where('slug', $slug)->where('active', true)->firstOrFail();
        $vehicles = $svc->vehicles()->with('category')->where('active', true)->orderBy('order')->get();
        $faqs = $svc->faqs()->where('active', true)->orderBy('order')->get();
        $base = Settings::siteUrl();
        $ld = [
            array_filter([
                '@context' => 'https://schema.org', '@type' => 'Service', 'name' => $svc->name, 'serviceType' => $svc->name,
                'description' => $svc->seo_description ?: $svc->blurb, 'url' => $base.'/services/'.$svc->slug,
                'provider' => ['@id' => $base.'/#business'], 'areaServed' => ['@type' => 'Country', 'name' => 'United Arab Emirates'],
                'image' => $svc->image ? Seo::absolute($svc->image) : null,
            ]),
            Seo::breadcrumbs([['Home', '/'], ['Services', '/services'], [$svc->name, '/services/'.$svc->slug]]),
        ];
        if ($faqs->count()) {
            $ld[] = Seo::faqPage($faqs);
        }

        return $this->page('site.service', Seo::meta(null, [
            'title' => $svc->seo_title ?: $svc->heroTitle(),
            'description' => $svc->seo_description ?: $svc->blurb,
            'keywords' => $svc->seo_keywords,
            'ogImage' => $svc->og_image ?: $svc->image,
            'path' => '/services/'.$svc->slug,
        ]), [
            'svc' => $svc,
            'vehicles' => $vehicles,
            'faqs' => $faqs,
            'others' => SiteData::services()->where('slug', '!=', $svc->slug)->take(4)->values(),
            'opts' => SiteData::formOptions(),
            'ld' => $ld,
        ]);
    }

    public function fleet()
    {
        return $this->page('site.fleet', Seo::meta('fleet', ['title' => 'Our Vehicles', 'path' => '/fleet']), [
            'vehicles' => SiteData::vehicles(),
            'categories' => SiteData::categories(),
        ]);
    }

    public function vehicle(string $slug)
    {
        $v = Vehicle::with(['category', 'services' => fn ($q) => $q->where('active', true)->orderBy('order')])->where('slug', $slug)->where('active', true)->firstOrFail();
        $all = SiteData::vehicles();
        $related = $all->filter(fn ($x) => $x->slug !== $v->slug && $x->fleet_category_id === $v->fleet_category_id)->take(3);
        if ($related->count() < 3) {
            $fill = $all->filter(fn ($x) => $x->slug !== $v->slug && ! $related->contains('id', $x->id))
                ->sortBy(fn ($x) => abs($x->capacity - $v->capacity))->take(3 - $related->count());
            $related = $related->concat($fill);
        }

        return $this->page('site.vehicle', Seo::meta(null, [
            'title' => $v->seo_title ?: $v->name.' Rental Dubai — '.$v->seats_label,
            'description' => $v->seo_description ?: $v->description,
            'keywords' => $v->seo_keywords ?: $v->name.' rental Dubai, '.$v->name.' with driver, '.$v->class_label.' rental UAE',
            'ogImage' => $v->og_image ?: $v->cover(),
            'path' => '/fleet/'.$v->slug,
        ]), ['v' => $v, 'related' => $related->values(), 'opts' => SiteData::formOptions()]);
    }

    public function coverage()
    {
        return $this->page('site.coverage', Seo::meta('coverage', ['title' => 'UAE Coverage — All Seven Emirates', 'path' => '/coverage']), [
            'areas' => SiteData::areas(),
            'routes' => SiteData::routes(),
        ]);
    }

    public function blog(Request $request)
    {
        $tag = mb_strtolower(trim((string) $request->query('tag', '')));
        $posts = SiteData::posts();
        if ($tag !== '') {
            $posts = $posts->filter(fn ($p) => in_array($tag, array_map('mb_strtolower', $p->tagList()), true))->values();
        }

        return $this->page('site.blog', Seo::meta('blog', ['title' => 'Blog', 'path' => '/blog', 'noindex' => $tag !== '']), [
            'posts' => $posts,
            'tag' => $tag,
        ]);
    }

    public function post(string $slug)
    {
        $p = Post::where('slug', $slug)->firstOrFail();
        $preview = false;
        if (! $p->isLive()) {
            abort_unless(Auth::check(), 404); // drafts: signed-in admins only
            $preview = true;
        }
        $base = Settings::siteUrl();
        $ld = array_filter([
            '@context' => 'https://schema.org', '@type' => 'BlogPosting', 'headline' => $p->title, 'description' => $p->excerpt,
            'datePublished' => optional($p->published_at)->toIso8601String(), 'dateModified' => $p->updated_at?->toIso8601String(),
            'author' => ['@type' => 'Organization', 'name' => $p->author ?: site('general.siteName')],
            'publisher' => ['@id' => $base.'/#business'], 'mainEntityOfPage' => $base.'/blog/'.$p->slug,
            'image' => $p->cover_image ? Seo::absolute($p->cover_image) : null, 'keywords' => implode(', ', $p->tagList()),
        ]);

        return $this->page('site.post', Seo::meta(null, [
            'title' => $p->seo_title ?: $p->title,
            'description' => $p->seo_description ?: ($p->excerpt ?: Markdown::toText($p->body)),
            'keywords' => $p->seo_keywords ?: $p->tags,
            'ogImage' => $p->og_image ?: $p->cover_image,
            'path' => '/blog/'.$p->slug,
            'type' => 'article',
            'publishedTime' => optional($p->published_at)->toIso8601String(),
            'noindex' => $preview,
        ]), [
            'p' => $p,
            'preview' => $preview,
            'others' => SiteData::posts(4)->where('id', '!=', $p->id)->take(3)->values(),
            'ld' => $ld,
        ]);
    }

    public function about()
    {
        return $this->page('site.about', Seo::meta('about', ['title' => 'About Us', 'path' => '/about']));
    }

    public function contact(Request $request)
    {
        $opts = SiteData::formOptions();
        $svc = collect($opts['services'])->firstWhere('value', $request->query('service'));
        $veh = collect($opts['vehicles'])->firstWhere('value', $request->query('vehicle'));

        return $this->page('site.contact', Seo::meta('contact', ['title' => 'Contact Us', 'path' => '/contact']), [
            'opts' => $opts,
            'areas' => SiteData::areas(),
            'initialService' => $svc['label'] ?? '',
            'initialVehicle' => $veh['label'] ?? '',
        ]);
    }

    public function faq()
    {
        return $this->page('site.faq', Seo::meta('faq', ['title' => 'Frequently Asked Questions', 'path' => '/faq']), [
            'faqs' => SiteData::faqs(),
        ]);
    }

    public function cmsPage(string $slug)
    {
        $p = Page::where('slug', $slug)->where('status', 'published')->first();
        if (! $p) {
            return $this->notFound();
        }

        return $this->page('site.page', Seo::meta(null, [
            'title' => $p->seo_title ?: $p->title,
            'description' => $p->seo_description ?: ($p->subtitle ?: Markdown::toText($p->body)),
            'keywords' => $p->seo_keywords,
            'ogImage' => $p->og_image,
            'path' => '/'.$p->slug,
        ]), ['p' => $p]);
    }

    public function notFound()
    {
        return response()->view('site.not-found', [
            's' => Settings::all(),
            'meta' => Seo::meta(null, ['title' => 'Page not found', 'path' => '/'.request()->path(), 'noindex' => true]),
        ], 404);
    }
}
