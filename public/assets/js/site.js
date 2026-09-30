/* ============================================================
   Buses Transport UAE — public site behaviour
   Header mega menu + drawer, scroll effects, reveal/count-up,
   sliders, filters, gallery and the AJAX quote forms.
   ============================================================ */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var icon = function (n) { return '<svg class="ic" aria-hidden="true"><use href="#' + n + '"/></svg>'; };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  /* ---------- toast ---------- */
  var toastT;
  function toast(msg) {
    var el = $('#toast'); if (!el) return;
    el.querySelector('span').textContent = msg;
    el.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('show'); }, 4200);
  }

  /* ---------- mega menu ---------- */
  function megaSetup() {
    var head = $('#siteHead'), host = $('#megaHost'); if (!head || !host) return;
    var openKey = null, closeT;
    function open(key) {
      clearTimeout(closeT); openKey = key;
      $$('.mega', host).forEach(function (p) { p.classList.toggle('show', p.dataset.panel === key); });
      $$('.nav-item', head).forEach(function (n) {
        var on = n.dataset.mega === key; n.classList.toggle('open', on);
        var a = n.querySelector('.nav-link'); if (a && a.hasAttribute('aria-expanded')) a.setAttribute('aria-expanded', String(on));
      });
    }
    function close(now) {
      clearTimeout(closeT);
      closeT = setTimeout(function () {
        openKey = null; $$('.mega', host).forEach(function (p) { p.classList.remove('show'); });
        $$('.nav-item', head).forEach(function (n) { n.classList.remove('open'); var a = n.querySelector('.nav-link'); if (a && a.hasAttribute('aria-expanded')) a.setAttribute('aria-expanded', 'false'); });
      }, now ? 0 : 160);
    }
    head.addEventListener('mouseover', function (e) {
      var item = e.target.closest('.nav-item[data-mega]');
      if (item) { open(item.dataset.mega); return; }
      if (e.target.closest('.mega')) { clearTimeout(closeT); return; }
      if (e.target.closest('.head-main') && openKey) close();
    });
    head.addEventListener('mouseleave', function () { close(); });
    head.addEventListener('focusin', function (e) {
      var item = e.target.closest('.nav-item[data-mega]');
      if (item) open(item.dataset.mega); else if (!e.target.closest('.mega')) close(true);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openKey) close(true); });
    document.addEventListener('click', function (e) { if (openKey && !e.target.closest('.head-main')) close(true); });
  }

  /* ---------- mobile drawer ---------- */
  function drawerSetup() {
    var drawer = $('#drawer'), scrim = $('#scrim'), burger = $('#burger'); if (!drawer || !burger) return;
    function open() { drawer.hidden = false; scrim.hidden = false; burger.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; }
    function close() { drawer.hidden = true; scrim.hidden = true; burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
    burger.addEventListener('click', open);
    $('#drawerClose').addEventListener('click', close);
    scrim.addEventListener('click', close);
    drawer.addEventListener('click', function (e) {
      var top = e.target.closest('.dr-top');
      if (top && top.tagName === 'BUTTON') top.parentElement.classList.toggle('open');
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !drawer.hidden) close(); });
  }

  /* ---------- scroll: sticky header, progress bar, back to top ---------- */
  function scrollSetup() {
    var head = $('#siteHead'), bar = $('#headProgress'), top = $('#toTop'), tick = false;
    function onScroll() {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        var y = window.scrollY || 0;
        if (head) head.classList.toggle('stuck', y > 24);
        if (top) top.classList.toggle('show', y > 640);
        var h = document.documentElement.scrollHeight - window.innerHeight;
        if (bar) bar.style.width = (h > 0 ? Math.min(100, y / h * 100) : 0) + '%';
        tick = false;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });
    onScroll();
  }

  /* ---------- reveal + counters ---------- */
  var io;
  function countUp(el) {
    var to = parseFloat(el.dataset.to) || 0, dec = parseInt(el.dataset.dec || '0', 10), sfx = el.dataset.suffix || '';
    var fmt = function (v) { return v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + sfx; };
    if (reduced) { el.textContent = fmt(to); return; }
    var t0 = performance.now();
    (function step(now) {
      var p = Math.min(1, (now - t0) / 1300);
      el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  function markIn(el) {
    if (el.classList.contains('in') || el.dataset.done) return;
    el.classList.add('in');
    if (el.classList.contains('count')) { el.dataset.done = '1'; countUp(el); }
  }
  function observe(root) {
    var items = $$('.reveal, .step, .count', root);
    if (reduced || !('IntersectionObserver' in window)) { items.forEach(markIn); return; }
    if (!io) io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { markIn(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
    setTimeout(function () { items.forEach(markIn); }, 2200);
  }

  /* ---------- fleet rail ---------- */
  function rails() {
    $$('[data-rail]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var rail = document.getElementById(btn.dataset.rail); if (!rail) return;
        var card = rail.firstElementChild, step = card ? card.getBoundingClientRect().width + 20 : 300;
        rail.scrollBy({ left: step * Number(btn.dataset.dir), behavior: reduced ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------- testimonials ---------- */
  function slider() {
    var track = $('#tslTrack'); if (!track) return;
    var n = track.children.length, i = 0, timer, dots = $('#tslDots');
    if (n < 2) return;
    dots.innerHTML = Array.from({ length: n }, function (_, k) { return '<button class="tsl-dot' + (k ? '' : ' on') + '" type="button" data-i="' + k + '" aria-label="Testimonial ' + (k + 1) + '"></button>'; }).join('');
    function go(k) {
      i = (k + n) % n;
      track.style.transform = 'translateX(-' + i * 100 + '%)';
      $$('.tsl-dot', dots).forEach(function (d, j) { d.classList.toggle('on', j === i); });
    }
    function restart() { clearInterval(timer); if (!reduced) timer = setInterval(function () { go(i + 1); }, 7000); }
    dots.addEventListener('click', function (e) { var b = e.target.closest('[data-i]'); if (b) { go(Number(b.dataset.i)); restart(); } });
    $('#tslPrev').addEventListener('click', function () { go(i - 1); restart(); });
    $('#tslNext').addEventListener('click', function () { go(i + 1); restart(); });
    $('#tsl').addEventListener('mouseenter', function () { clearInterval(timer); });
    $('#tsl').addEventListener('mouseleave', restart);
    restart();
  }

  /* ---------- filters ---------- */
  function filters() {
    var fl = $('#fleetFilters'), grid = $('#fleetGrid');
    if (fl && grid) fl.addEventListener('click', function (e) {
      var b = e.target.closest('.fbtn'); if (!b) return;
      $$('.fbtn', fl).forEach(function (x) { x.classList.toggle('on', x === b); });
      var cat = b.dataset.cat;
      $$('.fcard', grid).forEach(function (card) {
        var show = cat === 'all' || (cat === '__self' ? card.dataset.self === '1' : card.dataset.cat === cat);
        card.hidden = !show; if (show) card.classList.add('in');
      });
    });
    var bf = $('#blogFilters'), bg = $('#blogGrid');
    if (bf && bg) bf.addEventListener('click', function (e) {
      var b = e.target.closest('.fbtn'); if (!b) return;
      $$('.fbtn', bf).forEach(function (x) { x.classList.toggle('on', x === b); });
      $$('.post-card', bg).forEach(function (card) {
        var show = b.dataset.cat === 'All' || card.dataset.cat === b.dataset.cat;
        card.hidden = !show; if (show) card.classList.add('in');
      });
    });
  }

  /* ---------- vehicle gallery ---------- */
  function gallery() {
    $$('.js-gallery').forEach(function (g) {
      var thumbs = $$('.gal-thumbs button', g), main = $('.gal-main img', g), count = $('.gal-count', g);
      if (!main || thumbs.length < 2) return;
      var i = 0, n = thumbs.length;
      function go(k) {
        i = (k + n) % n;
        main.src = thumbs[i].dataset.src;
        main.alt = main.dataset.alt + ' — photo ' + (i + 1) + ' of ' + n;
        thumbs.forEach(function (t, j) { t.classList.toggle('on', j === i); });
        if (count) count.textContent = (i + 1) + ' / ' + n;
      }
      thumbs.forEach(function (t, j) { t.addEventListener('click', function () { go(j); }); });
      $$('[data-gal]', g).forEach(function (b) { b.addEventListener('click', function () { go(i + Number(b.dataset.gal)); }); });
    });
  }

  /* ---------- quote forms ---------- */
  function track(event, source) {
    try {
      if (window.dataLayer) window.dataLayer.push({ event: event, source: source });
      if (window.fbq) window.fbq('track', 'Lead');
    } catch (e) { /* analytics is optional */ }
  }
  function quoteForms() {
    $$('.js-quote').forEach(function (form) {
      var body = $('.js-form-body', form), original = body.innerHTML;
      function bindTabs() {
        $$('[data-qtab]', form).forEach(function (tab) {
          tab.addEventListener('click', function () {
            var hire = tab.dataset.qtab === 'hire';
            $$('[data-qtab]', form).forEach(function (t) { t.classList.toggle('on', t === tab); t.setAttribute('aria-selected', String(t === tab)); });
            var lbl = $('#qToLbl', form), to = $('#qTo', form), from = $('#qFrom', form), svc = $('input[name=service]', form);
            if (lbl) lbl.textContent = hire ? 'Return to' : 'Drop-off';
            if (to) to.placeholder = hire ? 'Same address' : 'Dubai Marina';
            if (from) from.placeholder = hire ? 'Business Bay, Dubai' : 'DXB Terminal 3';
            if (svc) svc.value = hire ? 'Daily Rental' : 'Transfer';
          });
        });
      }
      bindTabs();
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var err = $('.form-err', form), btn = $('button[type=submit]', form);
        var data = {}; new FormData(form).forEach(function (v, k) { data[k] = String(v); });
        function fail(msg) { err.textContent = msg; err.hidden = false; var note = $('.js-note', form); if (note) note.hidden = true; }
        if (!(data.name || '').trim()) return fail('Add your name so our team knows who to call back.');
        if (!(data.phone || '').trim()) return fail('Add a phone or WhatsApp number so we can confirm your quote.');
        data.source = form.dataset.source || 'website';
        data.pageUrl = location.pathname;
        err.hidden = true;
        var label = btn.innerHTML; btn.disabled = true; btn.innerHTML = 'Sending…';
        fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { return r.json(); })
          .then(function (r) {
            btn.disabled = false; btn.innerHTML = label;
            if (!r.ok) return fail(r.error || 'Could not send your request.');
            toast('Request sent. We will confirm your AED quote shortly.');
            track('quote_request', data.source);
            body.innerHTML = '<div class="form-ok" role="status" style="grid-column:1/-1">'
              + '<h3>' + icon('i-check') + ' Request received</h3><p>' + esc(r.message) + '</p>'
              + '<p>Your reference: <span class="mono">' + esc(r.ref) + '</span></p>'
              + '<div style="display:flex;gap:9px;flex-wrap:wrap">'
              + (r.whatsappUrl ? '<a class="btn btn-whats btn-sm" href="' + esc(r.whatsappUrl) + '" target="_blank" rel="noopener">' + icon('i-whats') + ' Also send on WhatsApp</a>' : '')
              + '<button class="btn btn-ghost btn-sm js-again" type="button">Send another request</button></div></div>';
            if (form.classList.contains('form-grid')) { body.style.display = 'block'; body.style.gridColumn = '1/-1'; }
            $('.js-again', body).addEventListener('click', function () {
              body.innerHTML = original;
              if (form.classList.contains('form-grid')) { body.style.display = 'contents'; body.style.gridColumn = ''; }
              bindTabs();
            });
          })
          .catch(function () { btn.disabled = false; btn.innerHTML = label; fail('Could not send your request. Check your connection, or call / WhatsApp us instead.'); });
      });
    });
  }

  /* ---------- article view counter (once per session) ---------- */
  function viewBeacon() {
    var el = $('.js-view'); if (!el) return;
    var k = 'bt.view.' + el.dataset.slug;
    try { if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, '1'); } catch (e) { /* storage blocked */ }
    fetch('/api/views/' + encodeURIComponent(el.dataset.slug), { method: 'POST', keepalive: true }).catch(function () {});
  }

  function start() {
    megaSetup(); drawerSetup(); scrollSetup(); observe(document); rails(); slider(); filters(); gallery(); quoteForms(); viewBeacon();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
