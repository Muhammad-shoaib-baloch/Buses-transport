import { Topbar } from '@/components/admin/Sidebar';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { QuotesClient } from './QuotesClient';

export const metadata = { title: 'Quote requests' };

export default async function QuotesAdmin(props: PageProps<'/admin/quotes'>) {
  const { open } = await props.searchParams;
  const [quotes, s] = await Promise.all([db.quoteRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 2000 }), getSettings()]);
  return (
    <>
      <Topbar title="Quote requests" sub="Every request sent from the website’s quote and contact forms" />
      <div className="body">
        <QuotesClient
          openId={open ? Number(open) : null}
          siteName={s.general.siteName}
          quotes={quotes.map((q) => ({ ...q, createdAt: q.createdAt.toISOString(), updatedAt: q.updatedAt.toISOString() }))}
        />
      </div>
    </>
  );
}
