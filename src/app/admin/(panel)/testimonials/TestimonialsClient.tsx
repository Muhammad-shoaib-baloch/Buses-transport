'use client';

import { Manager } from '@/components/admin/Manager';
import { deleteTestimonial, saveTestimonial } from '@/lib/actions/content';

type T = { id: number; quote: string; name: string; role: string; avatar: string; stat: string; statLabel: string; rating: number; order: number; active: boolean };

export function TestimonialsClient({ rows }: { rows: T[] }) {
  return (
    <Manager<T>
      title="Testimonials"
      entity="Testimonial"
      rows={rows}
      fields={[
        { k: 'quote', label: 'What the client said', type: 'textarea' },
        { k: 'name', label: 'Client name', type: 'text', help: 'or role, e.g. “Travel manager”' },
        { k: 'role', label: 'Company / context', type: 'text', help: 'e.g. Hotel group, Dubai' },
        { k: 'avatar', label: 'Initials', type: 'text', help: 'auto from name when empty' },
        {
          k: 'rating',
          label: 'Stars',
          type: 'select',
          options: [5, 4, 3, 2, 1].map((n) => ({ value: n, label: `${n} star${n > 1 ? 's' : ''}` })),
        },
        { k: 'stat', label: 'Highlight number', type: 'text', help: 'optional, e.g. 300' },
        { k: 'statLabel', label: 'Highlight label', type: 'text', help: 'e.g. Guests moved' },
        { k: 'order', label: 'Order', type: 'number' },
        { k: 'active', label: 'Visible', type: 'toggle', help: 'Show on the homepage' },
      ]}
      hint="Only add genuine reviews you have permission to publish."
      blank={{ quote: '', name: '', role: '', avatar: '', rating: 5, stat: '', statLabel: '', order: rows.length + 1, active: true }}
      toForm={(t) => ({ ...t })}
      save={saveTestimonial}
      remove={deleteTestimonial}
      searchText={(t) => `${t.name} ${t.role} ${t.quote}`}
      columns={[
        {
          label: 'Client',
          render: (t) => (
            <div className="t-title" style={{ minWidth: 200 }}>
              <span className="av" style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--grad-brand)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12, flex: 'none' }}>
                {t.avatar}
              </span>
              <span>
                <b>{t.name}</b>
                <span>{t.role}</span>
              </span>
            </div>
          ),
        },
        { label: 'Quote', render: (t) => <span className="muted">{t.quote.length > 90 ? t.quote.slice(0, 90) + '…' : t.quote}</span> },
        { label: 'Stars', render: (t) => '★'.repeat(t.rating), className: 'num' },
        { label: 'Status', render: (t) => <span className={`pill ${t.active ? 'published' : 'archived'}`}>{t.active ? 'Visible' : 'Hidden'}</span> },
      ]}
    />
  );
}
