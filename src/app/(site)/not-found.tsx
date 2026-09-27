import Link from 'next/link';
import { Ic } from '@/components/Sprite';
import { PageHead } from '@/components/site/Cards';

export default function NotFound() {
  return (
    <>
      <PageHead crumbs={[['Not found']]} title="That page does not exist" sub="The link may be out of date. The fleet and the services are both a click away." />
      <section className="sec">
        <div className="wrap">
          <div className="empty">
            <h3>Nothing here</h3>
            <p style={{ marginBottom: 16 }}>Try the fleet, the services, or tell our team what you need.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link className="btn btn-primary" href="/">
                Back to home <Ic n="i-arrow" />
              </Link>
              <Link className="btn btn-ghost" href="/fleet">
                Browse the fleet
              </Link>
              <Link className="btn btn-ghost" href="/services">
                Our services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
