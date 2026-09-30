<?php

namespace App\Admin;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

/**
 * A content type managed in the dashboard: table columns, filters, the
 * editor's field schema and how submitted values are saved.
 *
 * Field schema: ['k' => key, 'label' => ..., 'type' => text|number|date|email|url|password|textarea|code|markdown|select|toggle|
 *   image|images|multi|icon|color|slug|strings|steps|kv|features|stats, 'help' => ..., 'full' => bool, 'options' => [[value, label]],
 *   'from' => source key for slug] or ['type' => 'section', 'title' => ..., 'desc' => ...]
 */
abstract class Resource
{
    public string $key;
    public string $title;
    public string $entity;
    public ?string $newLabel = null;
    public ?string $hint = null;
    public bool $wide = false;
    public bool $adminOnly = false;

    abstract public function rows(): Collection;

    abstract public function fields(?Model $row): array;

    /** @return array<int, array{0:string,1:callable,2?:string}> [label, fn($row): html, cell class] */
    abstract public function columns(): array;

    /** @return array<string, mixed> editor values for an existing row */
    abstract public function values(Model $row): array;

    abstract public function blank(): array;

    /** Validate + persist. Throw \RuntimeException with a friendly message on bad input. */
    abstract public function save(Request $r, ?Model $row): Model;

    abstract public function find(int $id): ?Model;

    /** @return array<int, array{0:string,1:string,2:callable}> [key, label, fn($row): bool] */
    public function filters(): array
    {
        return [];
    }

    public function searchText(Model $row): string
    {
        return '';
    }

    public function viewUrl(Model $row): ?string
    {
        return null;
    }

    public function label(Model $row): string
    {
        return (string) ($row->name ?? $row->title ?? $row->question ?? $this->entity);
    }

    public function delete(Model $row): void
    {
        $row->delete();
    }

    protected function assertUniqueSlug(string $model, string $slug, ?Model $row): void
    {
        if ($model::where('slug', $slug)->when($row, fn ($q) => $q->where('id', '!=', $row->id))->exists()) {
            throw new \RuntimeException('That URL slug is already used. Choose a different one.');
        }
    }

    /** Update the row, or create a new one of $model. */
    protected function persist(string $model, ?Model $row, array $data): Model
    {
        if ($row) {
            $row->update($data);

            return $row;
        }

        return $model::create($data);
    }

    /* ---------- input helpers ---------- */
    protected function str(Request $r, string $k, int $max = 500): string
    {
        return mb_substr(trim((string) $r->input($k, '')), 0, $max);
    }

    protected function text(Request $r, string $k, int $max = 100000): string
    {
        return mb_substr(str_replace("\r\n", "\n", (string) $r->input($k, '')), 0, $max);
    }

    protected function opt(Request $r, string $k, int $max = 500): ?string
    {
        $s = $this->str($r, $k, $max);

        return $s === '' ? null : $s;
    }

    protected function int(Request $r, string $k, int $def = 0): int
    {
        $v = $r->input($k);

        return is_numeric($v) ? (int) $v : $def;
    }

    protected function optInt(Request $r, string $k): ?int
    {
        $v = $r->input($k);

        return is_numeric($v) ? (int) $v : null;
    }

    protected function bool(Request $r, string $k): bool
    {
        return in_array($r->input($k), ['1', 1, true, 'true', 'on'], true);
    }

    /** @return int[] */
    protected function ids(Request $r, string $k): array
    {
        return array_values(array_filter(array_map('intval', (array) $r->input($k, [])), fn ($x) => $x > 0));
    }

    /** @return string[] */
    protected function strings(Request $r, string $k): array
    {
        return array_values(array_filter(array_map(fn ($x) => trim((string) $x), (array) $r->input($k, [])), fn ($x) => $x !== ''));
    }

    protected function slug(Request $r, string $fallback = 'name'): string
    {
        $s = slugify($this->str($r, 'slug') ?: $this->str($r, $fallback));
        if ($s === '') {
            throw new \RuntimeException('Add a name (or URL slug) first.');
        }

        return $s;
    }

    protected function seo(Request $r): array
    {
        return [
            'seo_title' => $this->opt($r, 'seo_title', 200),
            'seo_description' => $this->opt($r, 'seo_description', 400),
            'seo_keywords' => $this->opt($r, 'seo_keywords', 400),
            'og_image' => $this->opt($r, 'og_image', 500),
        ];
    }

    protected static function seoFields(string $desc = 'Leave empty to use the page heading and intro.'): array
    {
        return [
            ['type' => 'section', 'title' => 'SEO & sharing', 'desc' => $desc],
            ['k' => 'seo_title', 'label' => 'Meta title', 'type' => 'text', 'full' => true],
            ['k' => 'seo_description', 'label' => 'Meta description', 'type' => 'textarea'],
            ['k' => 'seo_keywords', 'label' => 'Meta keywords', 'type' => 'text', 'full' => true],
            ['k' => 'og_image', 'label' => 'Social share image', 'type' => 'image'],
        ];
    }

    protected static function seoValues(Model $row): array
    {
        return [
            'seo_title' => $row->seo_title ?? '',
            'seo_description' => $row->seo_description ?? '',
            'seo_keywords' => $row->seo_keywords ?? '',
            'og_image' => $row->og_image ?? '',
        ];
    }

    protected static function pill(bool $on, string $onText = 'Visible', string $offText = 'Hidden'): string
    {
        return '<span class="pill '.($on ? 'published' : 'archived').'">'.e($on ? $onText : $offText).'</span>';
    }
}
