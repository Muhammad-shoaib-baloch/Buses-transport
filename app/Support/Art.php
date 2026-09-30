<?php

namespace App\Support;

/**
 * Generated artwork: blog covers and a placeholder for vehicles that do not
 * have a photo yet. Deterministic per seed.
 */
class Art
{
    public const THEMES = [
        'ember' => ['#9A2315', '#2A0A06', '#E0705A'],
        'dusk' => ['#B22D1D', '#2A1008', '#F09C84'],
        'azure' => ['#2360A8', '#0C1A2B', '#7FB4EA'],
        'steel' => ['#35566F', '#111A21', '#A3C6DC'],
        'night' => ['#2A3138', '#12161A', '#8A98A3'],
    ];

    private static function hashOf(string $seed): int
    {
        $h = 0;
        $len = strlen($seed);
        for ($i = 0; $i < $len; $i++) {
            $h = ($h * 31 + ord($seed[$i])) & 0xFFFFFFFF;
        }

        return $h;
    }

    public static function cover(string $seed, ?string $theme): string
    {
        $p = self::THEMES[$theme] ?? self::THEMES['ember'];
        $h = self::hashOf($seed);
        $id = 'cg'.($h % 99991);
        $rnd = function (int $n) use (&$h): int {
            $h = ($h * 1664525 + 1013904223) & 0xFFFFFFFF;

            return $h % $n;
        };
        $bars = '';
        $dots = '';
        for ($i = 0; $i < 5; $i++) {
            $bx = 26 + $i * 68;
            $bh = 20 + $rnd(78);
            $bars .= sprintf('<rect x="%d" y="%d" width="%d" height="%d" rx="3" fill="%s" opacity="%.2f"/>', $bx, 170 - $bh, 18 + $rnd(20), $bh, $p[2], 0.1 + $i * 0.045);
        }
        for ($i = 0; $i < 16; $i++) {
            $dots .= sprintf('<circle cx="%d" cy="%d" r="%d" fill="%s" opacity="%.2f"/>', 12 + $rnd(376), 10 + $rnd(90), 1 + $rnd(2), $p[2], 0.2 + $rnd(50) / 100);
        }
        $hills = sprintf('<path d="M0 148 q60 -%d 122 -6 q70 -%d 150 4 q70 %d 128 -10 v54 H0 z" fill="%s" opacity=".14"/>', 24 + $rnd(26), 18 + $rnd(30), 10 + $rnd(16), $p[2]);
        $ry = 128 + $rnd(14);
        $circle = sprintf('<circle cx="%d" cy="%d" r="%d" fill="%s" opacity=".2"/>', 300 + $rnd(60), 34 + $rnd(24), 26 + $rnd(16), $p[2]);
        $tag = sprintf('<rect x="%d" y="%d" width="86" height="24" rx="6" fill="#fff" opacity=".9"/>', 40 + $rnd(180), $ry - 26);
        $tag2 = sprintf('<rect x="%d" y="%d" width="60" height="9" rx="2" fill="%s" opacity=".55"/>', 46 + $rnd(180), $ry - 21, $p[1]);

        return '<svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">'
            .'<defs><linearGradient id="'.$id.'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'.$p[0].'"/><stop offset="1" stop-color="'.$p[1].'"/></linearGradient></defs>'
            .'<rect width="400" height="200" fill="url(#'.$id.')"/>'.$circle.$dots.$bars.$hills
            .'<path d="M0 '.$ry.' H400" stroke="'.$p[2].'" stroke-width="2" opacity=".5"/>'
            .'<path d="M0 '.($ry + 14).' H400" stroke="#fff" stroke-width="1.5" stroke-dasharray="16 14" opacity=".28"/>'
            .$tag.$tag2.'</svg>';
    }

    /** Side-profile silhouette sized to the vehicle's capacity. */
    public static function vehicle(string $seed, int $capacity, string $label): string
    {
        $h = self::hashOf($seed);
        $themes = array_values(self::THEMES);
        $p = $themes[$h % count($themes)];
        $id = 'va'.($h % 99991);
        $safe = htmlspecialchars($label, ENT_QUOTES, 'UTF-8');
        if ($capacity >= 20) {
            $body = '<rect x="52" y="78" width="300" height="84" rx="14" fill="#fff" opacity=".92"/><rect x="66" y="90" width="236" height="30" rx="5" fill="'.$p[1].'" opacity=".55"/><rect x="312" y="90" width="28" height="44" rx="5" fill="'.$p[1].'" opacity=".55"/><rect x="52" y="140" width="300" height="6" fill="'.$p[0].'" opacity=".6"/><circle cx="112" cy="164" r="17" fill="'.$p[1].'"/><circle cx="112" cy="164" r="7" fill="#fff" opacity=".7"/><circle cx="300" cy="164" r="17" fill="'.$p[1].'"/><circle cx="300" cy="164" r="7" fill="#fff" opacity=".7"/>';
        } elseif ($capacity >= 8) {
            $body = '<path d="M70 158 V104 Q70 86 88 84 L262 84 Q282 84 294 100 L330 130 Q342 136 342 150 V158 Z" fill="#fff" opacity=".92"/><rect x="88" y="96" width="150" height="28" rx="5" fill="'.$p[1].'" opacity=".55"/><path d="M250 96 H266 Q276 96 284 106 L302 126 H250 Z" fill="'.$p[1].'" opacity=".55"/><circle cx="120" cy="160" r="16" fill="'.$p[1].'"/><circle cx="120" cy="160" r="6.5" fill="#fff" opacity=".7"/><circle cx="296" cy="160" r="16" fill="'.$p[1].'"/><circle cx="296" cy="160" r="6.5" fill="#fff" opacity=".7"/>';
        } else {
            $body = '<path d="M64 156 V134 Q64 122 78 120 L118 116 L152 92 Q160 86 172 86 H250 Q262 86 272 94 L300 116 L330 122 Q344 126 344 140 V156 Z" fill="#fff" opacity=".92"/><path d="M160 98 H206 V118 H134 Z" fill="'.$p[1].'" opacity=".55"/><path d="M214 98 H252 Q258 98 264 104 L278 118 H214 Z" fill="'.$p[1].'" opacity=".55"/><circle cx="118" cy="158" r="16" fill="'.$p[1].'"/><circle cx="118" cy="158" r="6.5" fill="#fff" opacity=".7"/><circle cx="292" cy="158" r="16" fill="'.$p[1].'"/><circle cx="292" cy="158" r="6.5" fill="#fff" opacity=".7"/>';
        }

        return '<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" role="img" aria-label="'.$safe.'">'
            .'<defs><linearGradient id="'.$id.'" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'.$p[0].'"/><stop offset="1" stop-color="'.$p[1].'"/></linearGradient></defs>'
            .'<rect width="400" height="300" fill="url(#'.$id.')"/><circle cx="330" cy="54" r="34" fill="'.$p[2].'" opacity=".22"/>'
            .'<path d="M0 200 H400" stroke="'.$p[2].'" stroke-width="2" opacity=".45"/><path d="M0 214 H400" stroke="#fff" stroke-width="1.5" stroke-dasharray="16 14" opacity=".25"/>'
            .'<g transform="translate(0,30)">'.$body.'</g>'
            .'<text x="200" y="268" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="13" letter-spacing="2" fill="#fff" opacity=".7">PHOTO COMING SOON</text></svg>';
    }
}
