"use client";

import Script from "next/script";
import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface AnalyticsScriptsProps {
  ga4Enabled: boolean;
  ga4MeasurementId: string;
  metaPixelEnabled?: boolean;
  metaPixelId?: string | null;
}

function Ga4RouteTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!measurementId || typeof window === "undefined") return;
    const gtag = (window as any).gtag;
    if (typeof gtag === "function") {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      gtag("config", measurementId, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, measurementId]);

  return null;
}

export default function AnalyticsScripts({
  ga4Enabled,
  ga4MeasurementId,
  metaPixelEnabled = false,
  metaPixelId,
}: AnalyticsScriptsProps) {
  const cleanGa4Id = ga4MeasurementId?.trim();
  const cleanPixelId = metaPixelId?.trim();

  return (
    <>
      {ga4Enabled && cleanGa4Id && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(cleanGa4Id)}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics-4" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${cleanGa4Id}');
            `}
          </Script>
          <Suspense fallback={null}>
            <Ga4RouteTracker measurementId={cleanGa4Id} />
          </Suspense>
        </>
      )}

      {metaPixelEnabled && cleanPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${cleanPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
