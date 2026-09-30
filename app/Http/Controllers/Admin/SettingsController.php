<?php

namespace App\Http\Controllers\Admin;

use App\Admin\SettingsTabs;
use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Support\Notifier;
use App\Support\Settings;
use App\Support\SettingsDefaults;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function show(Request $r)
    {
        $tabs = SettingsTabs::all();
        $tab = array_key_exists((string) $r->query('tab'), $tabs) ? (string) $r->query('tab') : 'general';
        $values = Settings::group($tabs[$tab]['group']);
        if ($tab === 'email') {
            $values['smtpPass'] = ''; // never sent back to the browser
            $values['hasSmtpPass'] = (bool) Settings::group('email')['smtpPass'];
        }

        return view('admin.settings', compact('tabs', 'tab', 'values'));
    }

    public function save(Request $r, string $tab)
    {
        $tabs = SettingsTabs::all();
        abort_unless(isset($tabs[$tab]), 404);
        $def = $tabs[$tab];
        $group = Settings::group($def['group']);
        $defaults = SettingsDefaults::all()[$def['group']];

        foreach ($def['fields'] as $f) {
            if (($f['type'] ?? '') === 'section') {
                continue;
            }
            $k = $f['k'];
            $in = $r->input($k);
            $value = match ($f['type']) {
                'toggle' => in_array($in, ['1', 1, true, 'on'], true),
                'number' => is_numeric($in) ? $in + 0 : data_get($defaults, $k),
                'strings' => array_values(array_filter(array_map('trim', preg_split('/\r?\n/', (string) $in)), fn ($x) => $x !== '')),
                'kv' => $this->rows($in, ['label', 'value'], 'label'),
                'steps' => $this->rows($in, ['t', 'b'], 't'),
                'features' => $this->rows($in, ['icon', 'title', 'body'], 'title'),
                'stats' => array_map(fn ($s) => ['n' => (float) ($s['n'] ?? 0) + 0, 'suffix' => $s['suffix'], 'dec' => (int) ($s['dec'] ?? 0), 'label' => $s['label'], 'sub' => $s['sub']], $this->rows($in, ['n', 'suffix', 'dec', 'label', 'sub'], 'label')),
                'code', 'textarea', 'markdown' => str_replace("\r\n", "\n", (string) $in),
                default => trim((string) $in),
            };
            if ($tab === 'email' && $k === 'smtpPass' && $value === '') {
                continue; // keep the saved password
            }
            data_set($group, $k, $value);
        }

        Settings::saveGroup($def['group'], $group);
        Activity::log('Updated <b>'.e($def['label']).'</b> settings', 'i-settings');

        return redirect('/admin/settings?tab='.$tab)->with('status', 'Saved — the website is updated.');
    }

    /** @return array<int, array<string,string>> rows with a non-empty $required column */
    private function rows(mixed $in, array $cols, string $required): array
    {
        $out = [];
        foreach ((array) $in as $row) {
            if (! is_array($row)) {
                continue;
            }
            $clean = [];
            foreach ($cols as $c) {
                $clean[$c] = trim((string) ($row[$c] ?? ''));
            }
            if ($clean[$required] !== '') {
                $out[] = $clean;
            }
        }

        return $out;
    }

    public function testEmail(Request $r)
    {
        $e = Settings::group('email');
        $to = $e['notifyTo'] ?: $r->user()->email;
        try {
            Notifier::send($to, 'Test email from your website', '<p>Email notifications are working.</p>');
        } catch (\Throwable $ex) {
            return redirect('/admin/settings?tab=email')->with('error', 'Could not send: '.$ex->getMessage());
        }

        return redirect('/admin/settings?tab=email')->with('status', 'Test email sent to '.$to.'.');
    }
}
