'use client';

import { Manager } from '@/components/admin/Manager';
import { deleteUser, saveUser } from '@/lib/actions/admin';
import { dateTimeFmt } from '@/lib/utils';

type U = { id: number; name: string; email: string; role: string; active: boolean; lastLoginAt: string | null; createdAt: string };

export function UsersClient({ users, me }: { users: U[]; me: number }) {
  return (
    <Manager<U>
      title="Dashboard users"
      entity="User"
      rows={users}
      fields={(v) => [
        { k: 'name', label: 'Name', type: 'text' },
        { k: 'email', label: 'Email (used to sign in)', type: 'email' },
        {
          k: 'role',
          label: 'Role',
          type: 'select',
          options: [
            { value: 'admin', label: 'Administrator — everything' },
            { value: 'editor', label: 'Editor — content & quote requests' },
          ],
        },
        { k: 'password', label: v.id ? 'New password' : 'Password', type: 'password', help: v.id ? 'leave empty to keep the current one' : 'at least 8 characters' },
        { k: 'active', label: 'Access', type: 'toggle', help: 'Allowed to sign in' },
      ]}
      blank={{ name: '', email: '', role: 'editor', password: '', active: true }}
      toForm={(u) => ({ ...u, password: '' })}
      save={saveUser}
      remove={(id) => deleteUser(id)}
      searchText={(u) => `${u.name} ${u.email}`}
      columns={[
        {
          label: 'User',
          render: (u) => (
            <div>
              <b style={{ fontWeight: 600 }}>
                {u.name}
                {u.id === me ? ' (you)' : ''}
              </b>
              <div className="muted" style={{ fontSize: 12 }}>
                {u.email}
              </div>
            </div>
          ),
        },
        { label: 'Role', render: (u) => <span className={`pill ${u.role}`}>{u.role === 'admin' ? 'Administrator' : 'Editor'}</span> },
        { label: 'Access', render: (u) => <span className={`pill ${u.active ? 'active' : 'inactive'}`}>{u.active ? 'Active' : 'Disabled'}</span> },
        { label: 'Last sign-in', render: (u) => (u.lastLoginAt ? dateTimeFmt(u.lastLoginAt) : 'Never'), className: 'num' },
      ]}
    />
  );
}
