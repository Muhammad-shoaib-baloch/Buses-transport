import { notFound } from 'next/navigation';
import { PageHead } from '@/components/site/Cards';
import { getPage } from '@/lib/data';
import { markdownToText, renderMarkdown } from '@/lib/markdown';
import { pageMetadata } from '@/lib/seo';

export async function generateMetadata(props: PageProps<'/[slug]'>) {
  const { slug } = await props.params;
  const p = await getPage(slug);
  if (!p) return {};
  return pageMetadata(null, {
    title: p.seoTitle || p.title,
    description: p.seoDescription || p.subtitle || markdownToText(p.body),
    keywords: p.seoKeywords,
    ogImage: p.ogImage,
    path: `/${p.slug}`,
  });
}

export default async function CmsPage(props: PageProps<'/[slug]'>) {
  const { slug } = await props.params;
  const p = await getPage(slug);
  if (!p) notFound();
  return (
    <>
      <PageHead crumbs={[[p.title]]} title={p.title} sub={p.subtitle || undefined} />
      <section className="sec">
        <div className="wrap">
          <article className="article">
            <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(p.body) }} />
          </article>
        </div>
      </section>
    </>
  );
}
