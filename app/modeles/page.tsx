import { Suspense } from "react";
import CatalogClient from "@/components/modeles/CatalogClient";

export const metadata = {
  title: "Modèles de Motos & Scooters - Catalogue & Prix | actumoto.tn",
  description: "🇹🇳 Catalogue complet de motos et scooters avec prix en Tunisie. Découvrez tous les modèles par marque : Peugeot, CFMOTO, Suzuki. Comparateur de prix motos 2024.",
};

export default function ModelesPage() {
  return (
    <>
      <section className="pt-24 pb-8 md:pt-32 md:pb-12 text-center bg-gray-50 border-b border-gray-200">
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
        <CatalogClient />
      </Suspense>
    </>
  );
}
