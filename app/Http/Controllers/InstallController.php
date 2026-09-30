<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * One-time web installer for shared hosting without SSH:
 *   https://yoursite.com/install?key=SETUP_KEY  → creates the tables and loads the content.
 * Locked after the first successful run (storage/app/installed.lock), or as soon
 * as it sees a database that was imported from the .sql file.
 */
class InstallController extends Controller
{
    private function lockFile(): string
    {
        return storage_path('app/installed.lock');
    }

    /** Locked, or the database was imported from the .sql file (it already has an admin). */
    private function installed(): bool
    {
        if (is_file($this->lockFile())) {
            return true;
        }
        try {
            if (Schema::hasTable('users') && DB::table('users')->exists()) {
                @file_put_contents($this->lockFile(), now()->toIso8601String());

                return true;
            }
        } catch (\Throwable) {
            // no database connection yet — show() explains it
        }

        return false;
    }

    private function keyOk(Request $r): bool
    {
        $key = (string) env('SETUP_KEY', '');

        return strlen($key) >= 12 && hash_equals($key, (string) $r->input('key', ''));
    }

    private function page(string $title, string $body, int $status = 200)
    {
        $html = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex">'
            .'<title>'.e($title).'</title><style>body{font-family:system-ui,sans-serif;background:#F6F7FB;color:#0C1220;display:grid;place-items:center;min-height:100vh;margin:0;padding:20px}'
            .'.c{background:#fff;border:1px solid rgba(10,14,23,.1);border-radius:20px;padding:30px;max-width:520px;width:100%;box-shadow:0 30px 60px -30px rgba(12,18,32,.3)}'
            .'h1{font-size:22px;margin:0 0 10px}p,li{color:#3F4A5F;line-height:1.6;font-size:14px}.ok{color:#12794E}.bad{color:#B3261E}'
            .'button,a.b{display:inline-block;background:linear-gradient(135deg,#C9391F,#9A2317);color:#fff;border:0;border-radius:100px;padding:12px 22px;font-weight:600;font-size:14px;cursor:pointer;text-decoration:none}'
            .'code{background:#F2F4F9;padding:2px 6px;border-radius:5px}</style></head><body><div class="c"><h1>'.e($title).'</h1>'.$body.'</div></body></html>';

        return response($html, $status);
    }

    public function show(Request $r)
    {
        if ($this->installed()) {
            return $this->page('Already installed', '<p>This website is installed. The installer is locked.</p><p><a class="b" href="/admin/login">Go to the dashboard</a></p>');
        }
        if (! $this->keyOk($r)) {
            return $this->page('Installer', '<p class="bad">Open this page with the correct key: <code>/install?key=YOUR_SETUP_KEY</code> (the SETUP_KEY value in your .env file).</p>', 403);
        }
        try {
            DB::connection()->getPdo();
            $db = '<p class="ok">✔ Connected to the database <code>'.e(DB::connection()->getDatabaseName()).'</code>.</p>';
            $ready = true;
        } catch (\Throwable $e) {
            $db = '<p class="bad">✘ Cannot connect to the database. Check DB_HOST, DB_DATABASE, DB_USERNAME and DB_PASSWORD in .env.</p><p><code>'.e($e->getMessage()).'</code></p>';
            $ready = false;
        }
        $admin = env('ADMIN_EMAIL') && strlen((string) env('ADMIN_PASSWORD')) >= 8
            ? '<p class="ok">✔ Admin login will be created for <code>'.e(env('ADMIN_EMAIL')).'</code>.</p>'
            : '<p class="bad">✘ Set ADMIN_EMAIL and ADMIN_PASSWORD (8+ characters) in .env first.</p>';
        $form = $ready ? '<form method="post" action="/install">'.csrf_field().'<input type="hidden" name="key" value="'.e($r->input('key')).'"><button type="submit">Install now</button></form>' : '';

        return $this->page('Install Buses Transport UAE', $db.$admin.'<p>This creates the database tables and loads the services, fleet, FAQs, coverage and blog content.</p>'.$form);
    }

    public function run(Request $r)
    {
        if ($this->installed() || ! $this->keyOk($r)) {
            return redirect('/install');
        }
        @set_time_limit(300);
        try {
            Artisan::call('migrate', ['--force' => true]);
            Artisan::call('db:seed', ['--force' => true]);
        } catch (\Throwable $e) {
            return $this->page('Installation failed', '<p class="bad">'.e($e->getMessage()).'</p><p>Fix the problem and reload this page.</p>', 500);
        }
        @file_put_contents($this->lockFile(), now()->toIso8601String());

        return $this->page('Installed ✔', '<p class="ok">The database is ready and the content is loaded.</p><p>Sign in with the ADMIN_EMAIL / ADMIN_PASSWORD from your .env file, then change the password under <b>My account</b>. You can also remove ADMIN_PASSWORD from .env now.</p><p><a class="b" href="/admin/login">Open the dashboard</a></p>');
    }
}
