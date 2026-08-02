import { occasionModelsData } from "@/lib/data";
import OccasionCard from "@/components/modeles/OccasionCard";
import Link from "next/link";

export const metadata = {
  title: "Motos & Scooters d'Occasion - Prix Tunisie | actumoto.tn",
  description: "🇹🇳 Motos et scooters d'occasion en Tunisie au meilleur prix. Découvrez des motos occasion vérifiées, prix intéressants, toutes marques. Honda, CFMOTO, Kawasaki, BMW, Peugeot occasion.",
};

export default function OccasionPage() {
  return (
    <>
      <section className="pt-24 pb-8 relative" role="main">
        <Link
          href="/"
          className="section-back-btn"
          title="Retour à l'accueil"
          aria-label="Retour à la page d'accueil"
        >
          ←
        </Link>

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
            {occasionModelsData.map((model, index) => (
              <OccasionCard key={index} model={model} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
