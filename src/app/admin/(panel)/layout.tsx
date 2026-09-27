import type { Metadata } from 'next';
import { AdminToast } from '@/components/admin/Manager';
import { Sidebar } from '@/components/admin/Sidebar';
import { requirePageSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';

export const metadata: Metadata = {
  title: { default: 'Dashboard', template: '%s · Admin' },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageSession();
  const [s, newQuotes, services, vehicles, posts, pages, faqs, testimonials, media] = await Promise.all([
    getSettings(),
    db.quoteRequest.count({ where: { status: 'new' } }),
    db.service.count(),
    db.vehicle.count(),
    db.post.count(),
    db.page.count(),
    db.faq.count(),
    db.testimonial.count(),
    db.media.count(),
  ]);
  return (
    <div className="dash">
      <Sidebar
        user={{ name: user.name, email: user.email, role: user.role }}
        brand={{ first: s.general.brandFirst, second: s.general.brandSecond }}
        counts={{ newQuotes, services, vehicles, posts, pages, faqs, testimonials, media }}
      />
      <div className="main">{children}</div>
      <AdminToast />
    </div>
  );
}
