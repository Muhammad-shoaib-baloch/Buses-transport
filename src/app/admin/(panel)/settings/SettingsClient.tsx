'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Ic } from '@/components/Sprite';
import { FormFields, type FieldDef, type Values } from '@/components/admin/Fields';
import { flash } from '@/components/admin/Manager';
import { saveSettings, sendTestEmail } from '@/lib/actions/admin';
import type { Settings } from '@/lib/settings-defaults';

type TabKey = 'general' | 'contact' | 'social' | 'home' | 'about' | 'seo' | 'pageseo' | 'tracking' | 'email' | 'theme' | 'forms';

const PAGE_KEYS: [string, string][] = [
  ['home', 'Homepage'],
  ['services', 'Services'],
  ['fleet', 'Fleet'],
  ['coverage', 'Coverage'],
  ['blog', 'Blog'],
  ['about', 'About'],
  ['contact', 'Contact'],
  ['faq', 'FAQ'],
];

const TABS: { key: TabKey; group: keyof Settings; label: string; icon: string; desc: string; fields: FieldDef[] }[] = [
  {
    key: 'general',
    group: 'general',
    label: 'Branding & logo',
    icon: 'i-image',
    desc: 'Logo, favicon, site name and footer text.',
    fields: [
      { type: 'section', title: 'Logo', desc: 'Upload a PNG or SVG logo with a transparent background. Without a logo, the two-colour text wordmark below is shown.' },
      { k: 'logo', label: 'Logo', type: 'image' },
      { k: 'logoHeight', label: 'Logo height (px)', type: 'number', help: 'desktop header, 28–64' },
      { k: 'showWordmarkWithLogo', label: 'Wordmark next to logo', type: 'toggle', help: 'Also show the text name beside the logo' },
      { k: 'favicon', label: 'Favicon (browser tab icon)', type: 'image', help: 'square PNG/ICO, 512×512 recommended' },
      { type: 'section', title: 'Name' },
      { k: 'siteName', label: 'Business / site name', type: 'text' },
      { k: 'tagline', label: 'Tagline under the wordmark', type: 'text' },
      { k: 'brandFirst', label: 'Wordmark — first part (dark)', type: 'text' },
      { k: 'brandSecond', label: 'Wordmark — second part (red)', type: 'text' },
      { k: 'siteUrl', label: 'Live website URL', type: 'url', help: 'e.g. https://busestransport.com — used for sitemap & SEO', full: true },
      { type: 'section', title: 'Footer & layout' },
      { k: 'footerAbout', label: 'Footer description', type: 'textarea' },
      { k: 'footerLegal', label: 'Footer small print', type: 'text', full: true },
      { k: 'copyright', label: 'Copyright line', type: 'text', full: true, help: '{year} becomes the current year' },
      { k: 'showFloatingWhatsApp', label: 'Floating WhatsApp button', type: 'toggle', help: 'Show the round WhatsApp button on every page' },
      { k: 'showBlogInNav', label: 'Blog in menu', type: 'toggle', help: 'Show “Blog” in the header and footer' },
    ],
  },
  {
    key: 'contact',
    group: 'contact',
    label: 'Contact details',
    icon: 'i-phone',
    desc: 'Phone numbers, WhatsApp, email, address and hours — used across the whole site.',
    fields: [
      { k: 'phones', label: 'Phone numbers', type: 'strings', help: 'one per line — the first is the main number' },
      { k: 'emails', label: 'Email addresses', type: 'strings', help: 'one per line' },
      { k: 'whatsapp', label: 'WhatsApp number', type: 'text', help: 'with country code, e.g. +971 52 736 6525' },
      { k: 'headStripLocation', label: 'Top bar location text', type: 'text' },
      { k: 'whatsappMessage', label: 'WhatsApp greeting message', type: 'textarea', help: 'pre-filled when visitors tap WhatsApp' },
      { k: 'address', label: 'Address', type: 'text', full: true },
      { k: 'hours', label: 'Hours line', type: 'text', full: true },
      { k: 'hoursRows', label: 'Hours table (contact page)', type: 'kv' },
      { k: 'mapEmbedUrl', label: 'Google Maps embed URL', type: 'url', full: true, help: 'Google Maps → Share → Embed a map → copy the src="https://www.google.com/maps/embed?…" link' },
      { k: 'contactTitle', label: 'Contact page heading', type: 'text', full: true },
      { k: 'contactSub', label: 'Contact page intro', type: 'textarea' },
    ],
  },
  {
    key: 'social',
    group: 'social',
    label: 'Social links',
    icon: 'i-globe',
    desc: 'Icons appear in the footer; review links power the homepage reviews section.',
    fields: [
      { k: 'facebook', label: 'Facebook', type: 'url' },
      { k: 'instagram', label: 'Instagram', type: 'url' },
      { k: 'tiktok', label: 'TikTok', type: 'url' },
      { k: 'linkedin', label: 'LinkedIn', type: 'url' },
      { k: 'youtube', label: 'YouTube', type: 'url' },
      { k: 'x', label: 'X (Twitter)', type: 'url' },
      { k: 'googleReviews', label: 'Google reviews / Business Profile link', type: 'url', full: true },
    ],
  },
  {
    key: 'home',
    group: 'home',
    label: 'Homepage',
    icon: 'i-grid',
    desc: 'Every text on the homepage, plus switches to show or hide each section.',
    fields: [
      { type: 'section', title: 'Hero' },
      { k: 'heroKicker', label: 'Small label above the heading', type: 'text', full: true },
      { k: 'heroLine1', label: 'Heading line 1', type: 'text' },
      { k: 'heroLine2', label: 'Heading line 2', type: 'text' },
      { k: 'heroHighlight', label: 'Heading line 3 (red)', type: 'text' },
      { k: 'heroImage', label: 'Background image', type: 'image' },
      { k: 'heroSub', label: 'Intro paragraph', type: 'textarea' },
      { k: 'heroPrimaryLabel', label: 'Main button text', type: 'text' },
      { k: 'heroPrimaryHref', label: 'Main button link', type: 'text' },
      { k: 'heroSecondaryLabel', label: 'Second button text', type: 'text' },
      { k: 'heroSecondaryHref', label: 'Second button link', type: 'text' },
      { k: 'trust', label: 'Numbers under the buttons', type: 'kv' },
      { k: 'quoteTitle', label: 'Quote form title', type: 'text' },
      { k: 'quoteBadge', label: 'Quote form badge', type: 'text' },
      { k: 'quoteNote', label: 'Quote form note', type: 'text', full: true },
      { type: 'section', title: 'Ticker', desc: 'Routes marked “Ticker” in Coverage & routes are shown first.' },
      { k: 'showTicker', label: 'Show ticker', type: 'toggle', help: 'Scrolling strip under the hero' },
      { k: 'tickerExtras', label: 'Extra ticker items', type: 'strings', help: 'one per line — “Text|Bold part”' },
      { type: 'section', title: 'Services section' },
      { k: 'showServices', label: 'Show section', type: 'toggle', help: 'Services grid' },
      { k: 'servicesEyebrow', label: 'Small label', type: 'text' },
      { k: 'servicesTitle', label: 'Heading', type: 'text', full: true },
      { k: 'servicesSub', label: 'Intro', type: 'textarea' },
      { type: 'section', title: 'Fleet section', desc: 'Choose which vehicles appear with the “Homepage & menu” switch in Fleet.' },
      { k: 'showFleet', label: 'Show section', type: 'toggle', help: 'Fleet slider' },
      { k: 'fleetEyebrow', label: 'Small label', type: 'text' },
      { k: 'fleetTitle', label: 'Heading', type: 'text', full: true },
      { k: 'fleetSub', label: 'Intro', type: 'textarea' },
      { type: 'section', title: 'Why choose us' },
      { k: 'showWhy', label: 'Show section', type: 'toggle', help: 'Feature grid (also used on the About page)' },
      { k: 'whyEyebrow', label: 'Small label', type: 'text' },
      { k: 'whyTitle', label: 'Heading', type: 'text', full: true },
      { k: 'whySub', label: 'Intro', type: 'textarea' },
      { k: 'why', label: 'Features', type: 'features' },
      { type: 'section', title: 'Coverage & map' },
      { k: 'showCoverage', label: 'Show section', type: 'toggle', help: 'UAE map, routes and emirates' },
      { k: 'coverageEyebrow', label: 'Small label', type: 'text' },
      { k: 'coverageTitle', label: 'Heading', type: 'text', full: true },
      { k: 'coverageSub', label: 'Intro', type: 'textarea' },
      { type: 'section', title: 'Numbers strip' },
      { k: 'showStats', label: 'Show section', type: 'toggle', help: 'Animated numbers' },
      { k: 'stats', label: 'Numbers', type: 'stats' },
      { type: 'section', title: 'How booking works' },
      { k: 'showSteps', label: 'Show section', type: 'toggle', help: 'Four steps' },
      { k: 'stepsEyebrow', label: 'Small label', type: 'text' },
      { k: 'stepsTitle', label: 'Heading', type: 'text', full: true },
      { k: 'stepsSub', label: 'Intro', type: 'textarea' },
      { k: 'steps', label: 'Steps', type: 'steps' },
      { type: 'section', title: 'Reviews', desc: 'Shows your testimonials when you have some; otherwise links to Google / Facebook reviews.' },
      { k: 'showReviews', label: 'Show section', type: 'toggle', help: 'Reviews / testimonials' },
      { k: 'reviewsEyebrow', label: 'Small label', type: 'text' },
      { k: 'reviewsTitle', label: 'Heading', type: 'text', full: true },
      { k: 'reviewsSub', label: 'Intro (when there are no testimonials)', type: 'textarea' },
      { type: 'section', title: 'Blog' },
      { k: 'showBlog', label: 'Show section', type: 'toggle', help: 'Latest 3 articles' },
      { k: 'blogEyebrow', label: 'Small label', type: 'text' },
      { k: 'blogTitle', label: 'Heading', type: 'text', full: true },
      { k: 'blogSub', label: 'Intro', type: 'textarea' },
      { type: 'section', title: 'Call-to-action band', desc: 'Also used at the bottom of most pages.' },
      { k: 'showCta', label: 'Show section', type: 'toggle', help: 'Bottom call-to-action' },
      { k: 'ctaTitle', label: 'Heading', type: 'text', full: true },
      { k: 'ctaSub', label: 'Text', type: 'textarea' },
      { k: 'ctaImage', label: 'Background image', type: 'image' },
    ],
  },
  {
    key: 'about',
    group: 'about',
    label: 'About page',
    icon: 'i-users',
    desc: 'Heading, story and the “at a glance” facts panel.',
    fields: [
      { k: 'title', label: 'Heading', type: 'text', full: true },
      { k: 'sub', label: 'Intro', type: 'textarea' },
      { k: 'body', label: 'Story', type: 'markdown' },
      { k: 'image', label: 'Side image', type: 'image' },
      { k: 'panelTitle', label: 'Facts panel title', type: 'text' },
      { k: 'valuesTitle', label: 'Features heading', type: 'text' },
      { k: 'facts', label: 'Facts', type: 'kv' },
    ],
  },
  {
    key: 'seo',
    group: 'seo',
    label: 'SEO & meta tags',
    icon: 'i-search',
    desc: 'Default meta tags, search engine verification and indexing.',
    fields: [
      { k: 'defaultTitle', label: 'Homepage title tag', type: 'text', full: true },
      { k: 'titleTemplate', label: 'Title template for other pages', type: 'text', full: true, help: '%s is replaced by the page title' },
      { k: 'description', label: 'Default meta description', type: 'textarea', help: '150–160 characters works best' },
      { k: 'keywords', label: 'Default meta keywords', type: 'textarea', help: 'comma separated' },
      { k: 'ogImage', label: 'Default social share image', type: 'image', help: '1200×630 recommended' },
      { k: 'googleVerification', label: 'Google Search Console code', type: 'text', help: 'content="…" value of the meta tag' },
      { k: 'bingVerification', label: 'Bing Webmaster code', type: 'text', help: 'msvalidate.01 value' },
      {
        k: 'businessType',
        label: 'Business type (schema.org)',
        type: 'select',
        options: ['LocalBusiness', 'AutoRental', 'TravelAgency', 'TaxiService', 'Organization'].map((v) => ({ value: v, label: v })),
      },
      { k: 'robotsIndex', label: 'Search engines', type: 'toggle', help: 'Allow Google & others to index the site (turn off for a staging copy)' },
    ],
  },
  {
    key: 'pageseo',
    group: 'seo',
    label: 'Page meta tags',
    icon: 'i-tag',
    desc: 'Override the title, description, keywords and share image of each main page. Services, vehicles, posts and pages have their own SEO fields in their editors.',
    fields: PAGE_KEYS.flatMap(([k, name]): FieldDef[] => [
      { type: 'section', title: name },
      { k: `pages.${k}.title`, label: 'Meta title', type: 'text', full: true },
      { k: `pages.${k}.description`, label: 'Meta description', type: 'textarea' },
      { k: `pages.${k}.keywords`, label: 'Meta keywords', type: 'text', full: true },
      { k: `pages.${k}.ogImage`, label: 'Share image', type: 'image' },
    ]),
  },
  {
    key: 'tracking',
    group: 'tracking',
    label: 'Tracking & code',
    icon: 'i-chart',
    desc: 'Analytics tags and custom code added to every public page.',
    fields: [
      { k: 'gtmId', label: 'Google Tag Manager ID', type: 'text', help: 'GTM-XXXXXXX' },
      { k: 'ga4Id', label: 'Google Analytics 4 ID', type: 'text', help: 'G-XXXXXXXXXX (skip if GA4 runs through GTM)' },
      { k: 'metaPixelId', label: 'Meta (Facebook) Pixel ID', type: 'text', help: 'numbers only' },
      { k: 'headCode', label: 'Custom code in <head>', type: 'code', help: 'verification tags, chat widgets…' },
      { k: 'bodyCode', label: 'Custom code at end of <body>', type: 'code' },
    ],
  },
  {
    key: 'email',
    group: 'email',
    label: 'Email alerts',
    icon: 'i-mail',
    desc: 'Get an email for every new quote request. Works with Gmail (App Password), Zoho, Hostinger or any SMTP server.',
    fields: [
      { k: 'notifyEnabled', label: 'Email alerts', type: 'toggle', help: 'Email me when a quote request arrives' },
      { k: 'notifyTo', label: 'Send alerts to', type: 'email' },
      { k: 'smtpHost', label: 'SMTP host', type: 'text', help: 'e.g. smtp.gmail.com' },
      { k: 'smtpPort', label: 'SMTP port', type: 'number', help: '587 (TLS) or 465 (SSL)' },
      { k: 'smtpUser', label: 'SMTP username', type: 'text' },
      { k: 'smtpPass', label: 'SMTP password', type: 'password', help: 'for Gmail use an App Password' },
      { k: 'smtpSecure', label: 'SSL', type: 'toggle', help: 'Use SSL (port 465)' },
      { k: 'fromEmail', label: 'From address', type: 'email', help: 'usually the SMTP username' },
      { k: 'fromName', label: 'From name', type: 'text' },
    ],
  },
  {
    key: 'theme',
    group: 'theme',
    label: 'Colours',
    icon: 'i-layers',
    desc: 'Brand colours used for buttons, highlights and accents.',
    fields: [
      { k: 'brandLight', label: 'Brand — light', type: 'color' },
      { k: 'brand', label: 'Brand — main', type: 'color' },
      { k: 'brandDark', label: 'Brand — dark (text & links)', type: 'color' },
      { k: 'accent', label: 'Accent (blue)', type: 'color' },
    ],
  },
  {
    key: 'forms',
    group: 'forms',
    label: 'Quote forms',
    icon: 'i-inbox',
    desc: 'What visitors see after sending a quote request.',
    fields: [
      { k: 'successMessage', label: 'Thank-you message', type: 'textarea' },
      { k: 'offerWhatsapp', label: 'WhatsApp follow-up', type: 'toggle', help: 'Offer an “Also send on WhatsApp” button with the request pre-filled' },
    ],
  },
];

