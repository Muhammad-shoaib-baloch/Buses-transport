import { Topbar } from '@/components/admin/Sidebar';
import { db } from '@/lib/db';
import { PagesClient } from './PagesClient';

export const metadata = { title: 'Pages' };

export default async function PagesAdmin() {
  const pages = await db.page.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] });
  return (
    <>
      <Topbar title="Pages" sub="Extra pages such as Privacy Policy, Terms, or landing pages — published at yoursite.com/slug" />
      <div className="body">
        <PagesClient pages={pages.map(({ createdAt, updatedAt, ...p }) => ({ ...p, createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() }))} />
      </div>
    </>
  );
}
