"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { Phone, MessageCircle, X, MapPin, Lock, Sparkles } from "lucide-react";

const PROFILE_PROMPT_DELAY_MS = 5 * 60 * 1000; // 5 minutes après la connexion / première session active
const SNOOZE_DELAY_MS = 15 * 60 * 1000; // 15 minutes si l'utilisateur clique "Plus tard"

interface ProfileUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  phone: string | null;
  hasWhatsapp: boolean;
  city: string | null;
  profilePromptDismissed: boolean;
}

const EXCLUDED_PREFIXES = ["/admin", "/connexion", "/inscription", "/verify", "/compte", "/dealer"];

export default function ProfileCompletionPrompt() {
  const pathname = usePathname();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hasWhatsapp, setHasWhatsapp] = useState(false);
  const [city, setCity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isExcludedRoute = EXCLUDED_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  // Récupère l'état du profil connecté (et re-vérifie lors de navigation tant qu'aucun user n'est détecté)
  useEffect(() => {
    if (isExcludedRoute) {
      setVisible(false);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      try {
        const res = await fetch("/api/user/profile", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (cancelled) return;

        if (!data.authenticated || !data.user) {
          setUser(null);
          setVisible(false);
          return;
        }

        const fetchedUser: ProfileUser = data.user;
        setUser(fetchedUser);
        setName((prev) => prev || fetchedUser.name || "");
        setCity((prev) => prev || fetchedUser.city || "");
        setHasWhatsapp(fetchedUser.hasWhatsapp);
      } catch {
        // Silencieux en cas de coupure réseau
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [pathname, isExcludedRoute]);

  // Planifie l'affichage non-intrusif exactement 5 minutes après la première détection de session
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!user || isExcludedRoute) {
      setVisible(false);
      return;
    }

    if (user.role !== "CLIENT" || user.phone || user.profilePromptDismissed) {
      setVisible(false);
      return;
    }

    try {
      const dismissedKey = `actumoto_profile_dismissed_${user.id}`;
      if (localStorage.getItem(dismissedKey) === "1") {
        setVisible(false);
        return;
      }

      const startKey = `actumoto_profile_prompt_since_${user.id}`;
      const snoozeKey = `actumoto_profile_prompt_snooze_${user.id}`;

      const now = Date.now();
      let startTs = Number(localStorage.getItem(startKey) || "0");
      if (!startTs || Number.isNaN(startTs)) {
        startTs = now;
        localStorage.setItem(startKey, String(startTs));
      }

      const snoozeUntil = Number(localStorage.getItem(snoozeKey) || "0") || 0;
      const targetTs = Math.max(startTs + PROFILE_PROMPT_DELAY_MS, snoozeUntil);
      const remaining = Math.max(0, targetTs - now);

      timerRef.current = setTimeout(async () => {
        // Vérification fraîche avant affichage (au cas où complété entre-temps sur /compte ou un autre onglet)
        try {
          const checkRes = await fetch("/api/user/profile", { cache: "no-store" });
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            if (
              !checkData.authenticated ||
              !checkData.user ||
              checkData.user.role !== "CLIENT" ||
              checkData.user.phone ||
              checkData.user.profilePromptDismissed
            ) {
              return;
            }
          }
        } catch {
          // On affiche si le timer est atteint même si la re-vérif échoue
        }
        setVisible(true);
      }, remaining);
    } catch {
      // Fallback si localStorage indisponible
      timerRef.current = setTimeout(() => setVisible(true), PROFILE_PROMPT_DELAY_MS);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [user, isExcludedRoute]);

  const handleLater = () => {
    setVisible(false);
    if (!user) return;
    try {
      const snoozeKey = `actumoto_profile_prompt_snooze_${user.id}`;
      localStorage.setItem(snoozeKey, String(Date.now() + SNOOZE_DELAY_MS));
    } catch {
      // ignore
    }
  };

  const handleNeverShowAgain = async () => {
    setVisible(false);
    if (!user) return;
    try {
      localStorage.setItem(`actumoto_profile_dismissed_${user.id}`, "1");
    } catch {
      // ignore
    }
    setUser((prev) => (prev ? { ...prev, profilePromptDismissed: true } : null));

    try {
      await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePromptDismissed: true }),
      });
    } catch {
      // Déjà masqué localement
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error("Veuillez entrer votre numéro de téléphone.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          phone: phone.trim(),
          hasWhatsapp,
          city: city.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'enregistrement.");
      } else {
        toast.success("Merci ! Vos coordonnées ont bien été enregistrées.");
        setUser(data.user);
        setVisible(false);
      }
    } catch {
      toast.error("Erreur réseau lors de l'enregistrement.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible || !user || isExcludedRoute) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-labelledby="profile-completion-title"
      style={{
        position: "fixed",
        right: "1.25rem",
        bottom: "1.25rem",
        zIndex: 9980,
        width: "calc(100vw - 2.5rem)",
        maxWidth: "400px",
        background: "linear-gradient(160deg, rgba(20, 22, 29, 0.98) 0%, rgba(12, 13, 18, 0.98) 100%)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "1.25rem",
        padding: "1.35rem",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(239, 68, 68, 0.15)",
        color: "#fff",
      }}
    >
      <button
        type="button"
        onClick={handleLater}
        aria-label="Fermer temporairement"
        style={{
          position: "absolute",
          top: "0.85rem",
          right: "0.85rem",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "9999px",
          width: "28px",
          height: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.7)",
          cursor: "pointer",
        }}
      >
        <X size={15} />
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.45rem", paddingRight: "1.75rem" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "30px",
            height: "30px",
            borderRadius: "0.6rem",
            background: "rgba(239, 68, 68, 0.15)",
            color: "#ef4444",
            flexShrink: 0,
          }}
        >
          <Sparkles size={16} />
        </span>
        <h3 id="profile-completion-title" style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#fff" }}>
          Complétez votre profil
        </h3>
      </div>

      <p style={{ margin: "0 0 1rem", fontSize: "0.83rem", lineHeight: 1.45, color: "rgba(255,255,255,0.68)" }}>
        Ajoutez votre numéro pour faciliter la mise en relation avec nos concessionnaires partenaires.
      </p>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.76rem", color: "rgba(255,255,255,0.65)", marginBottom: "0.3rem" }}>
            Nom complet
          </label>
          <input
            type="text"
            className="auth-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom et prénom"
            style={{ padding: "0.62rem 0.85rem", fontSize: "0.9rem" }}
          />
        </div>

        <div>
          <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.76rem", color: "rgba(255,255,255,0.65)", marginBottom: "0.3rem" }}>
            <Phone size={12} style={{ color: "#ef4444" }} />
            Numéro de téléphone <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            type="tel"
            className="auth-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Ex: 20 123 456"
            required
            style={{ padding: "0.62rem 0.85rem", fontSize: "0.9rem" }}
          />
        </div>

        <div>
          <label style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.76rem", color: "rgba(255,255,255,0.65)", marginBottom: "0.3rem" }}>
            <MapPin size={12} style={{ color: "rgba(255,255,255,0.5)" }} />
            Ville / Gouvernorat (optionnel)
          </label>
          <input
            type="text"
            className="auth-input"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ex: Tunis, Sousse, Sfax..."
            style={{ padding: "0.62rem 0.85rem", fontSize: "0.9rem" }}
          />
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.55rem 0.75rem",
            borderRadius: "0.65rem",
            background: hasWhatsapp ? "rgba(34, 197, 94, 0.1)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${hasWhatsapp ? "rgba(34, 197, 94, 0.35)" : "rgba(255,255,255,0.08)"}`,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={hasWhatsapp}
            onChange={(e) => setHasWhatsapp(e.target.checked)}
            style={{ width: "1rem", height: "1rem", accentColor: "#22c55e", cursor: "pointer" }}
          />
          <MessageCircle size={15} style={{ color: hasWhatsapp ? "#22c55e" : "rgba(255,255,255,0.55)", flexShrink: 0 }} />
          <span style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.88)" }}>
            Numéro lié à WhatsApp
          </span>
        </label>

        {user.email && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.74rem", color: "rgba(255,255,255,0.45)" }}>
            <Lock size={11} />
            <span>Compte : {user.email} (email non modifiable)</span>
          </div>
        )}

        <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.25rem" }}>
          <button
            type="button"
            onClick={handleLater}
            style={{
              flex: 1,
              padding: "0.68rem",
              borderRadius: "0.75rem",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.8)",
              fontSize: "0.86rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Plus tard
          </button>
          <button
            type="submit"
            className="auth-btn"
            disabled={submitting}
            style={{
              flex: 1.4,
              padding: "0.68rem",
              fontSize: "0.88rem",
            }}
          >
            {submitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>

        <button
          type="button"
          onClick={handleNeverShowAgain}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.45)",
            fontSize: "0.76rem",
            textDecoration: "underline",
            cursor: "pointer",
            padding: "0.15rem 0",
            alignSelf: "center",
          }}
        >
          Ne plus afficher ce message
        </button>
      </form>
    </div>
  );
}
