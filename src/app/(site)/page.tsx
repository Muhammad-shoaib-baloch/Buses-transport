import Link from 'next/link';
import { Ic } from '@/components/Sprite';
import { CtaBand, FleetCard, PostCard, SecHead, ServiceCard } from '@/components/site/Cards';
import { QuoteCard } from '@/components/site/Forms';
import { RailNav, TestimonialSlider } from '@/components/site/Interactive';
import { MapCard, Ticker } from '@/components/site/Widgets';
import { getAreas, getFeaturedVehicles, getPosts, getRoutes, getServices, getTestimonials, getVehicles } from '@/lib/data';
import { pageMetadata } from '@/lib/seo';
import { getSettings } from '@/lib/settings';
import { mins, waHref } from '@/lib/utils';

export async function generateMetadata() {
  return pageMetadata('home', { path: '/' });
}

export default async function HomePage() {
  const [s, services, featured, allVehicles, areas, routes, testimonials, posts] = await Promise.all([
    getSettings(),
    getServices(),
    getFeaturedVehicles(),
    getVehicles(),
    getAreas(),
    getRoutes(),
    getTestimonials(),
    getPosts(3),
  ]);
  const h = s.home;
  const contact = { phone: s.contact.phones[0] || '', whatsapp: s.contact.whatsapp };
  const emirates = areas.filter((a) => a.kind === 'emirate');
  const homeServices = services.filter((x) => x.featured);
  const svcGrid = homeServices.length % 3 === 0 && homeServices.length % 4 !== 0 ? 'g-3' : 'g-4';
  const vehicleOpts = allVehicles.map((v) => ({ value: v.slug, label: `${v.name} (${v.seatsLabel})` }));

  return (
    <>
      <section className="hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {h.heroImage && <img className="hero-img" src={h.heroImage} alt="" aria-hidden="true" width={1800} height={1012} fetchPriority="high" />}
        <div className="wrap hero-in">
          <div>
            {h.heroKicker && (
              <div className="hero-kicker">
                <span className="eyebrow eyebrow-night">{h.heroKicker}</span>
              </div>
            )}
            <h1>
              {h.heroLine1 && (
                <span className="ln">
                  <span>{h.heroLine1}</span>
                </span>
              )}
              {h.heroLine2 && (
                <span className="ln">
                  <span>{h.heroLine2}</span>
                </span>
              )}
              {h.heroHighlight && (
                <span className="ln">
                  <span>
                    <em>{h.heroHighlight}</em>
                  </span>
                </span>
              )}
            </h1>
            {h.heroSub && <p className="hero-sub">{h.heroSub}</p>}
            <div className="hero-acts">
              {h.heroPrimaryLabel && (
                <Link className="btn btn-primary btn-lg" href={h.heroPrimaryHref || '/fleet'}>
                  {h.heroPrimaryLabel} <Ic n="i-arrow" />
                </Link>
              )}
              {h.heroSecondaryLabel && (
                <Link className="btn btn-onnight btn-lg" href={h.heroSecondaryHref || '/services'}>
                  {h.heroSecondaryLabel}
                </Link>
              )}
            </div>
            {h.trust.length > 0 && (
              <div className="hero-trust">
                {h.trust.map((t) => (
                  <span className="ht" key={t.label}>
                    <b>{t.value}</b>
                    <span>{t.label}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <QuoteCard title={h.quoteTitle} badge={h.quoteBadge} note={h.quoteNote} vehicles={vehicleOpts} />
        </div>
      </section>

      {h.showTicker && <Ticker routes={routes.filter((r) => r.showInTicker)} extras={h.tickerExtras} />}

      {h.showServices && homeServices.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <SecHead eyebrow={h.servicesEyebrow} title={h.servicesTitle} sub={h.servicesSub} />
            <div className={`grid ${svcGrid}`}>
              {homeServices.map((x, i) => (
                <ServiceCard key={x.slug} s={x} i={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {h.showFleet && featured.length > 0 && (
        <section className="sec sec-alt">
          <div className="wrap">
            <SecHead eyebrow={h.fleetEyebrow} title={h.fleetTitle} sub={h.fleetSub}>
              <RailNav target="fleetRail" />
            </SecHead>
            <div className="rail-shell">
              <div className="rail" id="fleetRail">
                {featured.map((v, i) => (
                  <FleetCard key={v.slug} v={v} i={i} contact={contact} />
                ))}
              </div>
            </div>
            <div style={{ marginTop: 26 }}>
              <Link className="btn btn-ghost" href="/fleet">
                View full fleet <Ic n="i-arrow" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {h.showWhy && h.why.length > 0 && (
        <section className="sec sec-alt" style={{ paddingTop: h.showFleet ? 0 : undefined }}>
          <div className="wrap">
            <SecHead eyebrow={h.whyEyebrow} title={h.whyTitle} sub={h.whySub} />
            <div className="grid g-3">
              {h.why.map((w, i) => (
                <div className="feat reveal" data-d={i % 3} key={w.title}>
                  <span className="feat-ico">
                    <Ic n={w.icon} />
                  </span>
                  <div>
                    <h3>{w.title}</h3>
                    <p>{w.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {h.showCoverage && (
        <section className="sec">
          <div className="wrap">
            <SecHead eyebrow={h.coverageEyebrow} title={h.coverageTitle} sub={h.coverageSub} />
            <MapCard areas={emirates} />
            <div className="grid g-2 lists reveal" data-d={1} style={{ marginTop: 20 }}>
              <div className="rt-list">
                {routes.slice(0, 6).map((r) => (
                  <Link className="rt" href="/coverage" key={r.id}>
                    <span className="rt-name">
                      <Ic n="i-route" /> {r.from} <span style={{ color: 'var(--muted)' }}>&rarr;</span> {r.to}
                    </span>
                    <span className="rt-km">{r.km ? `${r.km} km` : ''}</span>
                    <span className="rt-time">{r.mins ? mins(r.mins) : ''}</span>
                  </Link>
                ))}
              </div>
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
      )}

      {h.showStats && h.stats.length > 0 && (
        <section className="sec-tight sec-alt">
          <div className="wrap">
            <div className="stats reveal">
              {h.stats.map((st) => (
                <div className="stat" key={st.label}>
                  <b className="count" data-to={st.n} data-dec={st.dec || 0} data-suffix={st.suffix}>
                    {st.n.toFixed(st.dec || 0)}
                    {st.suffix}
                  </b>
                  <span>{st.label}</span>
                  <small>{st.sub}</small>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {h.showSteps && h.steps.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <SecHead eyebrow={h.stepsEyebrow} title={h.stepsTitle} sub={h.stepsSub} />
            <div className="steps">
              {h.steps.map((st, i) => (
                <div className="step reveal" data-d={i} key={st.t}>
                  <div className="step-bar">
                    <i />
                  </div>
                  <span className="step-n">Step {String(i + 1).padStart(2, '0')}</span>
                  <h3>{st.t}</h3>
                  <p>{st.b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {h.showReviews && (
        <section className="sec sec-alt">
          <div className="wrap">
            <SecHead eyebrow={h.reviewsEyebrow} title={h.reviewsTitle} sub={testimonials.length ? undefined : h.reviewsSub} />
            {testimonials.length ? (
              <TestimonialSlider items={testimonials} />
            ) : (
              <div className="grid g-3">
                <a className="rv-card reveal" href={s.social.googleReviews || waHref(s.contact.whatsapp, 'Hello, I would like to share a review of my trip.')} target="_blank" rel="noopener">
                  <span className="rv-ico">
                    <Ic n="i-google" />
                  </span>
                  <h3>Google reviews</h3>
                  <p>Read what travellers say about us on our Google Business Profile — and leave your own review after your trip.</p>
                  <span className="svc-go">
                    {s.social.googleReviews ? 'Open Google reviews' : 'Ask us for the link'} <Ic n="i-arrow" />
                  </span>
                </a>
                <a className="rv-card reveal" data-d={1} href={s.social.facebook || waHref(s.contact.whatsapp, 'Hello, I would like to share a review of my trip.')} target="_blank" rel="noopener">
                  <span className="rv-ico">
                    <Ic n="i-facebook" />
                  </span>
                  <h3>Facebook reviews</h3>
                  <p>Follow our page for updates, and share a recommendation for the next family or company booking with us.</p>
                  <span className="svc-go">
                    {s.social.facebook ? 'Visit our page' : 'Message us'} <Ic n="i-arrow" />
                  </span>
                </a>
                <a className="rv-card reveal" data-d={2} href={waHref(s.contact.whatsapp, 'Hello, I would like to send a testimonial about my trip with Buses Transport UAE.')} target="_blank" rel="noopener">
                  <span className="rv-ico">
                    <Ic n="i-quote" />
                  </span>
                  <h3>Send us a testimonial</h3>
                  <p>Corporate and hotel partners: send us a short testimonial and we’ll feature it here with your permission.</p>
                  <span className="svc-go">
                    Send on WhatsApp <Ic n="i-arrow" />
                  </span>
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {h.showBlog && posts.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <SecHead eyebrow={h.blogEyebrow} title={h.blogTitle} sub={h.blogSub}>
              <Link className="btn btn-ghost btn-sm" href="/blog">
                All articles <Ic n="i-arrow" />
              </Link>
            </SecHead>
            <div className="grid g-3">
              {posts.map((p, i) => (
                <PostCard key={p.id} p={p} i={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {h.showCta && (
        <CtaBand title={h.ctaTitle} sub={h.ctaSub} image={h.ctaImage} phone={contact.phone} whatsapp={s.contact.whatsapp} waText={s.contact.whatsappMessage} />
      )}
    </>
  );
}
