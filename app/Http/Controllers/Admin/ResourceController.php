<?php

namespace App\Http\Controllers\Admin;

use App\Admin\Registry;
use App\Admin\Resource;
use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** Generic list + drawer editor for every content type (see App\Admin\Resources). */
class ResourceController extends Controller
{
    private function resolve(string $key, Request $r): Resource
    {
        $res = Registry::resource($key);
        abort_unless($res, 404);
        abort_if($res->adminOnly && ! $r->user()->isAdmin(), 403, 'Only administrators can manage this.');

        return $res;
    }

    public function page(Request $r, string $section)
    {
        [$title, $sub, $keys] = Registry::SECTIONS[$section];
        abort_if($section === 'users' && ! $r->user()->isAdmin(), 403);

        [$editKey, $editId] = array_pad(explode(':', (string) $r->query('edit', ''), 2), 2, null);
        $newKey = (string) $r->query('new', '');

        $managers = [];
        foreach ($keys as $key) {
            $res = Registry::resource($key);
            $editing = null;
            if ($editKey === $key && is_numeric($editId) && ($row = $res->find((int) $editId))) {
                $editing = ['row' => $row, 'fields' => $res->fields($row), 'values' => $res->values($row)];
            } elseif ($newKey === $key) {
                $editing = ['row' => null, 'fields' => $res->fields(null), 'values' => $res->blank()];
            }
            if ($editing && $r->session()->hasOldInput()) {
                $editing['values'] = array_merge($editing['values'], $r->session()->getOldInput());
            }
            $managers[] = ['res' => $res, 'rows' => $res->rows(), 'editing' => $editing, 'section' => $section];
        }

        return view('admin.resource', compact('title', 'sub', 'managers', 'section'));
    }

    private function back(string $key): string
    {
        return '/admin/'.Registry::sectionOf($key);
    }

    public function store(Request $r, string $resource)
    {
        $res = $this->resolve($resource, $r);
        try {
            DB::transaction(fn () => $res->save($r, null));
        } catch (\RuntimeException $e) {
            return redirect($this->back($resource).'?new='.$resource)->withInput()->with('error', $e->getMessage());
        }

        return redirect($this->back($resource))->with('status', $res->entity.' saved.');
    }

    public function update(Request $r, string $resource, int $id)
    {
        $res = $this->resolve($resource, $r);
        $row = $res->find($id);
        abort_unless($row, 404);
        try {
            DB::transaction(fn () => $res->save($r, $row));
        } catch (\RuntimeException $e) {
            return redirect($this->back($resource).'?edit='.$resource.':'.$id)->withInput()->with('error', $e->getMessage());
        }

        return redirect($this->back($resource))->with('status', $res->entity.' saved.');
    }

    public function destroy(Request $r, string $resource, int $id)
    {
        $res = $this->resolve($resource, $r);
        $row = $res->find($id);
        abort_unless($row, 404);
        try {
            $label = $res->label($row);
            $res->delete($row);
            Activity::log('Deleted '.strtolower($res->entity).' <b>'.e($label).'</b>', 'i-trash');
        } catch (\RuntimeException $e) {
            return redirect($this->back($resource))->with('error', $e->getMessage());
        }

        return redirect($this->back($resource))->with('status', $res->entity.' deleted.');
    }
}
