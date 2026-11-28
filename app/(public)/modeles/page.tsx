import { Suspense } from "react";
import Link from "next/link";
import CatalogClient from "@/components/modeles/CatalogClient";
import prisma from "@/lib/prisma";

export const metadata = {
  title: "Modèles de Motos & Scooters - Catalogue & Prix | actumoto.tn",
  description: "🇹🇳 Catalogue complet de motos et scooters avec prix en Tunisie. Découvrez tous les modèles par marque : Peugeot, CFMOTO, Suzuki. Comparateur de prix motos.",
  keywords: "catalogue moto tunisie, prix moto tunisie, scooter tunisie, motos neuves tunisie, comparateur moto, actumoto.tn",
  alternates: { canonical: "/modeles" },
};

export default async function ModelesPage() {
  const modelsData = await prisma.model.findMany({
    where: { isVisible: true },
    include: { brand: true, category: true, images: { orderBy: { orderIndex: "asc" } }, specs: true },
    orderBy: [{ orderIndex: "asc" }],
  });

  const formattedModels = modelsData.map((m) => ({
    ...m,
    brand: m.brand.name,
    category: m.category?.name,
    images: m.images.map((img: any) => img.url),
  }));

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://actumoto.tn").replace(/\/$/, "");
  const catalogSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Catalogue Motos & Scooters en Tunisie",
    description: metadata.description,
    url: `${baseUrl}/modeles`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: formattedModels.length,
      itemListElement: formattedModels.slice(0, 50).map((m: any, idx: number) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "Product",
          name: `${m.brand} ${m.name}`,
          brand: { "@type": "Brand", name: m.brand },
          ...(m.promoPrice || m.price
            ? {
                offers: {
                  "@type": "Offer",
                  priceCurrency: "TND",
                  price: m.promoPrice || m.price,
                  availability: "https://schema.org/InStock",
                },
              }
            : {}),
        },
      })),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Modèles", item: `${baseUrl}/modeles` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(catalogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Flèche retour fixe */}
      <div className="container mx-auto px-4 flex justify-end items-center my-[2px]">
        <Link
          href="/"
          className="section-back-btn-inline"
          title="Retour à l'accueil"
          aria-label="Retour à la page d'accueil"
        >
          ←
        </Link>
      </div>

      <section className="pt-2 pb-6 md:pt-4 md:pb-8 text-center bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <h1 className="futurist-font text-3xl md:text-5xl text-gray-900 mb-4 uppercase">
            CATALOGUE <span className="text-red-600">MOTOS & SCOOTERS</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Trouvez la moto ou le scooter qui vous correspond parmi notre sélection des meilleures marques en Tunisie.
          </p>
        </div>
      </section>

      <Suspense fallback={<div className="container mx-auto p-12 text-center text-xl">Chargement du catalogue...</div>}>
        <CatalogClient models={formattedModels} />
      </Suspense>
    </>
  );
}
