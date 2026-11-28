"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Send,
  Save,
  Trash2,
  Edit3,
  Copy,
  RefreshCw,
  Users,
  Smartphone,
  Monitor,
  CheckCircle2,
  XCircle,
  Upload,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { uploadImageAction } from "@/lib/upload";

interface PushCampaign {
  id: string;
  title: string;
  body: string;
  url: string | null;
  imageUrl: string | null;
  status: "DRAFT" | "SENT";
  sentCount: number;
  failedCount: number;
  sentAt: string | null;
  createdAt: string;
}

interface NotificationStats {
  totalSubscribers: number;
  mobileSubscribers: number;
  desktopSubscribers: number;
}

const QUICK_EMOJIS = ["🔥", "🏍️", "⚡", "💥", "🆕", "🎁", "🚨"];
const QUICK_URLS = [
  { label: "Accueil", url: "/" },
  { label: "Tous les modèles", url: "/modeles" },
  { label: "Occasions", url: "/occasion" },
  { label: "Comparateur", url: "/comparateur" },
];

export default function AdminNotificationsClient({
  hasVapidKeys,
}: {
  hasVapidKeys: boolean;
}) {
  const [stats, setStats] = useState<NotificationStats>({
    totalSubscribers: 0,
    mobileSubscribers: 0,
    desktopSubscribers: 0,
  });
  const [pushPromptEnabled, setPushPromptEnabled] = useState(true);
  const [campaigns, setCampaigns] = useState<PushCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [togglingPrompt, setTogglingPrompt] = useState(false);

  // Formulaire de préparation
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [imageUrl, setImageUrl] = useState("");

  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/notifications");
      if (!res.ok) throw new Error("Erreur de chargement des notifications");
      const data = await res.json();
      setStats(data.stats);
      setPushPromptEnabled(data.pushPromptEnabled);
      setCampaigns(data.campaigns || []);
    } catch (err: any) {
      showToast(err.message || "Erreur", "err");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setBody("");
    setUrl("/");
    setImageUrl("");
  };

  const handleTogglePrompt = async (enabled: boolean) => {
    setTogglingPrompt(true);
    setPushPromptEnabled(enabled);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pushPromptEnabled: enabled }),
      });
      if (!res.ok) throw new Error("Erreur lors de la sauvegarde");
      showToast(
        enabled
          ? "✅ Alerte d'abonnement affichée aux visiteurs"
          : "ℹ️ Alerte d'abonnement masquée sur le site"
      );
    } catch (err: any) {
      showToast(err.message, "err");
      loadData();
    } finally {
      setTogglingPrompt(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadedPath = await uploadImageAction(formData, "notifications");
      if (uploadedPath) {
        setImageUrl(uploadedPath);
        showToast("🖼️ Image uploadée avec succès");
      } else {
        showToast("Échec de l'upload de l'image", "err");
      }
    } catch {
      showToast("Erreur lors de l'upload", "err");
    } finally {
      setUploadingImage(false);
    }
  };

  const saveDraft = async (): Promise<PushCampaign | null> => {
    if (!title.trim() || !body.trim()) {
      showToast("Veuillez saisir un titre et un message.", "err");
      return null;
    }

    const method = editingId ? "PATCH" : "POST";
    const res = await fetch("/api/admin/notifications", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(editingId ? { id: editingId } : {}),
        title,
        body,
        url,
        imageUrl,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Erreur d'enregistrement");
    }
    return data.campaign;
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await saveDraft();
      showToast(
        editingId
          ? "✅ Message préparé mis à jour !"
          : "💾 Message enregistré en brouillon (prêt à être envoyé) !"
      );
      resetForm();
      await loadData();
    } catch (err: any) {
      showToast(err.message, "err");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAndSendNow = async () => {
    if (stats.totalSubscribers === 0) {
      showToast("Aucun abonné enregistré pour le moment.", "err");
      return;
    }
    if (!confirm(`Envoyer cette notification à ${stats.totalSubscribers} abonné(s) maintenant ?`)) {
      return;
    }

    setSubmitting(true);
    try {
      const saved = await saveDraft();
      if (!saved) {
        setSubmitting(false);
        return;
      }
      await sendCampaignById(saved.id);
      resetForm();
    } catch (err: any) {
      showToast(err.message, "err");
    } finally {
      setSubmitting(false);
    }
  };

  const sendCampaignById = async (id: string) => {
    setSendingId(id);
    try {
      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi");
      showToast(
        `🚀 Notification envoyée ! (${data.sentCount} reçue(s)${
          data.failedCount > 0 ? `, ${data.failedCount} échec(s)` : ""
        })`
      );
      await loadData();
    } catch (err: any) {
      showToast(err.message, "err");
    } finally {
      setSendingId(null);
    }
  };

  const handleEdit = (c: PushCampaign) => {
    setEditingId(c.id);
    setTitle(c.title);
    setBody(c.body);
    setUrl(c.url || "/");
    setImageUrl(c.imageUrl || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "duplicate" }),
      });
      if (!res.ok) throw new Error("Erreur de duplication");
      showToast("📋 Notification dupliquée dans les messages préparés !");
      await loadData();
    } catch (err: any) {
      showToast(err.message, "err");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    try {
      const res = await fetch(`/api/admin/notifications?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erreur de suppression");
      if (editingId === id) resetForm();
      showToast("🗑️ Message supprimé.");
      await loadData();
    } catch (err: any) {
      showToast(err.message, "err");
    }
  };

  const drafts = campaigns.filter((c) => c.status === "DRAFT");
  const sentList = campaigns.filter((c) => c.status === "SENT");

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "#9ca3af" }}>
        <RefreshCw className="animate-spin inline-block mr-2" size={24} />
        Chargement du studio notifications...
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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

      {!hasVapidKeys && (
        <div
          className="admin-card"
          style={{
            background: "rgba(220, 38, 38, 0.15)",
            borderColor: "rgba(220, 38, 38, 0.5)",
            color: "#fca5a5",
          }}
        >
          ⚠️ Les clés VAPID ne sont pas détectées dans l&apos;environnement serveur.
        </div>
      )}

      {/* Statistiques + Toggle Prompt */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "1rem",
        }}
      >
        <div className="admin-card" style={{ marginBottom: 0, padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#9ca3af", fontSize: "0.82rem" }}>
            <Users size={16} className="text-red-400" />
            Abonnés Actifs
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#fff", marginTop: "0.35rem" }}>
            {stats.totalSubscribers}
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.4rem", fontSize: "0.75rem", color: "#9ca3af" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              <Smartphone size={12} /> {stats.mobileSubscribers} Mobile
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
              <Monitor size={12} /> {stats.desktopSubscribers} Desktop
            </span>
          </div>
        </div>

        <div className="admin-card" style={{ marginBottom: 0, padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#9ca3af", fontSize: "0.82rem" }}>
            <Edit3 size={16} className="text-amber-400" />
            Messages Préparés
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#fff", marginTop: "0.35rem" }}>
            {drafts.length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.4rem" }}>
            Prêts à être envoyés en 1 clic
          </div>
        </div>

        <div className="admin-card" style={{ marginBottom: 0, padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", color: "#9ca3af", fontSize: "0.82rem" }}>
            <Send size={16} className="text-emerald-400" />
            Campagnes Envoyées
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: 800, color: "#fff", marginTop: "0.35rem" }}>
            {sentList.length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.4rem" }}>
            Historique complet conservé
          </div>
        </div>

        {/* Toggle d'affichage de l'alerte sur le site */}
        <div className="admin-card" style={{ marginBottom: 0, padding: "1.25rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#e5e7eb" }}>
              Alerte visiteurs sur le site
            </span>
            <label
              style={{
                position: "relative",
                display: "inline-block",
                width: "48px",
                height: "26px",
                cursor: togglingPrompt ? "not-allowed" : "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={pushPromptEnabled}
                disabled={togglingPrompt}
                onChange={(e) => handleTogglePrompt(e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: pushPromptEnabled ? "#dc2626" : "#374151",
                  borderRadius: "34px",
                  transition: "0.3s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    height: "20px",
                    width: "20px",
                    left: pushPromptEnabled ? "24px" : "3px",
                    bottom: "3px",
                    backgroundColor: "white",
                    borderRadius: "50%",
                    transition: "0.3s",
                  }}
                />
              </span>
            </label>
          </div>
          <div style={{ fontSize: "0.75rem", color: pushPromptEnabled ? "#4ade80" : "#9ca3af", marginTop: "0.6rem" }}>
            {pushPromptEnabled
              ? "🟢 L'alerte flottante s'affiche aux nouveaux visiteurs"
              : "⚪ Alerte d'inscription masquée"}
          </div>
        </div>
      </div>

      {/* Studio de création + Aperçu en direct */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.25rem",
          alignItems: "start",
        }}
      >
        {/* Formulaire */}
        <form onSubmit={handleSaveDraft} className="admin-card" style={{ marginBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h2 className="admin-card-title" style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Sparkles size={18} className="text-red-500" />
              {editingId ? "Modifier le message préparé" : "Préparer un nouveau message"}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
                style={{ fontSize: "0.75rem", padding: "0.3rem 0.65rem" }}
              >
                Annuler
              </button>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.82rem", color: "#d1d5db", marginBottom: "0.35rem", fontWeight: 600 }}>
                Titre de la notification *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: 🔥 Nouvel arrivage Peugeot Django 2026 !"
                className="admin-input"
                maxLength={80}
                required
              />
              <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.45rem", flexWrap: "wrap" }}>
                {QUICK_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setTitle((prev) => `${em} ${prev}`.trim())}
                    style={{
                      background: "#111827",
                      border: "1px solid #374151",
                      borderRadius: "6px",
                      padding: "0.15rem 0.45rem",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                    title="Ajouter cet emoji"
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", color: "#d1d5db", marginBottom: "0.35rem", fontWeight: 600 }}>
                Message détaillé *
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Ex: Profitez d'une remise exceptionnelle de 800 DT jusqu'à dimanche sur toute la gamme !"
                className="admin-input"
                rows={3}
                maxLength={220}
                required
                style={{ resize: "vertical" }}
              />
              <div style={{ textAlign: "right", fontSize: "0.72rem", color: "#6b7280", marginTop: "0.2rem" }}>
                {body.length} / 220 caractères
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", color: "#d1d5db", marginBottom: "0.35rem", fontWeight: 600 }}>
                Lien au clic (URL de destination)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="/marques/PEUGEOT ou https://..."
                className="admin-input"
              />
              <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.45rem", flexWrap: "wrap" }}>
                {QUICK_URLS.map((q) => (
                  <button
                    key={q.url}
                    type="button"
                    onClick={() => setUrl(q.url)}
                    style={{
                      background: url === q.url ? "rgba(220,38,38,0.2)" : "#111827",
                      border: url === q.url ? "1px solid rgba(220,38,38,0.5)" : "1px solid #374151",
                      color: url === q.url ? "#fca5a5" : "#9ca3af",
                      borderRadius: "6px",
                      padding: "0.2rem 0.55rem",
                      cursor: "pointer",
                      fontSize: "0.72rem",
                    }}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", color: "#d1d5db", marginBottom: "0.35rem", fontWeight: 600 }}>
                Image bannière (Optionnel — pour Rich Push)
              </label>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/img/notifications/... ou laisser vide"
                  className="admin-input"
                  style={{ flex: 1, minWidth: "160px" }}
                />
                <label
                  className="btn-secondary"
                  style={{
                    cursor: uploadingImage ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    margin: 0,
                  }}
                >
                  <Upload size={14} />
                  {uploadingImage ? "Upload..." : "Importer"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", paddingTop: "0.5rem" }}>
              <button
                type="submit"
                disabled={submitting}
                className="btn-secondary"
                style={{
                  flex: 1,
                  minWidth: "160px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  padding: "0.7rem 1rem",
                }}
              >
                <Save size={16} />
                {editingId ? "Mettre à jour" : "Enregistrer (Brouillon)"}
              </button>

              <button
                type="button"
                onClick={handleSaveAndSendNow}
                disabled={submitting || !hasVapidKeys}
                className="btn-primary"
                style={{
                  flex: 1,
                  minWidth: "160px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  padding: "0.7rem 1rem",
                }}
              >
                <Send size={16} />
                Envoyer maintenant
              </button>
            </div>
          </div>
        </form>

        {/* Aperçu en direct */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <h2 className="admin-card-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Bell size={18} className="text-red-500" />
            Aperçu en temps réel (Mobile & Desktop)
          </h2>

          <div
            style={{
              background: "linear-gradient(145deg, #0b0d13, #171b26)",
              borderRadius: "1rem",
              padding: "1.25rem",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Mockup Notification Card */}
            <div
              style={{
                background: "#1f2430",
                borderRadius: "14px",
                padding: "0.95rem",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.55rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                  <img
                    src="/img/favicon-32x32.png"
                    alt=""
                    style={{ width: "16px", height: "16px", borderRadius: "4px" }}
                  />
                  <span style={{ fontSize: "0.72rem", color: "#9ca3af", fontWeight: 600 }}>
                    actumoto.tn • à l&apos;instant
                  </span>
                </div>
                <span style={{ fontSize: "0.68rem", color: "#6b7280" }}>Chrome</span>
              </div>

              <div style={{ display: "flex", gap: "0.85rem", alignItems: "flex-start" }}>
                <img
                  src="/img/icon-192x192.png"
                  alt="Actumoto"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    objectFit: "cover",
                    flexShrink: 0,
                    background: "#000",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "#fff", wordBreak: "break-word" }}>
                    {title || "🔥 Titre de votre notification"}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#d1d5db", marginTop: "0.2rem", lineHeight: 1.4, wordBreak: "break-word" }}>
                    {body || "Votre message apparaîtra ici tel que le recevront vos visiteurs sur téléphone et ordinateur."}
                  </div>
                </div>
              </div>

              {imageUrl && (
                <div style={{ marginTop: "0.75rem", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <img
                    src={imageUrl}
                    alt="Aperçu bannière"
                    style={{ width: "100%", maxHeight: "150px", objectFit: "cover", display: "block" }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              <div
                style={{
                  marginTop: "0.7rem",
                  paddingTop: "0.55rem",
                  borderTop: "1px solid rgba(255,255,255,0.08)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.75rem",
                }}
              >
                <span style={{ color: "#f87171", fontWeight: 600 }}>Voir maintenant</span>
                <span style={{ color: "#6b7280", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                  <ExternalLink size={11} /> {url || "/"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Messages préparés (Brouillons) */}
      <div className="admin-card" style={{ marginBottom: 0 }}>
        <h2 className="admin-card-title">📝 Messages préparés prêts à l&apos;envoi ({drafts.length})</h2>
        {drafts.length === 0 ? (
          <p style={{ color: "#9ca3af", fontSize: "0.88rem", margin: 0 }}>
            Aucun brouillon préparé. Rédigez un message ci-dessus et cliquez sur « Enregistrer (Brouillon) ».
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {drafts.map((c) => (
              <div
                key={c.id}
                style={{
                  background: "rgba(17, 24, 39, 0.7)",
                  border: "1px solid #374151",
                  borderRadius: "0.75rem",
                  padding: "0.95rem 1.1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: "220px" }}>
                  <div style={{ fontWeight: 700, color: "#fff", fontSize: "0.98rem" }}>{c.title}</div>
                  <div style={{ color: "#d1d5db", fontSize: "0.84rem", marginTop: "0.2rem" }}>{c.body}</div>
                  <div style={{ color: "#9ca3af", fontSize: "0.75rem", marginTop: "0.35rem" }}>
                    Lien : <code style={{ color: "#fca5a5" }}>{c.url || "/"}</code>
                    {c.imageUrl && " • 🖼️ Image jointe"}
                  </div>
                </div>

                <div className="admin-item-actions" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        confirm(
                          `Envoyer "${c.title}" à ${stats.totalSubscribers} abonné(s) maintenant ?`
                        )
                      ) {
                        sendCampaignById(c.id);
                      }
                    }}
                    disabled={sendingId === c.id || !hasVapidKeys}
                    className="btn-primary"
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    <Send size={14} />
                    {sendingId === c.id ? "Envoi..." : "Envoyer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(c)}
                    className="btn-edit"
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                  >
                    <Edit3 size={14} /> Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="btn-danger"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historique des notifications envoyées */}
      <div className="admin-card" style={{ marginBottom: 0 }}>
        <h2 className="admin-card-title">📨 Historique des notifications envoyées ({sentList.length})</h2>
        {sentList.length === 0 ? (
          <p style={{ color: "#9ca3af", fontSize: "0.88rem", margin: 0 }}>
            Aucune notification envoyée pour le moment.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {sentList.map((c) => (
              <div
                key={c.id}
                style={{
                  background: "rgba(17, 24, 39, 0.5)",
                  border: "1px solid rgba(55, 65, 81, 0.7)",
                  borderRadius: "0.75rem",
                  padding: "0.95rem 1.1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: "220px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <span className="badge badge-green">Envoyée</span>
                    <span style={{ fontWeight: 700, color: "#fff", fontSize: "0.96rem" }}>{c.title}</span>
                  </div>
                  <div style={{ color: "#d1d5db", fontSize: "0.84rem", marginTop: "0.25rem" }}>{c.body}</div>
                  <div style={{ color: "#9ca3af", fontSize: "0.75rem", marginTop: "0.35rem" }}>
                    {c.sentAt
                      ? `Envoyée le ${new Date(c.sentAt).toLocaleString("fr-FR")}`
                      : ""}{" "}
                    • <strong style={{ color: "#4ade80" }}>{c.sentCount} délivrée(s)</strong>
                    {c.failedCount > 0 && ` • ${c.failedCount} expirée(s)`}
                  </div>
                </div>

                <div className="admin-item-actions" style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(c.id)}
                    className="btn-secondary"
                    style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}
                    title="Réutiliser ce message en brouillon"
                  >
                    <Copy size={14} /> Réutiliser
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="btn-danger"
                    title="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
