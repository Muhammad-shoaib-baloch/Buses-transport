'use client';

import { useState, useTransition } from 'react';
import { Ic } from '@/components/Sprite';
import { FormFields, type Values } from '@/components/admin/Fields';
import { changePassword } from '@/lib/actions/admin';

export function AccountClient() {
  const [v, setV] = useState<Values>({ current: '', next: '', confirm: '' });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="card">
      <div className="card-head">
        <h2>Change password</h2>
        <span className="hint">Use at least 8 characters — a short sentence is easy to remember and hard to guess.</span>
      </div>
      <div className="card-body">
        <FormFields
          fields={[
            { k: 'current', label: 'Current password', type: 'password', full: true },
            { k: 'next', label: 'New password', type: 'password' },
            { k: 'confirm', label: 'Repeat new password', type: 'password' },
          ]}
          values={v}
          onChange={(k, x) => setV((cur) => ({ ...cur, [k]: x }))}
        />
      </div>
      <div className="form-bar">
        {msg && <span className={`form-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</span>}
        <span className="grow" />
        <button
          className="btn btn-primary btn-sm"
          type="button"
          disabled={pending || !v.current || !v.next}
          onClick={() =>
            start(async () => {
              const r = await changePassword(v);
              if (r.ok) {
                setMsg({ ok: true, text: r.message || 'Password updated.' });
                setV({ current: '', next: '', confirm: '' });
              } else setMsg({ ok: false, text: r.error });
            })
          }
        >
          {pending ? 'Saving…' : 'Update password'} <Ic n="i-check" />
        </button>
      </div>
    </div>
  );
}
