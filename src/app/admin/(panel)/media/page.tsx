import { Topbar } from '@/components/admin/Sidebar';
import { db } from '@/lib/db';
import { MediaClient } from './MediaClient';

export const metadata = { title: 'Media library' };

export default async function MediaAdmin() {
  const media = await db.media.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <>
      <Topbar title="Media library" sub="Upload photos, logos and documents — large photos are resized automatically" />
      <div className="body">
        <MediaClient media={media.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }))} />
      </div>
    </>
  );
}
