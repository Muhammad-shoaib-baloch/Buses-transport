<?php

use App\Support\Markdown;
use App\Support\Settings;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/* Shared view/controller helpers (autoloaded via composer.json "files"). */

if (! function_exists('ic')) {
    /** Inline SVG icon from the sprite: {!! ic('i-phone') !!} */
    function ic(string $name, string $class = ''): string
    {
        $n = preg_replace('/[^a-z0-9-]/i', '', $name);

        return '<svg class="ic'.($class ? ' '.e($class) : '').'" aria-hidden="true"><use href="#'.$n.'"/></svg>';
    }
}

if (! function_exists('asset_v')) {
    /** Public asset URL with a file-modified-time version, so browsers pick up changes. */
    function asset_v(string $path): string
    {
        $file = public_path($path);

        return '/'.ltrim($path, '/').(is_file($file) ? '?v='.filemtime($file) : '');
    }
}

if (! function_exists('site')) {
    /** Settings accessor: site('contact.whatsapp') or site() for everything. */
    function site(?string $path = null, mixed $default = null): mixed
    {
        $all = Settings::all();

        return $path === null ? $all : data_get($all, $path, $default);
    }
}

if (! function_exists('digits')) {
    function digits(?string $phone): string
    {
        return preg_replace('/[^\d+]/', '', (string) $phone);
    }
}

if (! function_exists('tel_href')) {
    function tel_href(?string $phone): string
    {
        return 'tel:'.digits($phone);
    }
}

if (! function_exists('wa_href')) {
    function wa_href(?string $phone, ?string $text = null): string
    {
        $d = ltrim(digits($phone), '+');

        return 'https://wa.me/'.$d.($text ? '?text='.rawurlencode($text) : '');
    }
}

if (! function_exists('mins')) {
    function mins(?int $m): string
    {
        if ($m === null) {
            return '';
        }

        return $m >= 60 ? intdiv($m, 60).'h '.str_pad((string) ($m % 60), 2, '0', STR_PAD_LEFT).'m' : $m.'m';
    }
}

if (! function_exists('date_fmt')) {
    function date_fmt($d): string
    {
        if (! $d) {
            return '';
        }

        return Carbon::parse($d)->timezone('Asia/Dubai')->format('j M Y');
    }
}

if (! function_exists('datetime_fmt')) {
    function datetime_fmt($d): string
    {
        if (! $d) {
            return '';
        }

        return Carbon::parse($d)->timezone('Asia/Dubai')->format('j M Y, H:i');
    }
}

if (! function_exists('rel_time')) {
    function rel_time($d): string
    {
        $c = Carbon::parse($d);
        $s = now()->diffInSeconds($c, true);
        if ($s < 60) {
            return 'just now';
        }
        if ($s < 3600) {
            return floor($s / 60).' min ago';
        }
        if ($s < 86400) {
            return floor($s / 3600).' h ago';
        }
        if ($s < 7 * 86400) {
            return floor($s / 86400).' days ago';
        }

        return datetime_fmt($c);
    }
}

if (! function_exists('num')) {
    function num($n): string
    {
        return number_format((float) $n);
    }
}

if (! function_exists('split_list')) {
    /** @return string[] */
    function split_list(?string $s): array
    {
        return array_values(array_filter(array_map('trim', explode(',', (string) $s)), fn ($x) => $x !== ''));
    }
}

if (! function_exists('split_lines')) {
    /** @return string[] */
    function split_lines(?string $s): array
    {
        return array_values(array_filter(array_map('trim', preg_split('/\r?\n/', (string) $s)), fn ($x) => $x !== ''));
    }
}

if (! function_exists('md')) {
    function md(?string $src): string
    {
        return Markdown::render($src);
    }
}

if (! function_exists('slugify')) {
    function slugify(?string $s): string
    {
        return Str::limit(Str::slug((string) $s), 80, '');
    }
}

if (! function_exists('read_minutes')) {
    function read_minutes(?string $body): int
    {
        return max(1, (int) round(str_word_count(strip_tags((string) $body)) / 200));
    }
}

if (! function_exists('initials')) {
    function initials(?string $name): string
    {
        $words = preg_split('/\s+/', trim((string) $name)) ?: [];

        return strtoupper(implode('', array_map(fn ($w) => mb_substr($w, 0, 1), array_slice(array_filter($words), 0, 2))));
    }
}

if (! function_exists('icon_choices')) {
    /** @return string[] */
    function icon_choices(): array
    {
        return ['i-plane', 'i-pin', 'i-bag', 'i-route', 'i-moon', 'i-users', 'i-clock', 'i-calendar', 'i-bus', 'i-car', 'i-shield',
            'i-wheel', 'i-star', 'i-globe', 'i-whats', 'i-phone', 'i-mail', 'i-ac', 'i-wifi', 'i-seat', 'i-map', 'i-layers', 'i-check'];
    }
}

if (! function_exists('grid_class')) {
    /** 3 columns when the count divides evenly by 3 (but not 4), otherwise 4. */
    function grid_class(int $count): string
    {
        return ($count % 3 === 0 && $count % 4 !== 0) ? 'g-3' : 'g-4';
    }
}
