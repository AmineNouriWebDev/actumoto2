"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Lock, Phone, MessageCircle, MapPin, User as UserIcon, CheckCircle2 } from "lucide-react";

const TUNISIA_GOVERNORATES = [
  "Tunis",
  "Ariana",
  "Ben Arous",
  "Manouba",
  "Nabeul",
  "Zaghouan",
  "Bizerte",
  "Béja",
  "Jendouba",
  "Le Kef",
  "Siliana",
  "Sousse",
  "Monastir",
  "Mahdia",
  "Sfax",
  "Kairouan",
  "Kasserine",
  "Sidi Bouzid",
  "Gabès",
  "Médenine",
  "Tataouine",
  "Gafsa",
  "Tozeur",
  "Kébili",
];

interface ClientProfileFormProps {
  initialUser: {
    name: string | null;
    email: string | null;
    phone: string | null;
    hasWhatsapp: boolean;
    city: string | null;
  };
}

export default function ClientProfileForm({ initialUser }: ClientProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialUser.name || "");
  const [phone, setPhone] = useState(initialUser.phone || "");
  const [hasWhatsapp, setHasWhatsapp] = useState(initialUser.hasWhatsapp);
  const [city, setCity] = useState(initialUser.city || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          hasWhatsapp: phone.trim() ? hasWhatsapp : false,
          city,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Impossible de mettre à jour vos informations.");
      } else {
        toast.success("Vos informations personnelles ont été enregistrées.");
        router.refresh();
      }
    } catch {
      toast.error("Erreur réseau lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-card" style={{ maxWidth: "100%", padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: "0.75rem", color: "#fff" }}>
            <UserIcon size={22} style={{ color: "#ef4444" }} />
            Mes Informations Personnelles
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", margin: "0.4rem 0 0" }}>
            Ces coordonnées permettent aux concessionnaires de vous contacter pour vos demandes d&apos;offres ou d&apos;essais.
          </p>
        </div>

        {!phone.trim() ? (
          <span
            style={{
              padding: "0.35rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.78rem",
              fontWeight: 700,
              background: "rgba(245, 158, 11, 0.14)",
              color: "#fbbf24",
              border: "1px solid rgba(245, 158, 11, 0.3)",
            }}
          >
            Téléphone recommandé
          </span>
        ) : (
          <span
            style={{
              padding: "0.35rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.78rem",
              fontWeight: 700,
              background: "rgba(16, 185, 129, 0.14)",
              color: "#34d399",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            <CheckCircle2 size={14} />
            Profil complété
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.25rem",
          }}
        >
          <div className="auth-form-group">
            <label htmlFor="profile-name">Nom complet</label>
            <input
              id="profile-name"
              type="text"
              className="auth-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Ahmed Ben Ali"
              maxLength={100}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="profile-email" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Lock size={13} style={{ color: "rgba(255,255,255,0.5)" }} />
              Adresse Email (non modifiable)
            </label>
            <input
              id="profile-email"
              type="email"
              className="auth-input"
              value={initialUser.email || ""}
              disabled
              readOnly
              style={{
                opacity: 0.6,
                cursor: "not-allowed",
                background: "rgba(255,255,255,0.02)",
              }}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="profile-phone" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Phone size={13} style={{ color: "#ef4444" }} />
              Numéro de téléphone
            </label>
            <input
              id="profile-phone"
              type="tel"
              className="auth-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: 20 123 456"
              maxLength={25}
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="profile-city" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <MapPin size={13} style={{ color: "#ef4444" }} />
              Ville / Gouvernorat
            </label>
            <input
              id="profile-city"
              type="text"
              list="compte-tunisia-governorates"
              className="auth-input"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Tunis, Sousse, Sfax..."
              maxLength={80}
            />
            <datalist id="compte-tunisia-governorates">
              {TUNISIA_GOVERNORATES.map((gov) => (
                <option key={gov} value={gov} />
              ))}
            </datalist>
          </div>
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.9rem 1rem",
            borderRadius: "0.75rem",
            background: hasWhatsapp ? "rgba(34, 197, 94, 0.08)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${hasWhatsapp ? "rgba(34, 197, 94, 0.35)" : "rgba(255,255,255,0.08)"}`,
            cursor: "pointer",
            transition: "all 0.2s ease",
            width: "fit-content",
            maxWidth: "100%",
          }}
        >
          <input
            type="checkbox"
            checked={hasWhatsapp}
            onChange={(e) => setHasWhatsapp(e.target.checked)}
            style={{ width: "1.1rem", height: "1.1rem", accentColor: "#22c55e", cursor: "pointer" }}
          />
          <MessageCircle size={18} style={{ color: hasWhatsapp ? "#22c55e" : "rgba(255,255,255,0.5)", flexShrink: 0 }} />
          <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "0.95rem", fontWeight: 500 }}>
            Ce numéro est joignable sur WhatsApp
          </span>
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.25rem" }}>
          <button
            type="submit"
            className="auth-btn"
            disabled={saving}
            style={{ padding: "0.85rem 1.75rem", minWidth: "220px" }}
          >
            {saving ? "Enregistrement..." : "Enregistrer mes informations"}
          </button>
        </div>
      </form>
    </div>
  );
}
