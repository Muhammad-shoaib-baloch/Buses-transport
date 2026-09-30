<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = ['quote', 'name', 'role', 'avatar', 'stat', 'stat_label', 'rating', 'order', 'active'];

    protected function casts(): array
    {
        return ['active' => 'boolean', 'rating' => 'integer'];
    }
}
