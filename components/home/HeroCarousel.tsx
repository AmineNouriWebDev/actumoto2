"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  id?: string;
  imageDesktop: string;
  imageMobile?: string | null;
  alt?: string | null;
  link?: string | null;
  title?: string | null;
}

function cleanImgSrc(src?: string | null): string {
  if (!src) return "";
  return src.startsWith("./") ? src.substring(1) : src;
}

function DesktopSlideCard({ slide }: { slide: Slide }) {
  // Sur desktop, on utilise explicitement l'image mobile (format carré / vertical)
  const imgSrc = cleanImgSrc(slide.imageMobile || slide.imageDesktop);

  const cardContent = (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 bg-white border border-gray-200/80 group">
      <img
        src={imgSrc}
        alt={slide.alt || slide.title || "Image carrousel"}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
    </div>
  );

  if (slide.link) {
    const isExternal = slide.link.startsWith("http");
    return (
      <a
        href={slide.link}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="block w-full h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 rounded-2xl"
        aria-label={slide.alt || slide.title || "Lien carrousel"}
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
}

export default function HeroCarousel({
  slides,
  slideInterval = 4000,
}: {
  slides: Slide[];
  slideInterval?: number;
}) {
  // ==========================================
  // 1. ÉTAT & LOGIQUE MOBILE (< 768px)
  // Inchangé : 1 slide à la fois, rotation auto, swipe tactile, indicateurs
  // ==========================================
  const [currentMobileSlide, setCurrentMobileSlide] = useState(0);
  const [isMobileTransitioning, setIsMobileTransitioning] = useState(false);
  const mobileTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef(0);

  const startMobileAutoSlide = () => {
    if (slides.length <= 1) return;
    mobileTimerRef.current = setInterval(() => {
      nextMobileSlide();
    }, slideInterval);
  };

  const resetMobileAutoSlide = () => {
    if (mobileTimerRef.current) clearInterval(mobileTimerRef.current);
    startMobileAutoSlide();
  };

  const nextMobileSlide = () => {
    if (isMobileTransitioning || slides.length <= 1) return;
    setIsMobileTransitioning(true);
    setCurrentMobileSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsMobileTransitioning(false), 500);
  };

  const prevMobileSlide = () => {
    if (isMobileTransitioning || slides.length <= 1) return;
    setIsMobileTransitioning(true);
    setCurrentMobileSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsMobileTransitioning(false), 500);
  };

  const goToMobileSlide = (index: number) => {
    if (isMobileTransitioning || index === currentMobileSlide) return;
    setIsMobileTransitioning(true);
    setCurrentMobileSlide(index);
    resetMobileAutoSlide();
    setTimeout(() => setIsMobileTransitioning(false), 500);
  };

  useEffect(() => {
    startMobileAutoSlide();
    return () => {
      if (mobileTimerRef.current) clearInterval(mobileTimerRef.current);
    };
  }, [slides.length, slideInterval]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
    if (mobileTimerRef.current) clearInterval(mobileTimerRef.current);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].screenX;
    const swipeThreshold = 50;

    if (touchStartX.current - touchEndX > swipeThreshold) {
      nextMobileSlide();
      resetMobileAutoSlide();
    } else if (touchEndX - touchStartX.current > swipeThreshold) {
      prevMobileSlide();
      resetMobileAutoSlide();
    } else {
      resetMobileAutoSlide();
    }
  };

  // ==========================================
  // 2. ÉTAT & LOGIQUE DESKTOP (>= 768px)
  // Affiche 3 images (format mobile) l'une à côté de l'autre.
  // Si <= 3 images : pas de défilement, affichage statique côte à côte.
  // Si > 3 images : défilement slide par slide (la 1ère disparaît, la 4ème apparaît).
  // ==========================================
  const isDesktopStatic = slides.length <= 3;
  const GAP_DESKTOP_PX = 20;

  // Création des clones pour défilement infini bidirectionnel si > 3 slides
  const extendedSlides = useMemo(() => {
    if (isDesktopStatic) return slides;
    return [...slides.slice(-3), ...slides, ...slides.slice(0, 3)];
  }, [slides, isDesktopStatic]);

  // Index initial sur les slides réelles (décalé de 3 en raison des clones précédents)
  const [desktopIndex, setDesktopIndex] = useState(3);
  const [enableDesktopTransition, setEnableDesktopTransition] = useState(true);
  const [isDesktopTransitioning, setIsDesktopTransitioning] = useState(false);
  const [isDesktopHovered, setIsDesktopHovered] = useState(false);

  const nextDesktopSlide = () => {
    if (isDesktopTransitioning || isDesktopStatic) return;
    setIsDesktopTransitioning(true);
    setDesktopIndex((prev) => prev + 1);
  };

  const prevDesktopSlide = () => {
    if (isDesktopTransitioning || isDesktopStatic) return;
    setIsDesktopTransitioning(true);
    setDesktopIndex((prev) => prev - 1);
  };

  const goToDesktopSlide = (targetOriginalIndex: number) => {
    if (isDesktopTransitioning || isDesktopStatic) return;
    setIsDesktopTransitioning(true);
    setDesktopIndex(3 + targetOriginalIndex);
  };

  const handleDesktopTransitionEnd = () => {
    setIsDesktopTransitioning(false);
    if (isDesktopStatic) return;

    const total = slides.length;
    // Si on a dépassé la fin (dans les 3 clones de fin)
    if (desktopIndex >= 3 + total) {
      setEnableDesktopTransition(false);
      setDesktopIndex(3);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnableDesktopTransition(true);
        });
      });
    }
    // Si on a reculé dans les 3 clones du début
    else if (desktopIndex < 3) {
      setEnableDesktopTransition(false);
      setDesktopIndex(desktopIndex + total);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnableDesktopTransition(true);
        });
      });
    }
  };

  // Auto-slide sur desktop (uniquement si > 3 slides et non survolé)
  useEffect(() => {
    if (isDesktopStatic || isDesktopHovered) return;

    const timer = setInterval(() => {
      nextDesktopSlide();
    }, slideInterval);

    return () => clearInterval(timer);
  }, [isDesktopStatic, isDesktopHovered, slideInterval, isDesktopTransitioning]);

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <section
      className="hero-section"
      aria-label="Catalogue moto Tunisie - Découvrez les derniers modèles"
    >
      {/* ======================================================== */}
      {/* VERSION MOBILE (< 768px) - CONSERVÉE À L'ÉTAT ACTUEL      */}
      {/* ======================================================== */}
      <div
        className="carousel-container md:hidden"
        onMouseEnter={() => {
          if (mobileTimerRef.current) clearInterval(mobileTimerRef.current);
        }}
        onMouseLeave={resetMobileAutoSlide}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="carousel-track">
          {slides.map((slide, index) => {
            const isActive = index === currentMobileSlide;
            const mobileImageSrc = cleanImgSrc(slide.imageMobile || slide.imageDesktop);
            const desktopImageSrc = cleanImgSrc(slide.imageDesktop);

            const slideContent = (
              <picture>
                <source media="(max-width: 767px)" srcSet={mobileImageSrc} />
                <img
                  src={desktopImageSrc}
                  alt={slide.alt || "Slide image"}
                  className="carousel-image"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </picture>
            );

            return (
              <div
                key={slide.id || index}
                className={`carousel-slide ${isActive ? "active" : ""}`}
                style={{
                  transitionDelay: isActive ? "0.1s" : "0s",
                  zIndex: isActive ? 1 : 0,
                }}
              >
                {slide.link ? (
                  <a
                    href={slide.link}
                    className="carousel-slide-link"
                    aria-label={slide.alt || undefined}
                  >
                    {slideContent}
                  </a>
                ) : (
                  slideContent
                )}
              </div>
            );
          })}
        </div>

        {slides.length > 1 && (
          <div className="carousel-indicators">
            {slides.map((slide, index) => (
              <button
                key={slide.id || index}
                type="button"
                className={`indicator ${index === currentMobileSlide ? "active" : ""}`}
                style={{
                  backgroundColor:
                    index === currentMobileSlide ? "red" : "rgba(255, 255, 255, 0.5)",
                }}
                onClick={() => goToMobileSlide(index)}
                aria-label={`Afficher l'image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* VERSION DESKTOP (>= 768px) - 3 IMAGES FORMAT MOBILE       */}
      {/* ======================================================== */}
      <div className="carousel-desktop hidden md:block w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {isDesktopStatic ? (
          /* CAS ACTUEL (3 slides ou moins) : Affichage côte à côte sans défilement */
          <div
            className={`grid gap-5 lg:gap-6 w-full ${
              slides.length === 1
                ? "grid-cols-1 max-w-md mx-auto"
                : slides.length === 2
                ? "grid-cols-2 max-w-3xl mx-auto"
                : "grid-cols-3"
            }`}
          >
            {slides.map((slide, idx) => (
              <div key={slide.id || idx} className="w-full">
                <DesktopSlideCard slide={slide} />
              </div>
            ))}
          </div>
        ) : (
          /* CAS AVEC + DE 3 SLIDES : Défilement fluide slide par slide */
          <div
            className="relative w-full"
            onMouseEnter={() => setIsDesktopHovered(true)}
            onMouseLeave={() => setIsDesktopHovered(false)}
          >
            {/* Conteneur masquant les slides hors champ */}
            <div className="overflow-hidden w-full py-1">
              <div
                className="flex"
                style={{
                  gap: `${GAP_DESKTOP_PX}px`,
                  transform: `translateX(calc(-1 * ${desktopIndex} * ((100% + ${GAP_DESKTOP_PX}px) / 3)))`,
                  transition: enableDesktopTransition
                    ? "transform 500ms cubic-bezier(0.25, 1, 0.5, 1)"
                    : "none",
                }}
                onTransitionEnd={handleDesktopTransitionEnd}
              >
                {extendedSlides.map((slide, idx) => (
                  <div
                    key={`${slide.id || "slide"}-${idx}`}
                    style={{
                      flex: `0 0 calc((100% - 2 * ${GAP_DESKTOP_PX}px) / 3)`,
                      width: `calc((100% - 2 * ${GAP_DESKTOP_PX}px) / 3)`,
                    }}
                  >
                    <DesktopSlideCard slide={slide} />
                  </div>
                ))}
              </div>
            </div>

            {/* Bouton Précédent */}
            <button
              type="button"
              onClick={prevDesktopSlide}
              className="absolute -left-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-gray-800 hover:text-red-600 shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 border border-gray-200/80 backdrop-blur-sm z-20 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              aria-label="Image précédente"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Bouton Suivant */}
            <button
              type="button"
              onClick={nextDesktopSlide}
              className="absolute -right-5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-gray-800 hover:text-red-600 shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 border border-gray-200/80 backdrop-blur-sm z-20 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              aria-label="Image suivante"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicateurs (dots) */}
            <div className="flex justify-center items-center gap-2 mt-4">
              {slides.map((_, dotIdx) => {
                const activeIdx =
                  (((desktopIndex - 3) % slides.length) + slides.length) % slides.length;
                const isActive = activeIdx === dotIdx;
                return (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => goToDesktopSlide(dotIdx)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      isActive
                        ? "w-8 h-2.5 bg-red-600 shadow-sm"
                        : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Aller au groupe ${dotIdx + 1}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
