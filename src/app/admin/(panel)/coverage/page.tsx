import { Topbar } from '@/components/admin/Sidebar';
import { MAP_NODES } from '@/components/site/Widgets';
import { db } from '@/lib/db';
import { AreasClient, RoutesClient } from './CoverageClient';

export const metadata = { title: 'Coverage & routes' };

export default async function CoverageAdmin() {
  const [areas, routes] = await Promise.all([
    db.area.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] }),
    db.route.findMany({ orderBy: [{ order: 'asc' }, { id: 'asc' }] }),
  ]);
  return (
    <>
      <Topbar title="Coverage & routes" sub="Emirates on the map, airports, areas served and the popular routes ticker" />
      <div className="body">
        <AreasClient areas={areas} mapKeys={Object.keys(MAP_NODES)} />
        <RoutesClient routes={routes} />
      </div>
    </>
  );
}
