import { Ic } from '@/components/Sprite';
import { PageHead } from '@/components/site/Cards';
import { ContactForm } from '@/components/site/Forms';
import { getAreas, getFormOptions } from '@/lib/data';
import { pageMetadata } from '@/lib/seo';
import { getSettings } from '@/lib/settings';
import { telHref, waHref } from '@/lib/utils';

export async function generateMetadata() {
  return pageMetadata('contact', { title: 'Contact Us', path: '/contact' });
}

export default async function ContactPage(props: PageProps<'/contact'>) {
  const sp = await props.searchParams;
  const [s, opts, areas] = await Promise.all([getSettings(), getFormOptions(), getAreas()]);
  const c = s.contact;
  const svc = opts.services.find((o) => o.value === sp.service)?.label;
  const veh = opts.vehicles.find((o) => o.value === sp.vehicle)?.label;
  const places = areas;

  return (
    <>
      <PageHead crumbs={[['Contact']]} title={c.contactTitle} sub={c.contactSub}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
          {c.whatsapp && (
            <a className="btn btn-whats" href={waHref(c.whatsapp, c.whatsappMessage)} target="_blank" rel="noopener">
              <Ic n="i-whats" /> WhatsApp Us
            </a>
          )}
          {c.phones[0] && (
            <a className="btn btn-ghost" href={telHref(c.phones[0])}>
              <Ic n="i-phone" /> Call Now
            </a>
          )}
        </div>
      </PageHead>
      <section className="sec">
        <div className="wrap map-wrap">
          <div className="panel reveal" id="quote">
            <h3>Request a free quote</h3>
            <p className="note" style={{ margin: '6px 0 20px' }}>
              Rough details are fine — we’ll come back with questions if we need them.
            </p>
            <ContactForm services={opts.services} vehicles={opts.vehicles} initial={{ service: svc, vehicle: veh }} source="contact" />
          </div>
          <div className="reveal" data-d={1} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="panel">
              <h3>Speak to our team</h3>
              <div className="foot-contact" style={{ marginTop: 12, color: 'var(--text-2)' }}>
                {c.phones.map((ph) => (
                  <a className="fc" key={ph} href={telHref(ph)}>
                    <Ic n="i-phone" />
                    <span>
                      <b className="mono">{ph}</b>
                      <br />
                      <span className="note">Call, 24 hours</span>
                    </span>
                  </a>
                ))}
                {c.whatsapp && (
                  <a className="fc" href={waHref(c.whatsapp, c.whatsappMessage)} target="_blank" rel="noopener">
                    <Ic n="i-whats" />
                    <span>
                      <b className="mono">{c.whatsapp}</b>
                      <br />
                      <span className="note">WhatsApp, 24 hours</span>
                    </span>
                  </a>
                )}
                {c.emails.map((e) => (
                  <a className="fc" key={e} href={`mailto:${e}`}>
                    <Ic n="i-mail" />
                    <span>
                      <b style={{ overflowWrap: 'anywhere' }}>{e}</b>
                      <br />
                      <span className="note">Email</span>
                    </span>
                  </a>
                ))}
                {c.address && (
                  <span className="fc">
                    <Ic n="i-pin" />
                    <span>
                      <b>Based in</b>
                      <br />
                      <span className="note">{c.address}</span>
                    </span>
                  </span>
                )}
              </div>
            </div>
            {c.hoursRows.length > 0 && (
              <div className="panel">
                <h3>Hours</h3>
                {c.hoursRows.map((h) => (
                  <div className="kv" key={h.label}>
                    <span>{h.label}</span>
                    <b>{h.value}</b>
                  </div>
                ))}
              </div>
            )}
            {c.mapEmbedUrl && /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/i.test(c.mapEmbedUrl) && (
              <div className="map-embed">
                <iframe src={c.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Office location" allowFullScreen />
              </div>
            )}
          </div>
        </div>
      </section>
      {places.length > 0 && (
        <section className="sec-tight sec-alt">
          <div className="wrap">
            <span className="eyebrow">Coverage</span>
            <h2 style={{ fontSize: 'var(--t-2xl)', margin: '12px 0 18px' }}>Areas we serve</h2>
            <div className="chips">
              {places.map((p) => (
                <span key={p.id}>
                  <Ic n={p.kind === 'airport' ? 'i-plane' : 'i-pin'} /> {p.name}
                  {p.kind === 'airport' && p.code ? ` (${p.code})` : ''}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
