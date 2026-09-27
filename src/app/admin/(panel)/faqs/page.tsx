import { Topbar } from '@/components/admin/Sidebar';
import { db } from '@/lib/db';
import { FaqsClient } from './FaqsClient';

export const metadata = { title: 'FAQs' };

export default async function FaqsAdmin() {
  const faqs = await db.faq.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }], include: { _count: { select: { services: true } } } });
  return (
    <>
      <Topbar title="FAQs" sub="Questions on the FAQ page, the services page and individual service pages" />
      <div className="body">
        <FaqsClient faqs={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer, order: f.order, active: f.active, showOnHome: f.showOnHome, services: f._count.services }))} />
      </div>
    </>
  );
}
