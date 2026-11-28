import prisma from "@/lib/prisma";
import OccasionCard from "@/components/modeles/OccasionCard";
import Link from "next/link";

export const metadata = {
  title: "Motos & Scooters d'Occasion - Prix Tunisie | actumoto.tn",
  description: "🇹🇳 Motos et scooters d'occasion en Tunisie au meilleur prix. Découvrez des motos occasion vérifiées, prix intéressants, toutes marques. Honda, CFMOTO, Kawasaki, BMW, Peugeot occasion.",
  keywords: "moto occasion tunisie, scooter occasion tunisie, vente moto occasion, moto pas cher tunisie, actumoto occasion",
  alternates: { canonical: "/occasion" },
};



export default async function OccasionPage() {
  const occasions = await prisma.occasion.findMany({
    where: { isVisible: true },
    include: {
      images: { orderBy: { orderIndex: 'asc' } },
      specs: true,
    },
    orderBy: { orderIndex: "asc" },
  });

  // Transform Prisma models into the format expected by OccasionCard
  const formattedOccasions = occasions.map(occ => ({
    ...occ,
    images: occ.images.map(img => img.url),
    image: occ.images[0]?.url,
    specs: occ.specs ? {
      ...occ.specs,
      tankCapacity: occ.specs.tankCapacity || undefined,
      autonomie: occ.specs.autonomie || undefined,
    } : null,
  }));

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://actumoto.tn").replace(/\/$/, "");
  const occasionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Motos & Scooters d'Occasion en Tunisie",
    description: metadata.description,
    url: `${baseUrl}/occasion`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: formattedOccasions.length,
      itemListElement: formattedOccasions.map((occ: any, idx: number) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "Product",
          name: `${occ.marque} ${occ.name}`,
          brand: { "@type": "Brand", name: occ.marque },
          itemCondition: "https://schema.org/UsedCondition",
        },
      })),
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Occasions", item: `${baseUrl}/occasion` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(occasionSchema) }}
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

      <section className="pt-[2px] pb-8 relative" role="main">

        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="futurist-font text-3xl md:text-5xl text-[#B22222] mb-1 mt-4">
              OCCASIONS
            </h1>
          </div>

          <div
            id="occasion-container"
            className="occasion-grid"
            role="list"
            aria-label="Liste des motos d'occasion"
          >
            {formattedOccasions.map((model, index) => (
              <OccasionCard key={index} model={model} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
