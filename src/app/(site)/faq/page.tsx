import { JsonLd } from '@/components/JsonLd';
import { Ic } from '@/components/Sprite';
import { CtaBand, PageHead } from '@/components/site/Cards';
import { getFaqs } from '@/lib/data';
import { pageMetadata } from '@/lib/seo';
import { getSettings } from '@/lib/settings';

export async function generateMetadata() {
  return pageMetadata('faq', { title: 'Frequently Asked Questions', path: '/faq' });
}

export default async function FaqPage() {
  const [s, faqs] = await Promise.all([getSettings(), getFaqs()]);
  return (
    <>
      <PageHead crumbs={[['FAQ']]} title="Frequently asked questions" sub="Answers to the questions we hear most often about booking, pricing, coverage and our fleet." />
      <section className="sec">
        <div className="wrap" style={{ maxWidth: 900 }}>
          <div className="faq-list">
            {faqs.map((f, i) => (
              <details className="faq-item reveal" data-d={i % 4} key={f.id} open={i === 0}>
                <summary>
                  {f.question}
                  <Ic n="i-chev" />
                </summary>
                <div className="faq-a">{f.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
      <CtaBand title="Still have a question?" sub="Our team is available 24/7 by phone and WhatsApp to help with anything not covered here." image={s.home.ctaImage} phone={s.contact.phones[0] || ''} whatsapp={s.contact.whatsapp} waText={s.contact.whatsappMessage} />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
        }}
      />
    </>
  );
}
