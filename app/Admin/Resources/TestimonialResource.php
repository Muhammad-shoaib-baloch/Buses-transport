<?php

namespace App\Admin\Resources;

use App\Admin\Resource;
use App\Models\Activity;
use App\Models\Testimonial;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class TestimonialResource extends Resource
{
    public string $key = 'testimonials';
    public string $title = 'Testimonials';
    public string $entity = 'Testimonial';
    public ?string $hint = 'Only add genuine reviews you have permission to publish.';

    public function rows(): Collection
    {
        return Testimonial::orderBy('order')->orderBy('id')->get();
    }

    public function find(int $id): ?Model
    {
        return Testimonial::find($id);
    }

    public function fields(?Model $row): array
    {
        return [
            ['k' => 'quote', 'label' => 'What the client said', 'type' => 'textarea'],
            ['k' => 'name', 'label' => 'Client name', 'type' => 'text', 'help' => 'or role, e.g. “Travel manager”'],
            ['k' => 'role', 'label' => 'Company / context', 'type' => 'text', 'help' => 'e.g. Hotel group, Dubai'],
            ['k' => 'avatar', 'label' => 'Initials', 'type' => 'text', 'help' => 'auto from name when empty'],
            ['k' => 'rating', 'label' => 'Stars', 'type' => 'select', 'options' => array_map(fn ($n) => [$n, $n.' star'.($n > 1 ? 's' : '')], [5, 4, 3, 2, 1])],
            ['k' => 'stat', 'label' => 'Highlight number', 'type' => 'text', 'help' => 'optional, e.g. 300'],
            ['k' => 'stat_label', 'label' => 'Highlight label', 'type' => 'text', 'help' => 'e.g. Guests moved'],
            ['k' => 'order', 'label' => 'Order', 'type' => 'number'],
            ['k' => 'active', 'label' => 'Visible', 'type' => 'toggle', 'help' => 'Show on the homepage'],
        ];
    }

    public function columns(): array
    {
        return [
            ['Client', fn ($t) => '<div class="t-title" style="min-width:200px"><span style="width:34px;height:34px;border-radius:50%;background:var(--grad-brand);color:#fff;display:grid;place-items:center;font-weight:700;font-size:12px;flex:none">'.e($t->avatar ?: initials($t->name)).'</span><span><b>'.e($t->name).'</b><span>'.e($t->role).'</span></span></div>'],
            ['Quote', fn ($t) => '<span class="muted">'.e(Str::limit($t->quote, 90)).'</span>'],
            ['Stars', fn ($t) => str_repeat('★', (int) $t->rating), 'num'],
            ['Status', fn ($t) => self::pill($t->active)],
        ];
    }

    public function searchText(Model $t): string
    {
        return $t->name.' '.$t->role.' '.$t->quote;
    }

    public function values(Model $t): array
    {
        return $t->only(['quote', 'name', 'role', 'avatar', 'rating', 'stat', 'stat_label', 'order', 'active']);
    }

    public function blank(): array
    {
        return ['rating' => 5, 'order' => Testimonial::count() + 1, 'active' => true];
    }

    public function save(Request $r, ?Model $row): Model
    {
        $quote = trim($this->text($r, 'quote', 1500));
        $name = $this->str($r, 'name', 120);
        if ($quote === '' || $name === '') {
            throw new \RuntimeException('Add the quote and the client name.');
        }
        $row = $this->persist(Testimonial::class, $row, [
            'quote' => $quote, 'name' => $name, 'role' => $this->str($r, 'role', 160),
            'avatar' => strtoupper($this->str($r, 'avatar', 3) ?: initials($name)), 'stat' => $this->str($r, 'stat', 20),
            'stat_label' => $this->str($r, 'stat_label', 40), 'rating' => min(5, max(0, $this->int($r, 'rating', 5))),
            'order' => $this->int($r, 'order'), 'active' => $this->bool($r, 'active'),
        ]);
        Activity::log(($row->wasRecentlyCreated ? 'Added' : 'Updated').' testimonial from <b>'.e($row->name).'</b>', 'i-quote');

        return $row;
    }
}
