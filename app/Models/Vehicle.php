<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Vehicle extends Model
{
    protected $fillable = [
        'slug', 'name', 'class_label', 'seats_label', 'capacity', 'driver_option', 'tags', 'description', 'body', 'luggage',
        'best_for', 'features', 'images', 'alt', 'order', 'active', 'featured', 'fleet_category_id',
        'seo_title', 'seo_description', 'seo_keywords', 'og_image',
    ];

    protected function casts(): array
    {
        return ['images' => 'array', 'active' => 'boolean', 'featured' => 'boolean', 'capacity' => 'integer'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(FleetCategory::class, 'fleet_category_id');
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class);
    }

    /** @return string[] */
    public function imageList(): array
    {
        return array_values(array_filter((array) $this->images, fn ($u) => is_string($u) && $u !== ''));
    }

    public function cover(): ?string
    {
        return $this->imageList()[0] ?? null;
    }

    /** @return string[] */
    public function tagList(): array
    {
        return split_list($this->tags);
    }

    /** @return string[] */
    public function featureList(): array
    {
        return split_lines($this->features);
    }

    public function selfDrive(): bool
    {
        return $this->driver_option === 'either';
    }

    public function driverText(): string
    {
        return $this->selfDrive() ? 'With or without driver' : 'Chauffeur-driven only';
    }

    public function altText(): string
    {
        return $this->alt ?: $this->name;
    }
}
