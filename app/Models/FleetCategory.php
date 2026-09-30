<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FleetCategory extends Model
{
    protected $fillable = ['name', 'slug', 'order'];

    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }
}
