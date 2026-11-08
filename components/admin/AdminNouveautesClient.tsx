"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, ArrowRight, Check, Search, Filter, ExternalLink, RefreshCw } from "lucide-react";

interface ModelImage {
  id: string;
  url: string;
  orderIndex: number;
}

interface ModelCard {
  id: string;
  name: string;
  price?: number | null;
  promoPrice?: number | null;
  currency?: string | null;
  isNew: boolean;
  orderIndex: number;
  brand: { id: string; name: string; logo?: string };
  images: ModelImage[];
}

interface BrandOption {
  id: string;
  name: string;
}

function cleanSrc(url?: string | null) {
  if (!url) return "/img/placeholder-moto.jpg";
  return url.startsWith("./") ? url.substring(1) : url;
}

export default function AdminNouveautesClient() {
  const [models, setModels] = useState<ModelCard[]>([]);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/nouveautes");
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      setModels(data.models || []);
      setBrands(data.brands || []);
    } catch (err: any) {
      showToast(err.message || "Erreur de chargement", "err");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Ajouter / Retirer des Nouveautés
  const toggleIsNew = async (model: ModelCard) => {
    const nextState = !model.isNew;
    setSavingId(model.id);

    // Optimistic update
    setModels((prev) =>
      prev.map((m) => (m.id === model.id ? { ...m, isNew: nextState } : m))
    );

    try {
      const res = await fetch("/api/admin/nouveautes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_is_new",
          modelId: model.id,
          isNew: nextState,
        }),
      });

      if (!res.ok) throw new Error();

      showToast(
        nextState
          ? `✅ "${model.name}" ajouté aux Nouveautés`
          : `🗑️ "${model.name}" retiré des Nouveautés`
      );
    } catch {
      // Revert on error
      setModels((prev) =>
        prev.map((m) => (m.id === model.id ? { ...m, isNew: !nextState } : m))
      );
      showToast("❌ Erreur lors de la mise à jour", "err");
    } finally {
      setSavingId(null);
    }
  };

  // Choisir l'image affichée dans la section nouveauté
  const setCoverImage = async (modelId: string, imageId: string) => {
    setSavingId(modelId);
    try {
      const res = await fetch("/api/admin/nouveautes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_cover_image",
          modelId,
          imageId,
        }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();

      setModels((prev) =>
        prev.map((m) => {
          if (m.id !== modelId) return m;
          return {
            ...m,
            images: data.images || m.images,
          };
        })
      );

      showToast("📸 Image principale mise à jour pour ce modèle !");
    } catch {
      showToast("❌ Erreur lors du choix de l'image", "err");
    } finally {
      setSavingId(null);
    }
  };

  // Déplacer l'ordre d'affichage (gauche/droite)
  const moveOrder = async (index: number, direction: -1 | 1) => {
    const currentSelected = models.filter((m) => m.isNew);
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentSelected.length) return;

    const reordered = [...currentSelected];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const updates = reordered.map((m, idx) => ({ id: m.id, orderIndex: idx }));

    // Optimistic
    setModels((prev) =>
      prev.map((m) => {
        const u = updates.find((x) => x.id === m.id);
        return u ? { ...m, orderIndex: u.orderIndex } : m;
      })
    );

    try {
      const res = await fetch("/api/admin/nouveautes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reorder",
          items: updates,
        }),
      });
      if (!res.ok) throw new Error();
      showToast("🔄 Ordre d'affichage mis à jour");
    } catch {
      showToast("❌ Impossible d'enregistrer l'ordre", "err");
      loadData();
    }
  };

  // Modèles actuellement dans les nouveautés
  const selectedModels = useMemo(() => {
    return models
      .filter((m) => m.isNew)
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0));
  }, [models]);

  // Autres modèles disponibles
  const availableModels = useMemo(() => {
    return models
      .filter((m) => !m.isNew)
      .filter((m) => {
        if (selectedBrand && m.brand.id !== selectedBrand) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = m.name.toLowerCase().includes(q);
          const matchBrand = m.brand.name.toLowerCase().includes(q);
          if (!matchName && !matchBrand) return false;
        }
        return true;
      })
      .sort((a, b) => a.brand.name.localeCompare(b.brand.name) || a.name.localeCompare(b.name));
  }, [models, selectedBrand, searchQuery]);

  return (
    <div className="admin-nouveautes-container">
      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "1.5rem",
            right: "1.5rem",
            zIndex: 9999,
            background: toast.type === "ok" ? "#166534" : "#991b1b",
            color: "white",
            padding: "0.85rem 1.4rem",
            borderRadius: "0.75rem",
            fontWeight: 600,
            fontSize: "0.92rem",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {toast.msg}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#9ca3af" }}>
          <RefreshCw className="animate-spin inline-block mr-2" size={24} />
          Chargement des modèles...
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SECTION 1 : Modèles actuellement affichés dans les Nouveautés */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="admin-card" style={{ marginBottom: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <h2 className="admin-card-title" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <Sparkles className="text-red-500" size={22} />
                  Motos affichées dans la section Nouveautés
                  <span
                    style={{
                      background: "#dc2626",
                      color: "white",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.65rem",
                      borderRadius: "999px",
                      marginLeft: "0.5rem",
                    }}
                  >
                    {selectedModels.length}
                  </span>
                </h2>
                <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: 0 }}>
                  Ces motos défilent sur la page d&apos;accueil. Vous pouvez changer l&apos;image exacte affichée pour chaque modèle et modifier leur ordre.
                </p>
              </div>

              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
              >
                <ExternalLink size={15} /> Voir sur la page d&apos;accueil
              </a>
            </div>

            {selectedModels.length === 0 ? (
              <div
                style={{
                  padding: "3rem",
                  textAlign: "center",
                  background: "rgba(255,255,255,0.02)",
                  border: "1px dashed #374151",
                  borderRadius: "0.75rem",
                  color: "#9ca3af",
                }}
              >
                <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "#e5e7eb", marginBottom: "0.5rem" }}>
                  Aucune moto sélectionnée pour le moment
                </p>
                <p style={{ fontSize: "0.875rem" }}>
                  Choisissez des modèles dans la liste ci-dessous en cliquant sur <strong>&quot;+ Ajouter aux nouveautés&quot;</strong>.
                </p>
              </div>
            ) : (
              <div className="nouveautes-active-grid">
                {selectedModels.map((model, idx) => {
                  const mainImage = model.images?.[0]?.url || "/img/placeholder-moto.jpg";
                  const effectivePrice = model.promoPrice && model.promoPrice > 0 ? model.promoPrice : model.price;

                  return (
                    <div
                      key={model.id}
                      className="nouveaute-card nouveaute-card-active"
                      style={{ position: "relative" }}
                    >
                      {/* Numéro d'ordre */}
                      <div className="nouveaute-card-order-badge">
                        #{idx + 1}
                      </div>

                      {/* Image principale */}
                      <div className="nouveaute-card-img-wrap">
                        <img
                          src={cleanSrc(mainImage)}
                          alt={model.name}
                          className="nouveaute-card-img"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/img/placeholder-moto.jpg";
                          }}
                        />
                        <div className="nouveaute-card-badge">✨ NOUVEAU</div>
                        {savingId === model.id && (
                          <div className="nouveaute-card-overlay">
                            <RefreshCw className="animate-spin" size={24} />
                          </div>
                        )}
                      </div>

                      {/* Sélecteur d'images si le modèle en a plusieurs */}
                      <div className="nouveaute-images-selector">
                        <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#d1d5db", marginBottom: "0.35rem", display: "flex", justifyContent: "space-between" }}>
                          <span>Image affichée dans la section :</span>
                          <span style={{ color: "#9ca3af" }}>({model.images?.length || 0} images)</span>
                        </div>

                        {model.images && model.images.length > 0 ? (
                          <div className="nouveaute-thumbs-row">
                            {model.images.map((img, imgIdx) => {
                              const isSelected = imgIdx === 0;
                              return (
                                <button
                                  key={img.id || imgIdx}
                                  type="button"
                                  onClick={() => setCoverImage(model.id, img.id)}
                                  disabled={savingId === model.id}
                                  className={`nouveaute-thumb-btn ${isSelected ? "thumb-selected" : ""}`}
                                  title={isSelected ? "Image actuellement affichée" : "Cliquer pour afficher cette image dans la section"}
                                >
                                  <img
                                    src={cleanSrc(img.url)}
                                    alt={`Image ${imgIdx + 1}`}
                                    className="nouveaute-thumb-img"
                                  />
                                  {isSelected && (
                                    <div className="thumb-check-badge">
                                      <Check size={11} strokeWidth={3} />
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ fontSize: "0.75rem", color: "#6b7280", fontStyle: "italic" }}>
                            Aucune image uploadée pour ce modèle
                          </div>
                        )}
                      </div>

                      {/* Infos modèle */}
                      <div className="nouveaute-card-body">
                        <div className="nouveaute-card-brand">{model.brand.name}</div>
                        <div className="nouveaute-card-name">{model.name}</div>
                        <div className="nouveaute-card-price">
                          {effectivePrice ? (
                            <span>{effectivePrice.toLocaleString("fr-FR")} {model.currency || "DT"}</span>
                          ) : (
                            <span style={{ color: "#ef4444" }}>En arrivage</span>
                          )}
                        </div>

                        {/* Réorganisation de l'ordre */}
                        <div className="nouveaute-reorder-bar">
                          <button
                            type="button"
                            onClick={() => moveOrder(idx, -1)}
                            disabled={idx === 0 || savingId === model.id}
                            className="btn-reorder"
                            title="Déplacer vers la gauche"
                          >
                            <ArrowLeft size={14} />
                          </button>
                          <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Position {idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => moveOrder(idx, 1)}
                            disabled={idx === selectedModels.length - 1 || savingId === model.id}
                            className="btn-reorder"
                            title="Déplacer vers la droite"
                          >
                            <ArrowRight size={14} />
                          </button>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                          <button
                            type="button"
                            onClick={() => toggleIsNew(model)}
                            disabled={savingId === model.id}
                            className="btn-danger"
                            style={{ flex: 1, padding: "0.45rem" }}
                          >
                            − Retirer
                          </button>
                          <Link
                            href={`/admin/modeles/${model.id}`}
                            className="btn-secondary"
                            style={{ padding: "0.45rem 0.75rem", fontSize: "0.78rem" }}
                            title="Éditer le modèle dans l'admin"
                          >
                            ✏️
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SECTION 2 : Tous les autres modèles disponibles                */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="admin-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
              <div>
                <h2 className="admin-card-title">
                  🏍️ Ajouter un modèle aux Nouveautés ({availableModels.length})
                </h2>
                <p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: 0 }}>
                  Recherchez et filtrez les modèles du catalogue pour les ajouter en un clic à la page d&apos;accueil.
                </p>
              </div>

              {/* Filtres de recherche */}
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <div style={{ position: "relative", minWidth: "220px" }}>
                  <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un modèle..."
                    style={{
                      width: "100%",
                      padding: "0.5rem 0.75rem 0.5rem 2.2rem",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
                      color: "white",
                      fontSize: "0.85rem",
                    }}
                  />
                </div>

                <div style={{ position: "relative" }}>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    style={{
                      padding: "0.5rem 2rem 0.5rem 0.75rem",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid #374151",
                      borderRadius: "0.5rem",
                      color: "white",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">Toutes les marques</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {availableModels.length === 0 ? (
              <p style={{ color: "#6b7280", fontStyle: "italic", textAlign: "center", padding: "2rem" }}>
                Aucun modèle ne correspond à votre recherche.
              </p>
            ) : (
              <div className="nouveautes-available-grid">
                {availableModels.map((model) => {
                  const mainImage = model.images?.[0]?.url || "/img/placeholder-moto.jpg";
                  const effectivePrice = model.promoPrice && model.promoPrice > 0 ? model.promoPrice : model.price;

                  return (
                    <div key={model.id} className="nouveaute-card">
                      <div className="nouveaute-card-img-wrap">
                        <img
                          src={cleanSrc(mainImage)}
                          alt={model.name}
                          className="nouveaute-card-img"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/img/placeholder-moto.jpg";
                          }}
                        />
                      </div>
                      <div className="nouveaute-card-body">
                        <div className="nouveaute-card-brand">{model.brand.name}</div>
                        <div className="nouveaute-card-name">{model.name}</div>
                        <div className="nouveaute-card-price" style={{ marginBottom: "0.75rem" }}>
                          {effectivePrice ? (
                            <span>{effectivePrice.toLocaleString("fr-FR")} {model.currency || "DT"}</span>
                          ) : (
                            <span style={{ color: "#ef4444" }}>En arrivage</span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleIsNew(model)}
                          disabled={savingId === model.id}
                          className="btn-primary"
                          style={{ width: "100%", justifyContent: "center", padding: "0.45rem", fontSize: "0.8rem" }}
                        >
                          + Ajouter aux nouveautés
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
