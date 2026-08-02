"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { formatSpecification } from "@/lib/formatters";

// Réplique exacte de formatPriceHtml() de data.js
function formatPriceDisplay(price: number | null | undefined, currency: string = "DT") {
  if (price === null || price === undefined) {
    return <span className="text-red-600 font-bold text-xl">En arrivage</span>;
  }
  // fr-FR → "34 100", on remplace l'espace par virgule → "34,100"
  const formatted = price.toLocaleString("fr-FR").replace(/\s/g, ",");
  return (
    <span className="text-red-600 font-bold text-2xl leading-none flex items-baseline">
      {formatted}
      <span className="text-sm font-normal ml-1">{currency}</span>
    </span>
  );
}


interface ModelCardProps {
  model: any;
  brand: string;
  index: number;
}

export default function ModelCard({ model, brand, index }: ModelCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [thumbnailGroupIndex, setThumbnailGroupIndex] = useState(0);
  const [isCompared, setIsCompared] = useState(false);

  // Check initial compare state
  useEffect(() => {
    const KEY = "comparateur_selection";
    const list: {brand: string; name: string}[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    const exists = list.some((item) => item.brand === brand && item.name === model.name);
    setIsCompared(exists);
    
    // Listen for storage events (if changed in other tabs)
    const handleStorage = () => {
      const newList: {brand: string; name: string}[] = JSON.parse(localStorage.getItem(KEY) || "[]");
      setIsCompared(newList.some((item) => item.brand === brand && item.name === model.name));
    };
    window.addEventListener("storage", handleStorage);
    // Custom event for same-window updates
    window.addEventListener("comparateur_updated", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("comparateur_updated", handleStorage);
    };
  }, [brand, model.name]);

  // Fix relative image paths
  const fixPath = (path: string) =>
    path ? path.replace(/^\.\//, "/") : "/img/placeholder-moto.jpg";

  const rawImages: string[] = model.images || (model.image ? [model.image] : []);
  const images = rawImages.map(fixPath);
  const hasMultipleImages = images.length > 1;
  const fuelType: string = model.fuelType || "Thermique";
  const isElectric = fuelType === "Electrique";

  const uniqueId = `specs-${brand.replace(/\s+/g, "-")}-${index}`;

  // Build specs list exactly like modeles.html
  const specsList: { label: string; value: string }[] = [];
  if (model.specs) {
    specsList.push({ label: "Catégorie", value: model.category || "Moto" });
    specsList.push({ label: "Type moteur", value: formatSpecification("typeMoteur", model.specs.typeMoteur, fuelType) });
    specsList.push({ label: "Cylindrée", value: formatSpecification("cylindree", model.specs.cylindree, fuelType) });
    specsList.push({ label: "Puissance", value: formatSpecification("puissance", model.specs.puissance, fuelType) });
    specsList.push({ label: "Couple Maximal", value: formatSpecification("coupleMaximal", model.specs.coupleMaximal, fuelType) });
    specsList.push({ label: "Refroidissement", value: formatSpecification("refroidissement", model.specs.refroidissement, fuelType) });
    specsList.push({ label: "Vitesse Maximale", value: formatSpecification("vitesseMaximale", model.specs.vitesseMaximale, fuelType) });

    if (fuelType === "Thermique" && model.specs.tankCapacity !== undefined) {
      specsList.push({ label: "Réservoir", value: formatSpecification("tankCapacity", model.specs.tankCapacity, fuelType) });
    }
    if (fuelType === "Electrique" && model.specs.autonomie !== undefined) {
      specsList.push({ label: "Autonomie", value: formatSpecification("autonomie", model.specs.autonomie, fuelType) });
    }

    specsList.push({ label: "Alimentation", value: formatSpecification("alimentation", model.specs.alimentation, fuelType) });

    let freinageVal = formatSpecification("freinage", model.specs.freinage || "-", fuelType);
    if (model.specs.systemeFreinage) freinageVal += ` - ${model.specs.systemeFreinage}`;
    specsList.push({ label: "Freinage", value: freinageVal });
  }

  // Toggle specs — replicates the original JS: data-open attribute + card-active-z class
  const toggleSpecs = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const specsEl = specsRef.current;
    const cardEl = cardRef.current;
    if (!specsEl || !cardEl) return;

    const isOpen = specsEl.getAttribute("data-open") === "true";

    if (isOpen) {
      specsEl.setAttribute("data-open", "false");
      cardEl.classList.remove("card-active-z");
    } else {
      // Close all others first (desktop behavior)
      if (window.innerWidth >= 768) {
        document.querySelectorAll(".specs-container[data-open='true']").forEach((el) => {
          el.setAttribute("data-open", "false");
          const btn = document.querySelector<HTMLButtonElement>(`.specs-btn[data-target-id="${el.id}"]`);
          if (btn) btn.textContent = "Fiche technique";
        });
        document.querySelectorAll(".model-card").forEach((c) => c.classList.remove("card-active-z"));
      }
      specsEl.setAttribute("data-open", "true");
      cardEl.classList.add("card-active-z");
    }
  }, []);

  // Close on outside click (desktop only) — same as original
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const target = e.target as Node;
      const specsEl = specsRef.current;
      const cardEl = cardRef.current;
      if (!specsEl || !cardEl) return;
      if (
        specsEl.getAttribute("data-open") === "true" &&
        !specsEl.contains(target) &&
        !cardEl.querySelector(".specs-btn")?.contains(target)
      ) {
        specsEl.setAttribute("data-open", "false");
        cardEl.classList.remove("card-active-z");
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Thumbnail click — updates main image
  const handleThumbnailClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setCurrentImageIndex(idx);
  };

  // Thumbnail group navigation (cycle)
  const handleNextGroup = (e: React.MouseEvent) => {
    e.stopPropagation();
    const totalGroups = Math.ceil(images.length / 4);
    setThumbnailGroupIndex((prev) => (prev + 1) % totalGroups);
  };

  const THUMB_PER_GROUP = 4;
  const totalGroups = Math.ceil(images.length / THUMB_PER_GROUP);

  return (
    <div ref={cardRef} className="model-card" role="listitem" data-model-index={index}>
      <div className="card-inner">
        {/* Main image */}
        <div className="image-container">
          <img
            src={images[currentImageIndex] || "/img/placeholder-moto.jpg"}
            alt={`${model.name} - ${brand}`}
            className="main-image"
            width={400}
            height={300}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = "/img/placeholder-moto.jpg"; }}
          />
        </div>

        {/* Thumbnails */}
        {hasMultipleImages && (
          <div className="image-thumbnails">
            {Array.from({ length: totalGroups }).map((_, groupIdx) => (
              <div
                key={groupIdx}
                className="thumbnail-group"
                style={{ display: thumbnailGroupIndex === groupIdx ? "flex" : "none" }}
              >
                {images
                  .slice(groupIdx * THUMB_PER_GROUP, groupIdx * THUMB_PER_GROUP + THUMB_PER_GROUP)
                  .map((img, i) => {
                    const absIdx = groupIdx * THUMB_PER_GROUP + i;
                    return (
                      <img
                        key={absIdx}
                        src={img}
                        alt={`Miniature ${absIdx + 1}`}
                        className={`thumbnail ${currentImageIndex === absIdx ? "active" : ""}`}
                        onClick={(e) => handleThumbnailClick(e, absIdx)}
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    );
                  })}
              </div>
            ))}
            {totalGroups > 1 && (
              <div className="thumbnail-nav">
                <button
                  className="thumbnail-nav-btn next-btn"
                  onClick={handleNextGroup}
                  title="Voir plus d'images"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        )}

        {/* Card content */}
        <div className="card-content">
          <div className="flex justify-between items-end gap-3 mb-3">
            <div className="flex flex-col items-start">
              <h2 className="futurist-font text-xl leading-none mt-0.5">{model.name}</h2>
              {isElectric && (
                <div className="electric-badge mt-1.5">
                  <span>⚡</span> ÉLECTRIQUE
                </div>
              )}
            </div>
            <div className="flex flex-col items-end text-right">
              {formatPriceDisplay(model.price, model.currency || "DT")}
            </div>
          </div>

          <div className="card-footer">
            <div className="flex items-stretch gap-4 w-full">
              {/* Compare button — using React state */}
              <button
                className={`compare-btn flex-1 py-1.5 px-0 rounded-md border-2 transition-all flex items-center justify-center shadow-sm gap-1 font-bold text-sm leading-none ${
                  isCompared
                    ? "bg-gray-800 border-gray-800 text-white"
                    : "bg-transparent border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
                }`}
                title="Ajouter au comparateur"
                data-brand={brand}
                data-model-index={index}
                onClick={(e) => {
                  e.stopPropagation();
                  const KEY = "comparateur_selection";
                  const list: {brand: string; name: string; price: number | null; image: string}[] =
                    JSON.parse(localStorage.getItem(KEY) || "[]");
                  const existsIdx = list.findIndex((item) => item.brand === brand && item.name === model.name);
                  const mainImage = images[0] || "";

                  if (existsIdx >= 0) {
                    list.splice(existsIdx, 1);
                    setIsCompared(false);
                  } else {
                    if (list.length >= 3) {
                      alert("Vous pouvez comparer jusqu'à 3 motos.");
                      return;
                    }
                    list.push({ brand, name: model.name, price: model.price, image: mainImage });
                    setIsCompared(true);
                  }
                  localStorage.setItem(KEY, JSON.stringify(list));
                  window.dispatchEvent(new Event("comparateur_updated"));
                }}
              >
                <span className="compare-text">{isCompared ? "✓ Ajouté" : "Comparer"}</span>
              </button>

              {/* Specs button */}
              {model.specs && (
                <button
                  className="specs-btn flex-1 flex items-center justify-center text-center m-0 leading-none"
                  style={{ padding: "0.35rem 0" }}
                  data-target-id={uniqueId}
                  data-card-index={index}
                  onClick={toggleSpecs}
                >
                  Fiche technique
                </button>
              )}
            </div>

            {/* Specs container — data-open controls visibility via CSS (same as original) */}
            {model.specs && (
              <div
                ref={specsRef}
                className="specs-container"
                id={uniqueId}
                data-open="false"
              >
                <table className="specs-table">
                  <thead>
                    <tr>
                      <th>Caractéristique</th>
                      <th>Détail</th>
                    </tr>
                  </thead>
                  <tbody>
                    {specsList.map((spec, i) => (
                      <tr key={i}>
                        <td>{spec.label}</td>
                        <td>{spec.value || "–"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div
                  className="close-specs"
                  data-target-id={uniqueId}
                  onClick={toggleSpecs}
                >
                  ✕ Fermer la fiche
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
