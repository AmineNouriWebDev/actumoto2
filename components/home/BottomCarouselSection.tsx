"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";

export interface BottomSlideItem {
  id: string;
  title?: string | null;
  alt?: string | null;
  imageDesktop: string;
  imageMobile?: string | null;
  link?: string | null;
  badgeText?: string | null;
}

interface BottomCarouselSectionProps {
  slides: BottomSlideItem[];
  slideInterval?: number;
}

function cleanSrc(url?: string | null) {
  if (!url) return "/img/placeholder-moto.jpg";
  return url.startsWith("./") ? url.substring(1) : url;
}

export default function BottomCarouselSection({
  slides,
  slideInterval = 3500,
}: BottomCarouselSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [screenWidth, setScreenWidth] = useState<number>(1200);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!slides || slides.length === 0) {
    return null;
  }

  const isDesktop = screenWidth >= 768;

  // Détermination si le carrousel doit défiler en boucle infinie :
  // Sur PC Desktop (>= 768px) : 3 affichés à la fois, défile si > 3 slides
  // Sur Mobile (< 768px) : 1 seul affiché à la fois, défile si > 1 slide
  const shouldLoop = isDesktop
    ? slides.length > 3
    : slides.length > 1;

  // Tripler la liste pour créer la boucle infinie sans saut visible
  const displayItems = shouldLoop
    ? [...slides, ...slides, ...slides]
    : slides;

  // Défilement continu automatique (pause au survol souris)
  useEffect(() => {
    if (!shouldLoop || slides.length <= 1) return;

    const interval = setInterval(() => {
      if (isHovered) return;

      const container = scrollRef.current;
      if (!container) return;

      const cards = container.children;
      const n = slides.length;

      // Dès qu'on dépasse le premier set de N éléments, on recule instantanément d'exactement 1 set
      if (cards.length >= 2 * n && cards[n] && cards[0]) {
        const singleSetWidth =
          (cards[n] as HTMLElement).offsetLeft - (cards[0] as HTMLElement).offsetLeft;

        if (singleSetWidth > 0 && container.scrollLeft >= singleSetWidth - 5) {
          container.scrollTo({
            left: container.scrollLeft - singleSetWidth,
            behavior: "instant" as ScrollBehavior,
          });
        }
      }

      // Avancement d'un cran = largeur d'une carte + écart (24px desktop, 16px mobile)
      const firstCard = cards[0] as HTMLElement;
      const gap = isDesktop ? 24 : 16;
      const step = firstCard
        ? firstCard.offsetWidth + gap
        : container.clientWidth / (isDesktop ? 3 : 1);

      container.scrollBy({ left: step, behavior: "smooth" });
    }, slideInterval);

    return () => clearInterval(interval);
  }, [shouldLoop, slides.length, isHovered, slideInterval, isDesktop]);

  // Gestion du swipe tactile ou défilement manuel
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container || !shouldLoop || slides.length <= 1) return;

    const cards = container.children;
    const n = slides.length;

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

  return (
    <section className="pt-2 pb-8 relative w-full overflow-hidden bg-transparent" aria-label="Carrousel inférieur">
      <div className="container mx-auto px-4">
        <div
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Rail de défilement horizontal (3 sur desktop, 1 sur mobile comme la section nouveautés) */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className={`flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory py-2 px-1 ${
              !shouldLoop && isDesktop ? "justify-center" : ""
            }`}
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {displayItems.map((slide, idx) => {
              const desktopSrc = cleanSrc(slide.imageDesktop);
              const mobileSrc = slide.imageMobile ? cleanSrc(slide.imageMobile) : desktopSrc;
              const hasBadge = Boolean(slide.badgeText && slide.badgeText.trim() !== "");
              const isClickable = Boolean(slide.link && slide.link.trim() !== "");
              const linkTarget = isClickable ? slide.link!.trim() : undefined;

              const cardContent = (
                <div className="bottom-carousel-plaque nouveaute-plaque-container relative w-full aspect-square flex flex-col justify-between overflow-hidden">
                  {/* Plaque métallique industrielle en fond */}
                  <img
                    src="/img/background-nouveaute.webp"
                    alt=""
                    className="nouveaute-plaque-bg absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                    aria-hidden="true"
                    loading="lazy"
                  />

                  {/* Zone image du slide : centrée au cœur de la plaque */}
                  <div className="relative z-[2] w-full flex-1 flex items-center justify-center pt-[10%] px-[5%] pb-[1%] min-h-0">
                    <picture className="w-full h-full flex items-center justify-center">
                      {slide.imageMobile && (
                        <source media="(max-width: 767px)" srcSet={mobileSrc} />
                      )}
                      <img
                        src={desktopSrc}
                        alt={slide.alt || slide.title || "Slide carrousel"}
                        className={`w-full h-full max-h-[92%] object-contain drop-shadow-[0_12px_22px_rgba(0,0,0,0.55)] ${
                          isClickable
                            ? "transition-transform duration-500 group-hover:scale-105"
                            : ""
                        }`}
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/img/placeholder-moto.jpg";
                        }}
                      />
                    </picture>
                  </div>

                  {/* Étiquette personnalisable (Badge noir, écriture blanche) */}
                  {hasBadge && (
                    <div className="nouveau-badge" aria-label={slide.badgeText!}>
                      <span>{slide.badgeText}</span>
                    </div>
                  )}

                  {/* Titre (si renseigné) gravé dans la plaque en bas */}
                  {slide.title ? (
                    <div className="relative z-[3] w-full px-5 sm:px-6 pb-[6%] pt-1 text-center select-none">
                      <h3
                        style={{ color: "#000000" }}
                        className="nouveaute-title futurist-font text-sm sm:text-base md:text-lg font-black uppercase tracking-wider leading-tight truncate text-black"
                      >
                        {slide.title}
                      </h3>
                    </div>
                  ) : (
                    <div className="pb-[6%]" />
                  )}
                </div>
              );

              return (
                <div
                  key={`${slide.id}-${idx}`}
                  className="w-full md:w-[calc((100%-3rem)/3)] flex-shrink-0 snap-center md:snap-start"
                >
                  {isClickable && linkTarget ? (
                    <Link
                      href={linkTarget}
                      className="group block text-center focus:outline-none cursor-pointer"
                      title={slide.title || "Voir l'élément"}
                    >
                      {cardContent}
                    </Link>
                  ) : (
                    <div className="group block text-center cursor-default select-none">
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
