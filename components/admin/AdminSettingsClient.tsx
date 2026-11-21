"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Sliders,
  CheckCircle2,
  XCircle,
  RefreshCw,
  LayoutTemplate,
  Footprints,
  ExternalLink,
} from "lucide-react";

interface SiteSettingsData {
  id: string;
  useHomeNavEverywhere: boolean;
  hideFooterOnOtherPages: boolean;
  carouselVisible?: boolean;
  carouselBottomVisible?: boolean;
  carouselDelayMs?: number;
}

export default function AdminSettingsClient() {
  const [settings, setSettings] = useState<SiteSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Erreur de chargement des paramètres");
      const data = await res.json();
      setSettings(data.settings);
    } catch (err: any) {
      showToast(err.message || "Erreur", "err");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateSetting = async (key: keyof SiteSettingsData, value: boolean) => {
    if (!settings) return;
    setSavingKey(key);

    // Optimistic update
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });

      if (!res.ok) {
        throw new Error("Erreur lors de la sauvegarde");
      }

      const data = await res.json();
      setSettings(data.settings);
      showToast("✅ Paramètre mis à jour avec succès !");
    } catch (err: any) {
      showToast(err.message || "Erreur lors de la mise à jour", "err");
      loadSettings();
    } finally {
      setSavingKey(null);
    }
  };

  if (loading || !settings) {
    return (
      <div style={{ textAlign: "center", padding: "4rem", color: "#9ca3af" }}>
        <RefreshCw className="animate-spin inline-block mr-2" size={24} />
        Chargement des paramètres...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto" }}>
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

      {/* PARAMÈTRE 1 : MENU NAVIGATION */}
      <div className="admin-card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
              <LayoutTemplate className="text-red-500" size={22} />
              <h2 className="admin-card-title" style={{ margin: 0 }}>
                Menu de Navigation (Header)
              </h2>
            </div>
            <p style={{ color: "#9ca3af", fontSize: "0.88rem", margin: "0 0 1rem 0" }}>
              Choisissez le style du menu de navigation pour les pages intérieures (marques, modèles, comparateur, etc.).
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                padding: "0.25rem 0.65rem",
                borderRadius: "999px",
                background: settings.useHomeNavEverywhere ? "rgba(22, 163, 74, 0.2)" : "rgba(107, 114, 128, 0.2)",
                color: settings.useHomeNavEverywhere ? "#4ade80" : "#9ca3af",
                border: settings.useHomeNavEverywhere ? "1px solid rgba(22, 163, 74, 0.4)" : "1px solid rgba(107, 114, 128, 0.3)",
              }}
            >
              {settings.useHomeNavEverywhere ? "Style Accueil Partout" : "Menu Classique Séparé"}
            </span>

            {/* Toggle Switch */}
            <label
              style={{
                position: "relative",
                display: "inline-block",
                width: "56px",
                height: "30px",
                cursor: savingKey === "useHomeNavEverywhere" ? "not-allowed" : "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={settings.useHomeNavEverywhere}
                disabled={savingKey === "useHomeNavEverywhere"}
                onChange={(e) => updateSetting("useHomeNavEverywhere", e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.useHomeNavEverywhere ? "#dc2626" : "#374151",
                  transition: "0.3s",
                  borderRadius: "34px",
                  boxShadow: settings.useHomeNavEverywhere ? "0 0 10px rgba(220, 38, 38, 0.5)" : "none",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    content: "",
                    height: "22px",
                    width: "22px",
                    left: settings.useHomeNavEverywhere ? "28px" : "4px",
                    bottom: "4px",
                    backgroundColor: "white",
                    transition: "0.3s",
                    borderRadius: "50%",
                  }}
                />
              </span>
            </label>
          </div>
        </div>

        <div
          style={{
            background: "rgba(0, 0, 0, 0.25)",
            padding: "1rem",
            borderRadius: "0.6rem",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            fontSize: "0.85rem",
            color: "#d1d5db",
            lineHeight: 1.5,
          }}
        >
          {settings.useHomeNavEverywhere ? (
            <div>
              <p style={{ margin: 0 }}>
                🟢 <strong>Option activée :</strong> Le menu rustique de la page d&apos;accueil (avec les 4 boutons métalliques, la recherche avec fenêtre déroulante et le logo version 2) est <strong>appliqué sur l&apos;ensemble du site</strong>.
              </p>
            </div>
          ) : (
            <div>
              <p style={{ margin: 0 }}>
                ⚪ <strong>Option désactivée :</strong> Les pages intérieures conservent le menu simple classique. Seule la page d&apos;accueil affiche le menu rustique.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PARAMÈTRE 2 : PIED DE PAGE (FOOTER) */}
      <div className="admin-card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
              <Footprints className="text-red-500" size={22} />
              <h2 className="admin-card-title" style={{ margin: 0 }}>
                Pied de page (Footer)
              </h2>
            </div>
            <p style={{ color: "#9ca3af", fontSize: "0.88rem", margin: "0 0 1rem 0" }}>
              Configurez la visibilité du footer sur les pages du site en dehors de la page d&apos;accueil.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                padding: "0.25rem 0.65rem",
                borderRadius: "999px",
                background: settings.hideFooterOnOtherPages ? "rgba(220, 38, 38, 0.2)" : "rgba(22, 163, 74, 0.2)",
                color: settings.hideFooterOnOtherPages ? "#f87171" : "#4ade80",
                border: settings.hideFooterOnOtherPages ? "1px solid rgba(220, 38, 38, 0.4)" : "1px solid rgba(22, 163, 74, 0.4)",
              }}
            >
              {settings.hideFooterOnOtherPages ? "Masqué sur les autres pages" : "Visible partout"}
            </span>

            {/* Toggle Switch */}
            <label
              style={{
                position: "relative",
                display: "inline-block",
                width: "56px",
                height: "30px",
                cursor: savingKey === "hideFooterOnOtherPages" ? "not-allowed" : "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={settings.hideFooterOnOtherPages}
                disabled={savingKey === "hideFooterOnOtherPages"}
                onChange={(e) => updateSetting("hideFooterOnOtherPages", e.target.checked)}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span
                style={{
                  position: "absolute",
                  cursor: "pointer",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: settings.hideFooterOnOtherPages ? "#dc2626" : "#374151",
                  transition: "0.3s",
                  borderRadius: "34px",
                  boxShadow: settings.hideFooterOnOtherPages ? "0 0 10px rgba(220, 38, 38, 0.5)" : "none",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    content: "",
                    height: "22px",
                    width: "22px",
                    left: settings.hideFooterOnOtherPages ? "28px" : "4px",
                    bottom: "4px",
                    backgroundColor: "white",
                    transition: "0.3s",
                    borderRadius: "50%",
                  }}
                />
              </span>
            </label>
          </div>
        </div>

        <div
          style={{
            background: "rgba(0, 0, 0, 0.25)",
            padding: "1rem",
            borderRadius: "0.6rem",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            fontSize: "0.85rem",
            color: "#d1d5db",
            lineHeight: 1.5,
          }}
        >
          {settings.hideFooterOnOtherPages ? (
            <div>
              <p style={{ margin: 0 }}>
                🔴 <strong>Option activée :</strong> Le pied de page est <strong>masqué sur toutes les pages intérieures</strong> (marques, modèles, catégories...) et <strong>conservé uniquement sur la page d&apos;accueil</strong>.
              </p>
            </div>
          ) : (
            <div>
              <p style={{ margin: 0 }}>
                🟢 <strong>Option désactivée :</strong> Le pied de page est affiché sur toutes les pages du site.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* INFORMATION : PAGE CONNEXION */}
      <div
        className="admin-card"
        style={{
          background: "rgba(17, 24, 39, 0.4)",
          border: "1px dashed #374151",
        }}
      >
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#e5e7eb", marginBottom: "0.5rem" }}>
          ℹ️ Page de Connexion (/connexion)
        </h3>
        <p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: 0 }}>
          Le menu de navigation et le pied de page sont automatiquement désactivés sur la page de connexion pour offrir une expérience épurée et sans distraction. Une flèche de retour flottante est positionnée en haut à droite pour permettre aux visiteurs de revenir immédiatement à la page où ils se trouvaient.
        </p>
      </div>
    </div>
  );
}
