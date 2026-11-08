"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

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

export default function HeroCarousel({
  slides,
  slideInterval = 4500,
}: {
  slides: Slide[];
  slideInterval?: number;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef(0);
  const containerRef = useRef<HTMLElement | null>(null);

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    if (index === currentSlide || slides.length <= 1) return;
    setCurrentSlide(index);
  };

  // Auto-play timer
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, slideInterval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, slideInterval, isPaused, nextSlide]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].screenX;
    const swipeThreshold = 45;

    if (touchStartX.current - touchEndX > swipeThreshold) {
      nextSlide();
    } else if (touchEndX - touchStartX.current > swipeThreshold) {
      prevSlide();
    }
    setIsPaused(false);
  };

  // Smooth scroll down to next section
  const handleScrollDown = () => {
    if (containerRef.current) {
      const targetY = containerRef.current.offsetTop + containerRef.current.offsetHeight;
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <section
      ref={containerRef}
      className="hero-section"
      aria-label="Catalogue moto Tunisie - Nouveautés et modèles"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="carousel-container">
        <div className="carousel-track">
          {slides.map((slide, index) => {
            const isActive = index === currentSlide;
            const mobileImageSrc = cleanImgSrc(slide.imageMobile || slide.imageDesktop);
            const desktopImageSrc = cleanImgSrc(slide.imageDesktop || slide.imageMobile);

            const slideContent = (
              <picture className="w-full h-full block">
                {slide.imageMobile && (
                  <source
                    media="(max-width: 767px)"
                    srcSet={mobileImageSrc}
                  />
                )}
                <img
                  src={desktopImageSrc}
                  alt={slide.alt || slide.title || "Image catalogue Actumoto"}
                  className="carousel-image select-none"
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding={index === 0 ? "sync" : "async"}
                />
              </picture>
            );

            return (
              <div
                key={slide.id || index}
                className={`carousel-slide ${isActive ? "active" : ""}`}
                aria-hidden={!isActive}
              >
                {slide.link ? (
                  <a
                    href={slide.link}
                    className="carousel-slide-link"
                    target={slide.link.startsWith("http") ? "_blank" : undefined}
                    rel={slide.link.startsWith("http") ? "noopener noreferrer" : undefined}
                    aria-label={slide.alt || slide.title || undefined}
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

        {/* Flèches de navigation (Desktop et tablettes uniquement, masquées sur mobile pour privilégier le swipe tactile) */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              className="carousel-nav-btn prev-btn hidden md:flex"
              aria-label="Slide précédente"
            >
              <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
            </button>
            <button
              type="button"
              onClick={nextSlide}
              className="carousel-nav-btn next-btn hidden md:flex"
              aria-label="Slide suivante"
            >
              <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
            </button>
          </>
        )}

        {/* Indicateurs / Puces en bas */}
        {slides.length > 1 && (
          <div className="carousel-indicators" role="tablist">
            {slides.map((slide, index) => {
              const isActive = index === currentSlide;
              return (
                <button
                  key={slide.id || index}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`indicator-pill ${isActive ? "active" : ""}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Afficher la diapositive ${index + 1}`}
                />
              );
            })}
          </div>
        )}

        {/* Bouton indicateur pour défiler vers le bas */}
        <button
          type="button"
          onClick={handleScrollDown}
          className="hero-scroll-down-btn"
          aria-label="Défiler vers les nouveautés"
        >
          <span className="scroll-text">Découvrir</span>
          <ChevronDown className="scroll-icon" />
        </button>
      </div>
    </section>
  );
}
