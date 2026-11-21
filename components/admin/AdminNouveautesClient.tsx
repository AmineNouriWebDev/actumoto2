"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
  Search,
  ExternalLink,
  RefreshCw,
  Upload,
  Link as LinkIcon,
  Link2Off,
  Trash2,
  Plus,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface ModelImage {
  id: string;
  url: string;
  orderIndex: number;
}

interface ActiveNouveauteItem {
  id: string;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  price: number | null;
  promoPrice: number | null;
  currency: string | null;
  orderIndex: number;
  isVisible: boolean;
  modelId: string | null;
  position?: string;
  linkedModelImages?: ModelImage[];
  defaultModelUrl?: string | null;
  brandName?: string;
}

interface CatalogModel {
  id: string;
  name: string;
  price?: number | null;
  promoPrice?: number | null;
  currency?: string | null;
  brand: { id: string; name: string; logo?: string };
  images: ModelImage[];
}

interface BrandOption {
  id: string;
  name: string;
}

interface EditCardState {
  title: string;
  subtitle: string;
  price: string;
  promoPrice: string;
  linkUrl: string;
}

function cleanSrc(url?: string | null) {
  if (!url) return "/img/placeholder-moto.jpg";
  return url.startsWith("./") ? url.substring(1) : url;
}

export default function AdminNouveautesClient() {
  const searchParams = useSearchParams();
  const [activePos, setActivePos] = useState<"HAUT" | "BAS">("HAUT");

  const [items, setItems] = useState<ActiveNouveauteItem[]>([]);
  const [models, setModels] = useState<CatalogModel[]>([]);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Filtres catalogue
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  // État formulaire Upload personnalisé
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadSubtitle, setUploadSubtitle] = useState("");
  const [uploadLinkUrl, setUploadLinkUrl] = useState("");
  const [uploadPrice, setUploadPrice] = useState("");
  const [uploadPromoPrice, setUploadPromoPrice] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // État d'édition en direct de chaque carte (titre, marque, prix, promo, url)
  const [cardEdits, setCardEdits] = useState<Record<string, EditCardState>>({});

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Synchronisation avec l'URL param ?pos=BAS ou ?pos=HAUT
  useEffect(() => {
    const pos = searchParams?.get("pos");
    if (pos === "BAS") {
      setActivePos("BAS");
    } else if (pos === "HAUT") {
      setActivePos("HAUT");
    }
  }, [searchParams]);

  // Changer d'onglet (Haut / Bas)
  const switchTab = (pos: "HAUT" | "BAS") => {
    setActivePos(pos);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("pos", pos);
      window.history.pushState({}, "", url.toString());
    }
  };

  // Chargement des données
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/nouveautes");
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      const loadedItems: ActiveNouveauteItem[] = data.items || [];
      setItems(loadedItems);
      setModels(data.models || []);
      setBrands(data.brands || []);

      // Initialiser le state des champs d'édition pour chaque carte
      const initialEdits: Record<string, EditCardState> = {};
      loadedItems.forEach((it) => {
        initialEdits[it.id] = {
          title: it.title || "",
          subtitle: it.subtitle || "",
          price: it.price !== null && it.price !== undefined ? it.price.toString() : "",
          promoPrice: it.promoPrice !== null && it.promoPrice !== undefined ? it.promoPrice.toString() : "",
          linkUrl: it.linkUrl || "",
        };
      });
      setCardEdits(initialEdits);
    } catch (err: any) {
      showToast(err.message || "Erreur de chargement", "err");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Modifier un champ dans l'état local d'édition d'une carte
  const updateCardEditField = (itemId: string, field: keyof EditCardState, value: string) => {
    setCardEdits((prev) => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || { title: "", subtitle: "", price: "", promoPrice: "", linkUrl: "" }),
        [field]: value,
      },
    }));
  };

  // Enregistrer les modifications de titre, sous-titre, prix et URL pour une carte
  const saveCardDetails = async (itemId: string) => {
    const edit = cardEdits[itemId];
    if (!edit) return;

    setSavingId(itemId);
    try {
      const res = await fetch("/api/admin/nouveautes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_item",
          itemId,
          title: edit.title.trim(),
          subtitle: edit.subtitle.trim() !== "" ? edit.subtitle.trim() : null,
          price: edit.price !== "" ? parseFloat(edit.price) : null,
          promoPrice: edit.promoPrice !== "" ? parseFloat(edit.promoPrice) : null,
          linkUrl: edit.linkUrl.trim() !== "" ? edit.linkUrl.trim() : null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de l'enregistrement");
      }

      const data = await res.json();
      setItems((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, ...data.item } : it))
      );

      showToast("💾 Nom, prix et lien enregistrés avec succès !");
    } catch (err: any) {
      showToast(err.message || "❌ Erreur lors de l'enregistrement", "err");
    } finally {
      setSavingId(null);
    }
  };

  // Déplacer une nouveauté entre HAUT et BAS
  const moveItemPosition = async (item: ActiveNouveauteItem) => {
    const currentPosition = (item.position || "HAUT") === "HAUT" ? "HAUT" : "BAS";
    const targetPosition = currentPosition === "HAUT" ? "BAS" : "HAUT";

    setSavingId(item.id);
    try {
      const res = await fetch("/api/admin/nouveautes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_item",
          itemId: item.id,
          position: targetPosition,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur de déplacement");
      }

      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, position: targetPosition } : it))
      );

      showToast(
        `↔️ Déplacé vers Nouveautés (${targetPosition === "HAUT" ? "Haut - Section 2" : "Bas - Section 4"}) !`
      );
    } catch (err: any) {
      showToast(err.message || "❌ Erreur lors du déplacement", "err");
    } finally {
      setSavingId(null);
    }
  };

  // Gestion du fichier upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      const objectUrl = URL.createObjectURL(file);
      setUploadPreview(objectUrl);
    }
  };

  // Soumission de l'upload personnalisé
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      showToast("Veuillez sélectionner une image à uploader", "err");
      return;
    }
    if (!uploadTitle.trim()) {
      showToast("Veuillez renseigner un titre", "err");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("title", uploadTitle.trim());
      if (uploadSubtitle.trim()) formData.append("subtitle", uploadSubtitle.trim());
      if (uploadLinkUrl.trim()) formData.append("linkUrl", uploadLinkUrl.trim());
      if (uploadPrice.trim()) formData.append("price", uploadPrice.trim());
      if (uploadPromoPrice.trim()) formData.append("promoPrice", uploadPromoPrice.trim());
      formData.append("position", activePos);

      const res = await fetch("/api/admin/nouveautes", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de l'upload");
      }

      showToast(`✅ Nouveauté (${activePos === "HAUT" ? "Haut" : "Bas"}) ajoutée avec succès !`);
      // Réinitialiser le formulaire
      setUploadFile(null);
      setUploadPreview(null);
      setUploadTitle("");
      setUploadSubtitle("");
      setUploadLinkUrl("");
      setUploadPrice("");
      setUploadPromoPrice("");

      await loadData();
    } catch (err: any) {
      showToast(err.message || "Erreur lors de l'upload", "err");
    } finally {
      setIsUploading(false);
    }
  };

  // Ajouter un modèle du catalogue
  const addCatalogModel = async (model: CatalogModel) => {
    setSavingId(model.id);
    try {
      const res = await fetch("/api/admin/nouveautes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_model",
          modelId: model.id,
          position: activePos,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de l'ajout");
      }

      showToast(
        `✅ "${model.name}" ajouté aux Nouveautés (${activePos === "HAUT" ? "Haut" : "Bas"}) !`
      );
      await loadData();
    } catch (err: any) {
      showToast(err.message || "Erreur lors de l'ajout", "err");
    } finally {
      setSavingId(null);
    }
  };

  // Choisir une image parmi celles du modèle
  const setItemImage = async (itemId: string, imageUrl: string) => {
    setSavingId(itemId);
    try {
      const res = await fetch("/api/admin/nouveautes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_item_image",
          itemId,
          imageUrl,
        }),
      });

      if (!res.ok) throw new Error();

      setItems((prev) =>
        prev.map((it) => (it.id === itemId ? { ...it, imageUrl } : it))
      );

      showToast("📸 Image d'affichage mise à jour !");
    } catch {
      showToast("❌ Erreur lors du changement d'image", "err");
    } finally {
      setSavingId(null);
    }
  };

  // Filtrer les éléments de la position active (HAUT ou BAS)
  const currentItems = useMemo(() => {
    return items
      .filter((it) => (it.position || "HAUT") === activePos)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [items, activePos]);

  const itemsHautCount = useMemo(() => {
    return items.filter((it) => (it.position || "HAUT") === "HAUT").length;
  }, [items]);

  const itemsBasCount = useMemo(() => {
    return items.filter((it) => it.position === "BAS").length;
  }, [items]);

  // Déplacer l'ordre d'affichage (gauche/droite) au sein de la section active
  const moveOrder = async (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentItems.length) return;

    const reordered = [...currentItems];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const updates = reordered.map((m, idx) => ({ id: m.id, orderIndex: idx }));

    // Optimistic
    setItems((prev) =>
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
      showToast("🔄 Ordre d'affichage mis à jour !");
    } catch {
      showToast("❌ Impossible d'enregistrer l'ordre", "err");
      loadData();
    }
  };

  // Retirer un élément des nouveautés
  const deleteItem = async (item: ActiveNouveauteItem) => {
    if (!confirm(`Voulez-vous vraiment retirer "${item.title || "cette nouveauté"}" de la section ?`)) {
      return;
    }

    setSavingId(item.id);
    try {
      const res = await fetch("/api/admin/nouveautes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_item",
          itemId: item.id,
        }),
      });

      if (!res.ok) throw new Error();

      setItems((prev) => prev.filter((it) => it.id !== item.id));
      showToast(`🗑️ "${item.title || "Nouveauté"}" retiré des Nouveautés`);
      await loadData();
    } catch {
      showToast("❌ Erreur lors de la suppression", "err");
    } finally {
      setSavingId(null);
    }
  };

  // Filtre modèles disponibles du catalogue pour la position active
  const availableCatalogModels = useMemo(() => {
    const activeModelIds = new Set(currentItems.map((it) => it.modelId).filter(Boolean));

    return models
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
      .map((m) => ({
        ...m,
        isAlreadyAdded: activeModelIds.has(m.id),
      }))
      .sort((a, b) => {
        if (a.isAlreadyAdded !== b.isAlreadyAdded) return a.isAlreadyAdded ? 1 : -1;
        return a.brand.name.localeCompare(b.brand.name) || a.name.localeCompare(b.name);
      });
  }, [models, currentItems, selectedBrand, searchQuery]);

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
          {toast.type === "ok" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Onglets de sélection HAUT / BAS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <button
          type="button"
          onClick={() => switchTab("HAUT")}
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "0.75rem",
            fontWeight: 700,
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
            cursor: "pointer",
            transition: "all 0.2s ease",
            background: activePos === "HAUT" ? "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)" : "rgba(31, 41, 55, 0.7)",
            color: "white",
            border: activePos === "HAUT" ? "2px solid #ef4444" : "1px solid #374151",
            boxShadow: activePos === "HAUT" ? "0 4px 16px rgba(220, 38, 38, 0.4)" : "none",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>✨</span>
          <span>Nouveautés HAUT (Section 2 - Sous le Hero)</span>
          <span
            style={{
              background: activePos === "HAUT" ? "white" : "rgba(255,255,255,0.15)",
              color: activePos === "HAUT" ? "#dc2626" : "white",
              padding: "0.15rem 0.55rem",
              borderRadius: "999px",
              fontSize: "0.8rem",
              fontWeight: 800,
            }}
          >
            {itemsHautCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => switchTab("BAS")}
          style={{
            padding: "1rem 1.25rem",
            borderRadius: "0.75rem",
            fontWeight: 700,
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
            cursor: "pointer",
            transition: "all 0.2s ease",
            background: activePos === "BAS" ? "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)" : "rgba(31, 41, 55, 0.7)",
            color: "white",
            border: activePos === "BAS" ? "2px solid #ef4444" : "1px solid #374151",
            boxShadow: activePos === "BAS" ? "0 4px 16px rgba(220, 38, 38, 0.4)" : "none",
          }}
        >
          <span style={{ fontSize: "1.2rem" }}>🌟</span>
          <span>Nouveautés BAS (Section 4 - Au-dessus du Footer)</span>
          <span
            style={{
              background: activePos === "BAS" ? "white" : "rgba(255,255,255,0.15)",
              color: activePos === "BAS" ? "#dc2626" : "white",
              padding: "0.15rem 0.55rem",
              borderRadius: "999px",
              fontSize: "0.8rem",
              fontWeight: 800,
            }}
          >
            {itemsBasCount}
          </span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#9ca3af" }}>
          <RefreshCw className="animate-spin inline-block mr-2" size={24} />
          Chargement des Nouveautés...
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SECTION 1 : Éléments actuellement affichés dans la position     */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="admin-card" style={{ marginBottom: "2.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <h2
                  className="admin-card-title"
                  style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}
                >
                  <Sparkles className="text-red-500" size={22} />
                  Motos & Plaques dans Nouveautés ({activePos === "HAUT" ? "Haut" : "Bas"})
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
                    {currentItems.length}
                  </span>
                </h2>
                <p style={{ color: "#9ca3af", fontSize: "0.875rem", margin: 0 }}>
                  Emplacement sur la page d&apos;accueil :{" "}
                  <strong style={{ color: "#f3f4f6" }}>
                    {activePos === "HAUT"
                      ? "Section 2 (juste sous les 4 boutons du hero)"
                      : "Section 4 (juste au-dessus du footer, remplace l'ancien carrousel)"}
                  </strong>
                  . Vous pouvez modifier les noms, prix, photos et liens directement ci-dessous à tout moment.
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={loadData}
                  className="btn-secondary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
                  title="Rafraîchir"
                >
                  <RefreshCw size={14} /> Rafraîchir
                </button>
                <a
                  href="/"
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.82rem" }}
                >
                  <ExternalLink size={14} /> Voir l&apos;accueil
                </a>
              </div>
            </div>

            {currentItems.length === 0 ? (
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
                  Aucune nouveauté configurée pour la section {activePos === "HAUT" ? "HAUT" : "BAS"}
                </p>
                <p style={{ fontSize: "0.875rem" }}>
                  Ajoutez un modèle du catalogue ci-dessous ou uploadez une image spéciale pour alimenter cette section.
                </p>
              </div>
            ) : (
              <div className="nouveautes-active-grid">
                {currentItems.map((item, idx) => {
                  const edit = cardEdits[item.id] || {
                    title: item.title || "",
                    subtitle: item.subtitle || "",
                    price: item.price !== null && item.price !== undefined ? item.price.toString() : "",
                    promoPrice: item.promoPrice !== null && item.promoPrice !== undefined ? item.promoPrice.toString() : "",
                    linkUrl: item.linkUrl || "",
                  };
                  const isClickable = Boolean(edit.linkUrl && edit.linkUrl.trim() !== "");

                  return (
                    <div
                      key={item.id}
                      className="nouveaute-card nouveaute-card-active"
                      style={{ position: "relative" }}
                    >
                      {/* Badge numéro d'ordre */}
                      <div className="nouveaute-card-order-badge">#{idx + 1}</div>

                      {/* Image principale */}
                      <div className="nouveaute-card-img-wrap">
                        <img
                          src={cleanSrc(item.imageUrl)}
                          alt={item.title || "Nouveauté"}
                          className="nouveaute-card-img"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/img/placeholder-moto.jpg";
                          }}
                        />
                        <div className="nouveaute-card-badge">✨ NOUVEAU</div>
                        {savingId === item.id && (
                          <div className="nouveaute-card-overlay">
                            <RefreshCw className="animate-spin" size={24} />
                          </div>
                        )}
                      </div>

                      {/* Sélecteur de miniatures (si lié à un modèle avec plusieurs photos) */}
                      {item.linkedModelImages && item.linkedModelImages.length > 1 && (
                        <div className="nouveaute-images-selector">
                          <div
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 600,
                              color: "#d1d5db",
                              marginBottom: "0.35rem",
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>Choisir l&apos;image du modèle :</span>
                            <span style={{ color: "#9ca3af" }}>({item.linkedModelImages.length} photos)</span>
                          </div>

                          <div className="nouveaute-thumbs-row">
                            {item.linkedModelImages.map((img, imgIdx) => {
                              const isSelected = item.imageUrl === img.url;
                              return (
                                <button
                                  key={img.id || imgIdx}
                                  type="button"
                                  onClick={() => setItemImage(item.id, img.url)}
                                  disabled={savingId === item.id}
                                  className={`nouveaute-thumb-btn ${isSelected ? "thumb-selected" : ""}`}
                                  title={
                                    isSelected
                                      ? "Image actuellement affichée"
                                      : "Cliquer pour afficher cette photo dans la section"
                                  }
                                >
                                  <img
                                    src={cleanSrc(img.url)}
                                    alt={`Photo ${imgIdx + 1}`}
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
                        </div>
                      )}

                      {/* Corps des informations & Édition en direct */}
                      <div className="nouveaute-card-body" style={{ gap: "0.6rem" }}>
                        {/* Titre / Nom du modèle */}
                        <div>
                          <label style={{ fontSize: "0.72rem", color: "#9ca3af", fontWeight: 700, display: "block", marginBottom: "0.2rem" }}>
                            Titre / Nom du modèle
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            style={{ fontSize: "0.82rem", padding: "0.35rem 0.5rem" }}
                            value={edit.title}
                            onChange={(e) => updateCardEditField(item.id, "title", e.target.value)}
                            placeholder="Nom du modèle"
                          />
                        </div>

                        {/* Marque / Sous-titre */}
                        <div>
                          <label style={{ fontSize: "0.72rem", color: "#9ca3af", fontWeight: 700, display: "block", marginBottom: "0.2rem" }}>
                            Marque / Sous-titre
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            style={{ fontSize: "0.82rem", padding: "0.35rem 0.5rem" }}
                            value={edit.subtitle}
                            onChange={(e) => updateCardEditField(item.id, "subtitle", e.target.value)}
                            placeholder="Marque ou sous-titre"
                          />
                        </div>

                        {/* Prix & Prix Promo */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                          <div>
                            <label style={{ fontSize: "0.72rem", color: "#9ca3af", fontWeight: 700, display: "block", marginBottom: "0.2rem" }}>
                              Prix (DT)
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              style={{ fontSize: "0.82rem", padding: "0.35rem 0.5rem" }}
                              value={edit.price}
                              onChange={(e) => updateCardEditField(item.id, "price", e.target.value)}
                              placeholder="Ex: 8500"
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: "0.72rem", color: "#9ca3af", fontWeight: 700, display: "block", marginBottom: "0.2rem" }}>
                              Prix Promo (DT)
                            </label>
                            <input
                              type="number"
                              className="form-control"
                              style={{ fontSize: "0.82rem", padding: "0.35rem 0.5rem" }}
                              value={edit.promoPrice}
                              onChange={(e) => updateCardEditField(item.id, "promoPrice", e.target.value)}
                              placeholder="Ex: 7900"
                            />
                          </div>
                        </div>

                        {/* Section URL & Cliquabilité */}
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                            <label style={{ fontSize: "0.72rem", color: "#9ca3af", fontWeight: 700, margin: 0 }}>
                              Lien cliquable (URL)
                            </label>
                            {isClickable ? (
                              <span className="nouveaute-link-badge nouveaute-link-badge-clickable" style={{ fontSize: "0.65rem", padding: "1px 5px", margin: 0 }}>
                                <LinkIcon size={10} /> Cliquable
                              </span>
                            ) : (
                              <span className="nouveaute-link-badge nouveaute-link-badge-unclickable" style={{ fontSize: "0.65rem", padding: "1px 5px", margin: 0 }}>
                                <Link2Off size={10} /> Non cliquable
                              </span>
                            )}
                          </div>
                          <input
                            type="text"
                            className="form-control"
                            style={{ fontSize: "0.78rem", padding: "0.35rem 0.5rem" }}
                            value={edit.linkUrl}
                            onChange={(e) => updateCardEditField(item.id, "linkUrl", e.target.value)}
                            placeholder="Laissez vide pour non cliquable"
                          />
                          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
                            {isClickable && (
                              <button
                                type="button"
                                onClick={() => updateCardEditField(item.id, "linkUrl", "")}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#9ca3af",
                                  fontSize: "0.7rem",
                                  padding: 0,
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                }}
                              >
                                🔒 Rendre non cliquable
                              </button>
                            )}
                            {item.defaultModelUrl && edit.linkUrl !== item.defaultModelUrl && (
                              <button
                                type="button"
                                onClick={() => updateCardEditField(item.id, "linkUrl", item.defaultModelUrl!)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#f87171",
                                  fontSize: "0.7rem",
                                  padding: 0,
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                }}
                              >
                                🔗 Rétablir le lien auto du modèle
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Bouton Enregistrer Nom & Prix & Lien */}
                        <button
                          type="button"
                          onClick={() => saveCardDetails(item.id)}
                          disabled={savingId === item.id}
                          className="btn-primary"
                          style={{
                            width: "100%",
                            padding: "0.45rem",
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.35rem",
                            background: "#16a34a",
                            borderColor: "#15803d",
                            marginTop: "0.2rem",
                          }}
                        >
                          <Check size={14} /> Enregistrer nom, prix & lien
                        </button>

                        {/* Déplacer vers HAUT ou BAS */}
                        <button
                          type="button"
                          onClick={() => moveItemPosition(item)}
                          disabled={savingId === item.id}
                          className="btn-secondary"
                          style={{
                            width: "100%",
                            padding: "0.35rem",
                            fontSize: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.35rem",
                          }}
                          title={`Déplacer cette moto vers la section Nouveautés ${(item.position || "HAUT") === "HAUT" ? "Bas" : "Haut"}`}
                        >
                          ↔️ Basculer vers Nouveautés {(item.position || "HAUT") === "HAUT" ? "Bas (Section 4)" : "Haut (Section 2)"}
                        </button>

                        {/* Réorganisation de l'ordre */}
                        <div className="nouveaute-reorder-bar">
                          <button
                            type="button"
                            onClick={() => moveOrder(idx, -1)}
                            disabled={idx === 0 || savingId === item.id}
                            className="btn-reorder"
                            title="Déplacer vers la gauche"
                          >
                            <ArrowLeft size={14} />
                          </button>
                          <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                            Position {idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => moveOrder(idx, 1)}
                            disabled={idx === currentItems.length - 1 || savingId === item.id}
                            className="btn-reorder"
                            title="Déplacer vers la droite"
                          >
                            <ArrowRight size={14} />
                          </button>
                        </div>

                        {/* Actions Retirer / Fiche */}
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.2rem" }}>
                          <button
                            type="button"
                            onClick={() => deleteItem(item)}
                            disabled={savingId === item.id}
                            className="btn-danger"
                            style={{
                              flex: 1,
                              padding: "0.45rem",
                              fontSize: "0.78rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.3rem",
                            }}
                          >
                            <Trash2 size={13} /> Retirer
                          </button>
                          {item.modelId && (
                            <Link
                              href={`/admin/modeles/${item.modelId}`}
                              className="btn-secondary"
                              style={{ padding: "0.45rem 0.75rem", fontSize: "0.78rem" }}
                              title="Éditer le modèle dans l'admin"
                            >
                              ✏️ Fiche
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SECTION 2 : Uploader une image spécialement pour cette section */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="admin-card" style={{ marginBottom: "2.5rem" }}>
            <h2 className="admin-card-title" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Upload className="text-red-500" size={22} />
              Uploader une nouveauté sur-mesure dans Nouveautés ({activePos === "HAUT" ? "Haut" : "Bas"})
            </h2>
            <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Ajoutez une image sur-mesure (bannière, promo, nouveau modèle non encore catalogué) spécialement pour la section{" "}
              <strong style={{ color: "#f3f4f6" }}>Nouveautés ({activePos === "HAUT" ? "Haut - Section 2" : "Bas - Section 4"})</strong>.
            </p>

            <form onSubmit={handleUploadSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                {/* Zone de téléversement Image */}
                <div>
                  <label className="form-label" style={{ fontWeight: 700, display: "block", marginBottom: "0.5rem" }}>
                    Photo de la nouveauté (JPG, PNG, WebP) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <label className="nouveaute-upload-dropzone" style={{ display: "block" }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                    />
                    {uploadPreview ? (
                      <div style={{ position: "relative", width: "100%", aspectRatio: "4/3", maxHeight: "220px", overflow: "hidden", borderRadius: "0.5rem" }}>
                        <img
                          src={uploadPreview}
                          alt="Aperçu"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "rgba(0,0,0,0.8)",
                            color: "white",
                            fontSize: "0.75rem",
                            padding: "4px 10px",
                            borderRadius: "999px",
                          }}
                        >
                          Cliquer pour changer d&apos;image
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: "1.5rem 1rem", color: "#9ca3af" }}>
                        <ImageIcon size={40} style={{ margin: "0 auto 0.75rem", color: "#6b7280" }} />
                        <p style={{ fontWeight: 600, color: "#e5e7eb", marginBottom: "0.25rem" }}>
                          Cliquez pour sélectionner une photo
                        </p>
                        <p style={{ fontSize: "0.78rem" }}>Format recommandé : ratio 4:3 (ex: 800x600 px)</p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Champs textes et URL */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "0.35rem" }}>
                      Titre / Nom du modèle <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: Peugeot Django 125 Allure"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "0.35rem" }}>
                      Marque ou Sous-titre (Optionnel)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: Peugeot ou Édition Limitée"
                      value={uploadSubtitle}
                      onChange={(e) => setUploadSubtitle(e.target.value)}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "0.35rem" }}>
                        Prix (DT) (Optionnel)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Ex: 8500"
                        value={uploadPrice}
                        onChange={(e) => setUploadPrice(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ fontWeight: 600, fontSize: "0.85rem", display: "block", marginBottom: "0.35rem" }}>
                        Prix Promo (DT) (Optionnel)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Ex: 7990"
                        value={uploadPromoPrice}
                        onChange={(e) => setUploadPromoPrice(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* CHAMP URL DE REDIRECTION */}
                  <div
                    style={{
                      background: "rgba(0,0,0,0.25)",
                      padding: "0.85rem",
                      borderRadius: "0.6rem",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                      <label className="form-label" style={{ fontWeight: 700, fontSize: "0.85rem", margin: 0 }}>
                        🔗 URL du lien (Optionnel)
                      </label>
                      {uploadLinkUrl.trim() ? (
                        <span className="nouveaute-link-badge nouveaute-link-badge-clickable" style={{ margin: 0 }}>
                          <LinkIcon size={11} /> Sera CLIQUABLE
                        </span>
                      ) : (
                        <span className="nouveaute-link-badge nouveaute-link-badge-unclickable" style={{ margin: 0 }}>
                          <Link2Off size={11} /> Sera NON CLIQUABLE
                        </span>
                      )}
                    </div>

                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex: /marques/peugeot/django ou https://... (Laissez vide pour non cliquable)"
                      value={uploadLinkUrl}
                      onChange={(e) => setUploadLinkUrl(e.target.value)}
                    />
                    <p style={{ color: "#9ca3af", fontSize: "0.75rem", marginTop: "0.4rem", margin: 0 }}>
                      💡 Si vous laissez ce champ vide, l&apos;image sera <strong>non cliquable</strong> sur la page d&apos;accueil.
                    </p>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={isUploading}
                      className="btn-primary"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        fontWeight: 700,
                      }}
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="animate-spin" size={18} />
                          Enregistrement en cours...
                        </>
                      ) : (
                        <>
                          <Plus size={18} />
                          Ajouter aux Nouveautés ({activePos === "HAUT" ? "Haut" : "Bas"})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* SECTION 3 : Ajouter un modèle existant du catalogue             */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="admin-card">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div>
                <h2 className="admin-card-title">
                  🏍️ Ajouter un modèle existant aux Nouveautés ({activePos === "HAUT" ? "Haut" : "Bas"}) ({availableCatalogModels.length})
                </h2>
                <p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: 0 }}>
                  Choisissez un modèle à ajouter à la section {activePos === "HAUT" ? "HAUT" : "BAS"}. Vous pourrez modifier son nom, son prix ou son lien à tout moment.
                </p>
              </div>

              {/* Filtres de recherche */}
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <div style={{ position: "relative", minWidth: "220px" }}>
                  <Search
                    size={16}
                    style={{
                      position: "absolute",
                      left: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9ca3af",
                    }}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher marque ou modèle..."
                    className="form-control"
                    style={{ paddingLeft: "2.2rem", fontSize: "0.85rem" }}
                  />
                </div>

                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="form-control"
                  style={{ minWidth: "160px", fontSize: "0.85rem" }}
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

            <div className="nouveautes-available-grid">
              {availableCatalogModels.map((model) => {
                const imgUrl = model.images?.[0]?.url || "/img/placeholder-moto.jpg";
                const price =
                  model.promoPrice && model.promoPrice > 0 ? model.promoPrice : model.price;

                return (
                  <div
                    key={model.id}
                    className="nouveaute-card"
                    style={{
                      opacity: model.isAlreadyAdded ? 0.5 : 1,
                      position: "relative",
                    }}
                  >
                    <div className="nouveaute-card-img-wrap" style={{ height: "130px" }}>
                      <img
                        src={cleanSrc(imgUrl)}
                        alt={model.name}
                        className="nouveaute-card-img"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = "/img/placeholder-moto.jpg";
                        }}
                      />
                    </div>

                    <div className="nouveaute-card-body" style={{ padding: "0.75rem" }}>
                      <div className="nouveaute-card-brand">{model.brand.name}</div>
                      <div className="nouveaute-card-name" style={{ fontSize: "0.88rem" }}>
                        {model.name}
                      </div>

                      <div className="nouveaute-card-price" style={{ fontSize: "0.8rem", marginBottom: "0.6rem" }}>
                        {price ? (
                          `${price.toLocaleString("fr-FR")} ${model.currency || "DT"}`
                        ) : (
                          <span style={{ color: "#9ca3af" }}>En arrivage</span>
                        )}
                      </div>

                      {model.isAlreadyAdded ? (
                        <div
                          style={{
                            textAlign: "center",
                            fontSize: "0.75rem",
                            color: "#10b981",
                            fontWeight: 700,
                            padding: "0.4rem",
                            background: "rgba(16, 185, 129, 0.1)",
                            borderRadius: "4px",
                          }}
                        >
                          ✓ Déjà dans Nouveautés ({activePos === "HAUT" ? "Haut" : "Bas"})
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addCatalogModel(model)}
                          disabled={savingId === model.id}
                          className="btn-primary"
                          style={{
                            width: "100%",
                            padding: "0.45rem",
                            fontSize: "0.78rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.3rem",
                          }}
                        >
                          <Plus size={14} /> Ajouter à Nouveautés ({activePos === "HAUT" ? "Haut" : "Bas"})
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
