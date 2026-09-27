import Script from 'next/script';
import type { Settings } from '@/lib/settings-defaults';
import { CustomCode } from './SiteEffects';

const clean = (id: string, re: RegExp) => (re.test(id.trim()) ? id.trim() : '');

/** Google Tag Manager, GA4, Meta Pixel and custom head/body code from Settings → SEO & tracking. */
export function Tracking({ t }: { t: Settings['tracking'] }) {
  const gtm = clean(t.gtmId, /^GTM-[A-Z0-9]+$/i);
  const ga = clean(t.ga4Id, /^G-[A-Z0-9]+$/i);
  const px = clean(t.metaPixelId, /^\d{5,20}$/);
  return (
    <>
      {gtm && (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
          </Script>
          <noscript>
            <iframe src={`https://www.googletagmanager.com/ns.html?id=${gtm}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} title="gtm" />
          </noscript>
        </>
      )}
      {ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
          </Script>
        </>
      )}
      {px && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${px}');fbq('track','PageView');`}
        </Script>
      )}
      {t.headCode && <CustomCode html={t.headCode} target="head" />}
      {t.bodyCode && <CustomCode html={t.bodyCode} target="body" />}
    </>
  );
}

const HEX = /^#[0-9a-f]{6}$/i;

/** Brand colour overrides from Settings → Appearance. */
export function ThemeStyle({ theme }: { theme: Settings['theme'] }) {
  const l = HEX.test(theme.brandLight) ? theme.brandLight : '#C9391F';
  const m = HEX.test(theme.brand) ? theme.brand : '#B32C1C';
  const d = HEX.test(theme.brandDark) ? theme.brandDark : '#9A2317';
  const a = HEX.test(theme.accent) ? theme.accent : '#3983D8';
  if (l === '#C9391F' && m === '#B32C1C' && d === '#9A2317' && a === '#3983D8') return null;
  const css = `:root{--r-400:${l};--r-500:${m};--r-600:${d};--r-wash:color-mix(in srgb,${d} 8%,transparent);--grad-brand:linear-gradient(135deg,${l} 0%,${m} 45%,${d} 100%);--grad-accent-text:linear-gradient(135deg,${m} 0%,${d} 100%);--glow-brand:0 18px 44px -20px color-mix(in srgb,${d} 55%,transparent);--accent:${a};--accent-ink:color-mix(in srgb,${a} 80%,#000);--accent-wash:color-mix(in srgb,${a} 10%,transparent);--c1:${d};--c2:${a}}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
