"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface NewModelsSectionProps {
  models: any[];
}

export default function NewModelsSection({ models }: NewModelsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Défilement automatique uniquement sur Desktop toutes les 3s (pause au survol)
  useEffect(() => {
    if (!models || models.length <= 3) return;

    const interval = setInterval(() => {
      // Uniquement sur Desktop (>= 768px) et si non survolé
      if (typeof window === "undefined" || window.innerWidth < 768) return;
      if (isHovered) return;

      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const { scrollLeft, scrollWidth, clientWidth } = container;

      // Si on arrive vers la fin, on revient doucement au début
      if (scrollLeft + clientWidth >= scrollWidth - 20) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        const card = container.firstElementChild as HTMLElement;
        const step = card ? card.offsetWidth + 24 : clientWidth / 3;
        container.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [models, isHovered]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const card = container.firstElementChild as HTMLElement;
    const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
    const gap = isDesktop ? 24 : 16;
    const step = card ? card.offsetWidth + gap : container.clientWidth / (isDesktop ? 3 : 1);
    const offset = direction === "left" ? -step : step;
    container.scrollBy({ left: offset, behavior: "smooth" });
  };

  if (!models || models.length === 0) {
    return null;
  }

  return (
    <section className="py-6 relative" aria-labelledby="nouveautes-title">
      <div className="container mx-auto px-4">
        {/* Titre masqué visuellement pour respecter la consigne (conservé sr-only pour SEO) */}
        <h2 id="nouveautes-title" className="sr-only">
          Dernières Nouveautés Moto
        </h2>

        {/* Zone Carrousel / Glissement */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Rail de défilement : 1 modèle sur mobile (glissement au doigt), 3 sur desktop */}
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {models.map((model, idx) => {
              const brandName =
                typeof model.brand === "string"
                  ? model.brand
                  : model.brand?.name || "";
              const modelHref = `/marques/${encodeURIComponent(brandName)}/${encodeURIComponent(model.name)}`;
              const rawImage =
                (Array.isArray(model.images) && model.images[0]) ||
                model.image ||
                "/img/placeholder-moto.jpg";
              const mainImage = rawImage.startsWith("./")
                ? rawImage.substring(1)
                : rawImage;

              const hasPrice =
                (model.promoPrice !== null &&
                  model.promoPrice !== undefined &&
                  model.promoPrice > 0) ||
                (model.price !== null &&
                  model.price !== undefined &&
                  model.price > 0);
              const effectivePrice =
                model.promoPrice && model.promoPrice > 0
                  ? model.promoPrice
                  : model.price;

              return (
                <div
                  key={model.id || idx}
                  className="w-full md:w-[calc((100%-3rem)/3)] flex-shrink-0 snap-center md:snap-start"
                >
                  <Link
                    href={modelHref}
                    className="group block text-center focus:outline-none"
                  >
                    {/* Conteneur Image avec ratio uniforme 4:3 garanti pour tous les modèles (sans cadre gris) */}
                    <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden relative flex items-center justify-center">
                      <img
                        src={mainImage}
                        alt={`${brandName} ${model.name}`}
                        className="w-full h-full object-cover rounded-2xl transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/img/placeholder-moto.jpg";
                        }}
                      />
                    </div>

                    {/* Nom du modèle en dessous de l'image */}
                    <div className="mt-3 px-1">
                      <h3 className="futurist-font text-base sm:text-lg text-gray-900 group-hover:text-red-600 transition-colors uppercase tracking-wide truncate">
                        {model.name}
                      </h3>

                      {/* Prix ou En arrivage en bas du nom */}
                      <div className="mt-1">
                        {hasPrice ? (
                          <p className="text-sm sm:text-base font-bold text-gray-800">
                            À partir de{" "}
                            <span className="text-red-600 font-extrabold text-base sm:text-lg">
                              {effectivePrice.toLocaleString("fr-FR")}{" "}
                              {model.currency || "DT"}
                            </span>
                          </p>
                        ) : (
                          <p className="text-sm sm:text-base font-extrabold text-red-600 uppercase tracking-wide">
                            En arrivage
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Deux petites flèches simples l'une à côté de l'autre en bas (Desktop uniquement) */}
          {models.length > 3 && (
            <div className="hidden md:flex items-center justify-center gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-red-600 text-gray-700 hover:text-white border border-gray-200 hover:border-red-600 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Nouveauté précédente"
                title="Précédent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-red-600 text-gray-700 hover:text-white border border-gray-200 hover:border-red-600 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Nouveauté suivante"
                title="Suivant"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
