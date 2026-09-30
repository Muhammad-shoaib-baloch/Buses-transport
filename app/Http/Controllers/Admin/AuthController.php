<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;

class AuthController extends Controller
{
    public function show()
    {
        return view('admin.login');
    }

    public function login(Request $r)
    {
        $key = 'login:'.$r->ip();
        if (RateLimiter::tooManyAttempts($key, 10)) {
            return back()->withInput($r->only('email'))->with('error', 'Too many attempts. Wait 15 minutes and try again.');
        }
        $email = strtolower(trim((string) $r->input('email')));
        $password = (string) $r->input('password');
        if ($email === '' || $password === '') {
            return back()->withInput($r->only('email'))->with('error', 'Enter your email and password.');
        }
        if (! Auth::attempt(['email' => $email, 'password' => $password, 'active' => true], true)) {
            RateLimiter::hit($key, 900);

            return back()->withInput($r->only('email'))->with('error', 'That email and password do not match.');
        }
        RateLimiter::clear($key);
        $r->session()->regenerate();
        $u = Auth::user();
        $u->forceFill(['last_login_at' => now()])->save();
        Activity::log('<b>'.e($u->name).'</b> signed in to the dashboard', 'i-user', $u->name);

        return redirect()->intended('/admin');
    }

    public function logout(Request $r)
    {
        Auth::logout();
        $r->session()->invalidate();
        $r->session()->regenerateToken();

        return redirect('/admin/login');
    }
}
