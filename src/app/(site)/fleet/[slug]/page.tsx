import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { Ic } from '@/components/Sprite';
import { CtaBand, FleetCard, PageHead, SecHead, ServiceCard } from '@/components/site/Cards';
import { ContactForm } from '@/components/site/Forms';
import { Gallery } from '@/components/site/Interactive';
import { vehicleArtSvg } from '@/lib/art';
import { getFormOptions, getVehicle, getVehicles } from '@/lib/data';
import { renderMarkdown } from '@/lib/markdown';
import { absolute, pageMetadata } from '@/lib/seo';
import { getSettings, siteUrl } from '@/lib/settings';
import { telHref, waHref } from '@/lib/utils';

export async function generateMetadata(props: PageProps<'/fleet/[slug]'>) {
  const { slug } = await props.params;
  const v = await getVehicle(slug);
  if (!v) return {};
  return pageMetadata(null, {
    title: v.seoTitle || `${v.name} Rental Dubai — ${v.seatsLabel}`,
    description: v.seoDescription || v.description,
    keywords: v.seoKeywords || `${v.name} rental Dubai, ${v.name} with driver, ${v.classLabel} rental UAE`,
    ogImage: v.ogImage || v.images[0],
    path: `/fleet/${v.slug}`,
  });
}

export default async function VehiclePage(props: PageProps<'/fleet/[slug]'>) {
  const { slug } = await props.params;
  const [v, all, s, opts] = await Promise.all([getVehicle(slug), getVehicles(), getSettings(), getFormOptions()]);
  if (!v) notFound();
  const c = s.contact;
  const phone = c.phones[0] || '';
  const either = v.driverOption === 'either';
  const related = all.filter((x) => x.slug !== v.slug && x.category?.slug === v.category?.slug).slice(0, 3);
  const fill = related.length < 3 ? all.filter((x) => x.slug !== v.slug && !related.includes(x)).sort((a, b) => Math.abs(a.capacity - v.capacity) - Math.abs(b.capacity - v.capacity)).slice(0, 3 - related.length) : [];
  const base = siteUrl(s);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: base },
      { '@type': 'ListItem', position: 2, name: 'Fleet', item: `${base}/fleet` },
      { '@type': 'ListItem', position: 3, name: v.name, item: `${base}/fleet/${v.slug}`, ...(v.images[0] ? { image: absolute(base, v.images[0]) } : {}) },
    ],
  };

  return (
    <>
      <PageHead crumbs={[['Fleet', '/fleet'], [v.name]]} title={v.name} sub={`${v.classLabel} · ${v.seatsLabel} · ${either ? 'With or without driver' : 'Chauffeur-driven only'}`} />
      <section className="sec">
        <div className="wrap vd">
          <div className="reveal">
            <Gallery images={v.images} alt={v.alt} fallback={vehicleArtSvg(v.slug, v.capacity, v.name)} />
          </div>
          <div className="reveal" data-d={1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span className={`drv ${either ? 'either' : 'only'}`} style={{ fontSize: 12 }}>
              <Ic n={either ? 'i-wheel' : 'i-shield'} />
              {either ? 'With or without driver' : 'Chauffeur-driven only'}
            </span>
            <p style={{ fontSize: 'var(--t-md)', color: 'var(--text-2)', lineHeight: 1.7 }}>{v.description}</p>
            {v.tags.length > 0 && (
              <div className="tag-row">
                {v.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            )}
            <div className="panel" style={{ padding: 20 }}>
              <div className="kv">
                <span>Capacity</span>
                <b>{v.seatsLabel}</b>
              </div>
              <div className="kv">
                <span>Class</span>
                <b>{v.classLabel}</b>
              </div>
              {v.category && (
                <div className="kv">
                  <span>Category</span>
                  <b>{v.category.name}</b>
                </div>
              )}
              <div className="kv">
                <span>Driver option</span>
                <b>{either ? 'With or without driver' : 'Chauffeur-driven only'}</b>
              </div>
              {v.luggage && (
                <div className="kv">
                  <span>Luggage</span>
                  <b>{v.luggage}</b>
                </div>
              )}
              {v.bestFor && (
                <div className="kv">
                  <span>Best for</span>
                  <b>{v.bestFor}</b>
                </div>
              )}
              <div className="kv">
                <span>Pricing</span>
                <b>Quoted in AED</b>
              </div>
            </div>
            {v.features.length > 0 && (
              <ul className="check-list">
                {v.features.map((f) => (
                  <li key={f}>
                    <Ic n="i-check" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              {phone && (
                <a className="btn btn-ghost" href={telHref(phone)}>
                  <Ic n="i-phone" /> Call Now
                </a>
              )}
              {c.whatsapp && (
                <a className="btn btn-whats" href={waHref(c.whatsapp, `Hello, I would like a quote for the ${v.name}.`)} target="_blank" rel="noopener">
                  <Ic n="i-whats" /> WhatsApp
                </a>
              )}
              <Link className="btn btn-primary" href="#vehicle-quote" style={{ gridColumn: '1/-1' }}>
                Get a Quote <Ic n="i-arrow" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="sec sec-alt" id="vehicle-quote">
        <div className="wrap map-wrap">
          <div className="reveal">
            {v.body ? (
              <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(v.body) }} />
            ) : (
              <div className="prose">
                <h2 style={{ marginTop: 0 }}>Book the {v.name}</h2>
                <p>
                  The {v.name} is available for airport transfers, hotel transfers, city tours, events and daily or monthly hire across Dubai, Abu Dhabi and all seven emirates. Send your pick-up,
                  destination, date and passenger count and we’ll confirm availability and an AED price.
                </p>
              </div>
            )}
            {v.services.length > 0 && (
              <div style={{ marginTop: 26 }}>
                <span className="eyebrow">Popular for</span>
                <div className="grid g-2" style={{ marginTop: 14 }}>
                  {v.services.slice(0, 4).map((x, i) => (
                    <ServiceCard key={x.slug} s={x} i={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="panel reveal" data-d={1}>
            <h3>Get a quote for the {v.name}</h3>
            <p className="note" style={{ margin: '4px 0 16px' }}>
              We reply with an AED price by phone or WhatsApp.
            </p>
            <ContactForm services={opts.services} vehicles={opts.vehicles} initial={{ vehicle: `${v.name} (${v.seatsLabel})` }} compact source={`vehicle:${v.slug}`} />
          </div>
        </div>
      </section>

      {related.length + fill.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <SecHead eyebrow="Similar vehicles" title="You may also consider">
              <Link className="btn btn-ghost btn-sm" href="/fleet">
                View full fleet <Ic n="i-arrow" />
              </Link>
            </SecHead>
            <div className="grid g-3">
              {[...related, ...fill].map((x, i) => (
                <FleetCard key={x.slug} v={x} i={i} contact={{ phone, whatsapp: c.whatsapp }} />
              ))}
            </div>
          </div>
        </section>
      )}
      <CtaBand title={s.home.ctaTitle} sub={s.home.ctaSub} image={s.home.ctaImage} phone={phone} whatsapp={c.whatsapp} waText={c.whatsappMessage} />
      <JsonLd data={ld} />
    </>
  );
}
