<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Post;
use App\Models\QuoteRequest;
use App\Support\Notifier;
use App\Support\Settings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

/** Public JSON endpoints: quote requests and article view counts. */
class QuoteController extends Controller
{
    private const FIELDS = [
        'name' => 120, 'phone' => 40, 'email' => 160, 'company' => 160, 'service' => 120, 'vehicle' => 160, 'pickup' => 200,
        'dropoff' => 200, 'date' => 20, 'time' => 10, 'passengers' => 20, 'driverOption' => 80, 'message' => 3000, 'source' => 40, 'pageUrl' => 300,
    ];

    /** Reject cross-site posts (these routes skip the CSRF token so cached pages keep working). */
    private function sameOrigin(Request $r): bool
    {
        $origin = $r->headers->get('Origin') ?: $r->headers->get('Referer');
        if (! $origin) {
            return true;
        }

        return parse_url($origin, PHP_URL_HOST) === $r->getHost();
    }

    public function store(Request $r)
    {
        if (! $this->sameOrigin($r)) {
            return response()->json(['ok' => false, 'error' => 'Invalid request.'], 403);
        }
        if (trim((string) $r->input('website', '')) !== '') { // honeypot
            return response()->json(['ok' => true, 'ref' => 'BT-00000', 'message' => 'Thank you.']);
        }
        $key = 'quote:'.$r->ip();
        if (RateLimiter::tooManyAttempts($key, 8)) {
            return response()->json(['ok' => false, 'error' => 'Too many requests. Please call or WhatsApp us instead.'], 429);
        }
        RateLimiter::hit($key, 600);

        $d = [];
        foreach (self::FIELDS as $k => $max) {
            $d[$k] = mb_substr(trim((string) $r->input($k, '')), 0, $max);
        }
        if ($d['name'] === '') {
            return response()->json(['ok' => false, 'error' => 'Please add your name.'], 422);
        }
        if (! preg_match('/[0-9]{6,}/', preg_replace('/[\s()+-]/', '', $d['phone']))) {
            return response()->json(['ok' => false, 'error' => 'Please add a valid phone or WhatsApp number.'], 422);
        }
        if ($d['email'] !== '' && ! filter_var($d['email'], FILTER_VALIDATE_EMAIL)) {
            return response()->json(['ok' => false, 'error' => 'That email address does not look right.'], 422);
        }

        $q = QuoteRequest::create([
            'name' => $d['name'], 'phone' => $d['phone'], 'email' => $d['email'], 'company' => $d['company'], 'service' => $d['service'],
            'vehicle' => $d['vehicle'], 'pickup' => $d['pickup'], 'dropoff' => $d['dropoff'], 'date' => $d['date'], 'time' => $d['time'],
            'passengers' => $d['passengers'], 'driver_option' => $d['driverOption'], 'message' => $d['message'],
            'source' => $d['source'] ?: 'website', 'page_url' => $d['pageUrl'], 'status' => 'new',
            'ip' => (string) $r->ip(), 'user_agent' => mb_substr((string) $r->userAgent(), 0, 300),
        ]);
        $q->update(['ref' => 'BT-'.(10000 + $q->id)]);

        Activity::log('New quote request <b>'.e($q->ref).'</b> from '.e($q->name).($q->service ? ' · '.e($q->service) : ''), 'i-inbox', '');
        dispatch(function () use ($q) {
            try {
                Notifier::newQuote($q);
            } catch (\Throwable $e) {
                Log::warning('Quote email failed: '.$e->getMessage());
            }
        })->afterResponse();

        $s = Settings::all();
        $text = "Hello, I just sent a quote request ({$q->ref}) on your website.\n\n".implode("\n", array_map(fn ($l) => $l[0].': '.$l[1], $q->lines(false)));

        return response()->json([
            'ok' => true,
            'ref' => $q->ref,
            'message' => $s['forms']['successMessage'],
            'whatsappUrl' => $s['forms']['offerWhatsapp'] && $s['contact']['whatsapp'] ? wa_href($s['contact']['whatsapp'], $text) : null,
        ]);
    }

    public function view(Request $r, string $slug)
    {
        if ($this->sameOrigin($r)) {
            $key = 'view:'.$r->ip().':'.$slug;
            if (! RateLimiter::tooManyAttempts($key, 3)) {
                RateLimiter::hit($key, 3600);
                Post::live()->where('slug', $slug)->increment('views');
            }
        }

        return response()->json(['ok' => true]);
    }
}
