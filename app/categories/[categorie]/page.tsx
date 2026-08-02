import { notFound } from "next/navigation";
import { Fragment } from "react";
import { modelsData, brands } from "@/lib/data";
import ModelCard from "@/components/modeles/ModelCard";
import Link from "next/link";
import ComparateurBar from "@/components/modeles/ComparateurBar";

const CATEGORIES = ["Sportive", "Trail", "Roadster", "Scooter", "Electrique", "Motocube", "Custom", "Motocross", "Mobylette"];

export async function generateMetadata({ params }: { params: Promise<{ categorie: string }> }) {
  const { categorie } = await params;
  const categoryName = decodeURIComponent(categorie);
  return {
    title: `${categoryName} en Tunisie - Prix et Modèles | actumoto.tn`,
    description: `Découvrez tous les modèles de la catégorie ${categoryName} disponibles en Tunisie. Prix, fiches techniques et comparateur.`,
  };
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ categorie: encodeURIComponent(c) }));
}

export default async function CategoriePage({ params }: { params: Promise<{ categorie: string }> }) {
  const { categorie } = await params;
  const categoryName = decodeURIComponent(categorie);

  // Collect models grouped by brand (same logic as original showModelsByCategory)
  const groupedByBrand: Record<string, { models: any[]; brandOrder: number }> = {};

  Object.keys(modelsData).forEach((brandKey) => {
    const brandModels = (modelsData as any)[brandKey].filter((model: any) => {
      if (categoryName.toLowerCase() === "electrique") {
        return model.fuelType && model.fuelType.toLowerCase() === "electrique";
      }
      return model.category && model.category.toLowerCase() === categoryName.toLowerCase();
    });

    if (brandModels.length > 0) {
      const brandOrder = (brands as any[]).findIndex((b) => b.name === brandKey);
      groupedByBrand[brandKey] = {
        models: [...brandModels].reverse(), // original reverses
        brandOrder: brandOrder === -1 ? 999 : brandOrder,
      };
    }
  });

  const sortedBrands = Object.keys(groupedByBrand).sort(
    (a, b) => groupedByBrand[a].brandOrder - groupedByBrand[b].brandOrder
  );

  if (sortedBrands.length === 0) {
    notFound();
  }

  return (
    <>
      {/* Floating back button — exact .section-back-btn */}
      <Link href="/" className="section-back-btn" title="Retour à l'accueil" aria-label="Retour à la page d'accueil">
        ←
      </Link>

      <section className="pt-28 pb-8 relative" role="main">
        <div className="container mx-auto px-4">
          <div className="sr-only">
            <h1>Catalogue {categoryName} - Motos et Scooters en Tunisie</h1>
            <p>Découvrez tous les modèles de {categoryName.toLowerCase()} disponibles avec prix et caractéristiques.</p>
          </div>

          <div id="models-container" role="list" aria-label="Liste des modèles de motos">
            {sortedBrands.map((brandKey) => (
              <Fragment key={brandKey}>
                {/* Brand group header — same as original .brand-group-header */}
                <div key={`header-${brandKey}`} className="brand-group-header">
                  {brandKey}
                </div>
                {groupedByBrand[brandKey].models.map((model: any, index: number) => (
                  <ModelCard key={`${brandKey}-${index}`} model={model} brand={brandKey} index={index} />
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Comparator bar */}
      <ComparateurBar />
    </>
  );
}
