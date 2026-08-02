"use client";

import { useState } from "react";
import SortableGrid from "./SortableGrid";
import { uploadAndConvertToWebp, deletePhysicalImage } from "@/lib/upload";

export default function ModelImageUploader({
  initialImages = [],
}: {
  initialImages?: { id: string; url: string }[];
}) {
  const [images, setImages] = useState(
    initialImages.map((img) => ({ id: img.id || Math.random().toString(), url: img.url }))
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages = [...images];

    for (let i = 0; i < files.length; i++) {
      const url = await uploadAndConvertToWebp(files[i], "modeles");
      if (url) {
        newImages.push({ id: Math.random().toString(), url });
      }
    }

    setImages(newImages);
    setIsUploading(false);
    // Reset file input
    e.target.value = "";
  };

  const handleRemove = async (idToRemove: string, urlToRemove: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette image ?")) return;
    
    setImages((prev) => prev.filter((img) => img.id !== idToRemove));
    
    // Optionally delete physical file
    await deletePhysicalImage(urlToRemove);
  };

  return (
    <div>
      {/* Hidden input to pass to the existing FormData action */}
      <input type="hidden" name="imageUrls" value={images.map((i) => i.url).join("\n")} />

      <div style={{ marginBottom: "1rem" }}>
        <label className="btn-secondary" style={{ cursor: "pointer", display: "inline-block" }}>
          {isUploading ? "⏳ Traitement..." : "➕ Ajouter des images"}
          <input
            type="file"
            multiple
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "1rem" }}>
        <SortableGrid
          items={images}
          onReorder={setImages}
          renderItem={(img) => (
            <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: "0.5rem", overflow: "hidden", border: "1px solid #374151" }}>
              <img
                src={img.url.startsWith("./") ? img.url.substring(1) : img.url}
                alt="preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={() => handleRemove(img.id, img.url)}
                style={{
                  position: "absolute",
                  top: "0.25rem",
                  right: "0.25rem",
                  background: "rgba(220,38,38,0.9)",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  zIndex: 30,
                }}
                title="Supprimer"
              >
                ✕
              </button>
            </div>
          )}
        />
      </div>
    </div>
  );
}
