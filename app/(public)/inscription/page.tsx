"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { registerClient } from "@/lib/client-actions/auth";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await registerClient(formData);

      if (res?.error) {
        toast.error(res.error);
        setIsLoading(false);
      } else {
        toast.success("Compte créé avec succès ! Un email de vérification vous a été envoyé. Pensez à vérifier votre boîte de spam/courrier indésirable.", { autoClose: false });
        router.push("/connexion");
      }
    } catch (error) {
      console.error(error);
      toast.error("Une erreur inattendue est survenue.");
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <img src="/img/logo-principal-6.png" alt="actumoto" style={{ height: "45px", marginBottom: "1.5rem", filter: "drop-shadow(0 0 10px rgba(220,38,38,0.5))" }} />
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", letterSpacing: "0.05em" }}>Créer un compte</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="auth-form-group">
            <label>Nom complet</label>
            <input type="text" name="name" className="auth-input" placeholder="Votre nom" required />
          </div>

          <div className="auth-form-group">
            <label>Email</label>
            <input type="email" name="email" className="auth-input" placeholder="votre@email.com" required />
          </div>

          <div className="auth-form-group relative">
            <label>Mot de passe</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                className="auth-input pr-10" 
                placeholder="••••••••" 
                minLength={8} 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                title={showPassword ? "Masquer" : "Afficher"}
              >
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
          </div>

          <div className="auth-form-group relative">
            <label>Confirmer le mot de passe</label>
            <div className="relative">
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                name="confirmPassword" 
                className="auth-input pr-10" 
                placeholder="••••••••" 
                minLength={8} 
                required 
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                title={showConfirmPassword ? "Masquer" : "Afficher"}
              >
                {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading} style={{ marginTop: "1rem" }}>
            {isLoading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <span className="spinner"></span> Création en cours...
              </span>
            ) : "S'inscrire"}
          </button>
        </form>

        <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>
          Vous avez déjà un compte ?{" "}
          <Link href="/connexion" style={{ color: "#ef4444", fontWeight: 700, textDecoration: "none" }}>
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
