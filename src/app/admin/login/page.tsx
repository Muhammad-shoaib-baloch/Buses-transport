import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false, follow: false } };

export default async function LoginPage(props: PageProps<'/admin/login'>) {
  if (await getSession()) redirect('/admin');
  const { next } = await props.searchParams;
  const s = await getSettings();
  return (
    <div className="login">
      <div className="login-card">
        <div className="brand">
          <strong>
            {s.general.brandFirst}
            <em>{s.general.brandSecond}</em>
          </strong>
          <small>Admin dashboard</small>
        </div>
        <h1>Sign in</h1>
        <p className="sub">Manage bookings, fleet, content and site settings.</p>
        <LoginForm next={typeof next === 'string' ? next : ''} />
      </div>
    </div>
  );
}
