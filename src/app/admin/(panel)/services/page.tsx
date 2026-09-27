import { Topbar } from '@/components/admin/Sidebar';
import { db } from '@/lib/db';
import { ServicesClient } from './ServicesClient';

export const metadata = { title: 'Services' };

export default async function ServicesAdmin() {
  const [services, vehicles, faqs] = await Promise.all([
    db.service.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }], include: { vehicles: { select: { id: true } }, faqs: { select: { id: true } } } }),
    db.vehicle.findMany({ orderBy: [{ order: 'asc' }], select: { id: true, name: true } }),
    db.faq.findMany({ orderBy: [{ order: 'asc' }], select: { id: true, question: true } }),
  ]);
  return (
    <>
      <Topbar title="Services" sub="Service pages, homepage cards, menus and the quote form options" />
      <div className="body">
        <ServicesClient
          services={services.map(({ vehicles: v, faqs: f, createdAt, updatedAt, ...s }) => ({ ...s, vehicleIds: v.map((x) => x.id), faqIds: f.map((x) => x.id), updatedAt: updatedAt.toISOString(), createdAt: createdAt.toISOString() }))}
          vehicles={vehicles.map((v) => ({ value: v.id, label: v.name }))}
          faqs={faqs.map((f) => ({ value: f.id, label: f.question }))}
        />
      </div>
    </>
  );
}
