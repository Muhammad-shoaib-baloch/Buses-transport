import Link from 'next/link';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { Ic } from '@/components/Sprite';
import { PageHead, PostCard, PostCover, SecHead } from '@/components/site/Cards';
import { ViewBeacon } from '@/components/site/Interactive';
import { getSession } from '@/lib/auth';
import { getPost, getPosts } from '@/lib/data';
import { markdownToText, renderMarkdown } from '@/lib/markdown';
import { absolute, pageMetadata } from '@/lib/seo';
import { getSettings, siteUrl } from '@/lib/settings';
import { dateFmt, splitList } from '@/lib/utils';

async function load(slug: string) {
  const p = await getPost(slug);
  if (!p) return null;
  if (p.status === 'published' && p.publishedAt <= new Date()) return { p, preview: false };
  // drafts are visible to signed-in admins only (preview)
  const s = await getSession();
  return s ? { p, preview: true } : null;
}

export async function generateMetadata(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params;
  const r = await load(slug);
  if (!r) return {};
  const { p } = r;
  return pageMetadata(null, {
    title: p.seoTitle || p.title,
    description: p.seoDescription || p.excerpt || markdownToText(p.body),
    keywords: p.seoKeywords || p.tags,
    ogImage: p.ogImage || p.coverImage,
    path: `/blog/${p.slug}`,
    type: 'article',
    publishedTime: p.publishedAt.toISOString(),
    noindex: r.preview,
  });
}

export default async function PostPage(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params;
  const r = await load(slug);
  if (!r) notFound();
  const { p, preview } = r;
  const [s, more] = await Promise.all([getSettings(), getPosts(4)]);
  const others = more.filter((x) => x.id !== p.id).slice(0, 3);
  const tags = splitList(p.tags);
  const base = siteUrl(s);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: p.title,
    description: p.excerpt,
    datePublished: p.publishedAt.toISOString(),
    dateModified: p.updatedAt.toISOString(),
    author: { '@type': 'Organization', name: p.author || s.general.siteName },
    publisher: { '@id': `${base}/#business` },
    mainEntityOfPage: `${base}/blog/${p.slug}`,
    ...(p.coverImage ? { image: absolute(base, p.coverImage) } : {}),
    keywords: tags.join(', '),
  };

  return (
    <>
      <PageHead crumbs={[['Blog', '/blog'], [p.category]]} title={p.title} sub={p.excerpt} titleStyle={{ maxWidth: '22ch' }}>
        <div className="post-meta" style={{ color: 'var(--muted)' }}>
          <span>{p.author || s.general.siteName}</span>
          <i />
          <span>{dateFmt(p.publishedAt)}</span>
          <i />
          <span>{p.readMinutes} min read</span>
          {preview && (
            <>
              <i />
              <span style={{ color: 'var(--r-600)' }}>Preview — {p.status}</span>
            </>
          )}
        </div>
      </PageHead>
      <section className="sec">
        <div className="wrap">
          <article className="article">
            <div className="article-hero">
              <PostCover p={p} />
            </div>
            <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.body) }} />
            {tags.length > 0 && (
              <div className="tag-row" style={{ marginTop: 30 }}>
                {tags.map((t) => (
                  <Link className="tag" key={t} href={`/blog?tag=${encodeURIComponent(t.toLowerCase())}`}>
                    #{t}
                  </Link>
                ))}
              </div>
            )}
            <div className="cta" style={{ marginTop: 44 }}>
              <div>
                <h2>Need a car, van or bus in Dubai?</h2>
                <p>Send us your route, date and group size — we’ll confirm your vehicle and an AED price by phone or WhatsApp.</p>
              </div>
              <div className="cta-acts">
                <Link className="btn btn-primary" href="/contact">
                  Get a quote <Ic n="i-arrow" />
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>
      {others.length > 0 && (
        <section className="sec sec-alt">
          <div className="wrap">
            <SecHead eyebrow="Keep reading" title="More from our team" />
            <div className="grid g-3">
              {others.map((x, i) => (
                <PostCard key={x.id} p={x} i={i} />
              ))}
            </div>
          </div>
        </section>
      )}
      {!preview && <ViewBeacon slug={p.slug} />}
      <JsonLd data={ld} />
    </>
  );
}
