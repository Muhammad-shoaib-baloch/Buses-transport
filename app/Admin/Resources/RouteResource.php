<?php

namespace App\Admin\Resources;

use App\Admin\Resource;
use App\Models\TravelRoute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class RouteResource extends Resource
{
    public string $key = 'routes';
    public string $title = 'Popular routes';
    public string $entity = 'Route';

    public function rows(): Collection
    {
        return TravelRoute::orderBy('order')->orderBy('id')->get();
    }

    public function find(int $id): ?Model
    {
        return TravelRoute::find($id);
    }

    public function fields(?Model $row): array
    {
        return [
            ['k' => 'from', 'label' => 'From', 'type' => 'text'],
            ['k' => 'to', 'label' => 'To', 'type' => 'text'],
            ['k' => 'km', 'label' => 'Distance (km)', 'type' => 'number', 'help' => 'approximate'],
            ['k' => 'mins', 'label' => 'Drive time (minutes)', 'type' => 'number', 'help' => 'approximate'],
            ['k' => 'note', 'label' => 'Note', 'type' => 'text', 'full' => true, 'help' => 'e.g. Approx. via E11'],
            ['k' => 'order', 'label' => 'Order', 'type' => 'number'],
            ['k' => 'show_in_ticker', 'label' => 'Ticker', 'type' => 'toggle', 'help' => 'Show in the scrolling ticker under the hero'],
            ['k' => 'active', 'label' => 'Visible', 'type' => 'toggle', 'help' => 'Show on the website'],
        ];
    }

    public function columns(): array
    {
        return [
            ['Route', fn ($x) => '<b style="font-weight:600">'.e($x->from.' → '.$x->to).'</b>'],
            ['Distance', fn ($x) => $x->km ? $x->km.' km' : '—', 'num'],
            ['Time', fn ($x) => $x->mins ? mins($x->mins) : '—', 'num'],
            ['Ticker', fn ($x) => $x->show_in_ticker ? 'Yes' : '—'],
            ['Status', fn ($x) => self::pill($x->active)],
        ];
    }

    public function searchText(Model $x): string
    {
        return $x->from.' '.$x->to.' '.$x->note;
    }

    public function label(Model $x): string
    {
        return $x->from.' → '.$x->to;
    }

    public function values(Model $x): array
    {
        return $x->only(['from', 'to', 'km', 'mins', 'note', 'order', 'show_in_ticker', 'active']);
    }

    public function blank(): array
    {
        return ['from' => 'Dubai', 'order' => TravelRoute::count() + 1, 'show_in_ticker' => true, 'active' => true];
    }

    public function save(Request $r, ?Model $row): Model
    {
        $from = $this->str($r, 'from', 80);
        $to = $this->str($r, 'to', 80);
        if ($from === '' || $to === '') {
            throw new \RuntimeException('Add where the route starts and ends.');
        }

        return $this->persist(TravelRoute::class, $row, [
            'from' => $from, 'to' => $to, 'km' => $this->optInt($r, 'km'), 'mins' => $this->optInt($r, 'mins'), 'note' => $this->str($r, 'note', 120),
            'order' => $this->int($r, 'order'), 'show_in_ticker' => $this->bool($r, 'show_in_ticker'), 'active' => $this->bool($r, 'active'),
        ]);
    }
}
