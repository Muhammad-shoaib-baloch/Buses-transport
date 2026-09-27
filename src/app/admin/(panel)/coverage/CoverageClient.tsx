'use client';

import { Manager } from '@/components/admin/Manager';
import { deleteArea, deleteRoute, saveArea, saveRoute } from '@/lib/actions/content';
import { mins } from '@/lib/utils';

type Area = { id: number; name: string; code: string; note: string; badge: string; kind: string; isHub: boolean; mapKey: string | null; order: number; active: boolean };
type Route = { id: number; from: string; to: string; km: number | null; mins: number | null; note: string; order: number; active: boolean; showInTicker: boolean };

const KIND: Record<string, string> = { emirate: 'Emirate / city (map)', airport: 'Airport', area: 'Area / neighbourhood' };

export function AreasClient({ areas, mapKeys }: { areas: Area[]; mapKeys: string[] }) {
  return (
    <Manager<Area>
      title="Areas served"
      entity="Area"
      rows={areas}
      fields={[
        { k: 'name', label: 'Name', type: 'text' },
        { k: 'kind', label: 'Type', type: 'select', options: Object.entries(KIND).map(([value, label]) => ({ value, label })) },
        { k: 'code', label: 'Code', type: 'text', help: 'e.g. DXB' },
        { k: 'badge', label: 'Badge', type: 'text', help: 'e.g. Head office, Covered' },
        { k: 'note', label: 'Short note', type: 'text', full: true },
        { k: 'mapKey', label: 'Point on the UAE map', type: 'select', options: [{ value: '', label: '— not on map —' }, ...mapKeys.map((k) => ({ value: k, label: k }))] },
        { k: 'order', label: 'Order', type: 'number' },
        { k: 'isHub', label: 'Highlight', type: 'toggle', help: 'Show as head office (red pulsing dot)' },
        { k: 'active', label: 'Visible', type: 'toggle', help: 'Show on the website' },
      ]}
      blank={{ name: '', kind: 'area', code: '', badge: '', note: '', mapKey: '', order: areas.length + 1, isHub: false, active: true }}
      toForm={(a) => ({ ...a, mapKey: a.mapKey || '' })}
      save={saveArea}
      remove={deleteArea}
      searchText={(a) => `${a.name} ${a.code} ${a.note}`}
      viewHref={() => '/coverage'}
      filters={[
        { key: 'emirate', label: 'Emirates', test: (a) => a.kind === 'emirate' },
        { key: 'airport', label: 'Airports', test: (a) => a.kind === 'airport' },
        { key: 'area', label: 'Areas', test: (a) => a.kind === 'area' },
      ]}
      columns={[
        {
          label: 'Name',
          render: (a) => (
            <div>
              <b style={{ fontWeight: 600 }}>{a.name}</b>
              <div className="muted" style={{ fontSize: 12 }}>
                {a.note}
              </div>
            </div>
          ),
        },
        { label: 'Type', render: (a) => KIND[a.kind] || a.kind },
        { label: 'Code', render: (a) => a.code, className: 'num' },
        { label: 'Map', render: (a) => (a.mapKey ? (a.isHub ? 'Head office' : 'Yes') : '—') },
        { label: 'Status', render: (a) => <span className={`pill ${a.active ? 'published' : 'archived'}`}>{a.active ? 'Visible' : 'Hidden'}</span> },
      ]}
    />
  );
}

export function RoutesClient({ routes }: { routes: Route[] }) {
  return (
    <Manager<Route>
      title="Popular routes"
      entity="Route"
      rows={routes}
      fields={[
        { k: 'from', label: 'From', type: 'text' },
        { k: 'to', label: 'To', type: 'text' },
        { k: 'km', label: 'Distance (km)', type: 'number', help: 'approximate' },
        { k: 'mins', label: 'Drive time (minutes)', type: 'number', help: 'approximate' },
        { k: 'note', label: 'Note', type: 'text', full: true, help: 'e.g. Approx. via E11' },
        { k: 'order', label: 'Order', type: 'number' },
        { k: 'showInTicker', label: 'Ticker', type: 'toggle', help: 'Show in the scrolling ticker under the hero' },
        { k: 'active', label: 'Visible', type: 'toggle', help: 'Show on the website' },
      ]}
      blank={{ from: 'Dubai', to: '', km: '', mins: '', note: '', order: routes.length + 1, showInTicker: true, active: true }}
      toForm={(r) => ({ ...r, km: r.km ?? '', mins: r.mins ?? '' })}
      save={saveRoute}
      remove={deleteRoute}
      searchText={(r) => `${r.from} ${r.to} ${r.note}`}
      columns={[
        { label: 'Route', render: (r) => <b style={{ fontWeight: 600 }}>{`${r.from} → ${r.to}`}</b> },
        { label: 'Distance', render: (r) => (r.km ? `${r.km} km` : '—'), className: 'num' },
        { label: 'Time', render: (r) => (r.mins ? mins(r.mins) : '—'), className: 'num' },
        { label: 'Ticker', render: (r) => (r.showInTicker ? 'Yes' : '—') },
        { label: 'Status', render: (r) => <span className={`pill ${r.active ? 'published' : 'archived'}`}>{r.active ? 'Visible' : 'Hidden'}</span> },
      ]}
    />
  );
}
