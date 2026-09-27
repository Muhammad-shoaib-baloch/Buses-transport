# Buses Transport UAE — website + admin dashboard

Next.js 16 (App Router) · React 19 · Prisma 6 · SQLite (swap to MySQL/PostgreSQL for production) · no UI framework — the design system lives in `src/app/site.css` (public site) and `src/app/admin.css` + `admin-extra.css` (dashboard).

Design ported from the prototype at busuae.mrshoaib.com; content (services, 17 vehicles, FAQs, contact details, coverage) from busestransport.com.

## Run it locally

```bash
npm install
cp .env.example .env        # then fill AUTH_SECRET and ADMIN_PASSWORD
npm run db:push             # create the database tables
npm run db:seed             # load the real content + first admin user
npm run dev                 # http://localhost:3000  ·  dashboard: /admin
```

The first admin account is `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`. Change the password after the first sign-in (Dashboard → My account).

## What the dashboard manages

| Area | Where |
|---|---|
| Quote requests from every form (status, notes, WhatsApp reply, CSV export) | Quote requests |
| Services — cards, pages, steps, included list, vehicles, FAQs, SEO | Services |
| Fleet — photos (gallery), capacity, driver option, categories, homepage slider, SEO | Fleet |
| Blog — markdown editor with preview, cover image, tags, drafts, scheduled dates, SEO | Blog posts |
| Extra pages (Privacy Policy, Terms…) with footer links | Pages |
| FAQs, testimonials, emirates/airports/areas, map points, popular routes & ticker | FAQs · Testimonials · Coverage & routes |
| Uploads (auto-resized, stored in `UPLOAD_DIR`, served at `/media/…`) | Media library |
| Logo, favicon, name, footer, contact numbers, WhatsApp, social links, every homepage text & section switch, About page, default + per-page meta tags, Google/Bing verification, robots, GTM / GA4 / Meta Pixel, custom head/body code, email alerts (SMTP), brand colours, form messages | Site settings |
| Admin & editor accounts | Users |

## SEO built in

Per-page titles/descriptions/keywords/OG images, canonical URLs, dynamic `sitemap.xml` and `robots.txt`, JSON-LD (LocalBusiness, Service, FAQPage, BlogPosting, BreadcrumbList), and 301 redirects from the old WordPress URLs (`/airport-transfer/` → `/services/airport-transfer`, `/our-vehicles/` → `/fleet`, `/about-us/`, `/contact-us/`).

## Deploying

This is a Node.js app (it needs a server that runs `node`, not plain PHP hosting).

```bash
npm ci
npx prisma db push          # first deploy only (creates tables)
npm run db:seed             # first deploy only
npm run build
npm start                   # listens on port 3000 (set PORT to change)
```

Keep these between deploys: the database file (`prisma/dev.db` for SQLite) and the `UPLOAD_DIR` folder. Set `SITE_URL` (and Settings → Branding → Live website URL) to the real domain.

- **VPS / Node hosting with a persistent disk** (Hostinger VPS, DigitalOcean, cPanel “Setup Node.js App”): works as-is with SQLite. Run it with `pm2 start npm --name busestransport -- start` behind Nginx/Apache.
- **Serverless (Vercel etc.)**: switch to a hosted database (change `provider` in `prisma/schema.prisma` to `mysql` or `postgresql` and set `DATABASE_URL`) and note that local uploads do not persist there.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | development server |
| `npm run build` / `npm start` | production build / server |
| `npm run db:push` | sync the Prisma schema to the database |
| `npm run db:seed` | load content (safe to re-run; never touches quote requests) |
| `npm run db:reset` | wipe and re-seed the database |
| `npm run db:studio` | browse the database |
| `npm run admin:password -- you@example.com "New password"` | set a dashboard password (creates the admin if missing) |
