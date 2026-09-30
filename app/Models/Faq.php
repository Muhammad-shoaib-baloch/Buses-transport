<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Faq extends Model
{
    protected $fillable = ['question', 'answer', 'order', 'active', 'show_on_home'];

    protected function casts(): array
    {
        return ['active' => 'boolean', 'show_on_home' => 'boolean'];
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class);
    }
}
