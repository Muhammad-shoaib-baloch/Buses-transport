import Link from 'next/link';
import { Ic } from '@/components/Sprite';
import { CtaBand, PageHead, SecHead } from '@/components/site/Cards';
import { FleetBrowser } from '@/components/site/Interactive';
import { getCategories, getVehicles } from '@/lib/data';
import { pageMetadata } from '@/lib/seo';
import { getSettings } from '@/lib/settings';

export async function generateMetadata() {
  return pageMetadata('fleet', { title: 'Our Vehicles', path: '/fleet' });
}

export default async function FleetPage() {
  const [s, vehicles, categories] = await Promise.all([getSettings(), getVehicles(), getCategories()]);
  const contact = { phone: s.contact.phones[0] || '', whatsapp: s.contact.whatsapp };
  const selfDrive = vehicles.filter((v) => v.driverOption === 'either').length;
  return (
    <>
      <PageHead
        crumbs={[['Fleet']]}
        title="Our vehicles — sedan to 50-seater luxury bus"
        sub="A full range of vehicle classes covering every group size — from a private executive sedan and luxury SUV to a 50-seat luxury coach. Most vehicles travel with a professional driver, with self-drive available on selected cars, vans and buses."
      />
      <section className="sec">
        <div className="wrap">
          <FleetBrowser vehicles={vehicles} categories={categories} contact={contact} />
        </div>
      </section>

      <section className="sec sec-alt">
        <div className="wrap">
          <SecHead
            eyebrow="Quick compare"
            title="Fleet at a glance"
            sub="Vehicles marked “With or without driver” can be booked as a self-drive hire; vehicles marked “Chauffeur-driven only” always come with a professional driver. Rates are always confirmed in AED."
          />
          <div className="compare table-scroll reveal">
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Capacity</th>
                  <th>Class</th>
                  <th>Driver option</th>
                  <th>Best for</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.slug}>
                    <td>
                      <Link href={`/fleet/${v.slug}`}>{v.name}</Link>
                    </td>
                    <td className="mono">{v.seatsLabel}</td>
                    <td>{v.classLabel}</td>
                    <td>{v.driverOption === 'either' ? 'With or without driver' : 'Chauffeur-driven only'}</td>
                    <td>{v.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="sec-tight">
        <div className="wrap">
          <div className="grid g-3">
            <div className="panel reveal">
              <h3>Every booking includes</h3>
              <div className="kv">
                <span>Professional, licensed driver</span>
                <b>Included</b>
              </div>
              <div className="kv">
                <span>Clean, air-conditioned vehicle</span>
                <b>Included</b>
              </div>
              <div className="kv">
                <span>Commercial passenger insurance</span>
                <b>Included</b>
              </div>
              <div className="kv">
                <span>Flight tracking on airport runs</span>
                <b>Included</b>
              </div>
              <div className="kv">
                <span>24/7 phone & WhatsApp support</span>
                <b>Included</b>
              </div>
            </div>
            <div className="panel reveal" data-d={1}>
              <h3>Ways to book</h3>
              <div className="kv">
                <span>Point-to-point transfer</span>
                <b>Any vehicle</b>
              </div>
              <div className="kv">
                <span>Hourly or daily hire</span>
                <b>Any vehicle</b>
              </div>
              <div className="kv">
                <span>Monthly rental</span>
                <b>Dedicated driver</b>
              </div>
              <div className="kv">
                <span>Self-drive hire</span>
                <b>
                  {selfDrive} of {vehicles.length} vehicles
                </b>
              </div>
              <div className="kv">
                <span>Pricing</span>
                <b>Quoted in AED</b>
              </div>
            </div>
            <div className="panel reveal" data-d={2}>
              <h3>Not sure which vehicle you need?</h3>
              <p className="note" style={{ marginTop: 8, fontSize: 'var(--t-sm)' }}>
                Tell us your group size, luggage and route and we’ll recommend the right vehicle — or several for large groups and events. Every vehicle in the fleet is regularly serviced and insured
                for commercial passenger transport.
              </p>
              <div style={{ marginTop: 16, display: 'grid', gap: 9 }}>
                <Link className="btn btn-primary btn-sm btn-block" href="/contact">
                  Ask about a vehicle <Ic n="i-arrow" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      <CtaBand title={s.home.ctaTitle} sub={s.home.ctaSub} image={s.home.ctaImage} phone={contact.phone} whatsapp={contact.whatsapp} waText={s.contact.whatsappMessage} />
    </>
  );
}
