"use client";

import { useState, useTransition } from "react";
import {
  createBrandBanner,
  toggleBrandBannerVisibility,
  updateBrandBannerPosition,
  deleteBrandBanner,
} from "@/lib/admin-actions/brand-banners";
import { Plus, Trash2, Eye, EyeOff, ExternalLink, Image as ImageIcon, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

interface BrandBanner {
  id: string;
  brandId: string;
  imageDesktop: string;
  imageMobile?: string | null;
  title?: string | null;
  link?: string | null;
  altText?: string | null;
  position: string;
  orderIndex: number;
  isVisible: boolean;
}

interface BrandBannersEditorProps {
  brandId: string;
  brandName: string;
  initialBanners: BrandBanner[];
}

export default function BrandBannersEditor({
  brandId,
  brandName,
  initialBanners,
}: BrandBannersEditorProps) {
  const [banners, setBanners] = useState<BrandBanner[]>(initialBanners);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [position, setPosition] = useState<"TOP" | "BOTTOM" | "BOTH">("TOP");

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("position", position);

    startTransition(async () => {
      const res = await createBrandBanner(brandId, formData);
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage("Bannière ajoutée avec succès !");
        form.reset();
        setIsAdding(false);
        // Optimistic refresh can be done or window reload/router refresh
        window.location.reload();
      }
    });
  };

  const handleToggle = (id: string, isVisible: boolean) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isVisible: !isVisible } : b))
    );
    startTransition(async () => {
      await toggleBrandBannerVisibility(id, brandId, isVisible);
    });
  };

  const handlePositionChange = (id: string, newPos: string) => {
    setBanners((prev) =>
      prev.map((b) => (b.id === id ? { ...b, position: newPos } : b))
    );
    startTransition(async () => {
      await updateBrandBannerPosition(id, brandId, newPos);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette bannière ?")) return;
    setBanners((prev) => prev.filter((b) => b.id !== id));
    startTransition(async () => {
      await deleteBrandBanner(id, brandId);
    });
  };

  const topCount = banners.filter(
    (b) => b.isVisible && (b.position === "TOP" || b.position === "BOTH")
  ).length;
  const bottomCount = banners.filter(
    (b) => b.isVisible && (b.position === "BOTTOM" || b.position === "BOTH")
  ).length;

  return (
    <div className="admin-card" style={{ marginTop: "1.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h2 className="admin-card-title" style={{ margin: 0 }}>
            Bannières de la Marque {brandName}
          </h2>
          <p style={{ color: "#9ca3af", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Ajoutez des bannières spécifiques pour cette marque. Si vous activez plus d'une bannière au même endroit, elles s'animent automatiquement sous forme de carrousel pleine largeur.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", fontSize: "0.875rem" }}
        >
          <Plus size={16} />
          {isAdding ? "Fermer le formulaire" : "Ajouter une bannière"}
        </button>
      </div>

      {/* Résumé des bannières actives */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <div style={{ background: "#1f2937", padding: "0.6rem 1rem", borderRadius: "0.5rem", border: "1px solid #374151", fontSize: "0.85rem" }}>
          <span style={{ color: "#9ca3af" }}>En Haut : </span>
          <strong style={{ color: topCount > 1 ? "#ef4444" : topCount === 1 ? "#10b981" : "#6b7280" }}>
            {topCount === 0 ? "Aucune" : topCount === 1 ? "1 bannière statique" : `${topCount} bannières (Carrousel)`}
          </strong>
        </div>
        <div style={{ background: "#1f2937", padding: "0.6rem 1rem", borderRadius: "0.5rem", border: "1px solid #374151", fontSize: "0.85rem" }}>
          <span style={{ color: "#9ca3af" }}>En Bas (sous les commentaires) : </span>
          <strong style={{ color: bottomCount > 1 ? "#ef4444" : bottomCount === 1 ? "#10b981" : "#6b7280" }}>
            {bottomCount === 0 ? "Aucune" : bottomCount === 1 ? "1 bannière statique" : `${bottomCount} bannières (Carrousel)`}
          </strong>
        </div>
      </div>

      {errorMessage && (
        <div style={{ background: "#ef444420", border: "1px solid #ef4444", color: "#fca5a5", padding: "0.75rem", borderRadius: "0.5rem", marginBottom: "1rem", fontSize: "0.875rem" }}>
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div style={{ background: "#10b98120", border: "1px solid #10b981", color: "#6ee7b7", padding: "0.75rem", borderRadius: "0.5rem", marginBottom: "1rem", fontSize: "0.875rem" }}>
          {successMessage}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          style={{
            background: "#111827",
            padding: "1.25rem",
            borderRadius: "0.75rem",
            border: "1px solid #374151",
            marginBottom: "1.5rem",
          }}
        >
          <h3 style={{ color: "#ffffff", fontSize: "1rem", fontWeight: 600, marginBottom: "1rem" }}>
            Nouvelle Bannière pour {brandName}
          </h3>

          <div className="admin-form-grid">
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ImageIcon size={16} /> Image Desktop / PC (Requise) *
              </label>
              <input
                type="file"
                name="imageDesktopFile"
                accept="image/*"
                required
                style={{ background: "#1f2937", color: "#f3f4f6", padding: "0.5rem", borderRadius: "0.375rem", width: "100%", border: "1px solid #4b5563" }}
              />
              <span className="form-hint">Recommandé : format panoramique (ex: 1920x500 ou 1600x450). Converti automatiquement en WebP.</span>
            </div>

            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <ImageIcon size={16} /> Image Mobile (Optionnelle)
              </label>
              <input
                type="file"
                name="imageMobileFile"
                accept="image/*"
                style={{ background: "#1f2937", color: "#f3f4f6", padding: "0.5rem", borderRadius: "0.375rem", width: "100%", border: "1px solid #4b5563" }}
              />
              <span className="form-hint">Si non fournie, l'image PC s'adaptera automatiquement.</span>
            </div>

            <div className="form-group span-2">
              <label>Emplacement / Position d'affichage *</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem", marginTop: "0.25rem" }}>
                <button
                  type="button"
                  onClick={() => setPosition("TOP")}
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    border: position === "TOP" ? "2px solid #ef4444" : "1px solid #4b5563",
                    background: position === "TOP" ? "#ef444420" : "#1f2937",
                    color: position === "TOP" ? "#ffffff" : "#9ca3af",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
                    <ArrowUp size={16} color="#ef4444" /> En haut
                  </div>
                  <div style={{ fontSize: "0.75rem", marginTop: "0.25rem", color: "#9ca3af" }}>
                    Affichée au-dessus de la liste des motos
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPosition("BOTTOM")}
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    border: position === "BOTTOM" ? "2px solid #ef4444" : "1px solid #4b5563",
                    background: position === "BOTTOM" ? "#ef444420" : "#1f2937",
                    color: position === "BOTTOM" ? "#ffffff" : "#9ca3af",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
                    <ArrowDown size={16} color="#ef4444" /> En bas
                  </div>
                  <div style={{ fontSize: "0.75rem", marginTop: "0.25rem", color: "#9ca3af" }}>
                    Affichée sous les commentaires
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPosition("BOTH")}
                  style={{
                    padding: "0.75rem 1rem",
                    borderRadius: "0.5rem",
                    border: position === "BOTH" ? "2px solid #ef4444" : "1px solid #4b5563",
                    background: position === "BOTH" ? "#ef444420" : "#1f2937",
                    color: position === "BOTH" ? "#ffffff" : "#9ca3af",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
                    <ArrowUpDown size={16} color="#ef4444" /> Les deux (Haut & Bas)
                  </div>
                  <div style={{ fontSize: "0.75rem", marginTop: "0.25rem", color: "#9ca3af" }}>
                    Visible en haut et en bas de la page
                  </div>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Titre / Texte alternatif (Optionnel)</label>
              <input
                type="text"
                name="title"
                placeholder="Ex: Nouvelle gamme Peugeot 2026"
                style={{ background: "#1f2937", color: "#f3f4f6", padding: "0.5rem", borderRadius: "0.375rem", width: "100%", border: "1px solid #4b5563" }}
              />
            </div>

            <div className="form-group">
              <label>Lien de redirection au clic (Optionnel)</label>
              <input
                type="url"
                name="link"
                placeholder="https://..."
                style={{ background: "#1f2937", color: "#f3f4f6", padding: "0.5rem", borderRadius: "0.375rem", width: "100%", border: "1px solid #4b5563" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="btn-secondary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary"
              style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}
            >
              {isPending ? "Téléchargement..." : "Enregistrer la bannière"}
            </button>
          </div>
        </form>
      )}

      {/* Liste des bannières existantes */}
      {banners.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280", border: "1px dashed #374151", borderRadius: "0.5rem" }}>
          Aucune bannière configurée pour cette marque. Cliquez sur "Ajouter une bannière" pour en créer une.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 1rem",
                background: "#1f2937",
                borderRadius: "0.5rem",
                border: "1px solid #374151",
                gap: "1rem",
                flexWrap: "wrap",
                opacity: banner.isVisible ? 1 : 0.6,
              }}
            >
              {/* Image previews */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: "180px" }}>
                <div style={{ width: "90px", height: "45px", background: "#111827", borderRadius: "0.25rem", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #4b5563" }}>
                  <img
                    src={banner.imageDesktop.startsWith("./") ? banner.imageDesktop.substring(1) : banner.imageDesktop}
                    alt="PC"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                {banner.imageMobile && (
                  <div style={{ width: "35px", height: "45px", background: "#111827", borderRadius: "0.25rem", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #4b5563" }} title="Image Mobile">
                    <img
                      src={banner.imageMobile.startsWith("./") ? banner.imageMobile.substring(1) : banner.imageMobile}
                      alt="Mobile"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                )}
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f3f4f6" }}>
                    {banner.title || `Bannière #${index + 1}`}
                  </div>
                  {banner.link && (
                    <a
                      href={banner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.75rem", color: "#60a5fa", display: "flex", alignItems: "center", gap: "0.25rem", textDecoration: "none" }}
                    >
                      <ExternalLink size={12} /> {banner.link.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
              </div>

              {/* Emplacement dropdown / selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>Position :</span>
                <select
                  value={banner.position || "TOP"}
                  onChange={(e) => handlePositionChange(banner.id, e.target.value)}
                  style={{
                    background: "#111827",
                    color: "#f3f4f6",
                    border: "1px solid #4b5563",
                    padding: "0.35rem 0.6rem",
                    borderRadius: "0.375rem",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  <option value="TOP">⬆️ En haut</option>
                  <option value="BOTTOM">⬇️ En bas (sous commentaires)</option>
                  <option value="BOTH">↕️ Les deux (Haut & Bas)</option>
                </select>
              </div>

              {/* Actions : Visibilité + Suppression */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => handleToggle(banner.id, banner.isVisible)}
                  style={{
                    padding: "0.4rem 0.75rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #4b5563",
                    background: banner.isVisible ? "#10b98120" : "#374151",
                    color: banner.isVisible ? "#34d399" : "#9ca3af",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                  title={banner.isVisible ? "Masquer la bannière" : "Activer la bannière"}
                >
                  {banner.isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span>{banner.isVisible ? "Active" : "Masquée"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(banner.id)}
                  style={{
                    padding: "0.4rem 0.6rem",
                    borderRadius: "0.375rem",
                    border: "1px solid #ef444450",
                    background: "#ef444420",
                    color: "#f87171",
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                  title="Supprimer cette bannière"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

