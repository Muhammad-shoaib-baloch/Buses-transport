<?php

use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\MediaController;
use App\Http\Controllers\Admin\QuotesController;
use App\Http\Controllers\Admin\ResourceController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\InstallController;
use App\Http\Controllers\QuoteController;
use App\Http\Controllers\SeoController;
use App\Http\Controllers\SiteController;
use Illuminate\Support\Facades\Route;

/* ---------------- public site ---------------- */
Route::get('/', [SiteController::class, 'home']);
Route::get('/services', [SiteController::class, 'services']);
Route::get('/services/{slug}', [SiteController::class, 'service']);
Route::get('/fleet', [SiteController::class, 'fleet']);
Route::get('/fleet/{slug}', [SiteController::class, 'vehicle']);
Route::get('/coverage', [SiteController::class, 'coverage']);
Route::get('/blog', [SiteController::class, 'blog']);
Route::get('/blog/{slug}', [SiteController::class, 'post']);
Route::get('/about', [SiteController::class, 'about']);
Route::get('/contact', [SiteController::class, 'contact']);
Route::get('/faq', [SiteController::class, 'faq']);
Route::get('/sitemap.xml', [SeoController::class, 'sitemap']);
Route::get('/robots.txt', [SeoController::class, 'robots']);

Route::post('/api/quote', [QuoteController::class, 'store']);
Route::post('/api/views/{slug}', [QuoteController::class, 'view']);

/* Old WordPress URLs on busestransport.com → new pages (301). */
foreach (['airport-transfer', 'city-tours', 'hotel-to-hotel-transfer', 'shuttle-services', 'dinner-transfer', 'bus-rental', 'daily-rental', 'monthly-rental', 'car-rental'] as $old) {
    Route::permanentRedirect('/'.$old, '/services/'.$old);
}
Route::permanentRedirect('/our-vehicles', '/fleet');
Route::permanentRedirect('/about-us', '/about');
Route::permanentRedirect('/contact-us', '/contact');
Route::redirect('/wp-admin', '/admin');
Route::redirect('/wp-login.php', '/admin/login');

/* One-time web installer for hosting without SSH. */
Route::get('/install', [InstallController::class, 'show']);
Route::post('/install', [InstallController::class, 'run']);

/* ---------------- admin dashboard ---------------- */
Route::prefix('admin')->group(function () {
    Route::get('/login', [AuthController::class, 'show'])->middleware('guest')->name('login');
    Route::post('/login', [AuthController::class, 'login'])->middleware('guest');
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::middleware('auth')->group(function () {
        Route::get('/', [DashboardController::class, 'index']);

        Route::get('/quotes', [QuotesController::class, 'index']);
        Route::get('/quotes/export', [QuotesController::class, 'export']);
        Route::post('/quotes/{quote}', [QuotesController::class, 'update']);
        Route::delete('/quotes/{quote}', [QuotesController::class, 'destroy']);

        Route::get('/media', [MediaController::class, 'index']);
        Route::get('/media.json', [MediaController::class, 'list']);
        Route::post('/media/upload', [MediaController::class, 'upload']);
        Route::delete('/media/{media}', [MediaController::class, 'destroy']);
        Route::post('/markdown', [MediaController::class, 'markdown']);

        Route::get('/account', [AccountController::class, 'show']);
        Route::post('/account', [AccountController::class, 'update']);

        Route::middleware('admin.role')->group(function () {
            Route::get('/settings', [SettingsController::class, 'show']);
            Route::post('/settings/test-email', [SettingsController::class, 'testEmail']);
            Route::post('/settings/{tab}', [SettingsController::class, 'save']);
        });

        // Content managers: services, fleet, posts, pages, faqs, testimonials, coverage, users
        Route::get('/{section}', [ResourceController::class, 'page'])->where('section', 'services|fleet|posts|pages|faqs|testimonials|coverage|users');
        Route::post('/r/{resource}', [ResourceController::class, 'store']);
        Route::put('/r/{resource}/{id}', [ResourceController::class, 'update'])->whereNumber('id');
        Route::delete('/r/{resource}/{id}', [ResourceController::class, 'destroy'])->whereNumber('id');
    });
});

/* CMS pages (privacy policy, terms…) — keep last. */
Route::get('/{slug}', [SiteController::class, 'cmsPage'])->where('slug', '[a-z0-9-]+');
