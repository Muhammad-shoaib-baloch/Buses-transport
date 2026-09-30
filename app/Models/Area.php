<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    protected $fillable = ['name', 'code', 'note', 'badge', 'kind', 'is_hub', 'map_key', 'order', 'active'];

    protected function casts(): array
    {
        return ['is_hub' => 'boolean', 'active' => 'boolean'];
    }
}
