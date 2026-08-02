"use client";

import { useTransition, useState } from "react";
import { CarouselSlide } from "@prisma/client";
import { updateSlideOrder, toggleSlideVisibility, deleteSlide, updateCarouselDelay } from "@/lib/admin-actions/carousel";
import ConfirmForm from "./ConfirmForm";
import SortableGrid from "./SortableGrid";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";

interface ClientCarouselListProps {
  initialSlides: CarouselSlide[];
  initialDelayMs: number;
}

export default function ClientCarouselList({ initialSlides, initialDelayMs }: ClientCarouselListProps) {
  const [isPending, startTransition] = useTransition();
  const [delaySec, setDelaySec] = useState(initialDelayMs / 1000);

  const handleReorder = (newItems: CarouselSlide[]) => {
    startTransition(async () => {
      const updates = newItems.map((item, index) => ({ id: item.id, orderIndex: index }));
      await updateSlideOrder(updates);
    });
  };

  const handleDelayUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await updateCarouselDelay(delaySec * 1000);
      alert("Délai mis à jour !");
    });
  };

  return (
    <div>
      {/* Settings section */}
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <h2 className="admin-card-title">⚙️ Paramètres du carrousel</h2>
        <form onSubmit={handleDelayUpdate} style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Temps entre chaque slide (en secondes)</label>
            <input 
              type="number" 
              min="1" 
              max="20" 
              step="0.5" 
              value={delaySec} 
              onChange={(e) => setDelaySec(parseFloat(e.target.value))} 
              style={{ width: "150px" }}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? "⏳ Sauvegarde..." : "💾 Sauvegarder"}
          </button>
        </form>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <SortableGrid
          items={initialSlides}
          onReorder={handleReorder}
          strategy={verticalListSortingStrategy}
          renderItem={(slide) => (
            <div className={`admin-card ${!slide.isVisible ? "is-hidden" : ""}`} style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", padding: "1rem", marginBottom: 0 }}>
              <div style={{ position: "relative", flexShrink: 0, marginLeft: "3rem" }}>
                <img
                  src={slide.imageDesktop.startsWith("./") ? slide.imageDesktop.substring(1) : slide.imageDesktop}
                  alt={slide.alt || "Slide"}
                  style={{ width: 140, height: 80, objectFit: "cover", borderRadius: "0.5rem", display: "block" }}
                />
                {slide.imageMobile && (
                  <div style={{ position: "absolute", bottom: 4, right: 4, background: "rgba(0,0,0,0.75)", color: "white", fontSize: "0.65rem", padding: "0.15rem 0.4rem", borderRadius: "0.25rem" }}>
                    📱 Mobile ✓
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 200 }}>
                {slide.title && <div style={{ color: "#f9fafb", fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.25rem" }}>{slide.title}</div>}
                {slide.link && <div style={{ color: "#93c5fd", fontSize: "0.8rem", marginBottom: "0.25rem" }}>🔗 {slide.link}</div>}
                <div style={{ color: "#4b5563", fontSize: "0.7rem", wordBreak: "break-all" }}>{slide.imageDesktop}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <form action={toggleSlideVisibility.bind(null, slide.id, slide.isVisible)}>
                  <button type="submit" className={slide.isVisible ? "btn-toggle-show" : "btn-toggle-hide"}>
                    {slide.isVisible ? "👁️ Visible" : "⊘ Caché"}
                  </button>
                </form>
                <ConfirmForm
                  action={deleteSlide.bind(null, slide.id)}
                  confirmMessage="Supprimer ce slide ?"
                >
                  <button type="submit" className="btn-danger">🗑️ Supprimer</button>
                </ConfirmForm>
              </div>
            </div>
          )}
        />
      </div>
    </div>
  );
}
