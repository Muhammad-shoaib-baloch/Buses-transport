<?php

namespace App\Admin\Resources;

use App\Admin\Resource;
use App\Models\Activity;
use App\Models\Page;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class PageResource extends Resource
{
    public string $key = 'pages';
    public string $title = 'Pages';
    public string $entity = 'Page';
    public bool $wide = true;

    private const RESERVED = ['admin', 'api', 'uploads', 'images', 'assets', 'services', 'fleet', 'coverage', 'blog', 'about', 'contact', 'faq', 'install', 'sitemap', 'robots'];

    public function rows(): Collection
    {
        return Page::orderBy('order')->orderBy('id')->get();
    }

    public function find(int $id): ?Model
    {
        return Page::find($id);
    }

    public function fields(?Model $row): array
    {
        return array_merge([
            ['k' => 'title', 'label' => 'Title', 'type' => 'text'],
            ['k' => 'slug', 'label' => 'URL slug', 'type' => 'slug', 'from' => 'title', 'help' => 'yoursite.com/…'],
            ['k' => 'status', 'label' => 'Status', 'type' => 'select', 'options' => [['published', 'Published'], ['draft', 'Draft (hidden)']]],
            ['k' => 'order', 'label' => 'Order', 'type' => 'number'],
            ['k' => 'show_in_footer', 'label' => 'Footer link', 'type' => 'toggle', 'help' => 'Link this page in the footer bar'],
            ['k' => 'subtitle', 'label' => 'Intro line', 'type' => 'textarea'],
            ['k' => 'body', 'label' => 'Content', 'type' => 'markdown'],
        ], self::seoFields(''));
    }

    public function columns(): array
    {
        return [
            ['Page', fn ($p) => '<div class="t-title"><span><b>'.e($p->title).'</b><span>/'.e($p->slug).'</span></span></div>'],
            ['Status', fn ($p) => '<span class="pill '.($p->status === 'published' ? 'published' : 'draft').'">'.($p->status === 'published' ? 'Published' : 'Draft').'</span>'],
            ['Footer', fn ($p) => $p->show_in_footer ? 'Yes' : '—'],
            ['Updated', fn ($p) => e(date_fmt($p->updated_at)), 'num'],
        ];
    }

    public function searchText(Model $p): string
    {
        return $p->title.' '.$p->slug;
    }

    public function viewUrl(Model $p): ?string
    {
        return $p->status === 'published' ? '/'.$p->slug : null;
    }

    public function values(Model $p): array
    {
        return ['title' => $p->title, 'slug' => $p->slug, 'status' => $p->status, 'order' => $p->order, 'show_in_footer' => $p->show_in_footer,
            'subtitle' => $p->subtitle ?? '', 'body' => $p->body ?? ''] + self::seoValues($p);
    }

    public function blank(): array
    {
        return ['status' => 'published', 'order' => Page::count() + 1, 'show_in_footer' => false];
    }

    public function save(Request $r, ?Model $row): Model
    {
        $title = $this->str($r, 'title', 200);
        if ($title === '') {
            throw new \RuntimeException('Add a page title.');
        }
        $slug = $this->slug($r, 'title');
        if (in_array($slug, self::RESERVED, true)) {
            throw new \RuntimeException("“{$slug}” is used by the site. Pick another URL slug.");
        }
        $this->assertUniqueSlug(Page::class, $slug, $row);
        $row = $this->persist(Page::class, $row, [
            'title' => $title, 'slug' => $slug, 'subtitle' => $this->str($r, 'subtitle', 400), 'body' => $this->text($r, 'body'),
            'status' => $r->input('status') === 'draft' ? 'draft' : 'published', 'show_in_footer' => $this->bool($r, 'show_in_footer'),
            'order' => $this->int($r, 'order'),
        ] + $this->seo($r));
        Activity::log(($row->wasRecentlyCreated ? 'Created' : 'Updated').' page <b>'.e($row->title).'</b>', 'i-layers');

        return $row;
    }
}
