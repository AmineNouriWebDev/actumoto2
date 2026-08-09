"use client";

import { useState, useTransition } from "react";
import { addModelColor, deleteModelColor } from "@/lib/admin-actions/models";

interface Color {
  id: string;
  name: string;
  hex: string;
  orderIndex: number;
}

interface ModelColorsManagerProps {
  modelId: string;
  initialColors: Color[];
}

export default function ModelColorsManager({ modelId, initialColors }: ModelColorsManagerProps) {
  const [colors, setColors] = useState<Color[]>(initialColors);
  const [newName, setNewName] = useState("");
  const [newHex, setNewHex] = useState("#ff0000");
  const [isPending, startTransition] = useTransition();

  const handleAdd = () => {
    if (!newName.trim()) return;
    startTransition(async () => {
      await addModelColor(modelId, newName.trim(), newHex);
      // Optimistic update
      setColors((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          name: newName.trim(),
          hex: newHex,
          orderIndex: prev.length,
        },
      ]);
      setNewName("");
      setNewHex("#ff0000");
    });
  };

  const handleDelete = (colorId: string) => {
    startTransition(async () => {
      await deleteModelColor(colorId, modelId);
      setColors((prev) => prev.filter((c) => c.id !== colorId));
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {/* Liste des couleurs existantes */}
      {colors.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
          {colors.map((color) => (
            <div
              key={color.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "0.4rem 0.75rem",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: color.hex,
                  border: "2px solid #e5e7eb",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
                {color.name}
              </span>
              <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>{color.hex}</span>
              <button
                type="button"
                onClick={() => handleDelete(color.id)}
                disabled={isPending}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  cursor: "pointer",
                  fontSize: "1rem",
                  padding: "0",
                  lineHeight: 1,
                }}
                title="Supprimer cette couleur"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: "#9ca3af", fontSize: "0.85rem", fontStyle: "italic" }}>
          Aucune couleur ajoutée.
        </p>
      )}

      {/* Formulaire ajout couleur */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-end", flexWrap: "wrap" }}>
        <div className="form-group" style={{ margin: 0, flex: "1 1 180px" }}>
          <label style={{ fontSize: "0.82rem" }}>Nom de la couleur</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="ex: Rouge Racing"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
          />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label style={{ fontSize: "0.82rem" }}>Couleur</label>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="color"
              value={newHex}
              onChange={(e) => setNewHex(e.target.value)}
              style={{ width: "48px", height: "40px", padding: "2px", borderRadius: "6px", border: "1px solid #d1d5db", cursor: "pointer" }}
            />
            <input
              type="text"
              value={newHex}
              onChange={(e) => setNewHex(e.target.value)}
              style={{ width: "100px" }}
              placeholder="#ff0000"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={isPending || !newName.trim()}
          className="btn-primary"
          style={{ marginBottom: "0", height: "40px", padding: "0 1.25rem", fontSize: "0.85rem" }}
        >
          + Ajouter
        </button>
      </div>
    </div>
  );
}
