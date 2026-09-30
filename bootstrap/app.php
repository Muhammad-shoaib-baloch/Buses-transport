<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Public JSON endpoints (quote form, article views) check the Origin header instead.
        $middleware->validateCsrfTokens(except: ['api/*']);
        $middleware->redirectGuestsTo('/admin/login');
        $middleware->redirectUsersTo('/admin');
        $middleware->alias([
            'admin.role' => \App\Http\Middleware\AdminRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Public 404s render inside the site design.
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e, \Illuminate\Http\Request $request) {
            if (! $request->is('admin', 'admin/*', 'api/*') && ! $request->expectsJson()) {
                try {
                    return app(\App\Http\Controllers\SiteController::class)->notFound();
                } catch (\Throwable) {
                    return null; // fall back to the default page (e.g. before installation)
                }
            }
        });
    })->create();
