<?php

namespace App\Admin\Resources;

use App\Admin\Resource;
use App\Models\Activity;
use App\Models\FleetCategory;
use App\Models\Service;
use App\Models\Vehicle;
use App\Support\Art;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class VehicleResource extends Resource
{
    public string $key = 'vehicles';
    public string $title = 'Vehicles';
    public string $entity = 'Vehicle';
    public bool $wide = true;

    public function rows(): Collection
    {
        return Vehicle::with('category')
            ->leftJoin('fleet_categories', 'fleet_categories.id', '=', 'vehicles.fleet_category_id')
            ->orderByRaw('COALESCE(fleet_categories.`order`, 999)')->orderBy('vehicles.capacity')->orderBy('vehicles.order')
            ->select('vehicles.*')->get();
    }

    public function find(int $id): ?Model
    {
        return Vehicle::with('services:id')->find($id);
    }

    public function fields(?Model $row): array
    {
        return array_merge([
            ['type' => 'section', 'title' => 'Vehicle'],
            ['k' => 'name', 'label' => 'Vehicle name', 'type' => 'text'],
            ['k' => 'slug', 'label' => 'URL slug', 'type' => 'slug', 'from' => 'name', 'help' => '/fleet/…'],
            ['k' => 'fleet_category_id', 'label' => 'Category', 'type' => 'select', 'options' => array_merge([['', '— none —']], FleetCategory::orderBy('order')->get()->map(fn ($c) => [$c->id, $c->name])->all())],
            ['k' => 'class_label', 'label' => 'Class label', 'type' => 'text', 'help' => 'e.g. Luxury MPV'],
            ['k' => 'seats_label', 'label' => 'Seats label', 'type' => 'text', 'help' => 'e.g. 6–7 seats'],
            ['k' => 'capacity', 'label' => 'Max passengers', 'type' => 'number', 'help' => 'used for sorting'],
            ['k' => 'driver_option', 'label' => 'Driver option', 'type' => 'select', 'options' => [['chauffeur', 'Chauffeur-driven only'], ['either', 'With or without driver (self-drive)']]],
            ['k' => 'order', 'label' => 'Order', 'type' => 'number', 'help' => 'homepage & menu order'],
            ['k' => 'active', 'label' => 'Visible on website', 'type' => 'toggle', 'help' => 'Show this vehicle on the website'],
            ['k' => 'featured', 'label' => 'Homepage & menu', 'type' => 'toggle', 'help' => 'Show in the homepage fleet slider and the Fleet menu'],
            ['k' => 'images', 'label' => 'Photos', 'type' => 'images', 'help' => 'the first photo is the cover'],
            ['k' => 'alt', 'label' => 'Photo description (alt text)', 'type' => 'text', 'full' => true],
            ['k' => 'description', 'label' => 'Card description', 'type' => 'textarea'],
            ['k' => 'tags', 'label' => 'Tags', 'type' => 'text', 'help' => 'comma separated, e.g. VIP transfer, Airport transfer', 'full' => true],
            ['k' => 'luggage', 'label' => 'Luggage', 'type' => 'text', 'help' => 'e.g. 5 large cases'],
            ['k' => 'best_for', 'label' => 'Best for', 'type' => 'text'],
            ['k' => 'features', 'label' => 'Features list', 'type' => 'textarea', 'help' => 'one per line, shown on the vehicle page'],
            ['k' => 'body', 'label' => 'Vehicle page content', 'type' => 'markdown', 'help' => 'optional'],
            ['k' => 'service_ids', 'label' => 'Popular for (services)', 'type' => 'multi', 'options' => Service::orderBy('order')->get(['id', 'name'])->map(fn ($s) => [$s->id, $s->name])->all()],
        ], self::seoFields('Leave empty for automatic “{Vehicle} Rental Dubai” titles.'));
    }

    private static function thumb(Vehicle $v): string
    {
        return $v->cover() ? '<img src="'.e($v->cover()).'" alt="">' : Art::vehicle($v->slug, (int) $v->capacity, $v->name);
    }

    public function columns(): array
    {
        return [
            ['Vehicle', function (Vehicle $v) {
                $n = count($v->imageList());

                return '<div class="t-title"><span class="t-thumb">'.self::thumb($v).'</span><span><b>'.e($v->name).'</b><span>'.$n.' photo'.($n === 1 ? '' : 's').' · /fleet/'.e($v->slug).'</span></span></div>';
            }],
            ['Category', fn (Vehicle $v) => e($v->category->name ?? '—')],
            ['Capacity', fn (Vehicle $v) => e($v->seats_label), 'num'],
            ['Driver', fn (Vehicle $v) => $v->selfDrive() ? 'With / without' : 'Chauffeur only'],
            ['Status', fn (Vehicle $v) => self::pill($v->active, $v->featured ? 'Visible · home' : 'Visible')],
        ];
    }

    public function filters(): array
    {
        return [
            ['home', 'On homepage', fn ($v) => $v->featured],
            ['self', 'Self-drive', fn ($v) => $v->selfDrive()],
            ['nophoto', 'Needs photos', fn ($v) => count($v->imageList()) === 0],
            ['off', 'Hidden', fn ($v) => ! $v->active],
        ];
    }

    public function searchText(Model $v): string
    {
        return $v->name.' '.$v->class_label.' '.($v->category->name ?? '').' '.$v->tags;
    }

    public function viewUrl(Model $v): ?string
    {
        return $v->active ? '/fleet/'.$v->slug : null;
    }

    public function values(Model $v): array
    {
        return [
            'name' => $v->name, 'slug' => $v->slug, 'fleet_category_id' => $v->fleet_category_id, 'class_label' => $v->class_label,
            'seats_label' => $v->seats_label, 'capacity' => $v->capacity, 'driver_option' => $v->driver_option, 'order' => $v->order,
            'active' => $v->active, 'featured' => $v->featured, 'images' => $v->imageList(), 'alt' => $v->alt, 'description' => $v->description ?? '',
            'tags' => $v->tags ?? '', 'luggage' => $v->luggage, 'best_for' => $v->best_for, 'features' => $v->features ?? '', 'body' => $v->body ?? '',
            'service_ids' => $v->services->pluck('id')->all(),
        ] + self::seoValues($v);
    }

    public function blank(): array
    {
        return ['capacity' => 4, 'driver_option' => 'chauffeur', 'order' => 50, 'active' => true, 'featured' => false, 'images' => [], 'service_ids' => [],
            'fleet_category_id' => FleetCategory::orderBy('order')->value('id')];
    }

    public function save(Request $r, ?Model $row): Model
    {
        $name = $this->str($r, 'name', 120);
        if ($name === '') {
            throw new \RuntimeException('Add a vehicle name.');
        }
        $cat = $this->optInt($r, 'fleet_category_id');
        $data = [
            'name' => $name, 'slug' => $this->slug($r), 'class_label' => $this->str($r, 'class_label', 60), 'seats_label' => $this->str($r, 'seats_label', 60),
            'capacity' => max(1, $this->int($r, 'capacity', 4)), 'driver_option' => $r->input('driver_option') === 'either' ? 'either' : 'chauffeur',
            'tags' => $this->str($r, 'tags', 400), 'description' => $this->str($r, 'description', 1200), 'body' => $this->text($r, 'body'),
            'luggage' => $this->str($r, 'luggage', 80), 'best_for' => $this->str($r, 'best_for', 120), 'features' => $this->text($r, 'features', 3000),
            'images' => array_slice($this->strings($r, 'images'), 0, 40), 'alt' => $this->str($r, 'alt', 200), 'order' => $this->int($r, 'order'),
            'active' => $this->bool($r, 'active'), 'featured' => $this->bool($r, 'featured'),
            'fleet_category_id' => $cat && FleetCategory::whereKey($cat)->exists() ? $cat : null,
        ] + $this->seo($r);
        $this->assertUniqueSlug(Vehicle::class, $data['slug'], $row);
        $row = $this->persist(Vehicle::class, $row, $data);
        $row->services()->sync($this->ids($r, 'service_ids'));
        Activity::log(($row->wasRecentlyCreated ? 'Added' : 'Updated').' vehicle <b>'.e($row->name).'</b>', 'i-wheel');

        return $row;
    }
}
