"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface Slide {
  id?: string;
  imageDesktop: string;
  imageMobile?: string | null;
  alt?: string | null;
  link?: string | null;
  title?: string | null;
}

export default function HeroCarousel({ slides, slideInterval = 4000 }: { slides: Slide[]; slideInterval?: number }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoSlide = () => {
    timerRef.current = setInterval(() => {
      nextSlide();
    }, slideInterval);
  };

  const resetAutoSlide = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    startAutoSlide();
  };

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    resetAutoSlide();
    setTimeout(() => setIsTransitioning(false), 500);
  };

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Touch support
  const touchStartX = useRef(0);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].screenX;
    const swipeThreshold = 50;

    if (touchStartX.current - touchEndX > swipeThreshold) {
      nextSlide();
      resetAutoSlide();
    } else if (touchEndX - touchStartX.current > swipeThreshold) {
      prevSlide();
      resetAutoSlide();
    } else {
      resetAutoSlide();
    }
  };

  return (
    <section 
      className="hero-section" 
      aria-label="Catalogue moto Tunisie - Découvrez les derniers modèles"
    >
      <div 
        className="carousel-container"
        onMouseEnter={() => { if (timerRef.current) clearInterval(timerRef.current); }}
        onMouseLeave={resetAutoSlide}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="carousel-track">
          {slides.map((slide, index) => {
            const isActive = index === currentSlide;
            const mobileImageSrc = slide.imageMobile || slide.imageDesktop;
            const desktopImageSrc = slide.imageDesktop;
            
            const slideContent = (
              <picture>
                <source media="(max-width: 767px)" srcSet={mobileImageSrc} />
                <img 
                  src={desktopImageSrc} 
                  alt={slide.alt || 'Slide image'} 
                  className="carousel-image"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </picture>
            );

            return (
              <div 
                key={slide.id}
                className={`carousel-slide ${isActive ? "active" : ""}`}
                style={{ 
                  transitionDelay: isActive ? "0.1s" : "0s",
                  zIndex: isActive ? 1 : 0
                }}
              >
                {slide.link ? (
                  <a href={slide.link} className="carousel-slide-link" aria-label={slide.alt || undefined}>
                    {slideContent}
                  </a>
                ) : (
                  slideContent
                )}
              </div>
            );
          })}
        </div>

        <div className="carousel-indicators">
          {slides.map((slide, index) => (
            <button
              key={slide.id || index}
              className={`indicator ${index === currentSlide ? "active" : ""}`}
              style={{ backgroundColor: index === currentSlide ? "red" : "rgba(255, 255, 255, 0.5)" }}
              onClick={() => goToSlide(index)}
              aria-label={`Afficher l'image ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
