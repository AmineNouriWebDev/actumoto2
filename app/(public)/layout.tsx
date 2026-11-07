import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ToastProvider from "@/components/admin/ToastProvider";

export const metadata: Metadata = {
  title: "actumoto.tn - Comparateur de prix motos et scooters en Tunisie",
  description: "🇹🇳 Trouvez la meilleure moto au meilleur prix. Comparateur de prix motos et scooters, fiches techniques et actualités en Tunisie.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/img/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/img/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/img/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/img/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "/img/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/img/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  openGraph: {
    title: "actumoto.tn - Comparateur Moto Tunisie",
    description: "Le 1er comparateur de prix de motos et scooters en Tunisie.",
    url: "https://actumoto.tn",
    siteName: "actumoto.tn",
    images: [
      {
        url: "https://actumoto.tn/img/logo2.webp",
        width: 1200,
        height: 630,
        alt: "actumoto.tn Logo",
      },
    ],
    locale: "fr_TN",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr-TN">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/img/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/img/favicon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/img/apple-touch-icon.png" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Racing+Sans+One&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <ToastProvider />
        <Header />
        <main role="main" className="pt-[80px]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
