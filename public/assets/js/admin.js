/* ============================================================
   Buses Transport UAE — admin dashboard behaviour
   ============================================================ */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var icon = function (n, cls) { return '<svg class="ic' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#' + n + '"/></svg>'; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var csrf = ($('meta[name="csrf-token"]') || {}).content || '';
  var slugify = function (s) {
    return String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
  };

  /* ---------- toasts ---------- */
  function toast(msg) {
    var el = $('#toast'); if (!el) return;
    el.querySelector('span').textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t); el._t = setTimeout(function () { el.classList.remove('show'); }, 3600);
  }
  $$('.toast.show').forEach(function (t) { setTimeout(function () { t.classList.remove('show'); }, 4200); });

  /* ---------- uploads ---------- */
  function uploadFiles(files) {
    var fd = new FormData();
    Array.prototype.forEach.call(files, function (f) { fd.append('files[]', f); });
    return fetch('/admin/media/upload', { method: 'POST', body: fd, headers: { 'X-CSRF-TOKEN': csrf, 'Accept': 'application/json' } })
      .then(function (r) {
        if (r.status === 413) throw new Error('That file is larger than the server upload limit.');
        return r.json().catch(function () { throw new Error('Upload failed (' + r.status + ').'); });
      })
      .then(function (d) { if (!d.ok) throw new Error(d.error || 'Upload failed.'); return d.files; });
  }

  /* ---------- media picker modal ---------- */
  function mediaPicker(multiple, onPick) {
    var scrim = document.createElement('div'); scrim.className = 'amodal-scrim';
    var box = document.createElement('div'); box.className = 'amodal'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Media library');
    box.innerHTML = '<div class="amodal-head"><h2>Media library</h2>'
      + '<button class="btn btn-primary btn-sm" type="button" data-up>' + icon('i-upload') + ' Upload</button>'
      + '<input type="file" hidden multiple accept="image/*">'
      + '<button class="icon-btn" type="button" aria-label="Close" data-x>' + icon('i-close') + '</button></div>'
      + '<div class="amodal-body"><p class="muted">Loading…</p></div>'
      + (multiple ? '<div class="form-bar"><span class="muted" style="font-size:var(--t-xs)" data-count>0 selected</span><span class="grow"></span>'
        + '<button class="btn btn-ghost btn-sm" type="button" data-x>Cancel</button><button class="btn btn-primary btn-sm" type="button" data-add disabled>Add selected</button></div>' : '');
    document.body.append(scrim, box);
    var sel = [], items = [], body = $('.amodal-body', box), fileIn = $('input[type=file]', box);
    function close() { scrim.remove(); box.remove(); document.removeEventListener('keydown', onKey, true); }
    function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } }
    document.addEventListener('keydown', onKey, true);
    scrim.addEventListener('click', close);
    $$('[data-x]', box).forEach(function (b) { b.addEventListener('click', close); });
    function render() {
      var imgs = items.filter(function (m) { return String(m.mime).indexOf('image/') === 0; });
      if (!imgs.length) { body.innerHTML = '<div class="empty"><h3>No images yet</h3><p>Upload one to get started.</p></div>'; return; }
      body.innerHTML = '<div class="media-grid">' + imgs.map(function (m) {
        var on = sel.indexOf(m.url) > -1;
        return '<button type="button" class="media-item" data-url="' + esc(m.url) + '"' + (on ? ' style="border-color:var(--r-400);box-shadow:0 0 0 2px var(--r-wash)"' : '') + '>'
          + '<span class="mi-img"><img src="' + esc(m.url) + '" alt="" loading="lazy"></span>'
          + '<span class="mi-meta"><span>' + esc(m.original_name || m.filename) + '</span>' + (m.width ? '<span>' + m.width + '×' + m.height + '</span>' : '') + '</span></button>';
      }).join('') + '</div>';
    }
    body.addEventListener('click', function (e) {
      var b = e.target.closest('[data-url]'); if (!b) return;
      var u = b.dataset.url;
      if (!multiple) { close(); onPick([u]); return; }
      var i = sel.indexOf(u); if (i > -1) sel.splice(i, 1); else sel.push(u);
      $('[data-count]', box).textContent = sel.length + ' selected';
      $('[data-add]', box).disabled = !sel.length;
      render();
    });
    if (multiple) $('[data-add]', box).addEventListener('click', function () { close(); onPick(sel); });
    $('[data-up]', box).addEventListener('click', function () { fileIn.click(); });
    fileIn.addEventListener('change', function () {
      if (!fileIn.files.length) return;
      var btn = $('[data-up]', box); btn.disabled = true; btn.innerHTML = 'Uploading…';
      uploadFiles(fileIn.files).then(function (rows) {
        items = rows.concat(items);
        if (!multiple && rows[0]) { close(); onPick([rows[0].url]); return; }
        rows.forEach(function (r) { sel.push(r.url); });
        $('[data-count]', box).textContent = sel.length + ' selected'; $('[data-add]', box).disabled = !sel.length;
        render();
      }).catch(function (err) { alert(err.message); }).finally(function () { btn.disabled = false; btn.innerHTML = icon('i-upload') + ' Upload'; fileIn.value = ''; });
    });
    fetch('/admin/media.json', { headers: { 'Accept': 'application/json' } }).then(function (r) { return r.json(); })
      .then(function (d) { items = d.media || []; render(); })
      .catch(function () { body.innerHTML = '<p class="form-msg err">Could not load the media library.</p>'; });
  }

  /* ---------- single image field ---------- */
  $$('[data-image-field]').forEach(function (f) {
    var input = $('[data-image-input]', f), prev = $('.imgf-prev', f), file = $('[data-file]', f), err = $('.form-msg', f);
    function set(u) { input.value = u; preview(); input.dispatchEvent(new Event('change', { bubbles: true })); }
    function preview() { prev.innerHTML = input.value ? '<img src="' + esc(input.value) + '" alt="">' : icon('i-image'); }
    input.addEventListener('input', preview);
    $('[data-clear]', f).addEventListener('click', function () { set(''); });
    $('[data-library]', f).addEventListener('click', function () { mediaPicker(false, function (u) { set(u[0] || ''); }); });
    $('[data-upload]', f).addEventListener('click', function () { file.click(); });
    file.addEventListener('change', function () {
      if (!file.files.length) return;
      var b = $('[data-upload]', f); b.disabled = true; err.hidden = true;
      uploadFiles(file.files).then(function (rows) { if (rows[0]) set(rows[0].url); })
        .catch(function (e) { err.textContent = e.message; err.hidden = false; })
        .finally(function () { b.disabled = false; file.value = ''; });
    });
  });

  /* ---------- gallery field ---------- */
  $$('[data-images-field]').forEach(function (f) {
    var grid = $('.imgs-grid', f), name = f.dataset.name, file = $('[data-file]', f), err = $('.form-msg', f);
    function badge() {
      $$('.imgs-item', grid).forEach(function (it, i) {
        var b = $('.imgs-badge', it);
        if (i === 0 && !b) it.insertAdjacentHTML('beforeend', '<span class="imgs-badge">Cover</span>');
        if (i !== 0 && b) b.remove();
      });
    }
    function add(urls) {
      var first = $('.imgs-add', grid);
      urls.forEach(function (u) {
        if ($$('input', grid).some(function (i) { return i.value === u; })) return;
        var d = document.createElement('div'); d.className = 'imgs-item';
        d.innerHTML = '<img src="' + esc(u) + '" alt=""><input type="hidden" name="' + esc(name) + '" value="' + esc(u) + '">'
          + '<div class="imgs-acts"><button type="button" data-move="-1" title="Move left">' + icon('i-chev', 'rot90') + '</button>'
          + '<button type="button" data-move="1" title="Move right">' + icon('i-chev', 'rot-90') + '</button>'
          + '<button type="button" data-remove title="Remove">' + icon('i-trash') + '</button></div>';
        grid.insertBefore(d, first);
      });
      badge(); f.dispatchEvent(new Event('change', { bubbles: true }));
    }
    badge();
    grid.addEventListener('click', function (e) {
      var it = e.target.closest('.imgs-item');
      if (e.target.closest('[data-remove]')) { it.remove(); badge(); f.dispatchEvent(new Event('change', { bubbles: true })); return; }
      var mv = e.target.closest('[data-move]');
      if (mv) {
        var dir = Number(mv.dataset.move);
        var sib = dir < 0 ? it.previousElementSibling : it.nextElementSibling;
        if (sib && sib.classList.contains('imgs-item')) { if (dir < 0) grid.insertBefore(it, sib); else grid.insertBefore(sib, it); badge(); }
        return;
      }
      if (e.target.closest('[data-library]')) { mediaPicker(true, add); return; }
      if (e.target.closest('[data-upload]')) file.click();
    });
    file.addEventListener('change', function () {
      if (!file.files.length) return;
      err.hidden = true;
      uploadFiles(file.files).then(function (rows) { add(rows.map(function (r) { return r.url; })); })
        .catch(function (e2) { err.textContent = e2.message; err.hidden = false; })
        .finally(function () { file.value = ''; });
    });
  });

  /* ---------- list editors (steps, key/value rows, features, stats) ---------- */
  var seq = 0;
  $$('[data-list]').forEach(function (list) {
    var rows = $('.le-rows', list), tpl = $('template', list);
    $('[data-add]', list).addEventListener('click', function () {
      var html = tpl.innerHTML.split('__i__').join('n' + Date.now().toString(36) + (seq++));
      rows.insertAdjacentHTML('beforeend', html);
      bindIconPickers(rows.lastElementChild);
      var first = $('input,textarea', rows.lastElementChild); if (first) first.focus();
    });
    rows.addEventListener('click', function (e) {
      var row = e.target.closest('.le-row'); if (!row) return;
      if (e.target.closest('[data-del]')) row.remove();
      else if (e.target.closest('[data-up]') && row.previousElementSibling) rows.insertBefore(row, row.previousElementSibling);
      else if (e.target.closest('[data-down]') && row.nextElementSibling) rows.insertBefore(row.nextElementSibling, row);
    });
  });

  /* ---------- icon pickers ---------- */
  function bindIconPickers(root) {
    $$('[data-icon-pick]', root).forEach(function (p) {
      if (p._bound) return; p._bound = true;
      p.addEventListener('click', function (e) {
        var b = e.target.closest('[data-icon]'); if (!b) return;
        $('input', p).value = b.dataset.icon;
        $$('[data-icon]', p).forEach(function (x) { x.classList.toggle('on', x === b); });
      });
    });
  }
  bindIconPickers(document);

  /* ---------- multi-select highlight, colours, slugs ---------- */
  document.addEventListener('change', function (e) {
    var cb = e.target.closest('.msel input'); if (cb) cb.parentElement.classList.toggle('on', cb.checked);
  });
  $$('[data-color]').forEach(function (c) {
    var picker = $('input[type=color]', c), text = $('input:not([type=color])', c);
    picker.addEventListener('input', function () { text.value = picker.value.toUpperCase(); });
    text.addEventListener('input', function () { if (/^#[0-9a-f]{6}$/i.test(text.value)) picker.value = text.value; });
  });
  var resetBtn = $('[data-theme-reset]');
  if (resetBtn) resetBtn.addEventListener('click', function () {
    var def = { brandLight: '#C9391F', brand: '#B32C1C', brandDark: '#9A2317', accent: '#3983D8' };
    Object.keys(def).forEach(function (k) {
      var t = $('input[name="' + k + '"]'); if (!t) return;
      t.value = def[k]; var p = $('input[type=color]', t.parentElement); if (p) p.value = def[k];
      t.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });
  $$('[data-slug-from]').forEach(function (slug) {
    var form = slug.form, src = form && form.querySelector('[name="' + slug.dataset.slugFrom + '"]');
    if (!src) return;
    var auto = slug.hasAttribute('data-slug-auto');
    slug.addEventListener('input', function () { auto = false; });
    slug.addEventListener('blur', function () { slug.value = slugify(slug.value); });
    src.addEventListener('input', function () { if (auto) slug.value = slugify(src.value); });
  });

  /* ---------- markdown preview (rendered by the server, same as the site) ---------- */
  $$('.md-field').forEach(function (m) {
    var ta = $('textarea', m), pv = $('.md-preview', m);
    $$('[data-md]', m).forEach(function (b) {
      b.addEventListener('click', function () {
        var preview = b.dataset.md === 'preview';
        $$('[data-md]', m).forEach(function (x) { x.classList.toggle('on', x === b); });
        ta.hidden = preview; pv.hidden = !preview;
        if (!preview) return;
        pv.innerHTML = '<p class="muted">Rendering…</p>';
        fetch('/admin/markdown', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-CSRF-TOKEN': csrf }, body: JSON.stringify({ src: ta.value }) })
          .then(function (r) { return r.json(); })
          .then(function (d) { pv.innerHTML = d.html || '<p class="muted">Nothing to preview yet.</p>'; })
          .catch(function () { pv.innerHTML = '<p class="form-msg err">Preview failed.</p>'; });
      });
    });
  });

  /* ---------- tables: search, filters, row click ---------- */
  $$('[data-manager]').forEach(function (card) {
    var search = $('[data-search]', card), active = 'all';
    var rows = $$('tbody tr', card).concat($$('.media-item[data-text]', card));
    var none = $('.js-noresults', card), exportLink = $('[data-export]', card);
    function apply() {
      var q = (search && search.value || '').trim().toLowerCase(), shown = 0;
      rows.forEach(function (r) {
        var okF = active === 'all' || (' ' + (r.dataset.filters || '') + ' ').indexOf(' ' + active + ' ') > -1;
        var okQ = !q || (r.dataset.text || r.textContent.toLowerCase()).indexOf(q) > -1;
        r.hidden = !(okF && okQ); if (!r.hidden) shown++;
      });
      if (none) none.hidden = shown > 0 || !rows.length;
      if (exportLink) exportLink.href = '/admin/quotes/export?status=' + encodeURIComponent(active);
    }
    if (search) search.addEventListener('input', apply);
    $$('[data-filter]', card).forEach(function (b) {
      b.addEventListener('click', function () {
        active = b.dataset.filter;
        $$('[data-filter]', card).forEach(function (x) { x.classList.toggle('on', x === b); });
        apply();
      });
    });
  });
  document.addEventListener('click', function (e) {
    var tr = e.target.closest('tr[data-href]');
    if (tr && !e.target.closest('a,button,select,input,form,label')) location.href = tr.dataset.href;
    var copy = e.target.closest('[data-copy]');
    if (copy) {
      var full = location.origin + copy.dataset.copy;
      (navigator.clipboard ? navigator.clipboard.writeText(full) : Promise.reject()).then(function () { toast('Link copied.'); }, function () { prompt('Copy this link:', full); });
    }
  });

  /* ---------- confirms and auto-submit ---------- */
  var submitting = false;
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.dataset.confirm && !confirm(f.dataset.confirm)) { e.preventDefault(); return; }
    submitting = true;
  });
  document.addEventListener('change', function (e) {
    var s = e.target.closest('[data-autosubmit]'); if (s && s.form) { submitting = true; s.form.submit(); }
  });

  /* ---------- editor drawer: Esc to close, unsaved-change warning ---------- */
  var editor = $('[data-editor]');
  if (editor) {
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('.amodal')) location.href = editor.dataset.close; });
    var first = $('.editor-body input:not([type=hidden]), .editor-body textarea', editor); if (first && !first.value) first.focus();
  }
  $$('[data-dirty-check]').forEach(function (f) {
    var dirty = false, note = $('.js-dirty', f);
    var mark = function () { dirty = true; if (note) note.hidden = false; };
    f.addEventListener('input', mark); f.addEventListener('change', mark);
    window.addEventListener('beforeunload', function (e) { if (dirty && !submitting) { e.preventDefault(); e.returnValue = ''; } });
  });

  /* ---------- media library page ---------- */
  var dz = $('[data-dropzone]');
  if (dz) {
    var fin = $('[data-file]', dz), derr = $('.form-msg', dz), btn = $('[data-upload]', dz);
    var go = function (files) {
      if (!files || !files.length) return;
      derr.hidden = true; btn.disabled = true; btn.innerHTML = 'Uploading…';
      uploadFiles(files).then(function (rows) { toast(rows.length + ' file' + (rows.length > 1 ? 's' : '') + ' uploaded.'); setTimeout(function () { location.reload(); }, 400); })
        .catch(function (e) { derr.textContent = e.message; derr.hidden = false; btn.disabled = false; btn.innerHTML = icon('i-upload') + ' Choose files'; });
    };
    btn.addEventListener('click', function () { fin.click(); });
    fin.addEventListener('change', function () { go(fin.files); });
    dz.addEventListener('dragover', function (e) { e.preventDefault(); dz.classList.add('over'); });
    dz.addEventListener('dragleave', function () { dz.classList.remove('over'); });
    dz.addEventListener('drop', function (e) { e.preventDefault(); dz.classList.remove('over'); go(e.dataTransfer.files); });
  }
})();
