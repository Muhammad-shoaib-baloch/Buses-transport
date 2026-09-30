<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    protected $fillable = [
        'slug', 'title', 'subtitle', 'body', 'status', 'show_in_footer', 'order',
        'seo_title', 'seo_description', 'seo_keywords', 'og_image',
    ];

    protected function casts(): array
    {
        return ['show_in_footer' => 'boolean'];
    }
}
