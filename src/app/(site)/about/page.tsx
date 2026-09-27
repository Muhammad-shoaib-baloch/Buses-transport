import { Ic } from '@/components/Sprite';
import { CtaBand, PageHead, SecHead } from '@/components/site/Cards';
import { renderMarkdown } from '@/lib/markdown';
import { pageMetadata } from '@/lib/seo';
import { getSettings } from '@/lib/settings';

export async function generateMetadata() {
  return pageMetadata('about', { title: 'About Us', path: '/about' });
}

export default async function AboutPage() {
  const s = await getSettings();
  const a = s.about;
  return (
    <>
      <PageHead crumbs={[['About']]} title={a.title} sub={a.sub} />
      <section className="sec">
        <div className="wrap map-wrap">
          <div className="reveal">
            <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(a.body) }} />
          </div>
          <div className="reveal" data-d={1} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {a.image && (
              <div className="article-hero" style={{ aspectRatio: '4/3', marginBottom: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            {a.facts.length > 0 && (
              <div className="panel">
                <h3>{a.panelTitle}</h3>
                {a.facts.map((f) => (
                  <div className="kv" key={f.label}>
                    <span>{f.label}</span>
                    <b>{f.value}</b>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      {s.home.why.length > 0 && (
        <section className="sec sec-alt">
          <div className="wrap">
            <SecHead eyebrow="Why choose us" title={a.valuesTitle} />
            <div className="grid g-3">
              {s.home.why.map((w, i) => (
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
      <CtaBand title={s.home.ctaTitle} sub={s.home.ctaSub} image={s.home.ctaImage} phone={s.contact.phones[0] || ''} whatsapp={s.contact.whatsapp} waText={s.contact.whatsappMessage} />
    </>
  );
}
