"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import ModelCard from "./ModelCard";

export default function CatalogClient({ models }: { models: any[] }) {
  const searchParams = useSearchParams();
  const [filteredModels, setFilteredModels] = useState<any[]>([]);

  useEffect(() => {
    // Read URL params
    const marqueParam = searchParams.get("marque");
    const categoryParam = searchParams.get("category");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");

    let allModels = [...models];

    // Filter
    if (marqueParam) {
      allModels = allModels.filter(m => m.brand === marqueParam);
    }
    if (categoryParam) {
      allModels = allModels.filter(m => m.category === categoryParam);
    }
    if (minPriceParam) {
      allModels = allModels.filter(m => m.price >= Number(minPriceParam));
    }
    if (maxPriceParam) {
      allModels = allModels.filter(m => m.price <= Number(maxPriceParam));
    }

    setFilteredModels(allModels);
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-[1400px]">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          {filteredModels.length} modèle(s) trouvé(s)
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start" id="models-container">
        {filteredModels.map((model, idx) => (
          <ModelCard key={idx} model={model} brand={model.brand} index={idx} />
        ))}
      </div>
      
      {filteredModels.length === 0 && (
        <div className="text-center py-20 text-gray-500 text-lg">
          Aucun modèle ne correspond à vos critères.
        </div>
      )}
    </div>
  );
}
