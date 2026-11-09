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

              // Card Inner Content : TOUT (moto, badge, nom et prix) est intégré à l'intérieur de la plaque métallique
              const cardContent = (
                <div className="nouveaute-plaque-container relative w-full aspect-square flex flex-col justify-between overflow-hidden">
                  {/* Plaque métallique en fond */}
                  <img
                    src="/img/background-nouveaute.webp"
                    alt=""
                    className="nouveaute-plaque-bg absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                    aria-hidden="true"
                    loading="lazy"
                  />

                  {/* Badge NOUVEAU en haut à gauche */}
                  <div
                    className="nouveau-badge"
                    aria-label="Nouveau modèle"
                  >
                    <Sparkles className="nouveau-badge-icon" aria-hidden="true" />
                    <span>NOUVEAU</span>
                  </div>

                  {/* Zone moto : occupe un maximum d'espace au centre/haut de la plaque */}
                  <div className="relative z-[2] w-full flex-1 flex items-center justify-center pt-[10%] px-[5%] pb-[1%] min-h-0">
                    <img
                      src={mainImage}
                      alt={subtitle ? `${subtitle} ${title}` : title}
                      className={`w-full h-full max-h-[92%] object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.55)] ${
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
                  </div>

                  {/* Nom & Prix à l'intérieur de la plaque en bas */}
                  <div className="relative z-[3] w-full px-5 sm:px-6 pb-[6%] pt-1 text-center select-none">
                    {/* Marque ou Sous-titre si présent et différent du titre */}
                    {subtitle && subtitle !== title && (
                      <p className="nouveaute-subtitle text-[0.65rem] sm:text-xs font-bold uppercase tracking-widest leading-tight truncate">
                        {subtitle}
                      </p>
                    )}

                    {/* Titre du modèle */}
                    <h3
                      className={`nouveaute-title futurist-font text-sm sm:text-base md:text-lg font-black uppercase tracking-wider leading-tight truncate ${
                        isClickable
                          ? "transition-colors duration-200"
                          : ""
                      }`}
                    >
                      {title}
                    </h3>

                    {/* Prix ou En arrivage sans "À partir de" */}
                    <div className="mt-0.5">
                      {hasPrice && effectivePrice ? (
                        <p className="nouveaute-price text-sm sm:text-base md:text-lg font-black tracking-wide leading-tight">
                          {effectivePrice.toLocaleString("fr-FR")}{" "}
                          {item.currency || "DT"}
                        </p>
                      ) : (
                        <p className="nouveaute-price text-xs sm:text-sm md:text-base font-black uppercase tracking-wide leading-tight">
                          En arrivage
                        </p>
                      )}
                    </div>
                  </div>
                </div>
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
