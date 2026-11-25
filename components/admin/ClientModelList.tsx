"use client";

import { useTransition } from "react";
import Link from "next/link";
import SortableGrid from "./SortableGrid";
import ConfirmForm from "./ConfirmForm";
import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Model, Brand, Category, Image } from "@prisma/client";
import {
  updateModelOrder,
  toggleModelVisibility,
  toggleModelIsNew,
  deleteModel,
} from "@/lib/admin-actions/models";

type ModelWithRelations = Model & {
  brand: Brand;
  category: Category | null;
  images?: Image[];
};

export default function ClientModelList({
  initialModels,
}: {
  initialModels: ModelWithRelations[];
}) {
  const [isPending, startTransition] = useTransition();

  const handleReorder = (newItems: ModelWithRelations[]) => {
    startTransition(async () => {
      const updates = newItems.map((item, index) => ({
        id: item.id,
        orderIndex: index,
      }));
      await updateModelOrder(updates);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <SortableGrid
        items={initialModels}
        onReorder={handleReorder}
        strategy={verticalListSortingStrategy}
        renderItem={(model) => {
          const mainImage =
            model.images && model.images.length > 0 ? model.images[0].url : null;
          return (
            <div
              className={`admin-card ${!model.isVisible ? "is-hidden" : ""}`}
              style={{
                marginBottom: 0,
                padding: "0.75rem 1.25rem",
                paddingLeft: "3.5rem",
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
                flexWrap: "wrap",
              }}
            >
              {/* Miniature de la moto */}
              <div
                style={{
                  width: 72,
                  height: 48,
                  background: "#111827",
                  borderRadius: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                  border: "1px solid #374151",
                }}
              >
                {mainImage ? (
                  <img
                    src={
                      mainImage.startsWith("./")
                        ? mainImage.substring(1)
                        : mainImage
                    }
                    alt={model.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "1.5rem" }}>🏍️</span>
                )}
              </div>

              {/* Informations : Nom, Marque, Catégorie */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  flexWrap: "wrap",
                  minWidth: 180,
                }}
              >
                <div style={{ minWidth: "140px" }}>
                  <div
                    style={{
                      color: "#f9fafb",
                      fontWeight: 600,
                      fontSize: "1.05rem",
                    }}
                  >
                    {model.name}
                  </div>
                  <div
                    style={{
                      color: "#9ca3af",
                      fontSize: "0.85rem",
                      marginTop: "0.15rem",
                    }}
                  >
                    {model.brand.name}{" "}
                    {model.category ? `• ${model.category.name}` : ""}
                  </div>
                </div>

                {/* Badges : Prix / Promo, Statut, Nouveauté */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.4rem",
                    alignItems: "center",
                  }}
                >
                  {model.promoPrice ? (
                    <div
                      style={{
                        display: "flex",
                        gap: "0.4rem",
                        alignItems: "center",
                      }}
                    >
                      <span
                        className="badge badge-gray"
                        style={{ textDecoration: "line-through" }}
                      >
                        {model.price?.toLocaleString("fr-FR")} {model.currency}
                      </span>
                      <span
                        className="badge badge-red"
                        style={{ fontWeight: 700 }}
                      >
                        {model.promoPrice.toLocaleString("fr-FR")}{" "}
                        {model.currency}
                      </span>
                    </div>
                  ) : model.price ? (
                    <span
                      className="badge badge-green"
                      style={{ fontWeight: 700 }}
                    >
                      {model.price.toLocaleString("fr-FR")} {model.currency}
                    </span>
                  ) : (
                    <span className="badge badge-gray">N/D</span>
                  )}

                  <span
                    className={`status-badge ${
                      model.isVisible ? "status-active" : "status-inactive"
                    }`}
                  >
                    {model.isVisible ? "Visible" : "Caché"}
                  </span>

                  <form
                    action={toggleModelIsNew.bind(
                      null,
                      model.id,
                      Boolean(model.isNew)
                    )}
                  >
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
                      title={
                        model.isNew
                          ? "Retirer des nouveautés"
                          : "Marquer comme nouveauté"
                      }
                    >
                      <span>{model.isNew ? "⭐" : "☆"}</span>
                      <span>{model.isNew ? "Nouveau" : "Non"}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Boutons d'action : à droite sur desktop, descendent en bas sur mobile */}
              <div
                className="admin-item-actions"
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <Link
                  href={`/admin/modeles/${model.id}`}
                  className="btn-edit"
                >
                  ✏️ Modifier
                </Link>
                <form
                  action={toggleModelVisibility.bind(
                    null,
                    model.id,
                    model.isVisible
                  )}
                >
                  <button
                    type="submit"
                    className={
                      model.isVisible ? "btn-toggle-hide" : "btn-toggle-show"
                    }
                    title={model.isVisible ? "Cacher" : "Afficher"}
                  >
                    {model.isVisible ? "👁️" : "👁️‍🗨️"}
                  </button>
                </form>
                <ConfirmForm
                  action={deleteModel.bind(null, model.id)}
                  confirmMessage={`Supprimer le modèle "${model.name}" ?`}
                >
                  <button type="submit" className="btn-danger">
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
