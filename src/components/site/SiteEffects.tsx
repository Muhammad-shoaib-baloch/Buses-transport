'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Ic } from '@/components/Sprite';
import { waHref } from '@/lib/utils';

/* Reveal-on-scroll, count-up numbers and route drawing — ported from the
   design's app.js. Re-runs on every client navigation. */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const items = document.querySelectorAll<HTMLElement>('.reveal, .step, .count, .route-path');
    const countUp = (el: HTMLElement) => {
      const to = parseFloat(el.dataset.to || '0') || 0;
      const dec = parseInt(el.dataset.dec || '0', 10);
      const sfx = el.dataset.suffix || '';
      const fmt = (v: number) => v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + sfx;
      if (reduced) {
        el.textContent = fmt(to);
        return;
      }
      const t0 = performance.now();
      const step = (now: number) => {
        const pr = Math.min(1, (now - t0) / 1300);
        el.textContent = fmt(to * (1 - Math.pow(1 - pr, 3)));
        if (pr < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const markIn = (el: HTMLElement) => {
      if (el.classList.contains('in') || el.dataset.done) return;
      el.classList.add('in');
      if (el.classList.contains('count')) {
        el.dataset.done = '1';
        countUp(el);
      }
      if (el.classList.contains('route-path')) el.classList.add('go');
    };
    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(markIn);
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            markIn(en.target as HTMLElement);
            io.unobserve(en.target);
          }
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    items.forEach((el) => io.observe(el));
    const fallback = setTimeout(() => items.forEach(markIn), 2200);
    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, [pathname]);
  return null;
}

export function FloatingButtons({ whatsapp, waText, showWhatsapp }: { whatsapp: string; waText: string; showWhatsapp: boolean }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow((window.scrollY || 0) > 640);
    window.addEventListener('scroll', on, { passive: true });
    on();
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <>
      {showWhatsapp && whatsapp && (
        <a className="wa-float" href={waHref(whatsapp, waText)} target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">
          <Ic n="i-whats" />
        </a>
      )}
      <button
        className={`to-top${show ? ' show' : ''}`}
        type="button"
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })}
      >
        <Ic n="i-chev" />
      </button>
    </>
  );
}

/** Injects admin-provided HTML (head/body code) so that its scripts execute. */
export function CustomCode({ html, target }: { html: string; target: 'head' | 'body' }) {
  useEffect(() => {
    if (!html.trim()) return;
    const host = target === 'head' ? document.head : document.body;
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    const added: Node[] = [];
    tpl.content.childNodes.forEach((node) => {
      let n: Node = node;
      if (node.nodeName === 'SCRIPT') {
        const src = node as HTMLScriptElement;
        const s = document.createElement('script');
        for (const a of Array.from(src.attributes)) s.setAttribute(a.name, a.value);
        s.text = src.text;
        n = s;
      } else {
        n = node.cloneNode(true);
      }
      host.appendChild(n);
      added.push(n);
    });
    return () => added.forEach((n) => n.parentNode?.removeChild(n));
  }, [html, target]);
  return null;
}
