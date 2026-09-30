<?php

namespace App\Admin\Resources;

use App\Admin\Resource;
use App\Models\Activity;
use App\Models\Post;
use App\Support\Art;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class PostResource extends Resource
{
    public string $key = 'posts';
    public string $title = 'Articles';
    public string $entity = 'Article';
    public ?string $newLabel = 'New article';
    public bool $wide = true;

    public function rows(): Collection
    {
        return Post::orderByDesc('published_at')->get();
    }

    public function find(int $id): ?Model
    {
        return Post::find($id);
    }

    private function categories(): array
    {
        return Post::query()->distinct()->pluck('category')->merge(['Transfers', 'Fleet', 'Rental', 'Tours', 'Company news'])->unique()->values()->all();
    }

    public function fields(?Model $row): array
    {
        return array_merge([
            ['k' => 'title', 'label' => 'Headline', 'type' => 'text', 'full' => true],
            ['k' => 'slug', 'label' => 'URL slug', 'type' => 'slug', 'from' => 'title', 'help' => '/blog/…'],
            ['k' => 'status', 'label' => 'Status', 'type' => 'select', 'options' => [['draft', 'Draft'], ['review', 'In review'], ['published', 'Published'], ['archived', 'Archived']]],
            ['k' => 'category', 'label' => 'Category', 'type' => 'select', 'options' => array_map(fn ($c) => [$c, $c], $this->categories())],
            ['k' => 'published_at', 'label' => 'Publish date', 'type' => 'date', 'help' => 'future date = scheduled'],
            ['k' => 'author', 'label' => 'Author', 'type' => 'text'],
            ['k' => 'tags', 'label' => 'Tags', 'type' => 'text', 'help' => 'comma separated'],
            ['k' => 'excerpt', 'label' => 'Excerpt', 'type' => 'textarea', 'help' => 'one or two sentences, shown on the blog index'],
            ['k' => 'cover_image', 'label' => 'Cover image', 'type' => 'image', 'help' => 'optional — generated artwork is used when empty'],
            ['k' => 'theme', 'label' => 'Artwork colour (when no cover image)', 'type' => 'select', 'options' => array_map(fn ($t) => [$t, ucfirst($t)], array_keys(Art::THEMES))],
            ['k' => 'body', 'label' => 'Article body', 'type' => 'markdown'],
        ], self::seoFields('Leave empty to use the headline and excerpt.'));
    }

    public function columns(): array
    {
        return [
            ['Article', fn (Post $p) => '<div class="t-title"><span class="t-thumb">'.($p->cover_image ? '<img src="'.e($p->cover_image).'" alt="">' : Art::cover('p-'.$p->slug, $p->theme)).'</span><span><b>'.e($p->title).'</b><span>/blog/'.e($p->slug).' · '.$p->read_minutes.' min</span></span></div>'],
            ['Category', fn (Post $p) => e($p->category)],
            ['Status', fn (Post $p) => '<span class="pill '.e($p->status).'">'.e(ucfirst($p->status)).'</span>'],
            ['Date', fn (Post $p) => e(date_fmt($p->published_at)), 'num'],
            ['Views', fn (Post $p) => num($p->views), 'num'],
        ];
    }

    public function filters(): array
    {
        return [
            ['published', 'Published', fn ($p) => $p->status === 'published'],
            ['draft', 'Drafts', fn ($p) => in_array($p->status, ['draft', 'review'], true)],
            ['archived', 'Archived', fn ($p) => $p->status === 'archived'],
        ];
    }

    public function searchText(Model $p): string
    {
        return $p->title.' '.$p->category.' '.$p->tags.' '.$p->author;
    }

    public function viewUrl(Model $p): ?string
    {
        return '/blog/'.$p->slug;
    }

    public function values(Model $p): array
    {
        return [
            'title' => $p->title, 'slug' => $p->slug, 'status' => $p->status, 'category' => $p->category,
            'published_at' => optional($p->published_at)->format('Y-m-d'), 'author' => $p->author, 'tags' => $p->tags ?? '',
            'excerpt' => $p->excerpt ?? '', 'cover_image' => $p->cover_image ?? '', 'theme' => $p->theme, 'body' => $p->body ?? '',
        ] + self::seoValues($p);
    }

    public function blank(): array
    {
        return ['status' => 'draft', 'category' => 'Transfers', 'author' => 'Buses Transport UAE', 'published_at' => now()->format('Y-m-d'), 'theme' => 'ember'];
    }

    public function save(Request $r, ?Model $row): Model
    {
        $title = $this->str($r, 'title', 200);
        if ($title === '') {
            throw new \RuntimeException('Give the article a headline.');
        }
        $status = in_array($r->input('status'), ['draft', 'review', 'published', 'archived'], true) ? $r->input('status') : 'draft';
        $date = $this->str($r, 'published_at', 20);
        $body = $this->text($r, 'body');
        $data = [
            'title' => $title,
            'slug' => $this->slug($r, 'title'),
            'excerpt' => $this->str($r, 'excerpt', 600),
            'body' => $body,
            'category' => $this->str($r, 'category', 60) ?: 'General',
            'tags' => $this->str($r, 'tags', 400),
            'cover_image' => $this->opt($r, 'cover_image'),
            'theme' => array_key_exists((string) $r->input('theme'), Art::THEMES) ? $r->input('theme') : 'ember',
            'author' => $this->str($r, 'author', 120),
            'status' => $status,
            'published_at' => preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) ? $date.' 09:00:00' : now(),
            'read_minutes' => read_minutes($body),
        ] + $this->seo($r);
        $this->assertUniqueSlug(Post::class, $data['slug'], $row);
        $row = $this->persist(Post::class, $row, $data);
        Activity::log(($row->wasRecentlyCreated ? 'Created' : 'Updated').' article <b>'.e($row->title).'</b> ('.e($status).')', 'i-doc');

        return $row;
    }
}
