'use client';

import { Ic } from '@/components/Sprite';
import { Manager } from '@/components/admin/Manager';
import type { FieldDef, Opt, Values } from '@/components/admin/Fields';
import { deleteService, saveService } from '@/lib/actions/content';
import { parseJSON } from '@/lib/utils';

type Svc = {
  id: number;
  slug: string;
  name: string;
  icon: string;
  meta: string;
  blurb: string;
  heroTitle: string;
  heroSub: string;
  body: string;
  included: string;
  steps: string;
  image: string | null;
  order: number;
  active: boolean;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImage: string | null;
  vehicleIds: number[];
  faqIds: number[];
};

export function ServicesClient({ services, vehicles, faqs }: { services: Svc[]; vehicles: Opt[]; faqs: Opt[] }) {
  const fields: FieldDef[] = [
    { type: 'section', title: 'Card & menu', desc: 'Shown on the homepage, the services page and the mega menu.' },
    { k: 'name', label: 'Service name', type: 'text' },
    { k: 'slug', label: 'URL slug', type: 'slug', from: 'name', help: '/services/…' },
    { k: 'meta', label: 'Short line', type: 'text', help: 'e.g. DXB · DWC · AUH · SHJ' },
    { k: 'order', label: 'Order', type: 'number', help: 'lower comes first' },
    { k: 'blurb', label: 'Card description', type: 'textarea' },
    { k: 'icon', label: 'Icon', type: 'icon' },
    { k: 'active', label: 'Visible on website', type: 'toggle', help: 'Show this service on the website' },
    { k: 'featured', label: 'Homepage', type: 'toggle', help: 'Show on the homepage services grid' },
    { type: 'section', title: 'Service page' },
    { k: 'heroTitle', label: 'Page heading (H1)', type: 'text', full: true },
    { k: 'heroSub', label: 'Page intro', type: 'textarea' },
    { k: 'image', label: 'Header image', type: 'image', help: 'optional' },
    { k: 'body', label: 'Main content', type: 'markdown' },
    { k: 'included', label: 'Every booking includes', type: 'textarea', help: 'one item per line' },
    { k: 'steps', label: 'How it works (steps)', type: 'steps' },
    { k: 'vehicleIds', label: 'Recommended vehicles', type: 'multi', options: vehicles },
    { k: 'faqIds', label: 'FAQs shown on this page', type: 'multi', options: faqs },
    { type: 'section', title: 'SEO & sharing', desc: 'Leave empty to use the page heading and intro.' },
    { k: 'seoTitle', label: 'Meta title', type: 'text', full: true },
    { k: 'seoDescription', label: 'Meta description', type: 'textarea' },
    { k: 'seoKeywords', label: 'Meta keywords', type: 'text', full: true },
    { k: 'ogImage', label: 'Social share image', type: 'image' },
  ];
  const toForm = (s: Svc): Values => ({
    ...s,
    steps: parseJSON(s.steps, []),
    image: s.image || '',
    seoTitle: s.seoTitle || '',
    seoDescription: s.seoDescription || '',
    seoKeywords: s.seoKeywords || '',
    ogImage: s.ogImage || '',
  });
  return (
    <Manager<Svc>
      title="Services"
      entity="Service"
      rows={services}
      editorWide
      fields={fields}
      blank={{ name: '', slug: '', icon: 'i-route', meta: '', blurb: '', heroTitle: '', heroSub: '', body: '', included: '', steps: [], image: '', order: services.length + 1, active: true, featured: true, vehicleIds: [], faqIds: [] }}
      toForm={toForm}
      save={saveService}
      remove={deleteService}
      searchText={(s) => `${s.name} ${s.slug} ${s.meta}`}
      viewHref={(s) => (s.active ? `/services/${s.slug}` : null)}
      filters={[
        { key: 'on', label: 'Visible', test: (s) => s.active },
        { key: 'off', label: 'Hidden', test: (s) => !s.active },
      ]}
      columns={[
        {
          label: 'Service',
          render: (s) => (
            <div className="t-title">
              <span className="tile-ico" style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', borderRadius: 10, background: 'var(--r-wash)', color: 'var(--r-600)' }}>
                <Ic n={s.icon} />
              </span>
              <span>
                <b>{s.name}</b>
                <span>/services/{s.slug}</span>
              </span>
            </div>
          ),
        },
        { label: 'Short line', render: (s) => s.meta },
        { label: 'Vehicles', render: (s) => s.vehicleIds.length, className: 'num' },
        { label: 'Status', render: (s) => <span className={`pill ${s.active ? 'published' : 'archived'}`}>{s.active ? (s.featured ? 'Visible · home' : 'Visible') : 'Hidden'}</span> },
        { label: 'Order', render: (s) => s.order, className: 'num' },
      ]}
    />
  );
}
