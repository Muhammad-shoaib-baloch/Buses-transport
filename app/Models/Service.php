<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Service extends Model
{
    protected $fillable = [
        'slug', 'name', 'icon', 'meta', 'blurb', 'hero_title', 'hero_sub', 'body', 'included', 'steps', 'image',
        'order', 'active', 'featured', 'seo_title', 'seo_description', 'seo_keywords', 'og_image',
    ];

    protected function casts(): array
    {
        return ['steps' => 'array', 'active' => 'boolean', 'featured' => 'boolean'];
    }

    public function vehicles(): BelongsToMany
    {
        return $this->belongsToMany(Vehicle::class);
    }

    public function faqs(): BelongsToMany
    {
        return $this->belongsToMany(Faq::class);
    }

    public function heroTitle(): string
    {
        return $this->hero_title ?: $this->name;
    }

    public function heroSub(): string
    {
        return $this->hero_sub ?: (string) $this->blurb;
    }

    /** @return string[] */
    public function includedList(): array
    {
        return split_lines($this->included);
    }

    /** @return array<int, array{t:string,b:string}> */
    public function stepList(): array
    {
        return array_values(array_filter((array) $this->steps, fn ($s) => is_array($s) && trim($s['t'] ?? '') !== ''));
    }
}
