'use client';

import { Manager } from '@/components/admin/Manager';
import type { FieldDef, Opt, Values } from '@/components/admin/Fields';
import { deleteCategory, deleteVehicle, saveCategory, saveVehicle } from '@/lib/actions/content';
import { vehicleArtSvg } from '@/lib/art';

type Veh = {
  id: number;
  slug: string;
  name: string;
  classLabel: string;
  seatsLabel: string;
  capacity: number;
  driverOption: string;
  tags: string;
  description: string;
  body: string;
  luggage: string;
  bestFor: string;
  features: string;
  imagesList: string[];
  alt: string;
  order: number;
  active: boolean;
  featured: boolean;
  categoryId: number | null;
  categoryName: string;
  serviceIds: number[];
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImage: string | null;
};

export function FleetClient({ vehicles, categories, services }: { vehicles: Veh[]; categories: Opt[]; services: Opt[] }) {
  const fields: FieldDef[] = [
    { type: 'section', title: 'Vehicle' },
    { k: 'name', label: 'Vehicle name', type: 'text' },
    { k: 'slug', label: 'URL slug', type: 'slug', from: 'name', help: '/fleet/…' },
    { k: 'categoryId', label: 'Category', type: 'select', options: [{ value: '', label: '— none —' }, ...categories] },
    { k: 'classLabel', label: 'Class label', type: 'text', help: 'e.g. Luxury MPV' },
    { k: 'seatsLabel', label: 'Seats label', type: 'text', help: 'e.g. 6–7 seats' },
    { k: 'capacity', label: 'Max passengers', type: 'number', help: 'used for sorting' },
    {
      k: 'driverOption',
      label: 'Driver option',
      type: 'select',
      options: [
        { value: 'chauffeur', label: 'Chauffeur-driven only' },
        { value: 'either', label: 'With or without driver (self-drive)' },
      ],
    },
    { k: 'order', label: 'Order', type: 'number', help: 'homepage & menu order' },
    { k: 'active', label: 'Visible on website', type: 'toggle', help: 'Show this vehicle on the website' },
    { k: 'featured', label: 'Homepage & menu', type: 'toggle', help: 'Show in the homepage fleet slider and the Fleet menu' },
    { k: 'imagesList', label: 'Photos', type: 'images', help: 'the first photo is the cover' },
    { k: 'alt', label: 'Photo description (alt text)', type: 'text', full: true },
    { k: 'description', label: 'Card description', type: 'textarea' },
    { k: 'tags', label: 'Tags', type: 'text', help: 'comma separated, e.g. VIP transfer, Airport transfer', full: true },
    { k: 'luggage', label: 'Luggage', type: 'text', help: 'e.g. 5 large cases' },
    { k: 'bestFor', label: 'Best for', type: 'text' },
    { k: 'features', label: 'Features list', type: 'textarea', help: 'one per line, shown on the vehicle page' },
    { k: 'body', label: 'Vehicle page content', type: 'markdown', help: 'optional' },
    { k: 'serviceIds', label: 'Popular for (services)', type: 'multi', options: services },
    { type: 'section', title: 'SEO & sharing', desc: 'Leave empty for automatic “{Vehicle} Rental Dubai” titles.' },
    { k: 'seoTitle', label: 'Meta title', type: 'text', full: true },
    { k: 'seoDescription', label: 'Meta description', type: 'textarea' },
    { k: 'seoKeywords', label: 'Meta keywords', type: 'text', full: true },
    { k: 'ogImage', label: 'Social share image', type: 'image' },
  ];
  const toForm = (v: Veh): Values => ({
    ...v,
    categoryId: v.categoryId ?? '',
    seoTitle: v.seoTitle || '',
    seoDescription: v.seoDescription || '',
    seoKeywords: v.seoKeywords || '',
    ogImage: v.ogImage || '',
  });
  const save = (v: Values) => saveVehicle({ ...v, images: v.imagesList });
  const thumb = (v: Veh) =>
    v.imagesList[0] ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={v.imagesList[0]} alt="" />
    ) : (
      <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: vehicleArtSvg(v.slug, v.capacity, v.name) }} />
    );
  return (
    <Manager<Veh>
      title="Vehicles"
      entity="Vehicle"
      rows={vehicles}
      editorWide
      fields={fields}
      blank={{ name: '', slug: '', categoryId: categories[0]?.value ?? '', classLabel: '', seatsLabel: '', capacity: 4, driverOption: 'chauffeur', order: 50, active: true, featured: false, imagesList: [], alt: '', description: '', tags: '', luggage: '', bestFor: '', features: '', body: '', serviceIds: [] }}
      toForm={toForm}
      save={save}
      remove={deleteVehicle}
      searchText={(v) => `${v.name} ${v.classLabel} ${v.categoryName} ${v.tags}`}
      viewHref={(v) => (v.active ? `/fleet/${v.slug}` : null)}
      filters={[
        { key: 'home', label: 'On homepage', test: (v) => v.featured },
        { key: 'self', label: 'Self-drive', test: (v) => v.driverOption === 'either' },
        { key: 'nophoto', label: 'Needs photos', test: (v) => v.imagesList.length === 0 },
        { key: 'off', label: 'Hidden', test: (v) => !v.active },
      ]}
      columns={[
        {
          label: 'Vehicle',
          render: (v) => (
            <div className="t-title">
              <span className="t-thumb">{thumb(v)}</span>
              <span>
                <b>{v.name}</b>
                <span>
                  {v.imagesList.length} photo{v.imagesList.length === 1 ? '' : 's'} · /fleet/{v.slug}
                </span>
              </span>
            </div>
          ),
        },
        { label: 'Category', render: (v) => v.categoryName || '—' },
        { label: 'Capacity', render: (v) => v.seatsLabel, className: 'num' },
        { label: 'Driver', render: (v) => (v.driverOption === 'either' ? 'With / without' : 'Chauffeur only') },
        { label: 'Status', render: (v) => <span className={`pill ${v.active ? 'published' : 'archived'}`}>{v.active ? (v.featured ? 'Visible · home' : 'Visible') : 'Hidden'}</span> },
      ]}
    />
  );
}

type Cat = { id: number; name: string; slug: string; order: number; count: number };

export function CategoriesClient({ categories }: { categories: Cat[] }) {
  return (
    <Manager<Cat>
      title="Fleet categories"
      entity="Category"
      rows={categories}
      fields={[
        { k: 'name', label: 'Category name', type: 'text' },
        { k: 'slug', label: 'Slug', type: 'slug', from: 'name' },
        { k: 'order', label: 'Order', type: 'number' },
      ]}
      blank={{ name: '', slug: '', order: categories.length + 1 }}
      toForm={(c) => ({ ...c })}
      save={saveCategory}
      remove={deleteCategory}
      columns={[
        { label: 'Category', render: (c) => <b>{c.name}</b> },
        { label: 'Vehicles', render: (c) => c.count, className: 'num' },
        { label: 'Order', render: (c) => c.order, className: 'num' },
      ]}
    />
  );
}
