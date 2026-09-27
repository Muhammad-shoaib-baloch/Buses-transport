import type { NextConfig } from 'next';

/* Old WordPress URLs on busestransport.com → new routes (permanent). */
const OLD_SERVICE_SLUGS = [
  'airport-transfer',
  'city-tours',
  'hotel-to-hotel-transfer',
  'shuttle-services',
  'dinner-transfer',
  'bus-rental',
  'daily-rental',
  'monthly-rental',
  'car-rental',
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverActions: { bodySizeLimit: '4mb' },
  },
  async redirects() {
    return [
      ...OLD_SERVICE_SLUGS.map((slug) => ({ source: `/${slug}`, destination: `/services/${slug}`, permanent: true })),
      { source: '/our-vehicles', destination: '/fleet', permanent: true },
      { source: '/about-us', destination: '/about', permanent: true },
      { source: '/contact-us', destination: '/contact', permanent: true },
      { source: '/wp-admin', destination: '/admin', permanent: false },
      { source: '/wp-login.php', destination: '/admin/login', permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      { source: '/images/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' }] },
    ];
  },
};

export default nextConfig;
