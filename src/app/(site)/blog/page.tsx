import Link from 'next/link';
import { PageHead } from '@/components/site/Cards';
import { BlogBrowser } from '@/components/site/Interactive';
import { getPosts } from '@/lib/data';
import { pageMetadata } from '@/lib/seo';
import { splitList } from '@/lib/utils';

export async function generateMetadata(props: PageProps<'/blog'>) {
  const { tag } = await props.searchParams;
  return pageMetadata('blog', { title: 'Blog', path: '/blog', noindex: !!tag });
}

export default async function BlogPage(props: PageProps<'/blog'>) {
  const { tag } = await props.searchParams;
  const t = typeof tag === 'string' ? tag.toLowerCase() : '';
  const all = await getPosts();
  const posts = t ? all.filter((p) => splitList(p.tags).some((x) => x.toLowerCase() === t)) : all;
  return (
    <>
      <PageHead
        crumbs={t ? [['Blog', '/blog'], [`#${t}`]] : [['Blog']]}
        title={t ? `Articles tagged “${t}”` : 'Guides for moving around the UAE'}
        sub="Practical notes on airport transfers, choosing the right vehicle and renting by the day or month — written by our team."
      >
        {t && (
          <div>
            <Link className="btn btn-ghost btn-sm" href="/blog">
              Show all articles
            </Link>
          </div>
        )}
      </PageHead>
      <section className="sec">
        <div className="wrap">
          <BlogBrowser posts={posts} />
        </div>
      </section>
    </>
  );
}
