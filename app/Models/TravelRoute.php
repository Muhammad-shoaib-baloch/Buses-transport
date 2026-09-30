<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/** A popular route (e.g. Dubai → Abu Dhabi). Named TravelRoute to avoid clashing with Laravel's Route facade. */
class TravelRoute extends Model
{
    protected $table = 'routes';

    protected $fillable = ['from', 'to', 'km', 'mins', 'note', 'order', 'active', 'show_in_ticker'];

    protected function casts(): array
    {
        return ['active' => 'boolean', 'show_in_ticker' => 'boolean', 'km' => 'integer', 'mins' => 'integer'];
    }
}
