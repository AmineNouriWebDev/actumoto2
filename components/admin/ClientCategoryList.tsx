"use client";

import { useTransition } from "react";
import Link from "next/link";
import SortableGrid from "./SortableGrid";
import ConfirmForm from "./ConfirmForm";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Category, Model } from "@prisma/client";
import { updateCategoryOrder, toggleCategoryVisibility, deleteCategory } from "@/lib/admin-actions/categories";

type CategoryWithRelations = Category & { models?: Model[] };

export default function ClientCategoryList({ initialCategories }: { initialCategories: CategoryWithRelations[] }) {
  const [isPending, startTransition] = useTransition();

  const handleReorder = (newItems: Category[]) => {
    startTransition(async () => {
      const updates = newItems.map((item, index) => ({ id: item.id, orderIndex: index }));
      await updateCategoryOrder(updates);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <SortableGrid
        items={initialCategories}
        onReorder={handleReorder}
        strategy={verticalListSortingStrategy}
        renderItem={(category) => {
          const logoSrc = category.logo.startsWith("./") ? category.logo.substring(1) : category.logo;
          return (
            <div
              className={`admin-card ${!category.isVisible ? "is-hidden" : ""}`}
              style={{
                marginBottom: 0,
                padding: "0.75rem 1.25rem",
                paddingLeft: "3.5rem",
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                flexWrap: "wrap",
              }}
            >
              {/* Conteneur image */}
              <div
                style={{
                  width: 80,
                  height: 48,
                  background: "white",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                  padding: "0.25rem",
                }}
              >
                <img
                  src={logoSrc}
                  alt={category.name}
                  style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                />
              </div>

              {/* Nom & Badges */}
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "2rem" }}>
                <div style={{ minWidth: "150px" }}>
                  <div style={{ color: "#f9fafb", fontWeight: 600, fontSize: "1.1rem" }}>
                    {category.name}
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                  <span className="badge badge-blue">
                    {category.models?.length || 0} modèles
                  </span>
                  {!category.isVisible && <span className="badge badge-red">Caché</span>}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <Link href={`/admin/categories/${category.id}`} className="btn-edit">
                  ✏️ Modifier
                </Link>
                <form action={toggleCategoryVisibility.bind(null, category.id, category.isVisible)}>
                  <button
                    type="submit"
                    className={category.isVisible ? "btn-toggle-hide" : "btn-toggle-show"}
                    title={category.isVisible ? "Cacher" : "Afficher"}
                  >
                    {category.isVisible ? "👁️" : "👁️‍🗨️"}
                  </button>
                </form>
                <ConfirmForm
                  action={deleteCategory.bind(null, category.id)}
                  confirmMessage={`Supprimer la catégorie "${category.name}" ?`}
                >
                  <button type="submit" className="btn-danger" title="Supprimer">
                    🗑️
                  </button>
                </ConfirmForm>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}
