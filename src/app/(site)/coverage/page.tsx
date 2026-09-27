import { Ic } from '@/components/Sprite';
import { CtaBand, PageHead, SecHead } from '@/components/site/Cards';
import { MapCard } from '@/components/site/Widgets';
import { getAreas, getRoutes } from '@/lib/data';
import { pageMetadata } from '@/lib/seo';
import { getSettings } from '@/lib/settings';
import { mins } from '@/lib/utils';

export async function generateMetadata() {
  return pageMetadata('coverage', { title: 'UAE Coverage — All Seven Emirates', path: '/coverage' });
}

export default async function CoveragePage() {
  const [s, areas, routes] = await Promise.all([getSettings(), getAreas(), getRoutes()]);
  const emirates = areas.filter((a) => a.kind === 'emirate');
  const airports = areas.filter((a) => a.kind === 'airport');
  const places = areas.filter((a) => a.kind === 'area');
  return (
    <>
      <PageHead crumbs={[['Coverage']]} title="Transportation across the UAE" sub={s.home.coverageSub} />
      <section className="sec">
        <div className="wrap">
          <MapCard areas={emirates} />
          <div className="reveal" data-d={1} style={{ marginTop: 26 }}>
            <h2 style={{ fontSize: 'var(--t-2xl)', marginBottom: 16 }}>Emirates we cover</h2>
            <div className="em-list">
              {emirates.map((e) => (
                <div className="em" key={e.id}>
                  <span className="em-code">{e.code}</span>
                  <span>
                    <b>{e.name}</b>
                    <span>{e.note}</span>
                  </span>
                  <span className="em-dep">{e.badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {routes.length > 0 && (
        <section className="sec sec-alt">
          <div className="wrap">
            <SecHead eyebrow="Popular routes" title="Inter-emirate and city routes" sub="Approximate distances and drive times. Actual journey time depends on traffic and stops — your driver plans the route on the day." />
            <div className="rt-list reveal">
              {routes.map((r) => (
                <div className="rt" key={r.id}>
                  <span className="rt-name">
                    <Ic n="i-route" /> {r.from} <span style={{ color: 'var(--muted)' }}>&rarr;</span> {r.to}
                    {r.note && (
                      <span className="note" style={{ marginLeft: 6 }}>
                        {r.note}
                      </span>
                    )}
                  </span>
                  <span className="rt-km">{r.km ? `${r.km} km` : ''}</span>
                  <span className="rt-time">{r.mins ? mins(r.mins) : ''}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(airports.length > 0 || places.length > 0) && (
        <section className="sec">
          <div className="wrap">
            <SecHead eyebrow="Coverage" title="Areas we serve" />
            <div className="grid g-2">
              {airports.length > 0 && (
                <div className="panel reveal">
                  <h3>Airports</h3>
                  {airports.map((a) => (
                    <div className="kv" key={a.id}>
                      <span>{a.name}</span>
                      <b>{a.code}</b>
                    </div>
                  ))}
                </div>
              )}
              {places.length > 0 && (
                <div className="panel reveal" data-d={1}>
                  <h3>Popular areas</h3>
                  <div className="chips" style={{ marginTop: 14 }}>
                    {[...emirates, ...places].map((p) => (
                      <span key={p.id}>
                        <Ic n="i-pin" /> {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
      <CtaBand title={s.home.ctaTitle} sub={s.home.ctaSub} image="/images/band-dest.jpg" phone={s.contact.phones[0] || ''} whatsapp={s.contact.whatsapp} waText={s.contact.whatsappMessage} />
    </>
  );
}
