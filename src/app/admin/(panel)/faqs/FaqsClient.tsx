'use client';

import { Manager } from '@/components/admin/Manager';
import { deleteFaq, saveFaq } from '@/lib/actions/content';

type Faq = { id: number; question: string; answer: string; order: number; active: boolean; showOnHome: boolean; services: number };

export function FaqsClient({ faqs }: { faqs: Faq[] }) {
  return (
    <Manager<Faq>
      title="Questions"
      entity="FAQ"
      newLabel="New question"
      rows={faqs}
      fields={[
        { k: 'question', label: 'Question', type: 'text', full: true },
        { k: 'answer', label: 'Answer', type: 'textarea' },
        { k: 'order', label: 'Order', type: 'number' },
        { k: 'active', label: 'Visible', type: 'toggle', help: 'Show on the website' },
        { k: 'showOnHome', label: 'Featured', type: 'toggle', help: 'Include in featured FAQ lists' },
      ]}
      hint="Tip: to show a question on a specific service page, open that service and tick it under “FAQs shown on this page”."
      blank={{ question: '', answer: '', order: faqs.length + 1, active: true, showOnHome: true }}
      toForm={(f) => ({ ...f })}
      save={saveFaq}
      remove={deleteFaq}
      searchText={(f) => `${f.question} ${f.answer}`}
      viewHref={() => '/faq'}
      columns={[
        {
          label: 'Question',
          render: (f) => (
            <div style={{ minWidth: 280 }}>
              <b style={{ fontWeight: 600 }}>{f.question}</b>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                {f.answer.length > 110 ? f.answer.slice(0, 110) + '…' : f.answer}
              </div>
            </div>
          ),
        },
        { label: 'Service pages', render: (f) => f.services, className: 'num' },
        { label: 'Status', render: (f) => <span className={`pill ${f.active ? 'published' : 'archived'}`}>{f.active ? 'Visible' : 'Hidden'}</span> },
        { label: 'Order', render: (f) => f.order, className: 'num' },
      ]}
    />
  );
}
