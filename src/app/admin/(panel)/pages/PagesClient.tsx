'use client';

import { Manager } from '@/components/admin/Manager';
import { deletePage, savePage } from '@/lib/actions/content';
import { dateFmt } from '@/lib/utils';

type P = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  body: string;
  status: string;
  showInFooter: boolean;
  order: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImage: string | null;
  updatedAt: string;
};

export function PagesClient({ pages }: { pages: P[] }) {
  return (
    <Manager<P>
      title="Pages"
      entity="Page"
      rows={pages}
      editorWide
      fields={[
        { k: 'title', label: 'Title', type: 'text' },
        { k: 'slug', label: 'URL slug', type: 'slug', from: 'title', help: 'yoursite.com/…' },
        {
          k: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'published', label: 'Published' },
            { value: 'draft', label: 'Draft (hidden)' },
          ],
        },
        { k: 'order', label: 'Order', type: 'number' },
        { k: 'showInFooter', label: 'Footer link', type: 'toggle', help: 'Link this page in the footer bar' },
        { k: 'subtitle', label: 'Intro line', type: 'textarea' },
        { k: 'body', label: 'Content', type: 'markdown' },
        { type: 'section', title: 'SEO & sharing' },
        { k: 'seoTitle', label: 'Meta title', type: 'text', full: true },
        { k: 'seoDescription', label: 'Meta description', type: 'textarea' },
        { k: 'seoKeywords', label: 'Meta keywords', type: 'text', full: true },
        { k: 'ogImage', label: 'Social share image', type: 'image' },
      ]}
      blank={{ title: '', slug: '', status: 'published', order: pages.length + 1, showInFooter: false, subtitle: '', body: '' }}
      toForm={(p) => ({ ...p, seoTitle: p.seoTitle || '', seoDescription: p.seoDescription || '', seoKeywords: p.seoKeywords || '', ogImage: p.ogImage || '' })}
      save={savePage}
      remove={deletePage}
      searchText={(p) => `${p.title} ${p.slug}`}
      viewHref={(p) => (p.status === 'published' ? `/${p.slug}` : null)}
      columns={[
        {
          label: 'Page',
          render: (p) => (
            <div className="t-title">
              <span>
                <b>{p.title}</b>
                <span>/{p.slug}</span>
              </span>
            </div>
          ),
        },
        { label: 'Status', render: (p) => <span className={`pill ${p.status === 'published' ? 'published' : 'draft'}`}>{p.status === 'published' ? 'Published' : 'Draft'}</span> },
        { label: 'Footer', render: (p) => (p.showInFooter ? 'Yes' : '—') },
        { label: 'Updated', render: (p) => dateFmt(p.updatedAt), className: 'num' },
      ]}
    />
  );
}
