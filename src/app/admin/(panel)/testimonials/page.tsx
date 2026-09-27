import { Topbar } from '@/components/admin/Sidebar';
import { db } from '@/lib/db';
import { TestimonialsClient } from './TestimonialsClient';

export const metadata = { title: 'Testimonials' };

export default async function TestimonialsAdmin() {
  const rows = await db.testimonial.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] });
  return (
    <>
      <Topbar title="Testimonials" sub="Real client reviews for the homepage slider — the review links show until you add one" />
      <div className="body">
        <TestimonialsClient rows={rows.map(({ createdAt, updatedAt, ...t }) => ({ ...t, createdAt: createdAt.toISOString(), updatedAt: updatedAt.toISOString() }))} />
      </div>
    </>
  );
}
