<?php

namespace App\Admin\Resources;

use App\Admin\Resource;
use App\Models\Area;
use App\Support\MapNodes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class AreaResource extends Resource
{
    public string $key = 'areas';
    public string $title = 'Areas served';
    public string $entity = 'Area';

    private const KIND = ['emirate' => 'Emirate / city (map)', 'airport' => 'Airport', 'area' => 'Area / neighbourhood'];

    public function rows(): Collection
    {
        return Area::orderBy('order')->orderBy('id')->get();
    }

    public function find(int $id): ?Model
    {
        return Area::find($id);
    }

    public function fields(?Model $row): array
    {
        return [
            ['k' => 'name', 'label' => 'Name', 'type' => 'text'],
            ['k' => 'kind', 'label' => 'Type', 'type' => 'select', 'options' => array_map(fn ($k, $v) => [$k, $v], array_keys(self::KIND), self::KIND)],
            ['k' => 'code', 'label' => 'Code', 'type' => 'text', 'help' => 'e.g. DXB'],
            ['k' => 'badge', 'label' => 'Badge', 'type' => 'text', 'help' => 'e.g. Head office, Covered'],
            ['k' => 'note', 'label' => 'Short note', 'type' => 'text', 'full' => true],
            ['k' => 'map_key', 'label' => 'Point on the UAE map', 'type' => 'select', 'options' => array_merge([['', '— not on map —']], array_map(fn ($k) => [$k, $k], array_keys(MapNodes::ALL)))],
            ['k' => 'order', 'label' => 'Order', 'type' => 'number'],
            ['k' => 'is_hub', 'label' => 'Highlight', 'type' => 'toggle', 'help' => 'Show as head office (red pulsing dot)'],
            ['k' => 'active', 'label' => 'Visible', 'type' => 'toggle', 'help' => 'Show on the website'],
        ];
    }

    public function columns(): array
    {
        return [
            ['Name', fn ($a) => '<div><b style="font-weight:600">'.e($a->name).'</b><div class="muted" style="font-size:12px">'.e($a->note).'</div></div>'],
            ['Type', fn ($a) => e(self::KIND[$a->kind] ?? $a->kind)],
            ['Code', fn ($a) => e($a->code), 'num'],
            ['Map', fn ($a) => $a->map_key ? ($a->is_hub ? 'Head office' : 'Yes') : '—'],
            ['Status', fn ($a) => self::pill($a->active)],
        ];
    }

    public function filters(): array
    {
        return [['emirate', 'Emirates', fn ($a) => $a->kind === 'emirate'], ['airport', 'Airports', fn ($a) => $a->kind === 'airport'], ['area', 'Areas', fn ($a) => $a->kind === 'area']];
    }

    public function searchText(Model $a): string
    {
        return $a->name.' '.$a->code.' '.$a->note;
    }

    public function viewUrl(Model $a): ?string
    {
        return '/coverage';
    }

    public function values(Model $a): array
    {
        return $a->only(['name', 'kind', 'code', 'badge', 'note', 'order', 'is_hub', 'active']) + ['map_key' => $a->map_key ?? ''];
    }

    public function blank(): array
    {
        return ['kind' => 'area', 'order' => Area::count() + 1, 'active' => true, 'is_hub' => false];
    }

    public function save(Request $r, ?Model $row): Model
    {
        $name = $this->str($r, 'name', 120);
        if ($name === '') {
            throw new \RuntimeException('Add an area name.');
        }
        $map = $this->str($r, 'map_key', 60);

        return $this->persist(Area::class, $row, [
            'name' => $name, 'kind' => array_key_exists((string) $r->input('kind'), self::KIND) ? $r->input('kind') : 'area',
            'code' => strtoupper($this->str($r, 'code', 8)), 'note' => $this->str($r, 'note', 160), 'badge' => $this->str($r, 'badge', 40),
            'map_key' => isset(MapNodes::ALL[$map]) ? $map : null, 'order' => $this->int($r, 'order'),
            'is_hub' => $this->bool($r, 'is_hub'), 'active' => $this->bool($r, 'active'),
        ]);
    }
}
