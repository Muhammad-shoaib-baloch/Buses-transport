<?php

namespace App\Admin\Resources;

use App\Admin\Resource;
use App\Models\FleetCategory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class CategoryResource extends Resource
{
    public string $key = 'categories';
    public string $title = 'Fleet categories';
    public string $entity = 'Category';

    public function rows(): Collection
    {
        return FleetCategory::withCount('vehicles')->orderBy('order')->get();
    }

    public function find(int $id): ?Model
    {
        return FleetCategory::find($id);
    }

    public function fields(?Model $row): array
    {
        return [
            ['k' => 'name', 'label' => 'Category name', 'type' => 'text'],
            ['k' => 'slug', 'label' => 'Slug', 'type' => 'slug', 'from' => 'name'],
            ['k' => 'order', 'label' => 'Order', 'type' => 'number'],
        ];
    }

    public function columns(): array
    {
        return [
            ['Category', fn ($c) => '<b>'.e($c->name).'</b>'],
            ['Vehicles', fn ($c) => (string) $c->vehicles_count, 'num'],
            ['Order', fn ($c) => (string) $c->order, 'num'],
        ];
    }

    public function values(Model $c): array
    {
        return ['name' => $c->name, 'slug' => $c->slug, 'order' => $c->order];
    }

    public function blank(): array
    {
        return ['order' => FleetCategory::count() + 1];
    }

    public function save(Request $r, ?Model $row): Model
    {
        $name = $this->str($r, 'name', 80);
        if ($name === '') {
            throw new \RuntimeException('Add a category name.');
        }
        $data = ['name' => $name, 'slug' => $this->slug($r), 'order' => $this->int($r, 'order')];
        $this->assertUniqueSlug(FleetCategory::class, $data['slug'], $row);

        return $this->persist(FleetCategory::class, $row, $data);
    }
}