/* dot-path helpers for nested settings (seo.pages.home.title) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPath(obj: any, path: string) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function setPath(obj: any, path: string, value: unknown) {
  const keys = path.split('.');
  const out = { ...obj };
  let cur = out;
  keys.slice(0, -1).forEach((k) => {
    cur[k] = { ...(cur[k] || {}) };
    cur = cur[k];
  });
  cur[keys[keys.length - 1]] = value;
  return out;
}

const THEME_DEFAULT = { brandLight: '#C9391F', brand: '#B32C1C', brandDark: '#9A2317', accent: '#3983D8' };

export function SettingsClient({ initial, initialTab }: { initial: Settings; initialTab: string }) {
  const router = useRouter();
  const [data, setData] = useState<Settings>(initial);
  const [tab, setTab] = useState<TabKey>((TABS.find((t) => t.key === initialTab)?.key as TabKey) || 'general');
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const t = TABS.find((x) => x.key === tab)!;
  const group = data[t.group] as unknown as Values;
  const values: Values = Object.fromEntries(t.fields.filter((f) => f.k).map((f) => [f.k!, getPath(group, f.k!)]));

  const change = (k: string, v: unknown) => {
    setData((cur) => ({ ...cur, [t.group]: setPath(cur[t.group], k, v) }));
    setDirty(true);
    setMsg(null);
  };

  const save = () =>
    start(async () => {
      const r = await saveSettings(t.group, data[t.group] as unknown as Values);
      if (r.ok) {
        setDirty(false);
        setMsg({ ok: true, text: 'Saved — the website is updated.' });
        flash('Settings saved.');
        router.refresh();
      } else setMsg({ ok: false, text: r.error });
    });

  const testEmail = () =>
    start(async () => {
      const r = await sendTestEmail();
      setMsg(r.ok ? { ok: true, text: r.message || 'Sent.' } : { ok: false, text: r.error });
    });

  const switchTab = (k: TabKey) => {
    if (dirty && !confirm('You have unsaved changes on this tab. Leave without saving?')) return;
    if (dirty) setData(initial);
    setDirty(false);
    setMsg(null);
    setTab(k);
    window.history.replaceState(null, '', `?tab=${k}`);
  };

  return (
    <>
      <div className="stabs" role="tablist">
        {TABS.map((x) => (
          <button key={x.key} className={`stab${tab === x.key ? ' on' : ''}`} type="button" role="tab" aria-selected={tab === x.key} onClick={() => switchTab(x.key)}>
            <Ic n={x.icon} /> {x.label}
          </button>
        ))}
      </div>
      <div className="card">
        <div className="card-head">
          <h2>{t.label}</h2>
          <span className="hint">{t.desc}</span>
        </div>
        <div className="card-body">
          <FormFields fields={t.fields} values={values} onChange={change} />
        </div>
        <div className="form-bar">
          {tab === 'email' && (
            <button className="btn btn-ghost btn-sm" type="button" onClick={testEmail} disabled={pending || dirty}>
              <Ic n="i-mail" /> Send test email
            </button>
          )}
          {tab === 'theme' && (
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={() => {
                setData((cur) => ({ ...cur, theme: THEME_DEFAULT }));
                setDirty(true);
              }}
            >
              Reset to default colours
            </button>
          )}
          {msg && <span className={`form-msg ${msg.ok ? 'ok' : 'err'}`}>{msg.text}</span>}
          <span className="grow" />
          {dirty && <span className="muted" style={{ fontSize: 'var(--t-xs)' }}>Unsaved changes</span>}
          <button className="btn btn-primary btn-sm" type="button" onClick={save} disabled={pending || !dirty}>
            {pending ? 'Saving…' : 'Save changes'} <Ic n="i-check" />
          </button>
        </div>
      </div>
    </>
  );
}
