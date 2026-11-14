"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  id?: string;
  imageDesktop: string;
  imageMobile?: string | null;
  title?: string | null;
  link?: string | null;
  altText?: string | null;
}

interface BrandBannerSectionProps {
  banners: Banner[];
  position?: "top" | "bottom";
  brandName?: string;
  slideInterval?: number;
}

function cleanImgSrc(src?: string | null): string {
  if (!src) return "";
  return src.startsWith("./") ? src.substring(1) : src;
}

export default function BrandBannerSection({
  banners,
  position = "top",
  brandName = "",
  slideInterval = 4500,
}: BrandBannerSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);

  const nextSlide = useCallback(() => {
    if (banners.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prevSlide = useCallback(() => {
    if (banners.length <= 1) return;
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    if (index === currentSlide || banners.length <= 1) return;
    setCurrentSlide(index);
  };

  // Auto-play timer if more than 1 banner
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, slideInterval);

    return () => clearInterval(interval);
  }, [banners.length, isPaused, slideInterval, nextSlide]);

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  if (!banners || banners.length === 0) return null;

  // CAS 1 : UNE SEULE BANNIÈRE ACTIVE -> BANNIÈRE STATIQUE PLEINE LARGEUR
  if (banners.length === 1) {
    const banner = banners[0];
    const desktopSrc = cleanImgSrc(banner.imageDesktop);
    const mobileSrc = cleanImgSrc(banner.imageMobile || banner.imageDesktop);

    const content = (
      <picture className="block w-full">
        {banner.imageMobile && (
          <source media="(max-width: 767px)" srcSet={mobileSrc} />
        )}
        <img
          src={desktopSrc}
          alt={banner.altText || banner.title || `Bannière ${brandName}`}
          className="w-full h-auto max-h-[520px] object-cover block select-none"
          loading="eager"
        />
      </picture>
    );

    return (
      <section
        className={`w-full overflow-hidden ${position === "bottom" ? "mt-8" : ""}`}
        aria-label={`Bannière ${brandName}`}
        style={{ width: "100%", margin: 0, padding: 0 }}
      >
        {banner.link ? (
          <a
            href={banner.link}
            target={banner.link.startsWith("http") ? "_blank" : undefined}
            rel={banner.link.startsWith("http") ? "noopener noreferrer" : undefined}
            className="block w-full focus:outline-none"
            title={banner.title || undefined}
          >
            {content}
          </a>
        ) : (
          content
        )}
      </section>
    );
  }

  // CAS 2 : PLUS D'UNE BANNIÈRE -> CARROUSEL INTERACTIF PLEINE LARGEUR
  return (
    <section
      className={`w-full overflow-hidden relative ${position === "bottom" ? "mt-8" : ""}`}
      aria-label={`Carrousel bannières ${brandName}`}
      style={{ width: "100%", margin: 0, padding: 0 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative w-full overflow-hidden bg-black aspect-[16/9] sm:aspect-[21/9] md:aspect-[24/8] min-h-[180px] max-h-[540px]">
        {banners.map((banner, index) => {
          const isActive = index === currentSlide;
          const desktopSrc = cleanImgSrc(banner.imageDesktop);
          const mobileSrc = cleanImgSrc(banner.imageMobile || banner.imageDesktop);

          const slideContent = (
            <picture className="w-full h-full block">
              {banner.imageMobile && (
                <source media="(max-width: 767px)" srcSet={mobileSrc} />
              )}
              <img
                src={desktopSrc}
                alt={banner.altText || banner.title || `Bannière ${brandName} ${index + 1}`}
                className="w-full h-full object-cover block select-none"
                loading={index === 0 ? "eager" : "lazy"}
              />
            </picture>
          );

          return (
            <div
              key={banner.id || index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
              aria-hidden={!isActive}
            >
              {banner.link ? (
                <a
                  href={banner.link}
                  target={banner.link.startsWith("http") ? "_blank" : undefined}
                  rel={banner.link.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="block w-full h-full focus:outline-none"
                  title={banner.title || undefined}
                >
                  {slideContent}
                </a>
              ) : (
                slideContent
              )}
            </div>
          );
        })}

        {/* Flèches de navigation (Desktop et tablettes) */}
        <button
          type="button"
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200 border border-white/20 hover:border-red-600 focus:outline-none shadow-lg cursor-pointer backdrop-blur-xs"
          aria-label="Bannière précédente"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/50 hover:bg-red-600 text-white flex items-center justify-center transition-all duration-200 border border-white/20 hover:border-red-600 focus:outline-none shadow-lg cursor-pointer backdrop-blur-xs"
          aria-label="Bannière suivante"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Indicateurs (dots) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-xs border border-white/10">
          {banners.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentSlide ? "w-7 bg-red-600" : "w-2.5 bg-white/60 hover:bg-white"
              }`}
              aria-label={`Aller à la bannière ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
