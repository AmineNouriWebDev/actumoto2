"use client";

import { useTransition, useState } from "react";
import { CarouselSlide } from "@prisma/client";
import {
  updateSlideOrder,
  toggleSlideVisibility,
  deleteSlide,
  updateCarouselDelay,
  toggleCarouselVisibility,
  toggleCarouselBottomVisibility,
  updateSlidePosition,
} from "@/lib/admin-actions/carousel";
import ConfirmForm from "./ConfirmForm";
import SortableGrid from "./SortableGrid";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";

import { toast } from "react-toastify";

interface ClientCarouselListProps {
  initialSlides: (CarouselSlide & { position?: string })[];
  initialDelayMs: number;
  initialVisible?: boolean;
  initialBottomVisible?: boolean;
}

export default function ClientCarouselList({
  initialSlides,
  initialDelayMs,
  initialVisible = true,
  initialBottomVisible = false,
}: ClientCarouselListProps) {
  const [isPending, startTransition] = useTransition();
  const [delaySec, setDelaySec] = useState(initialDelayMs / 1000);
  const [isVisibleTop, setIsVisibleTop] = useState(initialVisible);
  const [isVisibleBottom, setIsVisibleBottom] = useState(initialBottomVisible);
  const [slides, setSlides] = useState(initialSlides);
  const [filterTab, setFilterTab] = useState<"ALL" | "TOP" | "BOTTOM" | "BOTH">("ALL");

  const handleToggleTop = () => {
    const nextVal = !isVisibleTop;
    setIsVisibleTop(nextVal);
    startTransition(async () => {
      try {
        await toggleCarouselVisibility(nextVal);
        toast.success(
          nextVal
            ? "Carrousel du haut affiché sur la page d'accueil !"
            : "Carrousel du haut masqué de la page d'accueil !",
          { theme: "dark" }
        );
      } catch (err: any) {
        setIsVisibleTop(!nextVal);
        toast.error("Erreur lors de la mise à jour", { theme: "dark" });
      }
    });
  };

  const handleToggleBottom = () => {
    const nextVal = !isVisibleBottom;
    setIsVisibleBottom(nextVal);
    startTransition(async () => {
      try {
        await toggleCarouselBottomVisibility(nextVal);
        toast.success(
          nextVal
            ? "Carrousel du bas activé (remplace la bannière) !"
            : "Carrousel du bas désactivé !",
          { theme: "dark" }
        );
      } catch (err: any) {
        setIsVisibleBottom(!nextVal);
        toast.error("Erreur lors de la mise à jour", { theme: "dark" });
      }
    });
  };

  const handleChangePosition = (slideId: string, newPos: "TOP" | "BOTTOM" | "BOTH") => {
    setSlides((prev) =>
      prev.map((s) => (s.id === slideId ? { ...s, position: newPos } : s))
    );
    startTransition(async () => {
      try {
        await updateSlidePosition(slideId, newPos);
        toast.success(
          newPos === "TOP"
            ? "Slide assigné au carrousel du Haut"
            : newPos === "BOTTOM"
            ? "Slide assigné au carrousel du Bas"
            : "Slide assigné aux deux carrousels (Haut & Bas)",
          { theme: "dark" }
        );
      } catch (err) {
        toast.error("Erreur lors du changement d'emplacement", { theme: "dark" });
      }
    });
  };

  const handleReorder = (newItems: CarouselSlide[]) => {
    setSlides(newItems as any);
    startTransition(async () => {
      const updates = newItems.map((item, index) => ({ id: item.id, orderIndex: index }));
      await updateSlideOrder(updates);
    });
  };

  const handleDelayUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await updateCarouselDelay(delaySec * 1000);
      toast.success("Délai mis à jour avec succès !", { theme: "dark" });
    });
  };

  // Filtrage des slides selon l'onglet
  const filteredSlides = slides.filter((slide) => {
    const pos = (slide as any).position || "TOP";
    if (filterTab === "ALL") return true;
    if (filterTab === "TOP") return pos === "TOP" || pos === "BOTH";
    if (filterTab === "BOTTOM") return pos === "BOTTOM" || pos === "BOTH";
    if (filterTab === "BOTH") return pos === "BOTH";
    return true;
  });

  const countTop = slides.filter((s) => ((s as any).position || "TOP") === "TOP" || (s as any).position === "BOTH").length;
  const countBottom = slides.filter((s) => (s as any).position === "BOTTOM" || (s as any).position === "BOTH").length;
  const countBoth = slides.filter((s) => (s as any).position === "BOTH").length;

  return (
    <div>
      {/* Settings section */}
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <h2 className="admin-card-title">⚙️ Paramètres généraux des carrousels</h2>

        {/* Option 1: Carrousel du Haut (Hero Header) */}
        <div
          className="toggle-row"
          style={{
            padding: "0.6rem 0",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <label
            className="toggle-label"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              cursor: isPending ? "wait" : "pointer",
            }}
          >
            <div className="toggle-checkbox-wrap">
              <input
                type="checkbox"
                checked={isVisibleTop}
                onChange={handleToggleTop}
                disabled={isPending}
                className="toggle-checkbox"
              />
              <div className="toggle-slider" />
            </div>
            <div>
              <div
                className="toggle-text-title"
                style={{ color: "#ffffff", fontWeight: 700, fontSize: "0.95rem" }}
              >
                {isVisibleTop
                  ? "🟢 Carrousel en haut (Hero Header) : Activé"
                  : "🔴 Carrousel en haut (Hero Header) : Masqué"}
              </div>
              <div
                className="toggle-text-sub"
                style={{ color: "#9ca3af", fontSize: "0.8rem", marginTop: "2px" }}
              >
                {isVisibleTop
                  ? "Le slider Hero Header s'affiche en grand en haut de la page d'accueil."
                  : "Le slider du haut est masqué (le site commence directement par la section nouveautés)."}
              </div>
            </div>
          </label>
        </div>

        {/* Option 2: Carrousel du Bas (À la place de la bannière) */}
        <div
          className="toggle-row"
          style={{
            padding: "0.6rem 0",
            marginBottom: "1.25rem",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <label
            className="toggle-label"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              cursor: isPending ? "wait" : "pointer",
            }}
          >
            <div className="toggle-checkbox-wrap">
              <input
                type="checkbox"
                checked={isVisibleBottom}
                onChange={handleToggleBottom}
                disabled={isPending}
                className="toggle-checkbox"
              />
              <div className="toggle-slider" />
            </div>
            <div>
              <div
                className="toggle-text-title"
                style={{ color: "#ffffff", fontWeight: 700, fontSize: "0.95rem" }}
              >
                {isVisibleBottom
                  ? "🟢 Carrousel en bas : Activé (Remplace l'image bannière du bas)"
                  : "⚪ Carrousel en bas : Inactif (L'image bannière standard s'affiche)"}
              </div>
              <div
                className="toggle-text-sub"
                style={{ color: "#9ca3af", fontSize: "0.8rem", marginTop: "2px" }}
              >
                {isVisibleBottom
                  ? "Un carrousel défile en bas de page à la place de l'image de bannière accessoires."
                  : "L'image fixe de la bannière accessoires est affichée en bas de page."}
              </div>
            </div>
          </label>
        </div>

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

      {/* Onglets de filtrage rapide par emplacement */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => setFilterTab("ALL")}
          className={`btn-sm ${filterTab === "ALL" ? "btn-primary" : "btn-secondary"}`}
          style={{ padding: "0.35rem 0.8rem", borderRadius: "0.375rem", fontSize: "0.85rem", cursor: "pointer" }}
        >
          Tous les slides ({slides.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("TOP")}
          className={`btn-sm ${filterTab === "TOP" ? "btn-primary" : "btn-secondary"}`}
          style={{ padding: "0.35rem 0.8rem", borderRadius: "0.375rem", fontSize: "0.85rem", cursor: "pointer" }}
        >
          ⬆️ Haut ({countTop})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("BOTTOM")}
          className={`btn-sm ${filterTab === "BOTTOM" ? "btn-primary" : "btn-secondary"}`}
          style={{ padding: "0.35rem 0.8rem", borderRadius: "0.375rem", fontSize: "0.85rem", cursor: "pointer" }}
        >
          ⬇️ Bas ({countBottom})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("BOTH")}
          className={`btn-sm ${filterTab === "BOTH" ? "btn-primary" : "btn-secondary"}`}
          style={{ padding: "0.35rem 0.8rem", borderRadius: "0.375rem", fontSize: "0.85rem", cursor: "pointer" }}
        >
          ↕️ Les deux ({countBoth})
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
        <SortableGrid
          items={filteredSlides}
          onReorder={handleReorder}
          strategy={verticalListSortingStrategy}
          renderItem={(slide) => {
            const currentPos = ((slide as any).position || "TOP").toUpperCase();
            return (
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
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                    {slide.title && <div style={{ color: "#f9fafb", fontWeight: 600, fontSize: "0.95rem" }}>{slide.title}</div>}
                    
                    {/* Badge d'emplacement */}
                    <span
                      style={{
                        padding: "0.15rem 0.5rem",
                        borderRadius: "0.25rem",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        backgroundColor:
                          currentPos === "TOP"
                            ? "rgba(59, 130, 246, 0.2)"
                            : currentPos === "BOTTOM"
                            ? "rgba(168, 85, 247, 0.2)"
                            : "rgba(16, 185, 129, 0.2)",
                        color:
                          currentPos === "TOP"
                            ? "#93c5fd"
                            : currentPos === "BOTTOM"
                            ? "#d8b4fe"
                            : "#6ee7b7",
                        border: `1px solid ${
                          currentPos === "TOP"
                            ? "rgba(59, 130, 246, 0.4)"
                            : currentPos === "BOTTOM"
                            ? "rgba(168, 85, 247, 0.4)"
                            : "rgba(16, 185, 129, 0.4)"
                        }`,
                      }}
                    >
                      {currentPos === "TOP"
                        ? "⬆️ Carrousel Haut"
                        : currentPos === "BOTTOM"
                        ? "⬇️ Carrousel Bas"
                        : "↕️ Haut & Bas"}
                    </span>
                  </div>

                  {slide.link && <div style={{ color: "#93c5fd", fontSize: "0.8rem", marginBottom: "0.25rem" }}>🔗 {slide.link}</div>}
                  <div style={{ color: "#6b7280", fontSize: "0.72rem", wordBreak: "break-all" }}>{slide.imageDesktop}</div>

                  {/* Boutons de changement d'emplacement */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.5rem" }}>
                    <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Emplacement :</span>
                    <button
                      type="button"
                      onClick={() => handleChangePosition(slide.id, "TOP")}
                      disabled={isPending || currentPos === "TOP"}
                      style={{
                        padding: "0.15rem 0.45rem",
                        fontSize: "0.72rem",
                        borderRadius: "0.25rem",
                        border: "1px solid #4b5563",
                        background: currentPos === "TOP" ? "#2563eb" : "#1f2937",
                        color: "white",
                        cursor: currentPos === "TOP" ? "default" : "pointer",
                      }}
                      title="Afficher uniquement dans le carrousel du Haut"
                    >
                      ⬆️ Haut
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangePosition(slide.id, "BOTTOM")}
                      disabled={isPending || currentPos === "BOTTOM"}
                      style={{
                        padding: "0.15rem 0.45rem",
                        fontSize: "0.72rem",
                        borderRadius: "0.25rem",
                        border: "1px solid #4b5563",
                        background: currentPos === "BOTTOM" ? "#9333ea" : "#1f2937",
                        color: "white",
                        cursor: currentPos === "BOTTOM" ? "default" : "pointer",
                      }}
                      title="Afficher uniquement dans le carrousel du Bas"
                    >
                      ⬇️ Bas
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChangePosition(slide.id, "BOTH")}
                      disabled={isPending || currentPos === "BOTH"}
                      style={{
                        padding: "0.15rem 0.45rem",
                        fontSize: "0.72rem",
                        borderRadius: "0.25rem",
                        border: "1px solid #4b5563",
                        background: currentPos === "BOTH" ? "#059669" : "#1f2937",
                        color: "white",
                        cursor: currentPos === "BOTH" ? "default" : "pointer",
                      }}
                      title="Afficher dans les deux carrousels (Haut & Bas)"
                    >
                      ↕️ Les deux
                    </button>
                  </div>
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
            );
          }}
        />
      </div>
    </div>
  );
}
