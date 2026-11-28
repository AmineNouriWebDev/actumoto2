import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MainLayoutWrapper from "@/components/layout/MainLayoutWrapper";
import ToastProvider from "@/components/admin/ToastProvider";
import PushNotificationPrompt from "@/components/notifications/PushNotificationPrompt";
import ProfileCompletionPrompt from "@/components/client/ProfileCompletionPrompt";
import AnalyticsScripts from "@/components/seo/AnalyticsScripts";
import prisma from "@/lib/prisma";

const DEFAULT_TITLE = "Comparateur de Prix Moto & Scooter N°1 en Tunisie | actumoto.tn";
const DEFAULT_DESCRIPTION =
  "🇹🇳 Trouvez la meilleure moto au meilleur prix. Comparateur de prix motos et scooters, fiches techniques, occasions et concessionnaires officiels en Tunisie.";
const DEFAULT_KEYWORDS =
  "moto Tunisie, scooter Tunisie, prix moto Tunisie, scooter électrique Tunisie, comparateur de prix moto, moto neuve Tunisie, Peugeot scooter, CFMOTO moto, Suzuki moto, Forza, Zimota";

const DEVELOPER_HTML_COMMENT = `
<!-- 
  ========================================
  DEVELOPER INFORMATION / INFORMATIONS DÉVELOPPEUR
  ========================================
  Website Developer / Développeur du site : Mohamed Amine Nouri
  Company / Société : MaxSolving
  Contact / Email : contact@maxsolving.com
  Website / Site Web : https://maxsolving.com
  ======================================== 
-->
`;

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://actumoto.tn").replace(/\/$/, "");
  const settings = (await prisma.siteSettings.findFirst().catch(() => null)) as any;

  const title = settings?.seoSiteTitle?.trim() || DEFAULT_TITLE;
  const description = settings?.seoSiteDescription?.trim() || DEFAULT_DESCRIPTION;
  const keywords = settings?.seoKeywords?.trim() || DEFAULT_KEYWORDS;
  const googleVerification = settings?.googleSiteVerification?.trim() || undefined;

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    keywords,
    authors: [{ name: "MaxSolving", url: "https://maxsolving.com" }],
    creator: "Mohamed Amine Nouri — MaxSolving",
    publisher: "actumoto.tn",
    alternates: {
      canonical: "./",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
    icons: {
      icon: [
        { url: "/img/favicon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/favicon.ico" },
        { url: "/img/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/img/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/img/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
      other: [
        { rel: "icon", url: "/img/icon-192x192.png", sizes: "192x192", type: "image/png" },
        { rel: "icon", url: "/img/icon-512x512.png", sizes: "512x512", type: "image/png" },
      ],
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: "actumoto.tn",
      images: [
        {
          url: "/img/og-preview2.png",
          width: 1200,
          height: 630,
          alt: "actumoto.tn — Comparateur de Prix Moto & Scooter en Tunisie",
        },
      ],
      locale: "fr_TN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/img/og-preview2.png"],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = (await prisma.siteSettings.findFirst().catch(() => null)) as any;
  const hideFooterOnOtherPages = settings?.hideFooterOnOtherPages !== false;
  const pushPromptEnabled = settings?.pushPromptEnabled !== false;
  const ga4Enabled = settings?.ga4Enabled !== false;
  const ga4MeasurementId = settings?.ga4MeasurementId || "G-WGY6N6E618";
  const metaPixelEnabled = settings?.metaPixelEnabled === true;
  const metaPixelId = settings?.metaPixelId || "2443539866090948";
  const vapidPublicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || "";

  return (
    <html lang="fr-TN">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="author" href="https://maxsolving.com" />
        <meta name="theme-color" content="#0a0a0a" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Racing+Sans+One&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <div
          hidden
          aria-hidden="true"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: DEVELOPER_HTML_COMMENT }}
        />
        <AnalyticsScripts
          ga4Enabled={ga4Enabled}
          ga4MeasurementId={ga4MeasurementId}
          metaPixelEnabled={metaPixelEnabled}
          metaPixelId={metaPixelId}
        />
        <ToastProvider />
        <Header />
        <MainLayoutWrapper>{children}</MainLayoutWrapper>
        <Footer hideFooterOnOtherPages={hideFooterOnOtherPages} />
        <PushNotificationPrompt
          enabled={pushPromptEnabled}
          vapidPublicKey={vapidPublicKey}
        />
        <ProfileCompletionPrompt />
      </body>
    </html>
  );
}
