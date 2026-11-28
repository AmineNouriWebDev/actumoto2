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
  ShieldCheck,
  BarChart3,
  Search,
  Save,
} from "lucide-react";

interface SiteSettingsData {
  id: string;
  useHomeNavEverywhere: boolean;
  hideFooterOnOtherPages: boolean;
  showGoogleLogin?: boolean;
  showFacebookLogin?: boolean;
  carouselVisible?: boolean;
  carouselBottomVisible?: boolean;
  carouselDelayMs?: number;
  ga4Enabled?: boolean;
  ga4MeasurementId?: string;
  googleSiteVerification?: string | null;
  metaPixelEnabled?: boolean;
  metaPixelId?: string | null;
  seoSiteTitle?: string | null;
  seoSiteDescription?: string | null;
  seoKeywords?: string | null;
}

export default function AdminSettingsClient() {
  const [settings, setSettings] = useState<SiteSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savingSeo, setSavingSeo] = useState(false);
  const [ga4Id, setGa4Id] = useState("G-WGY6N6E618");
  const [gscCode, setGscCode] = useState("");
  const [pixelId, setPixelId] = useState("2443539866090948");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
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
      if (data.settings) {
        setGa4Id(data.settings.ga4MeasurementId || "G-WGY6N6E618");
        setGscCode(data.settings.googleSiteVerification || "");
        setPixelId(data.settings.metaPixelId || "2443539866090948");
        setSeoTitle(data.settings.seoSiteTitle || "");
        setSeoDesc(data.settings.seoSiteDescription || "");
        setSeoKeywords(data.settings.seoKeywords || "");
      }
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

  const handleSaveSeoSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSeo(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ga4MeasurementId: ga4Id,
          googleSiteVerification: gscCode,
          metaPixelId: pixelId,
          seoSiteTitle: seoTitle,
          seoSiteDescription: seoDesc,
          seoKeywords: seoKeywords,
        }),
      });
      if (!res.ok) throw new Error("Erreur lors de la sauvegarde SEO");
      const data = await res.json();
      setSettings(data.settings);
      showToast("✅ Paramètres SEO & Suivi Google enregistrés !");
    } catch (err: any) {
      showToast(err.message || "Erreur", "err");
    } finally {
      setSavingSeo(false);
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

      {/* PARAMÈTRE 3 : BOUTONS DE CONNEXION RÉSEAUX SOCIAUX */}
      <div className="admin-card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.4rem" }}>
          <ShieldCheck className="text-red-500" size={22} />
          <h2 className="admin-card-title" style={{ margin: 0 }}>
            Boutons de connexion (Réseaux Sociaux)
          </h2>
        </div>
        <p style={{ color: "#9ca3af", fontSize: "0.88rem", margin: "0 0 1.25rem 0" }}>
          Affichez ou masquez visuellement les boutons Google et Facebook sur les pages de connexion et d&apos;inscription tout en conservant la configuration technique intacte.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Toggle Google */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              padding: "1rem",
              borderRadius: "0.6rem",
              background: "rgba(0, 0, 0, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: "#f9fafb", fontSize: "0.95rem" }}>
                Bouton « Continuer avec Google »
              </div>
              <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.15rem" }}>
                {settings.showGoogleLogin !== false
                  ? "Affiché sur les pages /connexion et /inscription"
                  : "Masqué visuellement pour les visiteurs"}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  padding: "0.25rem 0.65rem",
                  borderRadius: "999px",
                  background: settings.showGoogleLogin !== false ? "rgba(22, 163, 74, 0.2)" : "rgba(107, 114, 128, 0.2)",
                  color: settings.showGoogleLogin !== false ? "#4ade80" : "#9ca3af",
                  border: settings.showGoogleLogin !== false ? "1px solid rgba(22, 163, 74, 0.4)" : "1px solid rgba(107, 114, 128, 0.3)",
                }}
              >
                {settings.showGoogleLogin !== false ? "Visible" : "Masqué"}
              </span>

              <label
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: "56px",
                  height: "30px",
                  cursor: savingKey === "showGoogleLogin" ? "not-allowed" : "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={settings.showGoogleLogin !== false}
                  disabled={savingKey === "showGoogleLogin"}
                  onChange={(e) => updateSetting("showGoogleLogin", e.target.checked)}
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
                    backgroundColor: settings.showGoogleLogin !== false ? "#dc2626" : "#374151",
                    transition: "0.3s",
                    borderRadius: "34px",
                    boxShadow: settings.showGoogleLogin !== false ? "0 0 10px rgba(220, 38, 38, 0.5)" : "none",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      content: "",
                      height: "22px",
                      width: "22px",
                      left: settings.showGoogleLogin !== false ? "28px" : "4px",
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

          {/* Toggle Facebook */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
              padding: "1rem",
              borderRadius: "0.6rem",
              background: "rgba(0, 0, 0, 0.25)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: "#f9fafb", fontSize: "0.95rem" }}>
                Bouton « Continuer avec Facebook »
              </div>
              <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "0.15rem" }}>
                {settings.showFacebookLogin !== false
                  ? "Affiché sur les pages /connexion et /inscription"
                  : "Masqué visuellement pour les visiteurs (code conservé)"}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  padding: "0.25rem 0.65rem",
                  borderRadius: "999px",
                  background: settings.showFacebookLogin !== false ? "rgba(22, 163, 74, 0.2)" : "rgba(220, 38, 38, 0.2)",
                  color: settings.showFacebookLogin !== false ? "#4ade80" : "#f87171",
                  border: settings.showFacebookLogin !== false ? "1px solid rgba(22, 163, 74, 0.4)" : "1px solid rgba(220, 38, 38, 0.4)",
                }}
              >
                {settings.showFacebookLogin !== false ? "Visible" : "Masqué"}
              </span>

              <label
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: "56px",
                  height: "30px",
                  cursor: savingKey === "showFacebookLogin" ? "not-allowed" : "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={settings.showFacebookLogin !== false}
                  disabled={savingKey === "showFacebookLogin"}
                  onChange={(e) => updateSetting("showFacebookLogin", e.target.checked)}
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
                    backgroundColor: settings.showFacebookLogin !== false ? "#dc2626" : "#374151",
                    transition: "0.3s",
                    borderRadius: "34px",
                    boxShadow: settings.showFacebookLogin !== false ? "0 0 10px rgba(220, 38, 38, 0.5)" : "none",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      content: "",
                      height: "22px",
                      width: "22px",
                      left: settings.showFacebookLogin !== false ? "28px" : "4px",
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
        </div>
      </div>

      {/* PARAMÈTRE 4 : SEO, GOOGLE ANALYTICS 4 & SEARCH CONSOLE */}
      <form onSubmit={handleSaveSeoSettings} className="admin-card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <BarChart3 className="text-red-500" size={22} />
            <h2 className="admin-card-title" style={{ margin: 0 }}>
              SEO, Google Analytics 4 & Search Console
            </h2>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: "0.75rem", padding: "0.3rem 0.65rem" }}>
              🗺️ Sitemap XML
            </a>
            <a href="/robots.txt" target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: "0.75rem", padding: "0.3rem 0.65rem" }}>
              🤖 Robots.txt
            </a>
          </div>
        </div>
        <p style={{ color: "#9ca3af", fontSize: "0.88rem", margin: "0 0 1.25rem 0" }}>
          Conservez vos statistiques existantes (GA4, Google Search Console, Meta Pixel) lors du basculement et gérez le référencement global du site. Schema.org et la balise auteur MaxSolving sont intégrés automatiquement.
        </p>

        {/* Toggles GA4 & Meta Pixel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "1rem", borderRadius: "0.6rem", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 600, color: "#f9fafb", fontSize: "0.95rem" }}>
                Google Analytics 4 (gtag.js)
              </div>
              <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                Active la balise de suivi GA4 sur toutes les pages du site (y compris navigation SPA).
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "999px", background: settings.ga4Enabled !== false ? "rgba(22,163,74,0.2)" : "rgba(107,114,128,0.2)", color: settings.ga4Enabled !== false ? "#4ade80" : "#9ca3af" }}>
                {settings.ga4Enabled !== false ? "Actif" : "Désactivé"}
              </span>
              <label style={{ position: "relative", display: "inline-block", width: "56px", height: "30px", cursor: savingKey === "ga4Enabled" ? "not-allowed" : "pointer" }}>
                <input
                  type="checkbox"
                  checked={settings.ga4Enabled !== false}
                  disabled={savingKey === "ga4Enabled"}
                  onChange={(e) => updateSetting("ga4Enabled", e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{ position: "absolute", inset: 0, backgroundColor: settings.ga4Enabled !== false ? "#dc2626" : "#374151", borderRadius: "34px", transition: "0.3s" }}>
                  <span style={{ position: "absolute", height: "22px", width: "22px", left: settings.ga4Enabled !== false ? "28px" : "4px", bottom: "4px", backgroundColor: "white", borderRadius: "50%", transition: "0.3s" }} />
                </span>
              </label>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", padding: "1rem", borderRadius: "0.6rem", background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.06)", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 600, color: "#f9fafb", fontSize: "0.95rem" }}>
                Meta Pixel (Facebook Ads)
              </div>
              <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                Suivi des événements PageView avec l&apos;ancien Pixel Facebook du site.
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: "999px", background: settings.metaPixelEnabled ? "rgba(22,163,74,0.2)" : "rgba(107,114,128,0.2)", color: settings.metaPixelEnabled ? "#4ade80" : "#9ca3af" }}>
                {settings.metaPixelEnabled ? "Actif" : "Désactivé"}
              </span>
              <label style={{ position: "relative", display: "inline-block", width: "56px", height: "30px", cursor: savingKey === "metaPixelEnabled" ? "not-allowed" : "pointer" }}>
                <input
                  type="checkbox"
                  checked={settings.metaPixelEnabled === true}
                  disabled={savingKey === "metaPixelEnabled"}
                  onChange={(e) => updateSetting("metaPixelEnabled", e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{ position: "absolute", inset: 0, backgroundColor: settings.metaPixelEnabled ? "#dc2626" : "#374151", borderRadius: "34px", transition: "0.3s" }}>
                  <span style={{ position: "absolute", height: "22px", width: "22px", left: settings.metaPixelEnabled ? "28px" : "4px", bottom: "4px", backgroundColor: "white", borderRadius: "50%", transition: "0.3s" }} />
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Champs de configuration SEO & IDs */}
        <div className="admin-form-grid">
          <div className="form-group">
            <label>ID Google Analytics 4 (Measurement ID)</label>
            <input
              type="text"
              value={ga4Id}
              onChange={(e) => setGa4Id(e.target.value)}
              placeholder="G-WGY6N6E618"
            />
            <span className="form-hint">Identifiant de l&apos;ancien site : G-WGY6N6E618</span>
          </div>

          <div className="form-group">
            <label>Code Google Search Console (meta verification)</label>
            <input
              type="text"
              value={gscCode}
              onChange={(e) => setGscCode(e.target.value)}
              placeholder="Ex: xYz123AbC..."
            />
            <span className="form-hint">Valeur du champ content=&quot;...&quot; de la balise google-site-verification</span>
          </div>

          <div className="form-group">
            <label>ID Meta Pixel (Facebook)</label>
            <input
              type="text"
              value={pixelId}
              onChange={(e) => setPixelId(e.target.value)}
              placeholder="2443539866090948"
            />
          </div>

          <div className="form-group">
            <label>Titre SEO Global (Page d&apos;accueil)</label>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              placeholder="Comparateur de Prix Moto & Scooter N°1 en Tunisie | actumoto.tn"
            />
          </div>

          <div className="form-group span-2">
            <label>Méta-Description Globale SEO</label>
            <textarea
              rows={2}
              value={seoDesc}
              onChange={(e) => setSeoDesc(e.target.value)}
              placeholder="🇹🇳 Trouvez la meilleure moto au meilleur prix. Comparateur de prix motos et scooters..."
            />
          </div>

          <div className="form-group span-2">
            <label style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Search size={14} className="text-red-400" />
              Mots-clés SEO Globaux (séparés par des virgules)
            </label>
            <textarea
              rows={2}
              value={seoKeywords}
              onChange={(e) => setSeoKeywords(e.target.value)}
              placeholder="moto Tunisie, scooter Tunisie, prix moto Tunisie, scooter électrique, comparateur de prix..."
            />
            <span className="form-hint">
              Laissez vide pour conserver les valeurs SEO par défaut optimisées. Les mots-clés de chaque marque se gèrent dans Marques &gt; Modifier.
            </span>
          </div>
        </div>

        <div className="admin-form-actions" style={{ marginTop: "1rem" }}>
          <button type="submit" disabled={savingSeo} className="btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem" }}>
            <Save size={16} />
            {savingSeo ? "Enregistrement..." : "Enregistrer les paramètres SEO & Google"}
          </button>
        </div>
      </form>

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
