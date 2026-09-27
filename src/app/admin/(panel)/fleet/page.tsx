import { Topbar } from '@/components/admin/Sidebar';
import { db } from '@/lib/db';
import { parseJSON } from '@/lib/utils';
import { CategoriesClient, FleetClient } from './FleetClient';

export const metadata = { title: 'Fleet' };

export default async function FleetAdmin() {
  const [vehicles, categories, services] = await Promise.all([
    db.vehicle.findMany({ orderBy: [{ category: { order: 'asc' } }, { capacity: 'asc' }, { order: 'asc' }], include: { category: true, services: { select: { id: true } } } }),
    db.fleetCategory.findMany({ orderBy: [{ order: 'asc' }], include: { _count: { select: { vehicles: true } } } }),
    db.service.findMany({ orderBy: [{ order: 'asc' }], select: { id: true, name: true } }),
  ]);
  return (
    <>
      <Topbar title="Fleet" sub="Vehicles, photos, capacities and categories" />
      <div className="body">
        <FleetClient
          vehicles={vehicles.map(({ category, services: sv, createdAt, updatedAt, ...v }) => ({
            ...v,
            imagesList: parseJSON<string[]>(v.images, []),
            categoryName: category?.name || '',
            serviceIds: sv.map((x) => x.id),
            createdAt: createdAt.toISOString(),
            updatedAt: updatedAt.toISOString(),
          }))}
          categories={categories.map((c) => ({ value: c.id, label: c.name }))}
          services={services.map((s) => ({ value: s.id, label: s.name }))}
        />
        <CategoriesClient categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, order: c.order, count: c._count.vehicles }))} />
      </div>
    </>
  );
}
