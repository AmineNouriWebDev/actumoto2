import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "actumoto.tn - Comparateur de prix motos et scooters en Tunisie",
  description: "🇹🇳 Trouvez la meilleure moto au meilleur prix. Comparateur de prix motos et scooters, fiches techniques et actualités en Tunisie.",
  openGraph: {
    title: "actumoto.tn - Comparateur Moto Tunisie",
    description: "Le 1er comparateur de prix de motos et scooters en Tunisie.",
    url: "https://actumoto.tn",
    siteName: "actumoto.tn",
    images: [
      {
        url: "https://actumoto.tn/img/logo-principal-6.png",
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
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Racing+Sans+One&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <Header />
        <main role="main" className="pt-[80px]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
