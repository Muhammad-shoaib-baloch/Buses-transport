/* Small, safe markdown renderer: everything is escaped first, then a
   limited set of constructs is re-introduced. Supports ## headings,
   **bold**, *italic*, `code`, [links](url), - lists, 1. lists,
   > quotes, | tables | and ![images](url). */

const esc = (s: string) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const safeUrl = (u: string) => {
  const url = u.trim();
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(url)) return url;
  return '#';
};

function inline(t: string) {
  return esc(t)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img src="${safeUrl(src)}" alt="${alt}" loading="lazy">`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, txt, href) => {
      const h = safeUrl(href);
      const ext = /^https?:/i.test(h);
      return `<a href="${h}"${ext ? ' target="_blank" rel="noopener"' : ''}>${txt}</a>`;
    })
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code class="mono">$1</code>');
}

const isTableStart = (lines: string[], i: number) =>
  lines[i].includes('|') && lines[i + 1] !== undefined && /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(lines[i + 1]);

export function renderMarkdown(src: string) {
  const lines = String(src || '').replace(/\r/g, '').split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) {
      i++;
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = l.match(/^(#{2,4})\s+(.*)$/))) {
      const lv = m[1].length;
      out.push(`<h${lv}>${inline(m[2])}</h${lv}>`);
      i++;
      continue;
    }
    if (l.startsWith('> ')) {
      const b: string[] = [];
      while (i < lines.length && lines[i].startsWith('> ')) b.push(lines[i++].slice(2));
      out.push(`<blockquote>${inline(b.join(' '))}</blockquote>`);
      continue;
    }
    if (/^\s*[-*]\s+/.test(l)) {
      const b: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) b.push(`<li>${inline(lines[i++].replace(/^\s*[-*]\s+/, ''))}</li>`);
      out.push(`<ul>${b.join('')}</ul>`);
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(l)) {
      const b: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) b.push(`<li>${inline(lines[i++].replace(/^\s*\d+[.)]\s+/, ''))}</li>`);
      out.push(`<ol>${b.join('')}</ol>`);
      continue;
    }
    if (isTableStart(lines, i)) {
      const cells = (r: string) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const head = cells(l);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|')) rows.push(cells(lines[i++]));
      out.push(
        `<div class="table-scroll"><table><thead><tr>${head.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${rows
          .map(
            (r) =>
              `<tr>${r
                .map((c, ci) => `<td${ci && /^[\d,.]+$/.test(c.replace(/\*\*/g, '')) ? ' class="mono"' : ''}>${inline(c)}</td>`)
                .join('')}</tr>`,
          )
          .join('')}</tbody></table></div>`,
      );
      continue;
    }
    const p: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{2,4}\s|>\s|\s*[-*]\s|\s*\d+[.)]\s)/.test(lines[i]) &&
      !isTableStart(lines, i)
    )
      p.push(lines[i++]);
    out.push(`<p>${inline(p.join(' '))}</p>`);
  }
  return out.join('');
}

/** Plain-text excerpt of markdown for meta descriptions. */
export function markdownToText(src: string, max = 160) {
  const t = String(src || '')
    .replace(/[#>*`|_-]+/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  return t.length > max ? t.slice(0, max - 1).trimEnd() + '…' : t;
}
