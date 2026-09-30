<?php

namespace App\Support;

use App\Models\QuoteRequest;
use Illuminate\Support\Facades\Mail;

/** Email alerts through the SMTP server configured in Settings → Email alerts. */
class Notifier
{
    private static function configure(): array
    {
        $e = Settings::group('email');
        if (! $e['smtpHost'] || ! $e['smtpUser']) {
            throw new \RuntimeException('SMTP is not configured.');
        }
        config([
            'mail.mailers.site_smtp' => [
                'transport' => 'smtp',
                'scheme' => $e['smtpSecure'] ? 'smtps' : 'smtp',
                'host' => $e['smtpHost'],
                'port' => (int) ($e['smtpPort'] ?: 587),
                'username' => $e['smtpUser'],
                'password' => $e['smtpPass'],
                'timeout' => 15,
            ],
        ]);

        return $e;
    }

    public static function send(string $to, string $subject, string $html, ?string $replyTo = null): void
    {
        $e = self::configure();
        $from = $e['fromEmail'] ?: $e['smtpUser'];
        Mail::mailer('site_smtp')->html($html, function ($m) use ($to, $subject, $from, $e, $replyTo) {
            $m->to($to)->subject($subject)->from($from, $e['fromName'] ?: site('general.siteName'));
            if ($replyTo) {
                $m->replyTo($replyTo);
            }
        });
    }

    public static function newQuote(QuoteRequest $q): void
    {
        $e = Settings::group('email');
        if (! $e['notifyEnabled'] || ! $e['notifyTo']) {
            return;
        }
        $rows = '';
        foreach ($q->lines() as [$k, $v]) {
            $rows .= '<tr><td style="padding:6px 12px 6px 0;color:#66718A;white-space:nowrap;vertical-align:top">'.e($k).'</td><td style="padding:6px 0;color:#0C1220">'.nl2br(e($v)).'</td></tr>';
        }
        $html = '<div style="font-family:Arial,sans-serif;font-size:14px"><h2 style="margin:0 0 12px">New quote request</h2><table>'.$rows.'</table></div>';
        self::send($e['notifyTo'], 'New quote request '.$q->ref.' — '.$q->name.($q->service ? ' · '.$q->service : ''), $html, $q->email ?: null);
    }
}
