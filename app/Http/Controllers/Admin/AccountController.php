<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AccountController extends Controller
{
    public function show()
    {
        return view('admin.account');
    }

    public function update(Request $r)
    {
        $u = $r->user();
        $current = (string) $r->input('current');
        $next = (string) $r->input('next');
        if (strlen($next) < 8) {
            return back()->with('error', 'The new password needs at least 8 characters.');
        }
        if ($next !== (string) $r->input('confirm')) {
            return back()->with('error', 'The two new passwords do not match.');
        }
        if (! Hash::check($current, $u->password)) {
            return back()->with('error', 'Your current password is not correct.');
        }
        $u->update(['password' => $next]);
        Activity::log('<b>'.e($u->name).'</b> changed their password', 'i-lock');

        return back()->with('status', 'Password updated.');
    }
}
