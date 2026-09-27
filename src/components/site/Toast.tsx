'use client';

import { useEffect, useRef, useState } from 'react';
import { Ic } from '@/components/Sprite';

const EVT = 'bt:toast';

export function toast(msg: string) {
  window.dispatchEvent(new CustomEvent(EVT, { detail: msg }));
}

export function ToastHost() {
  const [msg, setMsg] = useState('');
  const [show, setShow] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const on = (e: Event) => {
      setMsg(String((e as CustomEvent).detail || ''));
      setShow(true);
      if (t.current) clearTimeout(t.current);
      t.current = setTimeout(() => setShow(false), 4200);
    };
    window.addEventListener(EVT, on);
    return () => window.removeEventListener(EVT, on);
  }, []);
  return (
    <div className={`toast${show ? ' show' : ''}`} role="status" aria-live="polite">
      <Ic n="i-check" />
      <span>{msg}</span>
    </div>
  );
}
