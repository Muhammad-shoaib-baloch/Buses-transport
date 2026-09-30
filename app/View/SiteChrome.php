<?php

namespace App\View;

use App\Support\Settings;
use App\Support\SiteData;
use Illuminate\View\View;

/** Supplies the header, mega menu and footer data to the public layout. */
class SiteChrome
{
    public function compose(View $view): void
    {
        $featured = SiteData::featuredVehicles();
        $areas = SiteData::areas();
        $feature = $featured->first(fn ($v) => $v->slug === 'v-class' && $v->cover()) ?? $featured->first(fn ($v) => $v->cover());

        $view->with([
            's' => $view->getData()['s'] ?? Settings::all(),
            'chrome' => [
                'services' => SiteData::services(),
                'featured' => $featured,
                'feature' => $feature,
                'emirates' => $areas->where('kind', 'emirate')->values(),
                'airports' => $areas->where('kind', 'airport')->values(),
                'routes' => SiteData::routes(),
                'footerPages' => SiteData::footerPages(),
            ],
        ]);
    }
}
