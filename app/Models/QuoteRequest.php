<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuoteRequest extends Model
{
    public const STATUSES = ['new', 'contacted', 'quoted', 'confirmed', 'closed', 'spam'];

    protected $fillable = [
        'ref', 'name', 'phone', 'email', 'company', 'service', 'vehicle', 'pickup', 'dropoff', 'date', 'time', 'passengers',
        'driver_option', 'message', 'source', 'page_url', 'status', 'notes', 'ip', 'user_agent',
    ];

    /** @return array<int, array{0:string,1:string}> */
    public function lines(bool $withRef = true): array
    {
        $rows = [
            ['Reference', $this->ref], ['Name', $this->name], ['Phone / WhatsApp', $this->phone], ['Email', $this->email],
            ['Company', $this->company], ['Service', $this->service], ['Vehicle', $this->vehicle], ['Pick-up', $this->pickup],
            ['Drop-off', $this->dropoff], ['Date', $this->date], ['Time', $this->time], ['Passengers', $this->passengers],
            ['Driver', $this->driver_option], ['Details', $this->message],
        ];

        return array_values(array_filter($rows, fn ($r) => trim((string) $r[1]) !== '' && ($withRef || $r[0] !== 'Reference')));
    }
}
