"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export interface NouveauteItemProp {
  id: string;
  title?: string | null;
  name?: string | null;
  subtitle?: string | null;
  brand?: string | { name: string } | null;
  imageUrl?: string | null;
  image?: string | null;
  images?: string[] | { url: string }[];
  linkUrl?: string | null;
  price?: number | null;
  promoPrice?: number | null;
  currency?: string | null;
}

interface NewModelsSectionProps {
  items?: NouveauteItemProp[];
  models?: NouveauteItemProp[];
}

export default function NewModelsSection({ items, models }: NewModelsSectionProps) {
  const displayList = items && items.length > 0 ? items : (models || []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Défilement automatique uniquement sur Desktop toutes les 3s (pause au survol)
  useEffect(() => {
    if (!displayList || displayList.length <= 3) return;

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
  }, [displayList, isHovered]);

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

  if (!displayList || displayList.length === 0) {
    return null;
  }

  return (
    <section className="py-6 relative" aria-labelledby="nouveautes-title">
      <div className="container mx-auto px-4">
        {/* Titre masqué visuellement (conservé pour le SEO) */}
        <h2 id="nouveautes-title" className="sr-only">
          Dernières Nouveautés Moto & Scooters
        </h2>

        {/* Zone Carrousel / Glissement */}
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Rail de défilement : 1 modèle sur mobile, 3 sur desktop */}
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {displayList.map((item, idx) => {
              // Extraction des informations
              const title = item.title || item.name || "Nouveauté";
              const subtitle =
                item.subtitle ||
                (typeof item.brand === "string" ? item.brand : item.brand?.name) ||
                null;

              // Image
              let rawImage = item.imageUrl || item.image;
              if (!rawImage && Array.isArray(item.images) && item.images.length > 0) {
                const first = item.images[0];
                rawImage = typeof first === "string" ? first : first?.url;
              }
              const mainImage = rawImage
                ? rawImage.startsWith("./")
                  ? rawImage.substring(1)
                  : rawImage
                : "/img/placeholder-moto.jpg";

              // Prix
              const hasPrice =
                (item.promoPrice !== null &&
                  item.promoPrice !== undefined &&
                  item.promoPrice > 0) ||
                (item.price !== null &&
                  item.price !== undefined &&
                  item.price > 0);
              const effectivePrice =
                item.promoPrice && item.promoPrice > 0
                  ? item.promoPrice
                  : item.price;

              // Cliquable uniquement si linkUrl est présent et non vide
              const isClickable = Boolean(
                item.linkUrl && item.linkUrl.trim() !== ""
              );
              const linkTarget = isClickable ? item.linkUrl!.trim() : undefined;

              // Card Inner Content
              const cardContent = (
                <>
                  {/* Conteneur Image avec ratio uniforme 4:3 garanti (sans cadre gris) */}
                  <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden relative flex items-center justify-center bg-gray-900/40">
                    <img
                      src={mainImage}
                      alt={subtitle ? `${subtitle} ${title}` : title}
                      className={`w-full h-full object-cover rounded-2xl ${
                        isClickable
                          ? "transition-transform duration-500 group-hover:scale-105"
                          : ""
                      }`}
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/img/placeholder-moto.jpg";
                      }}
                    />
                    {/* Badge NOUVEAU */}
                    <div
                      className="nouveau-badge"
                      aria-label="Nouveau modèle"
                    >
                      <Sparkles className="nouveau-badge-icon" aria-hidden="true" />
                      <span>NOUVEAU</span>
                    </div>
                  </div>

                  {/* Nom & Infos en dessous de l'image */}
                  <div className="mt-3 px-1">
                    <h3
                      className={`futurist-font text-base sm:text-lg text-gray-900 ${
                        isClickable
                          ? "group-hover:text-red-600 transition-colors"
                          : ""
                      } uppercase tracking-wide truncate`}
                    >
                      {title}
                    </h3>

                    {/* Sous-titre ou Marque si présent et différent du titre */}
                    {subtitle && subtitle !== title && (
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mt-0.5">
                        {subtitle}
                      </p>
                    )}

                    {/* Prix ou En arrivage */}
                    <div className="mt-1">
                      {hasPrice && effectivePrice ? (
                        <p className="text-sm sm:text-base font-bold text-gray-800">
                          À partir de{" "}
                          <span className="text-red-600 font-extrabold text-base sm:text-lg">
                            {effectivePrice.toLocaleString("fr-FR")}{" "}
                            {item.currency || "DT"}
                          </span>
                        </p>
                      ) : (
                        <p className="text-sm sm:text-base font-extrabold text-red-600 uppercase tracking-wide">
                          En arrivage
                        </p>
                      )}
                    </div>
                  </div>
                </>
              );

              return (
                <div
                  key={item.id || idx}
                  className="w-full md:w-[calc((100%-3rem)/3)] flex-shrink-0 snap-center md:snap-start"
                >
                  {isClickable && linkTarget ? (
                    <Link
                      href={linkTarget}
                      className="group block text-center focus:outline-none cursor-pointer"
                      title={`Voir ${title}`}
                    >
                      {cardContent}
                    </Link>
                  ) : (
                    <div
                      className="group block text-center cursor-default select-none"
                      aria-disabled="true"
                    >
                      {cardContent}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Deux petites flèches simples en bas (Desktop uniquement si > 3 items) */}
          {displayList.length > 3 && (
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
