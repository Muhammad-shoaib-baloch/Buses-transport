import { Topbar } from '@/components/admin/Sidebar';
import { db } from '@/lib/db';
import { PostsClient } from './PostsClient';

export const metadata = { title: 'Blog posts' };

export default async function PostsPage(props: PageProps<'/admin/posts'>) {
  const { open } = await props.searchParams;
  const posts = await db.post.findMany({ orderBy: [{ publishedAt: 'desc' }] });
  const cats = Array.from(new Set(posts.map((p) => p.category).concat(['Transfers', 'Fleet', 'Rental', 'Tours', 'Company news'])));
  return (
    <>
      <Topbar title="Blog posts" sub="Write, edit and publish articles on the public blog" />
      <div className="body">
        <PostsClient
          openId={open ? Number(open) : null}
          categories={cats}
          posts={posts.map((p) => ({ ...p, publishedAt: p.publishedAt.toISOString(), createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() }))}
        />
      </div>
    </>
  );
}
