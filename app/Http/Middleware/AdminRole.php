<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/** Only administrators (not editors) may manage settings and users. */
class AdminRole
{
    public function handle(Request $request, Closure $next)
    {
        if (! $request->user()?->isAdmin()) {
            return redirect('/admin')->with('error', 'Only administrators can open that page.');
        }

        return $next($request);
    }
}
