"use client";

import { useTransition } from "react";
import Link from "next/link";
import SortableGrid from "./SortableGrid";
import ConfirmForm from "./ConfirmForm";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Brand, Model, DealerContact } from "@prisma/client";
import { updateBrandOrder, toggleBrandVisibility, toggleBrandComingSoon, deleteBrand } from "@/lib/admin-actions/brands";

type BrandWithRelations = Brand & { models: Model[]; dealerContact: DealerContact | null };

export default function ClientBrandList({ initialBrands }: { initialBrands: BrandWithRelations[] }) {
  const [isPending, startTransition] = useTransition();

  const handleReorder = (newItems: Brand[]) => {
    startTransition(async () => {
      const updates = newItems.map((item, index) => ({ id: item.id, orderIndex: index }));
      await updateBrandOrder(updates);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <SortableGrid
        items={initialBrands}
        onReorder={handleReorder}
        strategy={verticalListSortingStrategy}
        renderItem={(brand) => (
          <div className={`admin-card ${!brand.isVisible ? "is-hidden" : ""}`} style={{ marginBottom: 0, padding: "0.75rem 1.25rem", paddingLeft: "3.5rem", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{
              width: 72, height: 48, background: "white", borderRadius: "0.5rem",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden",
            }}>
              <img
                src={brand.logo.startsWith("./") ? brand.logo.substring(1) : brand.logo}
                alt={brand.name}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
              />
            </div>
            
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "2rem" }}>
              <div style={{ minWidth: "150px" }}>
                <div style={{ color: "#f9fafb", fontWeight: 600, fontSize: "1.1rem" }}>{brand.name}</div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                <span className="badge badge-blue">{brand.models?.length || 0} modèles</span>
                {brand.comingSoon && <span className="badge badge-yellow">Coming Soon</span>}
                {!brand.isVisible && <span className="badge badge-red">Caché</span>}
                {brand.dealerContact && <span className="badge badge-green">Contact ✓</span>}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Link href={`/admin/marques/${brand.id}`} className="btn-edit">✏️ Modifier</Link>
              <form action={toggleBrandVisibility.bind(null, brand.id, brand.isVisible)}>
                <button type="submit" className={brand.isVisible ? "btn-toggle-hide" : "btn-toggle-show"} title={brand.isVisible ? "Cacher" : "Afficher"}>
                  {brand.isVisible ? "👁️" : "👁️‍🗨️"}
                </button>
              </form>
              <form action={toggleBrandComingSoon.bind(null, brand.id, brand.comingSoon)}>
                <button type="submit" className="btn-coming-soon" title="Coming Soon">
                  {brand.comingSoon ? "✅" : "🔜"}
                </button>
              </form>
              <ConfirmForm
                action={deleteBrand.bind(null, brand.id)}
                confirmMessage={`Supprimer "${brand.name}" ?`}
              >
                <button type="submit" className="btn-danger">🗑️</button>
              </ConfirmForm>
            </div>
          </div>
        )}
      />
    </div>
  );
}
