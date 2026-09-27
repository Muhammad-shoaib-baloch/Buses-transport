'use client';

import { Manager } from '@/components/admin/Manager';
import type { FieldDef, Values } from '@/components/admin/Fields';
import { deletePost, savePost } from '@/lib/actions/content';
import { ART_THEMES, coverSvg } from '@/lib/art';
import { dateFmt, num } from '@/lib/utils';

type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  tags: string;
  coverImage: string | null;
  theme: string;
  author: string;
  status: string;
  publishedAt: string;
  readMinutes: number;
  views: number;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImage: string | null;
};

const Cover = ({ p }: { p: { slug: string; theme: string; coverImage: string | null } }) =>
  p.coverImage ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={p.coverImage} alt="" />
  ) : (
    <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: coverSvg(`p-${p.slug || 'new'}`, p.theme) }} />
  );

export function PostsClient({ posts, categories, openId }: { posts: Post[]; categories: string[]; openId: number | null }) {
  const fields: FieldDef[] = [
    { k: 'title', label: 'Headline', type: 'text', full: true },
    { k: 'slug', label: 'URL slug', type: 'slug', from: 'title', help: '/blog/…' },
    {
      k: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'review', label: 'In review' },
        { value: 'published', label: 'Published' },
        { value: 'archived', label: 'Archived' },
      ],
    },
    { k: 'category', label: 'Category', type: 'select', options: categories.map((c) => ({ value: c, label: c })) },
    { k: 'publishedAt', label: 'Publish date', type: 'date', help: 'future date = scheduled' },
    { k: 'author', label: 'Author', type: 'text' },
    { k: 'tags', label: 'Tags', type: 'text', help: 'comma separated' },
    { k: 'excerpt', label: 'Excerpt', type: 'textarea', help: 'one or two sentences, shown on the blog index' },
    { k: 'coverImage', label: 'Cover image', type: 'image', help: 'optional — generated artwork is used when empty' },
    {
      k: 'theme',
      label: 'Artwork colour (when no cover image)',
      type: 'select',
      options: Object.keys(ART_THEMES).map((t) => ({ value: t, label: t[0].toUpperCase() + t.slice(1) })),
    },
    { k: 'body', label: 'Article body', type: 'markdown' },
    { type: 'section', title: 'SEO & sharing', desc: 'Leave empty to use the headline and excerpt.' },
    { k: 'seoTitle', label: 'Meta title', type: 'text', full: true },
    { k: 'seoDescription', label: 'Meta description', type: 'textarea' },
    { k: 'seoKeywords', label: 'Meta keywords', type: 'text', full: true },
    { k: 'ogImage', label: 'Social share image', type: 'image' },
  ];

  const toForm = (p: Post): Values => ({ ...p, publishedAt: p.publishedAt.slice(0, 10), seoTitle: p.seoTitle || '', seoDescription: p.seoDescription || '', seoKeywords: p.seoKeywords || '', ogImage: p.ogImage || '', coverImage: p.coverImage || '' });

  return (
    <Manager<Post>
      title="Articles"
      entity="Article"
      newLabel="New article"
      rows={posts}
      openId={openId}
      editorWide
      fields={fields}
      blank={{ title: '', slug: '', status: 'draft', category: categories[0] || 'General', author: 'Buses Transport UAE', publishedAt: new Date().toISOString().slice(0, 10), tags: '', excerpt: '', body: '', theme: 'ember', coverImage: '' }}
      toForm={toForm}
      save={savePost}
      remove={deletePost}
      searchText={(p) => `${p.title} ${p.category} ${p.tags} ${p.author}`}
      viewHref={(p) => `/blog/${p.slug}`}
      filters={[
        { key: 'published', label: 'Published', test: (p) => p.status === 'published' },
        { key: 'draft', label: 'Drafts', test: (p) => p.status === 'draft' || p.status === 'review' },
        { key: 'archived', label: 'Archived', test: (p) => p.status === 'archived' },
      ]}
      preview={(v) => (
        <div className="editor-preview">
          <div className="pv-art">
            <Cover p={{ slug: v.slug || v.title || 'new', theme: v.theme, coverImage: v.coverImage || null }} />
          </div>
          <div className="pv-txt">
            <b>{v.title || 'Untitled article'}</b>
            <p>{v.excerpt || 'The excerpt appears on the blog index and in the article header.'}</p>
          </div>
        </div>
      )}
      columns={[
        {
          label: 'Article',
          render: (p) => (
            <div className="t-title">
              <span className="t-thumb">
                <Cover p={p} />
              </span>
              <span>
                <b>{p.title}</b>
                <span>
                  /blog/{p.slug} · {p.readMinutes} min
                </span>
              </span>
            </div>
          ),
        },
        { label: 'Category', render: (p) => p.category },
        { label: 'Status', render: (p) => <span className={`pill ${p.status}`}>{p.status[0].toUpperCase() + p.status.slice(1)}</span> },
        { label: 'Date', render: (p) => dateFmt(p.publishedAt), className: 'num' },
        { label: 'Views', render: (p) => num(p.views), className: 'num' },
      ]}
    />
  );
}
