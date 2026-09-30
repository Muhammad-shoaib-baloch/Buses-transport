<?php

namespace App\Support;

class Seo
{
    public static function absolute(?string $u): string
    {
        $u = (string) $u;
        if ($u === '' || preg_match('~^https?://~i', $u)) {
            return $u;
        }

        return Settings::siteUrl().(str_starts_with($u, '/') ? '' : '/').$u;
    }

    /**
     * Build the meta tags for a page. Explicit values win, then the
     * per-page overrides from Settings → Page meta tags, then defaults.
     *
     * @param  array{title?:?string,description?:?string,keywords?:?string,ogImage?:?string,path:string,type?:string,noindex?:bool,publishedTime?:?string}  $in
     */
    public static function meta(?string $pageKey, array $in): array
    {
        $s = Settings::group('seo');
        $over = $pageKey ? ($s['pages'][$pageKey] ?? []) : [];
        $title = trim((string) (($over['title'] ?? '') ?: ($in['title'] ?? '')));
        $full = $title !== '' ? str_replace('%s', $title, $s['titleTemplate'] ?: '%s') : $s['defaultTitle'];
        $og = ($over['ogImage'] ?? '') ?: ($in['ogImage'] ?? '') ?: $s['ogImage'];

        return [
            'title' => $full,
            'shortTitle' => $title ?: $s['defaultTitle'],
            'description' => trim((string) (($over['description'] ?? '') ?: ($in['description'] ?? '') ?: $s['description'])),
            'keywords' => trim((string) (($over['keywords'] ?? '') ?: ($in['keywords'] ?? '') ?: $s['keywords'])),
            'canonical' => Settings::siteUrl().($in['path'] === '/' ? '/' : $in['path']),
            'ogImage' => $og ? self::absolute($og) : '',
            'type' => $in['type'] ?? 'website',
            'noindex' => ! empty($in['noindex']) || ! $s['robotsIndex'],
            'publishedTime' => $in['publishedTime'] ?? null,
        ];
    }

    public static function business(): array
    {
        $s = Settings::all();
        $base = Settings::siteUrl();
        $img = $s['general']['logo'] ?: ($s['seo']['ogImage'] ?: '/images/hero.jpg');

        return array_filter([
            '@context' => 'https://schema.org',
            '@type' => $s['seo']['businessType'] ?: 'LocalBusiness',
            '@id' => $base.'/#business',
            'name' => $s['general']['siteName'],
            'url' => $base,
            'logo' => $s['general']['logo'] ? self::absolute($s['general']['logo']) : null,
            'image' => self::absolute($img),
            'description' => $s['seo']['description'],
            'telephone' => $s['contact']['phones'][0] ?? $s['contact']['whatsapp'],
            'email' => $s['contact']['emails'][0] ?? null,
            'address' => ['@type' => 'PostalAddress', 'streetAddress' => $s['contact']['address'], 'addressLocality' => 'Dubai', 'addressCountry' => 'AE'],
            'areaServed' => array_map(fn ($n) => ['@type' => 'City', 'name' => $n], ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Umm Al Quwain', 'Ras Al Khaimah', 'Fujairah', 'Al Ain']),
            'openingHoursSpecification' => [['@type' => 'OpeningHoursSpecification', 'dayOfWeek' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 'opens' => '00:00', 'closes' => '23:59']],
            'priceRange' => 'AED',
            'sameAs' => array_values(array_filter($s['social'])),
        ], fn ($v) => $v !== null);
    }

    public static function breadcrumbs(array $items): array
    {
        $base = Settings::siteUrl();

        return [
            '@context' => 'https://schema.org',
            '@type' => 'BreadcrumbList',
            'itemListElement' => array_map(fn ($it, $i) => ['@type' => 'ListItem', 'position' => $i + 1, 'name' => $it[0], 'item' => $base.$it[1]], $items, array_keys($items)),
        ];
    }

    public static function faqPage($faqs): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => collect($faqs)->map(fn ($f) => ['@type' => 'Question', 'name' => $f->question, 'acceptedAnswer' => ['@type' => 'Answer', 'text' => $f->answer]])->values()->all(),
        ];
    }

    public static function jsonLd(array $data): string
    {
        return '<script type="application/ld+json">'.str_replace('<', '<', json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)).'</script>';
    }
}
