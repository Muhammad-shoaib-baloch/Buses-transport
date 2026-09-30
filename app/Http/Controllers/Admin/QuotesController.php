<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\QuoteRequest;
use App\Support\Settings;
use Illuminate\Http\Request;

class QuotesController extends Controller
{
    public function index(Request $r)
    {
        $status = (string) $r->query('status', 'all');
        $q = trim((string) $r->query('q', ''));
        $all = QuoteRequest::latest()->take(3000)->get();
        $counts = ['all' => $all->count()] + collect(QuoteRequest::STATUSES)->mapWithKeys(fn ($st) => [$st => $all->where('status', $st)->count()])->all();
        $open = $r->query('open') ? QuoteRequest::find((int) $r->query('open')) : null;

        return view('admin.quotes', [
            'quotes' => $all,
            'counts' => $counts,
            'status' => $status,
            'q' => $q,
            'open' => $open,
            'siteName' => Settings::group('general')['siteName'],
        ]);
    }

    public function update(Request $r, QuoteRequest $quote)
    {
        $data = [];
        if ($r->has('status')) {
            abort_unless(in_array($r->input('status'), QuoteRequest::STATUSES, true), 422);
            $data['status'] = $r->input('status');
        }
        if ($r->has('notes')) {
            $data['notes'] = mb_substr((string) $r->input('notes'), 0, 5000);
        }
        $quote->update($data);
        if (isset($data['status'])) {
            Activity::log('Quote <b>'.e($quote->ref).'</b> marked <b>'.e($data['status']).'</b>', 'i-inbox');
        }
        if ($r->expectsJson()) {
            return response()->json(['ok' => true]);
        }
        $back = '/admin/quotes'.($r->input('stay') ? '?open='.$quote->id : '');

        return redirect($back)->with('status', isset($data['notes']) ? 'Notes saved.' : $quote->ref.' marked '.($data['status'] ?? '').'.');
    }

    public function destroy(QuoteRequest $quote)
    {
        $ref = $quote->ref;
        $quote->delete();
        Activity::log('Deleted quote request <b>'.e($ref).'</b>', 'i-trash');

        return redirect('/admin/quotes')->with('status', $ref.' deleted.');
    }

    public function export(Request $r)
    {
        $status = (string) $r->query('status', 'all');
        $rows = QuoteRequest::when($status !== 'all', fn ($q) => $q->where('status', $status))->latest()->get();
        $cols = ['ref', 'created_at', 'status', 'name', 'phone', 'email', 'company', 'service', 'vehicle', 'pickup', 'dropoff', 'date', 'time', 'passengers', 'driver_option', 'message', 'notes', 'source', 'page_url'];
        $cell = function ($v) {
            $s = (string) $v;
            if (preg_match('/^[=+\-@]/', $s)) {
                $s = "'".$s; // neutralise spreadsheet formulas
            }

            return '"'.str_replace('"', '""', $s).'"';
        };
        $csv = "\xEF\xBB\xBF".implode(',', $cols)."\r\n";
        foreach ($rows as $row) {
            $csv .= implode(',', array_map(fn ($c) => $cell($row->{$c}), $cols))."\r\n";
        }

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=utf-8',
            'Content-Disposition' => 'attachment; filename="quote-requests-'.now()->format('Y-m-d').'.csv"',
            'Cache-Control' => 'no-store',
        ]);
    }
}
