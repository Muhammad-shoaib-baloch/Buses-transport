<?php

namespace App\Admin;

use App\Admin\Resources\AreaResource;
use App\Admin\Resources\CategoryResource;
use App\Admin\Resources\FaqResource;
use App\Admin\Resources\PageResource;
use App\Admin\Resources\PostResource;
use App\Admin\Resources\RouteResource;
use App\Admin\Resources\ServiceResource;
use App\Admin\Resources\TestimonialResource;
use App\Admin\Resources\UserResource;
use App\Admin\Resources\VehicleResource;

class Registry
{
    public const RESOURCES = [
        'services' => ServiceResource::class,
        'vehicles' => VehicleResource::class,
        'categories' => CategoryResource::class,
        'posts' => PostResource::class,
        'pages' => PageResource::class,
        'faqs' => FaqResource::class,
        'testimonials' => TestimonialResource::class,
        'areas' => AreaResource::class,
        'routes' => RouteResource::class,
        'users' => UserResource::class,
    ];

    /** section => [title, subtitle, resource keys] */
    public const SECTIONS = [
        'services' => ['Services', 'Service pages, homepage cards, menus and the quote form options', ['services']],
        'fleet' => ['Fleet', 'Vehicles, photos, capacities and categories', ['vehicles', 'categories']],
        'posts' => ['Blog posts', 'Write, edit and publish articles on the public blog', ['posts']],
        'pages' => ['Pages', 'Extra pages such as Privacy Policy, Terms, or landing pages — published at yoursite.com/slug', ['pages']],
        'faqs' => ['FAQs', 'Questions on the FAQ page, the services page and individual service pages', ['faqs']],
        'testimonials' => ['Testimonials', 'Real client reviews for the homepage slider — the review links show until you add one', ['testimonials']],
        'coverage' => ['Coverage & routes', 'Emirates on the map, airports, areas served and the popular routes ticker', ['areas', 'routes']],
        'users' => ['Users', 'Who can sign in to this dashboard. Editors manage content; administrators also manage settings and users.', ['users']],
    ];

    public static function resource(string $key): ?Resource
    {
        $class = self::RESOURCES[$key] ?? null;

        return $class ? new $class : null;
    }

    public static function sectionOf(string $resourceKey): string
    {
        foreach (self::SECTIONS as $section => [, , $keys]) {
            if (in_array($resourceKey, $keys, true)) {
                return $section;
            }
        }

        return 'services';
    }
}
