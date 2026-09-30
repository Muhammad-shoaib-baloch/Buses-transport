<?php

namespace App\Support;

/** Small server-rendered SVG charts for the dashboard. */
class Charts
{
    public static function spark(array $series, bool $accent = false): string
    {
        $s = count($series) > 1 ? array_values($series) : [0, ...($series ?: [0])];
        [$w, $h, $pad] = [120, 34, 3];
        $max = max($s);
        $min = min($s);
        $span = ($max - $min) ?: 1;
        $pts = [];
        foreach ($s as $i => $v) {
            $pts[] = [$pad + $i * ($w - $pad * 2) / (count($s) - 1), $h - $pad - (($v - $min) / $span) * ($h - $pad * 2)];
        }
        $d = implode(' ', array_map(fn ($p, $i) => ($i ? 'L' : 'M').round($p[0], 1).' '.round($p[1], 1), $pts, array_keys($pts)));
        $last = end($pts);
        $c = $accent ? 'var(--c2)' : 'var(--c1)';

        return '<svg class="spark" viewBox="0 0 '.$w.' '.$h.'" preserveAspectRatio="none" aria-hidden="true">'
            .'<path d="'.$d.' L'.($w - $pad).' '.$h.' L'.$pad.' '.$h.' Z" fill="'.$c.'" opacity=".12"/>'
            .'<path d="'.$d.'" fill="none" stroke="'.$c.'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>'
            .'<path d="M'.round($last[0], 1).' '.round($last[1] - 4, 1).' V'.round($last[1] + 4, 1).'" stroke="'.$c.'" stroke-width="3" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>';
    }

    public static function tile(string $label, string $value, string $icon, string $delta, string $dir, array $series, bool $accent = false): string
    {
        $arrow = $dir === 'up' ? '▲' : ($dir === 'down' ? '▼' : '—');

        return '<div class="tile"><div class="tile-top"><span class="tile-lbl">'.e($label).'</span><span class="tile-ico">'.ic($icon).'</span></div>'
            .'<b>'.e($value).'</b><span class="tile-delta '.$dir.'">'.$arrow.' '.e($delta).'</span>'.self::spark($series, $accent).'</div>';
    }

    /** Paired monthly bars, e.g. requests vs confirmed. */
    public static function pair(array $data, array $labels, string $aria): string
    {
        [$w, $h, $L, $R, $T, $B] = [720, 190, 40, 8, 16, 26];
        $peak = max(4, ...array_map(fn ($d) => max($d['a'], $d['b']), $data));
        $step = (int) ceil($peak / 4);
        $max = $step * 4;
        $iw = $w - $L - $R;
        $ih = $h - $T - $B;
        $gw = $iw / count($data);
        $bw = min(26, ($gw - 16) / 2);
        $y = fn ($v) => $T + $ih - ($v / $max) * $ih;
        $out = '<svg class="chart" viewBox="0 0 '.$w.' '.$h.'" role="img" aria-label="'.e($aria).'">';
        foreach ([0, $step, $step * 2, $step * 3, $max] as $t) {
            $out .= '<line x1="'.$L.'" y1="'.round($y($t), 1).'" x2="'.($w - $R).'" y2="'.round($y($t), 1).'" stroke="var(--line)" stroke-width="1"/>'
                .'<text x="'.($L - 8).'" y="'.round($y($t) + 3.5, 1).'" text-anchor="end" font-size="10" font-family="IBM Plex Mono, monospace" fill="var(--muted)">'.$t.'</text>';
        }
        foreach ($data as $i => $d) {
            $cx = $L + $gw * $i + $gw / 2;
            foreach ([[$d['a'], $cx - $bw - 1, 'var(--c1)', $labels[0]], [$d['b'], $cx + 1, 'var(--c2)', $labels[1]]] as [$v, $x, $c, $lab]) {
                $out .= '<g class="bar"><rect x="'.round($x, 1).'" y="'.round($y($v), 1).'" width="'.round($bw, 1).'" height="'.round(max(2, $T + $ih - $y($v)), 1).'" rx="4" fill="'.$c.'"/><title>'.e($d['m'].' · '.$lab.': '.$v).'</title>'
                    .($v > 0 ? '<text x="'.round($x + $bw / 2, 1).'" y="'.round($y($v) - 5, 1).'" text-anchor="middle" font-size="10" font-weight="600" font-family="IBM Plex Mono, monospace" fill="var(--text-2)">'.$v.'</text>' : '').'</g>';
            }
            $out .= '<text x="'.round($cx, 1).'" y="'.($h - 8).'" text-anchor="middle" font-size="10.5" font-family="IBM Plex Sans, sans-serif" fill="var(--muted)">'.e($d['m']).'</text>';
        }

        return $out.'<line x1="'.$L.'" y1="'.round($y(0), 1).'" x2="'.($w - $R).'" y2="'.round($y(0), 1).'" stroke="var(--line-2)" stroke-width="1.5"/></svg>';
    }

    public static function barList(array $items): string
    {
        $max = max(1, ...array_map(fn ($i) => $i['value'], $items ?: [['value' => 1]]));
        $out = '<div class="bar-list">';
        foreach ($items as $it) {
            $out .= '<div class="bl"><span class="bl-name">'.e($it['name']).'</span><span class="bl-val">'.e($it['label'] ?? num($it['value'])).'</span>'
                .'<span class="bl-track"><i'.(! empty($it['accent']) ? ' class="accent"' : '').' style="width:'.round($it['value'] / $max * 100).'%"></i></span></div>';
        }

        return $out.'</div>';
    }
}
