<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    protected $fillable = [
        'slug', 'title', 'excerpt', 'body', 'category', 'tags', 'cover_image', 'theme', 'author', 'status', 'published_at',
        'read_minutes', 'views', 'seo_title', 'seo_description', 'seo_keywords', 'og_image',
    ];

    protected function casts(): array
    {
        return ['published_at' => 'datetime', 'views' => 'integer', 'read_minutes' => 'integer'];
    }

    public function scopeLive(Builder $q): Builder
    {
        return $q->where('status', 'published')->where('published_at', '<=', now());
    }

    public function isLive(): bool
    {
        return $this->status === 'published' && $this->published_at && $this->published_at->lte(now());
    }

    /** @return string[] */
    public function tagList(): array
    {
        return split_list($this->tags);
    }
}
