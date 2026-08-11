"use client";

import { useTransition } from "react";
import Link from "next/link";
import SortableGrid from "@/components/admin/SortableGrid";
import ConfirmForm from "@/components/admin/ConfirmForm";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Occasion, OccasionImage } from "@prisma/client";
import { updateOccasionOrder, toggleOccasionVisibility, deleteOccasion } from "@/lib/admin-actions/occasions";

type OccasionWithImages = Occasion & { images: OccasionImage[] };

export default function ClientOccasionList({ initialOccasions }: { initialOccasions: OccasionWithImages[] }) {
  const [isPending, startTransition] = useTransition();

  const handleReorder = (newItems: Occasion[]) => {
    startTransition(async () => {
      const updates = newItems.map((item, index) => ({ id: item.id, orderIndex: index }));
      await updateOccasionOrder(updates);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <SortableGrid
        items={initialOccasions}
        onReorder={handleReorder}
        strategy={verticalListSortingStrategy}
        renderItem={(occ) => (
          <div className={`admin-card ${!occ.isVisible ? "is-hidden" : ""}`} style={{ marginBottom: 0, padding: "0.75rem 1.25rem", paddingLeft: "3.5rem", display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{
              width: 72, height: 48, background: "#f3f4f6", borderRadius: "0.5rem",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden",
            }}>
              {occ.images && occ.images.length > 0 ? (
                <img
                  src={occ.images[0].url.startsWith("./") ? occ.images[0].url.substring(1) : occ.images[0].url}
                  alt={occ.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <span style={{ fontSize: "1.5rem" }}>🏍️</span>
              )}
            </div>
            
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "2rem", minWidth: 200 }}>
              <div style={{ color: "#f9fafb", fontWeight: 600 }}>{occ.name}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                <span className="badge badge-gray">{occ.marque}</span>
                {occ.price && <span className="badge badge-green">{occ.price} {occ.currency}</span>}
                {!occ.isVisible && <span className="badge badge-red">Caché</span>}
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <Link href={`/admin/occasion/${occ.id}`} className="btn-edit">✏️ Modifier</Link>
              <form action={toggleOccasionVisibility.bind(null, occ.id, occ.isVisible)}>
                <button type="submit" className={occ.isVisible ? "btn-toggle-hide" : "btn-toggle-show"} title={occ.isVisible ? "Cacher" : "Afficher"}>
                  {occ.isVisible ? "👁️" : "👁️‍🗨️"}
                </button>
              </form>
              <ConfirmForm
                action={deleteOccasion.bind(null, occ.id)}
                confirmMessage={`Supprimer l'annonce d'occasion "${occ.name}" ?`}
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
