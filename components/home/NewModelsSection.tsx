"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";

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
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  // Détermination si la section doit boucler / défiler :
  // Sur Desktop (>= 768px) : défile uniquement si 4 éléments ou plus (car 3 sont visibles à l'écran)
  // Sur Mobile (< 768px) : défile toujours s'il y a 2 éléments ou plus (1 seul visible à l'écran)
  const shouldLoop = isDesktop
    ? displayList.length >= 4
    : displayList.length >= 2;

  // Boucle infinie : on triple la liste uniquement si le défilement est actif
  const loopItems = shouldLoop
    ? [...displayList, ...displayList, ...displayList]
    : displayList;

  // Défilement automatique continu en boucle sans fin (pause au survol souris)
  useEffect(() => {
    if (!shouldLoop || !displayList || displayList.length <= 1) return;

    const interval = setInterval(() => {
      // Pause si l'utilisateur survole la section avec la souris
      if (isHovered) return;

      const container = scrollRef.current;
      if (!container) return;

      const cards = container.children;
      const n = displayList.length;

      // Calcul de la largeur d'un cycle complet (N cartes)
      if (cards.length >= 2 * n && cards[n] && cards[0]) {
        const singleSetWidth =
          (cards[n] as HTMLElement).offsetLeft - (cards[0] as HTMLElement).offsetLeft;

        // Dès qu'on dépasse le premier set, on recule instantanément d'exactement 1 set sans que l'utilisateur ne le voie
        if (singleSetWidth > 0 && container.scrollLeft >= singleSetWidth - 5) {
          container.scrollTo({
            left: container.scrollLeft - singleSetWidth,
            behavior: "instant" as ScrollBehavior,
          });
        }
      }

      // Largeur d'un pas d'avancement = largeur d'une carte + espacement
      const firstCard = cards[0] as HTMLElement;
      const isCurrentDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
      const gap = isCurrentDesktop ? 24 : 16;
      const step = firstCard
        ? firstCard.offsetWidth + gap
        : container.clientWidth / (isCurrentDesktop ? 3 : 1);

      container.scrollBy({ left: step, behavior: "smooth" });
    }, 3000);

    return () => clearInterval(interval);
  }, [shouldLoop, displayList, isHovered]);

  // Gestion du défilement manuel (swipe tactile / trackpad) pour maintenir la boucle infinie
  const handleScroll = () => {
    if (!shouldLoop) return;
    const container = scrollRef.current;
    if (!container || displayList.length <= 1) return;
    const cards = container.children;
    const n = displayList.length;
    if (cards.length >= 2 * n && cards[n] && cards[0]) {
      const singleSetWidth =
        (cards[n] as HTMLElement).offsetLeft - (cards[0] as HTMLElement).offsetLeft;
      if (singleSetWidth > 0) {
        if (container.scrollLeft >= 2 * singleSetWidth) {
          container.scrollTo({
            left: container.scrollLeft - singleSetWidth,
            behavior: "instant" as ScrollBehavior,
          });
        } else if (container.scrollLeft <= 0) {
          container.scrollTo({
            left: singleSetWidth,
            behavior: "instant" as ScrollBehavior,
          });
        }
      }
    }
  };

  if (!displayList || displayList.length === 0) {
    return null;
  }

  return (
    <section className="pt-2 pb-0 relative" aria-labelledby="nouveautes-title">
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
          {/* Rail de défilement : 1 modèle sur mobile, 3 sur desktop en boucle continue */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className={`flex gap-4 md:gap-6 ${shouldLoop ? "overflow-x-auto snap-x snap-mandatory" : "overflow-x-auto md:overflow-x-visible md:justify-center"} py-2 px-1`}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {loopItems.map((item, idx) => {
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

                  {/* Badge NOUVEAU en haut à gauche (fond noir, sans icône) */}
                  <div
                    className="nouveau-badge"
                    aria-label="Nouveau modèle"
                  >
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
                      style={{ color: "#000000" }}
                      className="nouveaute-title futurist-font text-sm sm:text-base md:text-lg font-black uppercase tracking-wider leading-tight truncate text-black"
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
                  key={`${item.id || "item"}-${idx}`}
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
        </div>
      </div>
    </section>
  );
}
