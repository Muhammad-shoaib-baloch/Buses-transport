<?php

namespace App\Support;

use App\Models\Area;
use App\Models\Faq;
use App\Models\FleetCategory;
use App\Models\Page;
use App\Models\Post;
use App\Models\Service;
use App\Models\Testimonial;
use App\Models\TravelRoute;
use App\Models\Vehicle;
use Illuminate\Support\Collection;

/** Public-site queries, memoised for the lifetime of one request. */
class SiteData
{
    private static array $memo = [];

    private static function once(string $key, callable $fn): mixed
    {
        return self::$memo[$key] ??= $fn();
    }

    public static function services(): Collection
    {
        return self::once('services', fn () => Service::where('active', true)->orderBy('order')->orderBy('id')->get());
    }

    public static function vehicles(): Collection
    {
        return self::once('vehicles', fn () => Vehicle::with('category')->where('active', true)
            ->leftJoin('fleet_categories', 'fleet_categories.id', '=', 'vehicles.fleet_category_id')
            ->orderByRaw('COALESCE(fleet_categories.`order`, 999)')->orderBy('vehicles.capacity')->orderBy('vehicles.order')
            ->select('vehicles.*')->get());
    }

    public static function featuredVehicles(): Collection
    {
        return self::once('featured', fn () => Vehicle::with('category')->where('active', true)->where('featured', true)->orderBy('order')->orderBy('id')->get());
    }

    public static function categories(): Collection
    {
        return self::once('categories', fn () => FleetCategory::orderBy('order')->orderBy('id')->get());
    }

    public static function faqs(bool $homeOnly = false): Collection
    {
        return self::once('faqs'.(int) $homeOnly, fn () => Faq::where('active', true)->when($homeOnly, fn ($q) => $q->where('show_on_home', true))->orderBy('order')->orderBy('id')->get());
    }

    public static function testimonials(): Collection
    {
        return self::once('testimonials', fn () => Testimonial::where('active', true)->orderBy('order')->orderBy('id')->get());
    }

    public static function areas(): Collection
    {
        return self::once('areas', fn () => Area::where('active', true)->orderBy('order')->orderBy('id')->get());
    }

    public static function routes(): Collection
    {
        return self::once('routes', fn () => TravelRoute::where('active', true)->orderBy('order')->orderBy('id')->get());
    }

    public static function posts(?int $limit = null): Collection
    {
        return self::once('posts'.$limit, fn () => Post::live()->orderByDesc('published_at')->when($limit, fn ($q) => $q->limit($limit))->get());
    }

    public static function footerPages(): Collection
    {
        return self::once('footerPages', fn () => Page::where('status', 'published')->where('show_in_footer', true)->orderBy('order')->orderBy('id')->get(['slug', 'title']));
    }

    /** Select options for the quote forms (value stored = human label). */
    public static function formOptions(): array
    {
        return self::once('formOptions', fn () => [
            'services' => self::services()->map(fn ($s) => ['value' => $s->slug, 'label' => $s->name])->all(),
            'vehicles' => self::vehicles()->map(fn ($v) => ['value' => $v->slug, 'label' => $v->name.' ('.$v->seats_label.')'])->all(),
        ]);
    }
}
