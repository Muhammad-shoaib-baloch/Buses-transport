'use client';

import { useActionState } from 'react';
import { Ic } from '@/components/Sprite';
import { login } from '@/lib/actions/auth';

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action}>
      <input type="hidden" name="next" value={next} />
      <div className="fld">
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </div>
      <div className="fld">
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state?.error && <p className="form-err">{state.error}</p>}
      <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'} <Ic n="i-arrow" />
      </button>
    </form>
  );
}
