"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { resetPassword } from "@/lib/client-actions/password";

function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!token || !email) {
      toast.error("Lien de réinitialisation invalide.");
      router.push("/connexion");
    }
  }, [token, email, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("token", token as string);
    formData.append("email", email as string);
    
    try {
      const res = await resetPassword(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Mot de passe modifié avec succès !");
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/connexion");
        }, 3000);
      }
    } catch (err) {
      toast.error("Une erreur s'est produite.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token || !email) return null;

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <img src="/img/logo-principal-6.png" alt="actumoto" style={{ height: "45px", marginBottom: "1.5rem", filter: "drop-shadow(0 0 10px rgba(220,38,38,0.5))" }} />
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", letterSpacing: "0.05em" }}>Nouveau mot de passe</h1>
        </div>

        {isSuccess ? (
          <div style={{ textAlign: "center", color: "#fff" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
            <p style={{ marginBottom: "1.5rem", lineHeight: 1.5, color: "rgba(255,255,255,0.7)" }}>
              Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
            </p>
            <Link href="/connexion" className="auth-btn" style={{ display: "inline-block", textDecoration: "none", width: "100%" }}>
              Se connecter maintenant
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem", textAlign: "center", margin: 0 }}>
              Veuillez saisir votre nouveau mot de passe (8 caractères minimum).
            </p>
            <div className="auth-form-group">
              <label>Nouveau mot de passe</label>
              <input type="password" name="password" className="auth-input" placeholder="••••••••" minLength={8} required />
            </div>

            <button type="submit" className="auth-btn" disabled={isLoading} style={{ marginTop: "1rem" }}>
              {isLoading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  <span className="spinner"></span> Modification...
                </span>
              ) : "Valider le mot de passe"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "80vh", display: "flex", justifyContent: "center", alignItems: "center", color: "#fff" }}>Chargement...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
