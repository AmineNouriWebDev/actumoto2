"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { formatSpecification } from "@/lib/formatters";

function formatPriceDisplay(price: number | string | null | undefined, currency: string = "DT") {
  if (price === null || price === undefined) {
    return <span className="text-red-600 font-bold text-xl">Sur demande</span>;
  }
  // Convert price to string to handle both cases cleanly
  const priceStr = price.toString();
  // We can just display it directly since occasion prices might be strings like "50,000" or raw numbers
  return (
    <span className="text-red-600 font-bold text-2xl leading-none flex items-baseline">
      {priceStr}
      <span className="text-sm font-normal ml-1">{currency}</span>
    </span>
  );
}

interface OccasionCardProps {
  model: any;
  index: number;
}

export default function OccasionCard({ model, index }: OccasionCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const specsRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fix relative image paths
  const fixPath = (path: string) =>
    path ? path.replace(/^\.\//, "/") : "/img/placeholder-moto.jpg";

  const rawImages: string[] = model.images || (model.image ? [model.image] : []);
  const images = rawImages.map(fixPath);
  const hasMultipleImages = images.length > 1;
  const fuelType: string = model.fuelType || "Thermique";

  const uniqueId = `specs-occasion-${index}`;

  // Build specs list
  const specsList: { label: string; value: string }[] = [];
  if (model.specs) {
    specsList.push({ label: "Kilométrage", value: formatSpecification("kilometrage", model.specs.kilometrage, fuelType) });
    specsList.push({ label: "Type moteur", value: formatSpecification("typeMoteur", model.specs.typeMoteur, fuelType) });
    specsList.push({ label: "Cylindrée", value: formatSpecification("cylindree", model.specs.cylindree, fuelType) });
    specsList.push({ label: "Puissance", value: formatSpecification("puissance", model.specs.puissance, fuelType) });
    specsList.push({ label: "Couple Maximal", value: formatSpecification("coupleMaximal", model.specs.coupleMaximal, fuelType) });
    specsList.push({ label: "Refroidissement", value: formatSpecification("refroidissement", model.specs.refroidissement, fuelType) });
    specsList.push({ label: "Vitesse Maximale", value: formatSpecification("vitesseMaximale", model.specs.vitesseMaximale, fuelType) });
    specsList.push({ label: "Alimentation", value: formatSpecification("alimentation", model.specs.alimentation, fuelType) });

    if (fuelType === "Thermique" && model.specs.tankCapacity !== undefined) {
      specsList.push({ label: "Réservoir", value: formatSpecification("tankCapacity", model.specs.tankCapacity, fuelType) });
    }
    if (fuelType === "Electrique" && model.specs.autonomie !== undefined) {
      specsList.push({ label: "Autonomie", value: formatSpecification("autonomie", model.specs.autonomie, fuelType) });
    }

    let freinageVal = formatSpecification("freinage", model.specs.freinage || "-", fuelType);
    if (model.specs.systemeFreinage) freinageVal += ` - ${model.specs.systemeFreinage}`;
    specsList.push({ label: "Freinage", value: freinageVal });
  }

  // Toggle specs
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
      if (window.innerWidth >= 768) {
        document.querySelectorAll(".specs-container[data-open='true']").forEach((el) => {
          el.setAttribute("data-open", "false");
          const btn = document.querySelector<HTMLButtonElement>(`.specs-btn[data-target-id="${el.id}"]`);
          if (btn) btn.textContent = "Fiche technique";
        });
        document.querySelectorAll(".occasion-card").forEach((c) => c.classList.remove("card-active-z"));
      }
      specsEl.setAttribute("data-open", "true");
      cardEl.classList.add("card-active-z");
    }
  }, []);

  // Close on outside click
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

  const handleThumbnailClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setCurrentImageIndex(idx);
  };

  return (
    <div ref={cardRef} className="occasion-card" role="listitem">
      <div className="card-inner">
        <div className="image-container">
          <img
            src={images[currentImageIndex] || "/img/placeholder-moto.jpg"}
            alt={`${model.marque} ${model.name}`}
            className="main-image"
            width={400}
            height={250}
            loading="lazy"
            onError={(e) => { e.currentTarget.src = "/img/placeholder-moto.jpg"; }}
          />
        </div>

        {hasMultipleImages && (
          <div className="image-thumbnails">
            {images.slice(0, 4).map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Miniature ${i + 1}`}
                className={`thumbnail ${currentImageIndex === i ? "active" : ""}`}
                onClick={(e) => handleThumbnailClick(e, i)}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ))}
            {images.length > 4 && (
              <div className="text-xs text-gray-500 self-center">+{images.length - 4}</div>
            )}
          </div>
        )}

        <div className="card-content">
          <div className="occasion-info">
            <div className="occasion-marque">{model.marque}</div>
            <h2 className="occasion-name">{model.name}</h2>
            
            <div className="occasion-footer">
              <div className="occasion-price">{model.price}</div>
              {model.specs && (
                <button
                  className="specs-btn"
                  data-target-id={uniqueId}
                  onClick={toggleSpecs}
                >
                  Fiche technique
                </button>
              )}
            </div>

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
                        <td>{spec.value || "—"}</td>
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
