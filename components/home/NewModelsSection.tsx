"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import ModelCard from "@/components/modeles/ModelCard";

interface NewModelsSectionProps {
  models: any[];
}

export default function NewModelsSection({ models }: NewModelsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const currentRef = scrollRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", checkScroll, { passive: true });
    }
    window.addEventListener("resize", checkScroll);
    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", checkScroll);
      }
      window.removeEventListener("resize", checkScroll);
    };
  }, [models]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = 350; // Défilement d'environ une carte sur Desktop
    const offset = direction === "left" ? -cardWidth : cardWidth;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  if (!models || models.length === 0) {
    return null;
  }

  return (
    <section className="py-8 relative" aria-labelledby="nouveautes-title">
      <div className="container mx-auto px-4">
        {/* Titre de section stylisé identique à Toutes les marques */}
        <div className="text-center mb-6">
          <h2 id="nouveautes-title" className="futurist-font text-xl md:text-2xl text-gray-900 mb-2">
            DERNIÈRES <span className="text-red-600">NOUVEAUTÉS</span> MOTO
          </h2>
          <div className="social-separator">
            <div className="separator-line"></div>
            <div className="red-square"></div>
            <div className="separator-line"></div>
          </div>
        </div>

        {/* Zone Carrousel / Glissement */}
        <div className="relative group/carousel">
          {/* Petite flèche Desktop Gauche */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll("left")}
              className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-gray-800 hover:text-red-600 shadow-xl border border-gray-200/80 items-center justify-center transition-all duration-200 z-30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Modèles précédents"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Rail de défilement : glissement au doigt sur mobile (snap) & scroll doux */}
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 px-1"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {models.map((model, idx) => (
              <div
                key={model.id || idx}
                className="flex-shrink-0 w-[280px] sm:w-[310px] md:w-[340px] snap-start relative"
              >
                {/* Badge visuel Nouveau en haut de la carte */}
                <div className="absolute top-2 left-2 z-20 pointer-events-none">
                  <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-md shadow-md tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    Nouveau
                  </span>
                </div>
                <ModelCard
                  model={model}
                  brand={model.brand?.name || model.brand}
                  index={idx}
                />
              </div>
            ))}
          </div>

          {/* Petite flèche Desktop Droite */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll("right")}
              className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-gray-800 hover:text-red-600 shadow-xl border border-gray-200/80 items-center justify-center transition-all duration-200 z-30 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Modèles suivants"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
