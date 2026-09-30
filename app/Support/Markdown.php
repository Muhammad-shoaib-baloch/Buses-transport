<?php

namespace App\Support;

/**
 * Small, safe markdown renderer: everything is escaped first, then a
 * limited set of constructs is re-introduced. Supports ## headings,
 * **bold**, *italic*, `code`, [links](url), - lists, 1. lists,
 * > quotes, | tables | and ![images](url).
 */
class Markdown
{
    private static function esc(string $s): string
    {
        return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    private static function safeUrl(string $u): string
    {
        $u = trim(html_entity_decode($u, ENT_QUOTES, 'UTF-8'));

        return preg_match('~^(https?:|mailto:|tel:|/|#)~i', $u) ? self::esc($u) : '#';
    }

    private static function inline(string $t): string
    {
        $s = self::esc($t);
        $s = preg_replace_callback('/!\[([^\]]*)\]\(([^)\s]+)\)/', fn ($m) => '<img src="'.self::safeUrl($m[2]).'" alt="'.$m[1].'" loading="lazy">', $s);
        $s = preg_replace_callback('/\[([^\]]+)\]\(([^)\s]+)\)/', function ($m) {
            $h = self::safeUrl($m[2]);
            $ext = preg_match('~^https?:~i', $h) ? ' target="_blank" rel="noopener"' : '';

            return '<a href="'.$h.'"'.$ext.'>'.$m[1].'</a>';
        }, $s);
        $s = preg_replace('/\*\*(.+?)\*\*/', '<strong>$1</strong>', $s);
        $s = preg_replace('/(^|[^*])\*([^*\s][^*]*)\*/', '$1<em>$2</em>', $s);
        $s = preg_replace('/`([^`]+)`/', '<code class="mono">$1</code>', $s);

        return $s;
    }

    private static function isTableStart(array $lines, int $i): bool
    {
        return str_contains($lines[$i], '|') && isset($lines[$i + 1]) && preg_match('/^\s*\|?[\s:-]+\|[\s|:-]*$/', $lines[$i + 1]);
    }

    public static function render(?string $src): string
    {
        $lines = explode("\n", str_replace("\r", '', (string) $src));
        $out = [];
        $i = 0;
        $n = count($lines);
        while ($i < $n) {
            $l = $lines[$i];
            if (trim($l) === '') {
                $i++;
                continue;
            }
            if (preg_match('/^(#{2,4})\s+(.*)$/', $l, $m)) {
                $lv = strlen($m[1]);
                $out[] = "<h$lv>".self::inline($m[2])."</h$lv>";
                $i++;
                continue;
            }
            if (str_starts_with($l, '> ')) {
                $b = [];
                while ($i < $n && str_starts_with($lines[$i], '> ')) {
                    $b[] = substr($lines[$i++], 2);
                }
                $out[] = '<blockquote>'.self::inline(implode(' ', $b)).'</blockquote>';
                continue;
            }
            if (preg_match('/^\s*[-*]\s+/', $l)) {
                $b = [];
                while ($i < $n && preg_match('/^\s*[-*]\s+/', $lines[$i])) {
                    $b[] = '<li>'.self::inline(preg_replace('/^\s*[-*]\s+/', '', $lines[$i++])).'</li>';
                }
                $out[] = '<ul>'.implode('', $b).'</ul>';
                continue;
            }
            if (preg_match('/^\s*\d+[.)]\s+/', $l)) {
                $b = [];
                while ($i < $n && preg_match('/^\s*\d+[.)]\s+/', $lines[$i])) {
                    $b[] = '<li>'.self::inline(preg_replace('/^\s*\d+[.)]\s+/', '', $lines[$i++])).'</li>';
                }
                $out[] = '<ol>'.implode('', $b).'</ol>';
                continue;
            }
            if (self::isTableStart($lines, $i)) {
                $cells = fn ($r) => array_map('trim', explode('|', trim(preg_replace('/^\||\|$/', '', trim($r)))));
                $head = $cells($l);
                $i += 2;
                $rows = [];
                while ($i < $n && str_contains($lines[$i], '|')) {
                    $rows[] = $cells($lines[$i++]);
                }
                $html = '<div class="table-scroll"><table><thead><tr>';
                foreach ($head as $h) {
                    $html .= '<th>'.self::inline($h).'</th>';
                }
                $html .= '</tr></thead><tbody>';
                foreach ($rows as $r) {
                    $html .= '<tr>';
                    foreach ($r as $ci => $c) {
                        $num = $ci && preg_match('/^[\d,.]+$/', str_replace('**', '', $c));
                        $html .= '<td'.($num ? ' class="mono"' : '').'>'.self::inline($c).'</td>';
                    }
                    $html .= '</tr>';
                }
                $out[] = $html.'</tbody></table></div>';
                continue;
            }
            $p = [];
            while ($i < $n && trim($lines[$i]) !== '' && ! preg_match('/^(#{2,4}\s|>\s|\s*[-*]\s|\s*\d+[.)]\s)/', $lines[$i]) && ! self::isTableStart($lines, $i)) {
                $p[] = $lines[$i++];
            }
            $out[] = '<p>'.self::inline(implode(' ', $p)).'</p>';
        }

        return implode('', $out);
    }

    /** Plain-text excerpt of markdown for meta descriptions. */
    public static function toText(?string $src, int $max = 160): string
    {
        $t = (string) $src;
        $t = preg_replace('/!\[[^\]]*\]\([^)]*\)/', '', $t);
        $t = preg_replace('/\[([^\]]+)\]\([^)]*\)/', '$1', $t);
        $t = preg_replace('/[#>*`|_-]+/', ' ', $t);
        $t = trim(preg_replace('/\s+/', ' ', $t));

        return mb_strlen($t) > $max ? rtrim(mb_substr($t, 0, $max - 1)).'…' : $t;
    }
}
