<?php

namespace App\Admin\Resources;

use App\Admin\Resource;
use App\Models\Activity;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class UserResource extends Resource
{
    public string $key = 'users';
    public string $title = 'Dashboard users';
    public string $entity = 'User';
    public bool $adminOnly = true;

    public function rows(): Collection
    {
        return User::orderBy('created_at')->get();
    }

    public function find(int $id): ?Model
    {
        return User::find($id);
    }

    public function fields(?Model $row): array
    {
        return [
            ['k' => 'name', 'label' => 'Name', 'type' => 'text'],
            ['k' => 'email', 'label' => 'Email (used to sign in)', 'type' => 'email'],
            ['k' => 'role', 'label' => 'Role', 'type' => 'select', 'options' => [['admin', 'Administrator — everything'], ['editor', 'Editor — content & quote requests']]],
            ['k' => 'password', 'label' => $row ? 'New password' : 'Password', 'type' => 'password', 'help' => $row ? 'leave empty to keep the current one' : 'at least 8 characters'],
            ['k' => 'active', 'label' => 'Access', 'type' => 'toggle', 'help' => 'Allowed to sign in'],
        ];
    }

    public function columns(): array
    {
        $me = Auth::id();

        return [
            ['User', fn ($u) => '<div><b style="font-weight:600">'.e($u->name).($u->id === $me ? ' (you)' : '').'</b><div class="muted" style="font-size:12px">'.e($u->email).'</div></div>'],
            ['Role', fn ($u) => '<span class="pill '.e($u->role).'">'.($u->role === 'admin' ? 'Administrator' : 'Editor').'</span>'],
            ['Access', fn ($u) => '<span class="pill '.($u->active ? 'active' : 'inactive').'">'.($u->active ? 'Active' : 'Disabled').'</span>'],
            ['Last sign-in', fn ($u) => $u->last_login_at ? e(datetime_fmt($u->last_login_at)) : 'Never', 'num'],
        ];
    }

    public function searchText(Model $u): string
    {
        return $u->name.' '.$u->email;
    }

    public function values(Model $u): array
    {
        return ['name' => $u->name, 'email' => $u->email, 'role' => $u->role, 'password' => '', 'active' => $u->active];
    }

    public function blank(): array
    {
        return ['role' => 'editor', 'active' => true];
    }

    public function save(Request $r, ?Model $row): Model
    {
        $name = $this->str($r, 'name', 120);
        $email = strtolower($this->str($r, 'email', 200));
        $password = (string) $r->input('password', '');
        if ($name === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new \RuntimeException('Add a name and a valid email.');
        }
        if (! $row && strlen($password) < 8) {
            throw new \RuntimeException('Set a password of at least 8 characters.');
        }
        if ($password !== '' && strlen($password) < 8) {
            throw new \RuntimeException('Passwords need at least 8 characters.');
        }
        if (User::where('email', $email)->when($row, fn ($q) => $q->where('id', '!=', $row->id))->exists()) {
            throw new \RuntimeException('Another user already has that email.');
        }
        $role = $r->input('role') === 'editor' ? 'editor' : 'admin';
        $active = $this->bool($r, 'active');
        if ($row && $row->id === Auth::id() && ($role !== 'admin' || ! $active)) {
            throw new \RuntimeException('You cannot remove your own admin access.');
        }
        $data = ['name' => $name, 'email' => $email, 'role' => $role, 'active' => $active] + ($password !== '' ? ['password' => $password] : []);
        $row = $this->persist(User::class, $row, $data);
        Activity::log(($row->wasRecentlyCreated ? 'Added' : 'Updated').' user <b>'.e($row->name).'</b>', 'i-user');

        return $row;
    }

    public function delete(Model $row): void
    {
        if ($row->id === Auth::id()) {
            throw new \RuntimeException('You cannot delete your own account.');
        }
        $row->delete();
    }
}
