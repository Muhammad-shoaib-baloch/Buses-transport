import { Topbar } from '@/components/admin/Sidebar';
import { requirePageSession } from '@/lib/auth';
import { AccountClient } from './AccountClient';

export const metadata = { title: 'My account' };

export default async function AccountPage() {
  const me = await requirePageSession();
  return (
    <>
      <Topbar title="My account" sub={`Signed in as ${me.email}`} />
      <div className="body" style={{ maxWidth: 720 }}>
        <AccountClient />
      </div>
    </>
  );
}
