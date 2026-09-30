# Buses Transport UAE — Laravel + MySQL website with admin dashboard

PHP 8.2+ · Laravel 12 · MySQL/MariaDB · plain CSS/JS (no Node needed). Runs on ordinary cPanel / Hostinger shared hosting.

Design from the busuae.mrshoaib.com prototype; content (9 services, 17 vehicles, FAQs, contact details, coverage) from busestransport.com.

## Deploy to cPanel or Hostinger (no SSH needed)

1. **Build the package** on this PC (XAMPP MySQL must be running):
   ```
   powershell -ExecutionPolicy Bypass -File scripts\build-cpanel-package.ps1
   ```
   The build produces two files:
   - `build\busestransport-cpanel.zip` with two folders: `busestransport\` (the app, with a fresh `.env`) and `public_html\` (the public files).
   - `build\busestransport-database.sql`, the database with all tables, content and the admin account from that `.env`.

   Each build makes new keys and a new admin password. Always upload the zip and the `.sql` from the **same** build. The values are also readable in `build\package\busestransport\.env`.
2. **Hosting → PHP version**: choose **PHP 8.2 or 8.3**.
   - cPanel: *Select PHP Version* / *MultiPHP Manager*.
   - Hostinger: *Advanced → PHP Configuration*.
   - Extensions: `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `tokenizer`, `xml`, `ctype`, `curl`, `gd`. `gd` resizes uploaded photos.
3. **Create a MySQL database** + user.
   - cPanel: *MySQL Databases*; give the user ALL PRIVILEGES.
   - Hostinger: *Databases → MySQL*.
4. **Import `busestransport-database.sql`** into that database: *phpMyAdmin → select the database → Import*.
5. **Back up the old site** in `public_html` (the old WordPress install) and move its files out of `public_html`. On a fresh temporary domain, just delete the host's default files.
6. **Upload the zip to the folder that contains `public_html`** and **Extract** it there.
   - cPanel: your home folder. Hostinger: `domains/<domain>/`.
   - You get `busestransport/` next to `public_html/`.
7. **Edit `busestransport/.env`** in File Manager: set `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_HOST` if your host says so.
8. **Sign in** at `/admin/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`, then change the password under *My account*.

`/install?key=SETUP_KEY` is an alternative to step 4: it creates the tables and content itself. It locks itself as soon as the database already has an admin, so after an `.sql` import it does nothing.

### Temporary domain first, live later

The same package works on a temporary / staging domain (for example Hostinger's `*.hostingersite.com`).
- Leave `APP_URL` and `LIVE_URL` as `https://busestransport.com`.
- On any other domain every page gets `noindex` and `robots.txt` blocks crawling, so Google does not index the review copy.
- Links, forms and the admin all work on whichever domain serves the site.

To go live, point the real domain at the same files (or move `busestransport/` + `public_html/` into the real domain's folder). Indexing switches on by itself on `busestransport.com`.

Folders that must be writable: `busestransport/storage`, `busestransport/bootstrap/cache`, `public_html/uploads` (755 is fine on most hosts).

## Run locally (XAMPP)

```
composer install
copy .env.example .env      # set DB_* to your local MySQL, ADMIN_PASSWORD, SETUP_KEY
php artisan key:generate
php artisan migrate --seed
php -d extension=gd -S 127.0.0.1:8000 -t public dev-server.php
```

## What the dashboard manages (`/admin`)

| Area | Where |
|---|---|
| Quote requests from every form — status, notes, WhatsApp reply, CSV export | Quote requests |
| Services — cards, pages, steps, included list, vehicles, FAQs, SEO | Services |
| Fleet — photo gallery, capacity, driver option, categories, homepage slider, SEO | Fleet |
| Blog — markdown editor with preview, cover image, tags, drafts, scheduled dates, SEO | Blog posts |
| Extra pages (Privacy Policy, Terms…) with footer links | Pages |
| FAQs, testimonials, emirates/airports/areas, map points, routes & ticker | FAQs · Testimonials · Coverage |
| Uploads (auto-resized to 2400px, stored in `public/uploads`) | Media library |
| Logo, favicon, name, footer, phones, WhatsApp, emails, social links, every homepage text & section switch, About page, default + per-page meta tags, Google/Bing verification, robots, GTM / GA4 / Meta Pixel, custom head/body code, email alerts (SMTP), brand colours, form messages | Site settings |
| Admin & editor accounts | Users |

## SEO

Per-page meta title/description/keywords/OG image, canonical URLs, `sitemap.xml`, `robots.txt`, JSON-LD (LocalBusiness, Service, FAQPage, BlogPosting, BreadcrumbList) and 301 redirects from the old WordPress URLs (`/airport-transfer/` → `/services/airport-transfer`, `/our-vehicles/` → `/fleet`, `/about-us/`, `/contact-us/`).

## Notes

- `php artisan db:seed` resets services, vehicles and coverage to the original content — run it only on a fresh install.
- Uploaded files live in `public/uploads` (`public_html/uploads` on the host) — include it in backups together with the database.
