import Link from 'next/link';
import { Ic } from '@/components/Sprite';
import { coverSvg, vehicleArtSvg } from '@/lib/art';
import { dateFmt, telHref, waHref } from '@/lib/utils';

export type VehicleCardData = {
  slug: string;
  name: string;
  classLabel: string;
  seatsLabel: string;
  capacity: number;
  driverOption: string;
  tags: string[];
  description: string;
  luggage: string;
  bestFor: string;
  images: string[];
  alt: string;
  category?: { slug: string; name: string } | null;
};

export type ContactInfo = { phone: string; whatsapp: string };

export function VehicleMedia({ v, eager }: { v: Pick<VehicleCardData, 'slug' | 'name' | 'images' | 'alt' | 'capacity'>; eager?: boolean }) {
  if (v.images[0]) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={v.images[0]} alt={v.alt || v.name} loading={eager ? 'eager' : 'lazy'} width={1000} height={750} />;
  }
  return <span className="vart" dangerouslySetInnerHTML={{ __html: vehicleArtSvg(v.slug, v.capacity, v.name) }} />;
}

export function FleetCard({ v, i = 0, contact }: { v: VehicleCardData; i?: number; contact: ContactInfo }) {
  const either = v.driverOption === 'either';
  const waText = `Hello, I would like a quote for the ${v.name}.`;
  return (
    <article className="fcard reveal" data-d={i % 4} id={`v-${v.slug}`}>
      <Link className="fcard-art" href={`/fleet/${v.slug}`} aria-label={v.name} style={{ display: 'block' }}>
        <span className="fcard-seats">{v.seatsLabel}</span>
        <VehicleMedia v={v} />
        <span className="fcard-cat">{v.classLabel}</span>
      </Link>
      <div className="fcard-body">
        <h3>
          <Link href={`/fleet/${v.slug}`}>{v.name}</Link>
        </h3>
        <span className={`drv ${either ? 'either' : 'only'}`}>
          <Ic n={either ? 'i-wheel' : 'i-shield'} />
          {either ? 'With or without driver' : 'Chauffeur-driven only'}
        </span>
        <p className="fcard-desc">{v.description}</p>
        {v.tags.length > 0 && (
          <div className="tag-row">
            {v.tags.map((t) => (
              <span className="tag" key={t}>
                {t}
              </span>
            ))}
          </div>
        )}
        {(v.luggage || v.bestFor) && (
          <div className="fcard-meta">
            {v.luggage && (
              <span>
                <Ic n="i-bag" />
                {v.luggage}
              </span>
            )}
            {v.bestFor && (
              <span>
                <Ic n="i-seat" />
                {v.bestFor}
              </span>
            )}
          </div>
        )}
        <div className="fcard-acts">
          <a className="btn btn-ghost" href={telHref(contact.phone)}>
            <Ic n="i-phone" />
            Call Now
          </a>
          <a className="btn btn-whats" href={waHref(contact.whatsapp, waText)} target="_blank" rel="noopener">
            <Ic n="i-whats" />
            WhatsApp
          </a>
          <Link className="btn btn-primary" href={`/contact?vehicle=${v.slug}`}>
            Get a Quote <Ic n="i-arrow" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ServiceCard({ s, i = 0 }: { s: { slug: string; name: string; icon: string; blurb: string; meta: string }; i?: number }) {
  return (
    <Link className="svc reveal" data-d={i % 4} href={`/services/${s.slug}`}>
      <span className="svc-ico">
        <Ic n={s.icon} />
      </span>
      <h3>{s.name}</h3>
      <p>{s.blurb}</p>
      <span className="svc-meta">{s.meta}</span>
      <span className="svc-go">
        View Service <Ic n="i-arrow" />
      </span>
    </Link>
  );
}

export type PostCardData = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  theme: string;
  coverImage: string | null;
  publishedAt: Date | string;
  readMinutes: number;
};

export function PostCover({ p }: { p: Pick<PostCardData, 'id' | 'slug' | 'title' | 'theme' | 'coverImage'> }) {
  if (p.coverImage) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={p.coverImage} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
  }
  return <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: coverSvg(`p-${p.slug}`, p.theme) }} />;
}

export function PostCard({ p, i = 0 }: { p: PostCardData; i?: number }) {
  return (
    <article className="post-card reveal" data-d={i % 4}>
      <Link className="post-art" href={`/blog/${p.slug}`} aria-label={p.title}>
        <span className="post-cat">{p.category}</span>
        <PostCover p={p} />
      </Link>
      <div className="post-body">
        <div className="post-meta">
          <span>{dateFmt(p.publishedAt)}</span>
          <i />
          <span>{p.readMinutes} min read</span>
        </div>
        <h3>
          <Link href={`/blog/${p.slug}`}>{p.title}</Link>
        </h3>
        <p>{p.excerpt}</p>
        <Link className="post-foot" href={`/blog/${p.slug}`}>
          Read article <Ic n="i-arrow" />
        </Link>
      </div>
    </article>
  );
}

export function PageHead({
  crumbs,
  title,
  sub,
  children,
  titleStyle,
}: {
  crumbs: [string, string?][];
  title: string;
  sub?: string;
  children?: React.ReactNode;
  titleStyle?: React.CSSProperties;
}) {
  return (
    <div className="phead">
      <div className="wrap phead-in">
        <nav className="crumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          {crumbs.map(([label, href], i) => (
            <span key={label + i} style={{ display: 'contents' }}>
              {' / '}
              {href ? <Link href={href}>{label}</Link> : <span>{label}</span>}
            </span>
          ))}
        </nav>
        <h1 style={titleStyle}>{title}</h1>
        {sub && <p>{sub}</p>}
        {children}
      </div>
    </div>
  );
}

export function SecHead({ eyebrow, title, sub, children }: { eyebrow?: string; title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="sec-head">
      <div className="sec-head-txt">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {children}
    </div>
  );
}

export function CtaBand({ title, sub, image, phone, whatsapp, waText }: { title: string; sub: string; image: string; phone: string; whatsapp: string; waText: string }) {
  return (
    <section className="band">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {image && <img src={image} alt="" aria-hidden="true" width={1600} height={685} loading="lazy" />}
      <div className="wrap band-in">
        <div>
          <h2>{title}</h2>
          <p>{sub}</p>
        </div>
        <div className="band-acts">
          <Link className="btn btn-primary btn-lg" href="/contact">
            Get a free quote <Ic n="i-arrow" />
          </Link>
          {whatsapp && (
            <a className="btn btn-onnight btn-lg" href={waHref(whatsapp, waText)} target="_blank" rel="noopener">
              <Ic n="i-whats" /> WhatsApp us
            </a>
          )}
          {phone && (
            <a className="btn btn-onnight btn-lg" href={telHref(phone)}>
              <Ic n="i-phone" /> Call now
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
