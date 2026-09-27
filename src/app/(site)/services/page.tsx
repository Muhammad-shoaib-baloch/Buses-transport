import { PageHead, SecHead, ServiceCard, CtaBand } from '@/components/site/Cards';
import { getFaqs, getServices } from '@/lib/data';
import { pageMetadata } from '@/lib/seo';
import { getSettings } from '@/lib/settings';

export async function generateMetadata() {
  return pageMetadata('services', { title: 'Transportation Services in Dubai & the UAE', path: '/services' });
}

export default async function ServicesPage() {
  const [s, services, faqs] = await Promise.all([getSettings(), getServices(), getFaqs()]);
  const grid = services.length % 3 === 0 && services.length % 4 !== 0 ? 'g-3' : 'g-4';
  return (
    <>
      <PageHead
        crumbs={[['Services']]}
        title="Transportation services across the UAE"
        sub="From airport pick-ups to monthly corporate contracts — transfers and daily hire are booked per journey; shuttles, staff transport and monthly rental run on a standing plan with dedicated vehicles."
      />
      <section className="sec">
        <div className="wrap">
          <div className={`grid ${grid}`}>
            {services.map((x, i) => (
              <ServiceCard key={x.slug} s={x} i={i} />
            ))}
          </div>
        </div>
      </section>
      {faqs.length > 0 && (
        <section className="sec sec-alt">
          <div className="wrap">
            <SecHead eyebrow="Common questions" title="Frequently asked questions" />
            <div className="grid g-2" style={{ gap: 12 }}>
              {faqs.map((f, i) => (
                <div className="panel reveal" data-d={i % 4} key={f.id}>
                  <h3 style={{ fontSize: 'var(--t-md)' }}>{f.question}</h3>
                  <p className="note" style={{ marginTop: 8, fontSize: 'var(--t-sm)' }}>
                    {f.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand title={s.home.ctaTitle} sub={s.home.ctaSub} image={s.home.ctaImage} phone={s.contact.phones[0] || ''} whatsapp={s.contact.whatsapp} waText={s.contact.whatsappMessage} />
    </>
  );
}
