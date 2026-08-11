"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        if (result.error.includes("Email non vérifié")) {
          toast.error("Veuillez vérifier votre adresse email pour activer votre compte.");
        } else {
          toast.error("Email ou mot de passe incorrect.");
        }
        setIsLoading(false);
      } else {
        router.push("/compte");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Une erreur s'est produite lors de la connexion.");
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <img src="/img/logo-principal-6.png" alt="actumoto" style={{ height: "45px", marginBottom: "1.5rem", filter: "drop-shadow(0 0 10px rgba(220,38,38,0.5))" }} />
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", letterSpacing: "0.05em" }}>Connexion</h1>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="auth-form-group">
            <label>Email</label>
            <input
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>

          <div className="auth-form-group relative">
            <label>Mot de passe</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
            <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
              <Link href="/mot-de-passe-oublie" style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", textDecoration: "underline" }}>
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading} style={{ marginTop: "1rem" }}>
            {isLoading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <span className="spinner"></span> Connexion...
              </span>
            ) : "Se connecter"}
          </button>
        </form>

        <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>
          Pas encore de compte ?{" "}
          <Link href="/inscription" style={{ color: "#ef4444", fontWeight: 700, textDecoration: "none" }}>
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}
