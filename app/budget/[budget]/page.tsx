import { notFound } from "next/navigation";
import { Fragment } from "react";
import prisma from "@/lib/prisma";
import ModelCard from "@/components/modeles/ModelCard";
import Link from "next/link";
import ComparateurBar from "@/components/modeles/ComparateurBar";

// Price ranges — same as index.html
const PRICE_RANGES: Record<string, { min: number; max: number; label: string }> = {
  "moins-de-4000":   { min: 0,     max: 4000,   label: "Moins de 4 000 DT" },
  "4000-7000":       { min: 4001,  max: 7000,   label: "4 000 – 7 000 DT" },
  "7000-10000":      { min: 7001,  max: 10000,  label: "7 000 – 10 000 DT" },
  "10000-15000":     { min: 10001, max: 15000,  label: "10 000 – 15 000 DT" },
  "15000-20000":     { min: 15001, max: 20000,  label: "15 000 – 20 000 DT" },
  "plus-de-20000":   { min: 20001, max: 9999999,label: "Plus de 20 000 DT" },
};

export async function generateMetadata({ params }: { params: Promise<{ budget: string }> }) {
  const { budget } = await params;
  const range = PRICE_RANGES[budget];
  if (!range) return { title: "Budget | actumoto.tn" };
  return {
    title: `Motos ${range.label} en Tunisie | actumoto.tn`,
    description: `Découvrez toutes les motos et scooters disponibles entre ${range.label} en Tunisie.`,
  };
}

export function generateStaticParams() {
  return Object.keys(PRICE_RANGES).map((budget) => ({ budget }));
}

export default async function BudgetPage({ params }: { params: Promise<{ budget: string }> }) {
  const { budget } = await params;
  const range = PRICE_RANGES[budget];

  if (!range) notFound();

  const modelsData = await prisma.model.findMany({
    where: {
      price: {
        gte: range.min,
        lte: range.max,
      },
    },
    include: { brand: true, category: true, images: { orderBy: { orderIndex: "asc" } }, specs: true },
  });

  const groupedByBrand: Record<string, { models: any[]; brandOrder: number }> = {};
  const brands = await prisma.brand.findMany({ orderBy: { id: "asc" } });

  modelsData.forEach((model) => {
    const brandName = model.brand.name;
    if (!groupedByBrand[brandName]) {
      const brandOrder = brands.findIndex((b) => b.id === model.brandId);
      groupedByBrand[brandName] = {
        models: [],
        brandOrder: brandOrder === -1 ? 999 : brandOrder,
      };
    }
    groupedByBrand[brandName].models.push({
      ...model,
      images: model.images.map((img: any) => img.url),
      category: model.category?.name,
    });
  });

  const sortedBrands = Object.keys(groupedByBrand).sort(
    (a, b) => groupedByBrand[a].brandOrder - groupedByBrand[b].brandOrder
  );

  return (
    <>
      {/* Floating back button */}
      <Link href="/" className="section-back-btn" title="Retour à l'accueil" aria-label="Retour à la page d'accueil">
        ←
      </Link>

      <section className="pt-28 pb-8 relative" role="main">
        <div className="container mx-auto px-4">
          <div className="sr-only">
            <h1>Motos {range.label} en Tunisie</h1>
          </div>

          {sortedBrands.length === 0 ? (
            <div className="flex items-center justify-center w-full min-h-[50vh] p-4">
              <p className="text-gray-500 text-lg">Aucun modèle disponible dans cette tranche de prix.</p>
            </div>
          ) : (
            <div id="models-container" role="list" aria-label="Liste des modèles de motos">
              {sortedBrands.map((brandKey) => (
                <Fragment key={brandKey}>
                  <div key={`header-${brandKey}`} className="brand-group-header">
                    {brandKey}
                  </div>
                  {groupedByBrand[brandKey].models.map((model: any, index: number) => (
                    <ModelCard key={`${brandKey}-${model.id || index}`} model={model} brand={brandKey} index={index} />
                  ))}
                </Fragment>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Comparator bar */}
      <ComparateurBar />
    </>
  );
}
