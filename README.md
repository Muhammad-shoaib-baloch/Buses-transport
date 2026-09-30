# Buses Transport UAE — Laravel + MySQL website with admin dashboard

PHP 8.2+ · Laravel 12 · MySQL/MariaDB · plain CSS/JS (no Node needed). Runs on ordinary cPanel / Hostinger shared hosting.

Design from the busuae.mrshoaib.com prototype; content (9 services, 17 vehicles, FAQs, contact details, coverage) from busestransport.com.

## Deploy to cPanel or Hostinger (no SSH needed)

1. **Build the package** on this PC:
   ```
   powershell -ExecutionPolicy Bypass -File scripts\build-cpanel-package.ps1
   ```
   → `build\busestransport-cpanel.zip` with two folders: `busestransport\` (the app, with a fresh `.env`) and `public_html\` (the public files).
2. **Hosting → PHP version**: choose **PHP 8.2 or 8.3** (cPanel: *Select PHP Version* / *MultiPHP Manager*; Hostinger: *Advanced → PHP Configuration*). Extensions: `pdo_mysql`, `mbstring`, `openssl`, `fileinfo`, `tokenizer`, `xml`, `ctype`, `curl`, `gd` (gd resizes uploaded photos).
3. **Create a MySQL database** + user (cPanel: *MySQL Databases*, give the user ALL PRIVILEGES; Hostinger: *Databases → MySQL*).
4. **Back up the old site** in `public_html` (the old WordPress install) and move its files out of `public_html`.
5. **Upload the zip to the folder that contains `public_html`** (cPanel: your home folder; Hostinger: `domains/busestransport.com/`) and **Extract** it there. You get `busestransport/` next to `public_html/`.
6. **Edit `busestransport/.env`** in File Manager: `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` (and `DB_HOST` if your host says so), and `APP_URL=https://busestransport.com`.
7. **Open `https://busestransport.com/install?key=SETUP_KEY`** (the `SETUP_KEY` value from `.env`) → *Install now*. This creates the tables and loads all the content. The installer locks itself afterwards.
8. **Sign in** at `/admin/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`, change the password under *My account*, then set *Settings → Branding → Live website URL*.

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
