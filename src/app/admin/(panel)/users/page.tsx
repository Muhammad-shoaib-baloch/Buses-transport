import { redirect } from 'next/navigation';
import { Topbar } from '@/components/admin/Sidebar';
import { requirePageSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { UsersClient } from './UsersClient';

export const metadata = { title: 'Users' };

export default async function UsersPage() {
  const me = await requirePageSession();
  if (me.role !== 'admin') redirect('/admin');
  const users = await db.user.findMany({ orderBy: { createdAt: 'asc' }, select: { id: true, name: true, email: true, role: true, active: true, lastLoginAt: true, createdAt: true } });
  return (
    <>
      <Topbar title="Users" sub="Who can sign in to this dashboard. Editors manage content; administrators also manage settings and users." />
      <div className="body">
        <UsersClient me={me.uid} users={users.map((u) => ({ ...u, lastLoginAt: u.lastLoginAt?.toISOString() || null, createdAt: u.createdAt.toISOString() }))} />
      </div>
    </>
  );
}
