"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { requestPasswordReset } from "@/lib/client-actions/password";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const res = await requestPasswordReset(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        setIsSent(true);
      }
    } catch (err) {
      toast.error("Une erreur s'est produite.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <img src="/img/logo-principal-6.png" alt="actumoto" style={{ height: "45px", marginBottom: "1.5rem", filter: "drop-shadow(0 0 10px rgba(220,38,38,0.5))" }} />
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", letterSpacing: "0.05em" }}>Mot de passe oublié</h1>
        </div>

        {isSent ? (
          <div style={{ textAlign: "center", color: "#fff" }}>
            <p style={{ marginBottom: "1.5rem", lineHeight: 1.5, color: "rgba(255,255,255,0.7)" }}>
              Si cette adresse existe, un email contenant les instructions de réinitialisation vous a été envoyé.
            </p>
            <Link href="/connexion" className="auth-btn" style={{ display: "inline-block", textDecoration: "none", width: "100%" }}>
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem", textAlign: "center", margin: 0 }}>
              Saisissez votre adresse email pour recevoir un lien de réinitialisation.
            </p>
            <div className="auth-form-group">
              <label>Email</label>
              <input type="email" name="email" className="auth-input" placeholder="votre@email.com" required />
            </div>

            <button type="submit" className="auth-btn" disabled={isLoading} style={{ marginTop: "1rem" }}>
              {isLoading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <span className="spinner"></span> Envoi...
                </span>
              ) : "Envoyer le lien"}
            </button>
          </form>
        )}

        <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>
          <Link href="/connexion" style={{ color: "#ef4444", fontWeight: 700, textDecoration: "none" }}>
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
