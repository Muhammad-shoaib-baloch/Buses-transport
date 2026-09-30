<?php

namespace App\Support;

use App\Models\Setting;

class Settings
{
    private static ?array $cache = null;

    /** Deep merge: associative arrays merge recursively; lists and scalars replace. */
    public static function merge(mixed $base, mixed $over): mixed
    {
        if (! is_array($base) || ! is_array($over) || array_is_list($base) || array_is_list($over)) {
            return $over ?? $base;
        }
        foreach ($over as $k => $v) {
            $base[$k] = array_key_exists($k, $base) ? self::merge($base[$k], $v) : $v;
        }

        return $base;
    }

    public static function all(): array
    {
        if (self::$cache !== null) {
            return self::$cache;
        }
        $defaults = SettingsDefaults::all();
        try {
            $rows = Setting::query()->pluck('value', 'key');
        } catch (\Throwable) {
            $rows = collect(); // not installed yet
        }
        foreach ($defaults as $group => $values) {
            $stored = $rows[$group] ?? null;
            $decoded = $stored ? json_decode($stored, true) : null;
            if (is_array($decoded)) {
                $defaults[$group] = self::merge($values, $decoded);
            }
        }

        return self::$cache = $defaults;
    }

    public static function group(string $group): array
    {
        return self::all()[$group] ?? [];
    }

    public static function saveGroup(string $group, array $values): array
    {
        $merged = self::merge(SettingsDefaults::all()[$group], $values);
        Setting::updateOrCreate(['key' => $group], ['value' => json_encode($merged, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)]);
        self::$cache = null;

        return $merged;
    }

    public static function forget(): void
    {
        self::$cache = null;
    }

    /** Absolute base URL for canonical links and sitemaps. */
    public static function siteUrl(): string
    {
        $u = trim((string) (self::group('general')['siteUrl'] ?? '')) ?: (string) config('app.url');

        return rtrim($u, '/');
    }
}
