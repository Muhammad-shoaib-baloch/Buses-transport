import Link from 'next/link';
import { Ic } from '@/components/Sprite';
import { BarList, PairChart, Tile } from '@/components/admin/Charts';
import { Topbar } from '@/components/admin/Sidebar';
import { db } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import { dateTimeFmt, num } from '@/lib/utils';

export const metadata = { title: 'Overview' };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function relTime(d: Date) {
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} days ago`;
  return dateTimeFmt(d);
}

export default async function Overview() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [s, quotes6, newCount, monthCount, latest, activity, posts, cats, vehicleCount, serviceCount, testimonials] = await Promise.all([
    getSettings(),
    db.quoteRequest.findMany({ where: { createdAt: { gte: from } }, select: { createdAt: true, status: true } }),
    db.quoteRequest.count({ where: { status: 'new' } }),
    db.quoteRequest.count({ where: { createdAt: { gte: monthStart } } }),
    db.quoteRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
    db.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    db.post.findMany({ where: { status: 'published' }, orderBy: { views: 'desc' }, select: { title: true, views: true } }),
    db.fleetCategory.findMany({ orderBy: { order: 'asc' }, include: { _count: { select: { vehicles: true } } } }),
    db.vehicle.count({ where: { active: true } }),
    db.service.count({ where: { active: true } }),
    db.testimonial.count({ where: { active: true } }),
  ]);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
    const items = quotes6.filter((q) => q.createdAt.getFullYear() === d.getFullYear() && q.createdAt.getMonth() === d.getMonth());
    return { m: MONTHS[d.getMonth()], a: items.length, b: items.filter((q) => q.status === 'confirmed').length };
  });
  const totalViews = posts.reduce((a, p) => a + p.views, 0);

  const checks: [boolean, string, string][] = [
    [!!s.general.logo, 'Upload your logo', '/admin/settings?tab=general'],
    [!!s.general.favicon, 'Upload a favicon (browser tab icon)', '/admin/settings?tab=general'],
    [!!(s.general.siteUrl || process.env.SITE_URL?.startsWith('https')), 'Set the live website URL (for sitemap & SEO)', '/admin/settings?tab=general'],
    [!!s.seo.googleVerification, 'Verify the site in Google Search Console', '/admin/settings?tab=seo'],
    [!!(s.tracking.gtmId || s.tracking.ga4Id), 'Connect Google Tag Manager or Analytics', '/admin/settings?tab=tracking'],
    [s.email.notifyEnabled && !!s.email.smtpHost, 'Turn on email alerts for new quote requests', '/admin/settings?tab=email'],
    [Object.values(s.social).some(Boolean), 'Add your social media & Google reviews links', '/admin/settings?tab=social'],
    [!!s.contact.mapEmbedUrl, 'Add a Google Maps embed of your office', '/admin/settings?tab=contact'],
    [testimonials > 0, 'Add your first real client testimonial', '/admin/testimonials'],
  ];
  const done = checks.filter((c) => c[0]).length;

  return (
    <>
      <Topbar title="Overview" sub={`Welcome back — here’s what’s happening on ${s.general.siteName}`}>
        <Link className="btn btn-accent btn-sm" href="/admin/quotes">
          <Ic n="i-inbox" /> Quote requests
        </Link>
      </Topbar>
      <div className="body">
        <div className="tiles">
          <Tile label="New quote requests" value={num(newCount)} icon="i-inbox" delta={newCount ? 'waiting for a reply' : 'all caught up'} dir={newCount ? 'up' : 'flat'} series={months.map((m) => m.a)} />
          <Tile label="Requests this month" value={num(monthCount)} icon="i-calendar" delta={`${months[5].b} confirmed`} dir="flat" series={months.map((m) => m.a)} accent />
          <Tile label="Blog article views" value={num(totalViews)} icon="i-eye" delta={`${posts.length} published articles`} dir="flat" series={posts.map((p) => p.views).reverse()} />
          <Tile label="Live on the site" value={`${vehicleCount} / ${serviceCount}`} icon="i-wheel" delta="vehicles / services" dir="flat" series={cats.map((c) => c._count.vehicles)} accent />
        </div>

        <div className="cols">
          <div className="card">
            <div className="card-head">
              <h2>Quote requests</h2>
              <span className="hint">Last 6 months</span>
            </div>
            <div className="card-body">
              <div className="chart-wrap">
                <PairChart data={months} labels={['Requests', 'Confirmed']} ariaLabel="Quote requests and confirmed bookings per month, last six months" />
              </div>
              <div className="chart-legend">
                <span>
                  <i style={{ background: 'var(--c1)' }} />
                  Requests received
                </span>
                <span>
                  <i style={{ background: 'var(--c2)' }} />
                  Marked confirmed
                </span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-head">
              <h2>Launch checklist</h2>
              <span className="hint">
                {done} of {checks.length} done
              </span>
            </div>
            <div className="card-body">
              <div className="feed">
                {checks.map(([ok, label, href]) => (
                  <Link className="fitem" key={label} href={href}>
                    <span className="fdot" style={ok ? { background: 'var(--ok-bg)', color: 'var(--ok)' } : undefined}>
                      <Ic n={ok ? 'i-check' : 'i-plus'} />
                    </span>
                    <div>
                      <p style={ok ? { color: 'var(--muted)', textDecoration: 'line-through' } : undefined}>{label}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="cols">
          <div className="card">
            <div className="card-head">
              <h2>Latest quote requests</h2>
              <span className="top-spacer" />
              <Link className="btn btn-ghost btn-sm" href="/admin/quotes">
                View all <Ic n="i-arrow" />
              </Link>
            </div>
            {latest.length === 0 ? (
              <div className="card-body">
                <div className="empty">
                  <h3>No quote requests yet</h3>
                  <p>Requests from the website’s quote forms appear here instantly.</p>
                </div>
              </div>
            ) : (
              <div className="tbl-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Customer</th>
                      <th>Service</th>
                      <th>Received</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latest.map((q) => (
                      <tr key={q.id}>
                        <td className="num">
                          <Link href={`/admin/quotes?open=${q.id}`} className={`strip ${q.status === 'new' ? 'hot' : q.status === 'confirmed' ? 'ok' : 'soon'}`}>
                            {q.ref}
                          </Link>
                        </td>
                        <td>
                          {q.name}
                          <div className="muted mono" style={{ fontSize: 11 }}>
                            {q.phone}
                          </div>
                        </td>
                        <td>{q.service || q.vehicle || '—'}</td>
                        <td className="num">{relTime(q.createdAt)}</td>
                        <td>
                          <span className={`pill ${q.status}`}>{q.status[0].toUpperCase() + q.status.slice(1)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="card">
            <div className="card-head">
              <h2>Recent activity</h2>
            </div>
            <div className="card-body">
              {activity.length === 0 ? (
                <p className="muted">Changes you make in the dashboard will be listed here.</p>
              ) : (
                <div className="feed">
                  {activity.map((a) => (
                    <div className="fitem" key={a.id}>
                      <span className="fdot">
                        <Ic n={a.icon} />
                      </span>
                      <div>
                        <p dangerouslySetInnerHTML={{ __html: a.text }} />
                        <time>
                          {relTime(a.createdAt)}
                          {a.userName ? ` · ${a.userName}` : ''}
                        </time>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="cols">
          <div className="card">
            <div className="card-head">
              <h2>Fleet by category</h2>
              <span className="hint">{vehicleCount} active vehicles</span>
            </div>
            <div className="card-body">
              <BarList items={cats.map((c, i) => ({ name: c.name, value: c._count.vehicles, accent: i === 0 }))} />
            </div>
          </div>
          <div className="card">
            <div className="card-head">
              <h2>Most read articles</h2>
              <span className="hint">Lifetime views</span>
            </div>
            <div className="card-body">
              {posts.length ? <BarList items={posts.slice(0, 5).map((p, i) => ({ name: p.title, value: p.views, accent: i === 0 }))} /> : <p className="muted">No published articles yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
