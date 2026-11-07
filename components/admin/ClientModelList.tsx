"use client";

import { useTransition } from "react";
import Link from "next/link";
import SortableTableBody from "./SortableTableBody";
import ConfirmForm from "./ConfirmForm";
import { Model, Brand, Category } from "@prisma/client";
import { updateModelOrder, toggleModelVisibility, toggleModelIsNew, deleteModel } from "@/lib/admin-actions/models";

type ModelWithRelations = Model & { brand: Brand; category: Category | null };

export default function ClientModelList({ initialModels }: { initialModels: ModelWithRelations[] }) {
  const [isPending, startTransition] = useTransition();

  const handleReorder = (newItems: ModelWithRelations[]) => {
    startTransition(async () => {
      const updates = newItems.map((item, index) => ({ id: item.id, orderIndex: index }));
      await updateModelOrder(updates);
    });
  };

  return (
    <div className="admin-table-container">
      <SortableTableBody
        tableHeader={
          <thead>
            <tr>
              <th style={{ width: "40px" }}></th>
              <th>Modèle</th>
              <th>Marque</th>
              <th>Catégorie</th>
              <th>Prix</th>
              <th>Statut</th>
              <th>Nouveauté</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
        }
        items={initialModels}
        onReorder={handleReorder}
        renderItem={(model) => (
          <>
            <td style={{ fontWeight: 500, color: "white" }}>{model.name}</td>
            <td>{model.brand.name}</td>
            <td>{model.category ? model.category.name : <span style={{ color: "#6b7280" }}>-</span>}</td>
            <td>
              {model.promoPrice ? (
                <div style={{ display: "flex", flexDirection: "column", fontSize: "0.85em" }}>
                  <span style={{ textDecoration: "line-through", color: "#6b7280" }}>{model.price?.toLocaleString("fr-FR")} {model.currency}</span>
                  <span style={{ color: "#ef4444", fontWeight: 600 }}>{model.promoPrice.toLocaleString("fr-FR")} {model.currency}</span>
                </div>
              ) : model.price ? (
                <span style={{ color: "#10b981", fontWeight: 500 }}>{model.price.toLocaleString("fr-FR")} {model.currency}</span>
              ) : (
                <span style={{ color: "#6b7280" }}>N/D</span>
              )}
            </td>
            <td>
              <span className={`status-badge ${model.isVisible ? "status-active" : "status-inactive"}`}>
                {model.isVisible ? "Visible" : "Caché"}
              </span>
            </td>
            <td>
              <form action={toggleModelIsNew.bind(null, model.id, Boolean(model.isNew))}>
                <button
                  type="submit"
                  className={`status-badge cursor-pointer transition-all ${
                    model.isNew
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30"
                      : "bg-gray-800 text-gray-400 border border-gray-700 hover:text-white hover:bg-gray-700"
                  }`}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  }}
                  title={model.isNew ? "Retirer des nouveautés" : "Marquer comme nouveauté"}
                >
                  <span>{model.isNew ? "⭐" : "☆"}</span>
                  <span>{model.isNew ? "Nouveau" : "Non"}</span>
                </button>
              </form>
            </td>
            <td>
              <div className="row-actions">
                <Link href={`/admin/modeles/${model.id}`} className="btn-secondary" style={{ padding: "0.3rem 0.75rem" }}>
                  ✏️ Éditer
                </Link>
                <form action={toggleModelVisibility.bind(null, model.id, model.isVisible)}>
                  <button type="submit" className="btn-secondary" style={{ padding: "0.3rem 0.55rem" }} title={model.isVisible ? "Cacher" : "Afficher"}>
                    {model.isVisible ? "👁️" : "🙈"}
                  </button>
                </form>
                <ConfirmForm
                  action={deleteModel.bind(null, model.id)}
                  confirmMessage="Supprimer ce modèle ?"
                >
                  <button type="submit" className="btn-danger" style={{ padding: "0.3rem 0.55rem" }}>🗑️</button>
                </ConfirmForm>
              </div>
            </td>
          </>
        )}
      />
    </div>
  );
}
