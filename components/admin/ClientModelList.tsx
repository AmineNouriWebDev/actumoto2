"use client";

import { useTransition } from "react";
import Link from "next/link";
import SortableTableBody from "./SortableTableBody";
import ConfirmForm from "./ConfirmForm";
import { Model, Brand, Category } from "@prisma/client";
import { updateModelOrder, toggleModelVisibility, deleteModel } from "@/lib/admin-actions/models";

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
              {model.price 
                ? <span style={{ color: "#10b981", fontWeight: 500 }}>{model.price.toLocaleString("fr-FR")} {model.currency}</span>
                : <span style={{ color: "#6b7280" }}>N/D</span>
              }
            </td>
            <td>
              <span className={`status-badge ${model.isVisible ? "status-active" : "status-inactive"}`}>
                {model.isVisible ? "Visible" : "Caché"}
              </span>
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
