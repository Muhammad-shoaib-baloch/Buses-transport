import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { Ic } from '@/components/Sprite';
import { CtaBand, FleetCard, PageHead, SecHead, ServiceCard } from '@/components/site/Cards';
import { ContactForm } from '@/components/site/Forms';
import { getFormOptions, getService, getServices } from '@/lib/data';
import { renderMarkdown } from '@/lib/markdown';
import { absolute, pageMetadata } from '@/lib/seo';
import { getSettings, siteUrl } from '@/lib/settings';
import { telHref, waHref } from '@/lib/utils';

export async function generateMetadata(props: PageProps<'/services/[slug]'>) {
  const { slug } = await props.params;
  const s = await getService(slug);
  if (!s) return {};
  return pageMetadata(null, {
    title: s.seoTitle || s.heroTitle || s.name,
    description: s.seoDescription || s.blurb,
    keywords: s.seoKeywords,
    ogImage: s.ogImage || s.image,
    path: `/services/${s.slug}`,
  });
}

export default async function ServicePage(props: PageProps<'/services/[slug]'>) {
  const { slug } = await props.params;
  const [svc, all, settings, opts] = await Promise.all([getService(slug), getServices(), getSettings(), getFormOptions()]);
  if (!svc) notFound();
  const c = settings.contact;
  const phone = c.phones[0] || '';
  const others = all.filter((x) => x.slug !== svc.slug).slice(0, 4);
  const base = siteUrl(settings);

  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: svc.name,
      serviceType: svc.name,
      description: svc.seoDescription || svc.blurb,
      url: `${base}/services/${svc.slug}`,
      provider: { '@id': `${base}/#business` },
      areaServed: { '@type': 'Country', name: 'United Arab Emirates' },
      ...(svc.image ? { image: absolute(base, svc.image) } : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: base },
        { '@type': 'ListItem', position: 2, name: 'Services', item: `${base}/services` },
        { '@type': 'ListItem', position: 3, name: svc.name, item: `${base}/services/${svc.slug}` },
      ],
    },
    ...(svc.faqs.length
      ? [
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: svc.faqs.map((f) => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHead crumbs={[['Services', '/services'], [svc.name]]} title={svc.heroTitle} sub={svc.heroSub}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
          <Link className="btn btn-primary" href={`/contact?service=${svc.slug}`}>
            Get a Quote <Ic n="i-arrow" />
          </Link>
          {c.whatsapp && (
            <a className="btn btn-whats" href={waHref(c.whatsapp, `Hello, I would like a quote for ${svc.name}.`)} target="_blank" rel="noopener">
              <Ic n="i-whats" /> WhatsApp Us
            </a>
          )}
          {phone && (
            <a className="btn btn-ghost" href={telHref(phone)}>
              <Ic n="i-phone" /> Call Now
            </a>
          )}
        </div>
      </PageHead>

      <section className="sec">
        <div className="wrap">
          <div className="map-wrap">
            <div className="reveal">
              {svc.image && (
                <div className="article-hero" style={{ aspectRatio: '16/9' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={svc.image} alt={svc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(svc.body) }} />
              {svc.included.length > 0 && (
                <div style={{ marginTop: 34 }}>
                  <span className="eyebrow">What’s included</span>
                  <h2 style={{ fontSize: 'var(--t-xl)', margin: '10px 0 16px' }}>Every booking includes</h2>
                  <ul className="check-list">
                    {svc.included.map((it) => (
                      <li key={it}>
                        <Ic n="i-check" />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="reveal" data-d={1} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="panel">
                <h3>At a glance</h3>
                <div className="kv">
                  <span>Service</span>
                  <b>{svc.name}</b>
                </div>
                {svc.meta && (
                  <div className="kv">
                    <span>Typical booking</span>
                    <b>{svc.meta}</b>
                  </div>
                )}
                <div className="kv">
                  <span>Coverage</span>
                  <b>All 7 emirates</b>
                </div>
                <div className="kv">
                  <span>Bookings & support</span>
                  <b>24 / 7</b>
                </div>
                <div className="kv">
                  <span>Pricing</span>
                  <b>Quoted in AED</b>
                </div>
              </div>
              <div className="panel">
                <h3>Get a quote for {svc.name}</h3>
                <p className="note" style={{ margin: '4px 0 16px' }}>
                  Send us your trip details — we’ll confirm an AED price by phone or WhatsApp.
                </p>
                <ContactForm services={opts.services} vehicles={opts.vehicles} initial={{ service: svc.name }} compact source={`service:${svc.slug}`} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {svc.steps.length > 0 && (
        <section className="sec sec-alt">
          <div className="wrap">
            <SecHead eyebrow="Process" title="How it works" />
            <div className="nsteps">
              {svc.steps.map((st, i) => (
                <div className="nstep reveal" data-d={i} key={st.t + i}>
                  <b>{String(i + 1).padStart(2, '0')}</b>
                  <h3>{st.t}</h3>
                  <p>{st.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {svc.vehicles.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <SecHead eyebrow="Recommended vehicles" title={`Vehicles for ${svc.name.toLowerCase()}`}>
              <Link className="btn btn-ghost btn-sm" href="/fleet">
                View full fleet <Ic n="i-arrow" />
              </Link>
            </SecHead>
            <div className="grid g-3">
              {svc.vehicles.map((v, i) => (
                <FleetCard key={v.slug} v={v} i={i} contact={{ phone, whatsapp: c.whatsapp }} />
              ))}
            </div>
          </div>
        </section>
      )}

      {svc.faqs.length > 0 && (
        <section className="sec sec-alt">
          <div className="wrap" style={{ maxWidth: 900 }}>
            <SecHead eyebrow="FAQ" title="Common questions" />
            <div className="faq-list">
              {svc.faqs.map((f, i) => (
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
      )}

      {others.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <SecHead eyebrow="Related" title="Other services you may need" />
            <div className="grid g-4">
              {others.map((x, i) => (
                <ServiceCard key={x.slug} s={x} i={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaBand title={settings.home.ctaTitle} sub={settings.home.ctaSub} image={settings.home.ctaImage} phone={phone} whatsapp={c.whatsapp} waText={c.whatsappMessage} />
      <JsonLd data={ld} />
    </>
  );
}
