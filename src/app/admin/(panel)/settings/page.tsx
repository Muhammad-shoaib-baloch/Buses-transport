import { redirect } from 'next/navigation';
import { Topbar } from '@/components/admin/Sidebar';
import { requirePageSession } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { SettingsClient } from './SettingsClient';

export const metadata = { title: 'Site settings' };

export default async function SettingsPage(props: PageProps<'/admin/settings'>) {
  const me = await requirePageSession();
  if (me.role !== 'admin') redirect('/admin');
  const { tab } = await props.searchParams;
  const s = await getSettings();
  const safe = { ...s, email: { ...s.email, smtpPass: s.email.smtpPass ? '••••••••' : '' } };
  return (
    <>
      <Topbar title="Site settings" sub="Branding, logo, contact details, homepage content, SEO tags, tracking and email alerts" />
      <div className="body">
        <SettingsClient initial={safe} initialTab={typeof tab === 'string' ? tab : 'general'} />
      </div>
    </>
  );
}
