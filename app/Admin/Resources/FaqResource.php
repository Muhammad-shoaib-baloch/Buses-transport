<?php

namespace App\Admin\Resources;

use App\Admin\Resource;
use App\Models\Faq;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class FaqResource extends Resource
{
    public string $key = 'faqs';
    public string $title = 'Questions';
    public string $entity = 'FAQ';
    public ?string $newLabel = 'New question';
    public ?string $hint = 'Tip: to show a question on a specific service page, open that service and tick it under “FAQs shown on this page”.';

    public function rows(): Collection
    {
        return Faq::withCount('services')->orderBy('order')->orderBy('id')->get();
    }

    public function find(int $id): ?Model
    {
        return Faq::find($id);
    }

    public function fields(?Model $row): array
    {
        return [
            ['k' => 'question', 'label' => 'Question', 'type' => 'text', 'full' => true],
            ['k' => 'answer', 'label' => 'Answer', 'type' => 'textarea'],
            ['k' => 'order', 'label' => 'Order', 'type' => 'number'],
            ['k' => 'active', 'label' => 'Visible', 'type' => 'toggle', 'help' => 'Show on the website'],
            ['k' => 'show_on_home', 'label' => 'Featured', 'type' => 'toggle', 'help' => 'Include in featured FAQ lists'],
        ];
    }

    public function columns(): array
    {
        return [
            ['Question', fn ($f) => '<div style="min-width:280px"><b style="font-weight:600">'.e($f->question).'</b><div class="muted" style="font-size:12px;margin-top:2px">'.e(Str::limit($f->answer, 110)).'</div></div>'],
            ['Service pages', fn ($f) => (string) $f->services_count, 'num'],
            ['Status', fn ($f) => self::pill($f->active)],
            ['Order', fn ($f) => (string) $f->order, 'num'],
        ];
    }

    public function searchText(Model $f): string
    {
        return $f->question.' '.$f->answer;
    }

    public function viewUrl(Model $f): ?string
    {
        return '/faq';
    }

    public function values(Model $f): array
    {
        return ['question' => $f->question, 'answer' => $f->answer, 'order' => $f->order, 'active' => $f->active, 'show_on_home' => $f->show_on_home];
    }

    public function blank(): array
    {
        return ['order' => Faq::count() + 1, 'active' => true, 'show_on_home' => true];
    }

    public function save(Request $r, ?Model $row): Model
    {
        $q = $this->str($r, 'question', 300);
        $a = trim($this->text($r, 'answer', 4000));
        if ($q === '' || $a === '') {
            throw new \RuntimeException('Add both a question and an answer.');
        }

        return $this->persist(Faq::class, $row, [
            'question' => $q, 'answer' => $a, 'order' => $this->int($r, 'order'),
            'active' => $this->bool($r, 'active'), 'show_on_home' => $this->bool($r, 'show_on_home'),
        ]);
    }
}
