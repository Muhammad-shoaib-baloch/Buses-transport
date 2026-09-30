<?php

namespace App\Admin\Resources;

use App\Admin\Resource;
use App\Models\Activity;
use App\Models\Faq;
use App\Models\Service;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class ServiceResource extends Resource
{
    public string $key = 'services';
    public string $title = 'Services';
    public string $entity = 'Service';
    public bool $wide = true;

    public function rows(): Collection
    {
        return Service::withCount('vehicles')->orderBy('order')->orderBy('id')->get();
    }

    public function find(int $id): ?Model
    {
        return Service::with(['vehicles:id', 'faqs:id'])->find($id);
    }

    public function fields(?Model $row): array
    {
        return array_merge([
            ['type' => 'section', 'title' => 'Card & menu', 'desc' => 'Shown on the homepage, the services page and the mega menu.'],
            ['k' => 'name', 'label' => 'Service name', 'type' => 'text'],
            ['k' => 'slug', 'label' => 'URL slug', 'type' => 'slug', 'from' => 'name', 'help' => '/services/…'],
            ['k' => 'meta', 'label' => 'Short line', 'type' => 'text', 'help' => 'e.g. DXB · DWC · AUH · SHJ'],
            ['k' => 'order', 'label' => 'Order', 'type' => 'number', 'help' => 'lower comes first'],
            ['k' => 'blurb', 'label' => 'Card description', 'type' => 'textarea'],
            ['k' => 'icon', 'label' => 'Icon', 'type' => 'icon'],
            ['k' => 'active', 'label' => 'Visible on website', 'type' => 'toggle', 'help' => 'Show this service on the website'],
            ['k' => 'featured', 'label' => 'Homepage', 'type' => 'toggle', 'help' => 'Show on the homepage services grid'],
            ['type' => 'section', 'title' => 'Service page'],
            ['k' => 'hero_title', 'label' => 'Page heading (H1)', 'type' => 'text', 'full' => true],
            ['k' => 'hero_sub', 'label' => 'Page intro', 'type' => 'textarea'],
            ['k' => 'image', 'label' => 'Header image', 'type' => 'image', 'help' => 'optional'],
            ['k' => 'body', 'label' => 'Main content', 'type' => 'markdown'],
            ['k' => 'included', 'label' => 'Every booking includes', 'type' => 'textarea', 'help' => 'one item per line'],
            ['k' => 'steps', 'label' => 'How it works (steps)', 'type' => 'steps'],
            ['k' => 'vehicle_ids', 'label' => 'Recommended vehicles', 'type' => 'multi', 'options' => Vehicle::orderBy('order')->get(['id', 'name'])->map(fn ($v) => [$v->id, $v->name])->all()],
            ['k' => 'faq_ids', 'label' => 'FAQs shown on this page', 'type' => 'multi', 'options' => Faq::orderBy('order')->get(['id', 'question'])->map(fn ($f) => [$f->id, $f->question])->all()],
        ], self::seoFields());
    }

    public function columns(): array
    {
        return [
            ['Service', fn (Service $s) => '<div class="t-title"><span style="width:34px;height:34px;display:grid;place-items:center;border-radius:10px;background:var(--r-wash);color:var(--r-600);flex:none">'.ic($s->icon).'</span><span><b>'.e($s->name).'</b><span>/services/'.e($s->slug).'</span></span></div>'],
            ['Short line', fn (Service $s) => e($s->meta)],
            ['Vehicles', fn (Service $s) => (string) $s->vehicles_count, 'num'],
            ['Status', fn (Service $s) => self::pill($s->active, $s->featured ? 'Visible · home' : 'Visible')],
            ['Order', fn (Service $s) => (string) $s->order, 'num'],
        ];
    }

    public function filters(): array
    {
        return [['on', 'Visible', fn ($s) => $s->active], ['off', 'Hidden', fn ($s) => ! $s->active]];
    }

    public function searchText(Model $s): string
    {
        return $s->name.' '.$s->slug.' '.$s->meta;
    }

    public function viewUrl(Model $s): ?string
    {
        return $s->active ? '/services/'.$s->slug : null;
    }

    public function values(Model $s): array
    {
        return [
            'name' => $s->name, 'slug' => $s->slug, 'meta' => $s->meta, 'order' => $s->order, 'blurb' => $s->blurb ?? '', 'icon' => $s->icon,
            'active' => $s->active, 'featured' => $s->featured, 'hero_title' => $s->hero_title, 'hero_sub' => $s->hero_sub ?? '',
            'image' => $s->image ?? '', 'body' => $s->body ?? '', 'included' => $s->included ?? '', 'steps' => $s->stepList(),
            'vehicle_ids' => $s->vehicles->pluck('id')->all(), 'faq_ids' => $s->faqs->pluck('id')->all(),
        ] + self::seoValues($s);
    }

    public function blank(): array
    {
        return ['icon' => 'i-route', 'order' => Service::count() + 1, 'active' => true, 'featured' => true, 'steps' => [], 'vehicle_ids' => [], 'faq_ids' => []];
    }

    public function save(Request $r, ?Model $row): Model
    {
        $name = $this->str($r, 'name', 120);
        if ($name === '') {
            throw new \RuntimeException('Add a service name.');
        }
        $steps = [];
        foreach ((array) $r->input('steps', []) as $st) {
            $t = trim((string) ($st['t'] ?? ''));
            if ($t !== '') {
                $steps[] = ['t' => $t, 'b' => trim((string) ($st['b'] ?? ''))];
            }
        }
        $data = [
            'name' => $name, 'slug' => $this->slug($r), 'icon' => $this->str($r, 'icon', 40) ?: 'i-route', 'meta' => $this->str($r, 'meta', 120),
            'blurb' => $this->str($r, 'blurb', 400), 'hero_title' => $this->str($r, 'hero_title', 200), 'hero_sub' => $this->str($r, 'hero_sub', 600),
            'body' => $this->text($r, 'body'), 'included' => $this->text($r, 'included', 4000), 'steps' => $steps, 'image' => $this->opt($r, 'image'),
            'order' => $this->int($r, 'order'), 'active' => $this->bool($r, 'active'), 'featured' => $this->bool($r, 'featured'),
        ] + $this->seo($r);
        $this->assertUniqueSlug(Service::class, $data['slug'], $row);
        $row = $this->persist(Service::class, $row, $data);
        $row->vehicles()->sync($this->ids($r, 'vehicle_ids'));
        $row->faqs()->sync($this->ids($r, 'faq_ids'));
        Activity::log(($row->wasRecentlyCreated ? 'Added' : 'Updated').' service <b>'.e($row->name).'</b>', 'i-route');

        return $row;
    }
}
