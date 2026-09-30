<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    protected $fillable = ['icon', 'text', 'user_name'];

    /** Best-effort activity feed entry. `$html` must already be escaped. */
    public static function log(string $html, string $icon = 'i-doc', ?string $user = null): void
    {
        try {
            static::create(['text' => $html, 'icon' => $icon, 'user_name' => $user ?? (auth()->user()->name ?? '')]);
        } catch (\Throwable) {
            // the feed is optional
        }
    }
}
