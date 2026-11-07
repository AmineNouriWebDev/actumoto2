"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, Fragment } from "react";
import ModelCard from "./ModelCard";
import ComparateurBar from "./ComparateurBar";

export default function CatalogClient({ models }: { models: any[] }) {
  const searchParams = useSearchParams();

  // Lecture des paramètres de recherche pour filtrer directement (compatible SSR et client)
  const marqueParam = searchParams.get("marque");
  const categoryParam = searchParams.get("category");
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");

  const filteredModels = useMemo(() => {
    let result = [...models];

    if (marqueParam) {
      result = result.filter((m) => m.brand === marqueParam);
    }
    if (categoryParam) {
      result = result.filter((m) => m.category === categoryParam);
    }
    if (minPriceParam) {
      result = result.filter((m) => (m.price || 0) >= Number(minPriceParam));
    }
    if (maxPriceParam) {
      result = result.filter((m) => (m.price || 0) <= Number(maxPriceParam));
    }

    return result;
  }, [models, marqueParam, categoryParam, minPriceParam, maxPriceParam]);

  // Organisation par marque puis tri par prix croissant (exactement comme les filtres par catégorie et budget)
  const { groupedByBrand, sortedBrands } = useMemo(() => {
    const grouped: Record<string, any[]> = {};

    filteredModels.forEach((model) => {
      const brandName = model.brand || "Autres";
      if (!grouped[brandName]) {
        grouped[brandName] = [];
      }
      grouped[brandName].push(model);
    });

    // Tri des modèles par prix croissant à l'intérieur de chaque marque
    Object.keys(grouped).forEach((brandName) => {
      grouped[brandName].sort(
        (a, b) => (a.price || 0) - (b.price || 0)
      );
    });

    const sorted = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

    return { groupedByBrand: grouped, sortedBrands: sorted };
  }, [filteredModels]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-[1400px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 font-sans">
          {filteredModels.length} modèle(s) trouvé(s)
        </h2>
      </div>

      {filteredModels.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-lg">
          Aucun modèle ne correspond à vos critères.
        </div>
      ) : (
        <div id="models-container" role="list" aria-label="Liste des modèles de motos">
          {sortedBrands.map((brandKey) => (
            <Fragment key={brandKey}>
              <div key={`header-${brandKey}`} className="brand-group-header">
                {brandKey}
              </div>
              {groupedByBrand[brandKey].map((model: any, index: number) => (
                <ModelCard
                  key={`${brandKey}-${model.id || index}`}
                  model={model}
                  brand={brandKey}
                  index={index}
                />
              ))}
            </Fragment>
          ))}
        </div>
      )}

      {/* Barre de comparaison flottante */}
      <ComparateurBar />
    </div>
  );
}
