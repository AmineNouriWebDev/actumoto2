"use client";

import { Suspense, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { EyeIcon, EyeOffIcon, AlertCircle } from "lucide-react";
import SocialAuthButtons from "@/components/auth/SocialAuthButtons";

interface ConnexionClientProps {
  showGoogle?: boolean;
  showFacebook?: boolean;
}

function LoginForm({ showGoogle = true, showFacebook = true }: ConnexionClientProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawCallback = searchParams.get("callbackUrl");
  const callbackUrl =
    rawCallback &&
    !rawCallback.startsWith("/connexion") &&
    !rawCallback.startsWith("/inscription")
      ? rawCallback
      : "/";
  const needLogin = searchParams.get("needLogin") === "1";
  const reason = searchParams.get("reason");

  useEffect(() => {
    if (needLogin) {
      if (reason === "rating") {
        toast.info("Veuillez vous connecter pour noter cette moto.");
      } else if (reason === "favorite") {
        toast.info("Veuillez vous connecter pour sauvegarder cette moto dans vos favoris.");
      } else {
        toast.info("Vous devez être connecté pour continuer.");
      }
    }
  }, [needLogin, reason]);

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
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.error("Une erreur s'est produite lors de la connexion.");
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container -mt-[80px] min-h-screen relative">
      {/* Flèche retour en haut à droite — même style que dans les pages modèles */}
      <Link
        href={callbackUrl}
        className="section-back-btn"
        style={{
          position: "fixed",
          top: "1.5rem",
          right: "1.5rem",
          zIndex: 100,
        }}
        title="Retour"
        aria-label="Retour à la page précédente"
      >
        ←
      </Link>

      <div className="auth-card">
        {/* En-tête : Logo et Titre tous les deux parfaitement centrés */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/" style={{ display: "inline-flex", justifyContent: "center", alignItems: "center" }}>
            <img
              src="/img/logo-final.jpeg"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/img/logo2.webp";
              }}
              alt="actumoto"
              style={{
                height: "50px",
                width: "auto",
                maxWidth: "220px",
                objectFit: "contain",
                display: "block",
                margin: "0 auto 1.25rem auto",
                filter: "drop-shadow(0 0 10px rgba(220,38,38,0.5))",
              }}
            />
          </Link>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#fff", letterSpacing: "0.05em", textAlign: "center", width: "100%", margin: 0 }}>
            Connexion
          </h1>
        </div>

        {/* Message d'alerte contextuel si redirection pour avis */}
        {needLogin && (
          <div
            style={{
              background: "rgba(220, 38, 38, 0.15)",
              border: "1px solid rgba(220, 38, 38, 0.4)",
              borderRadius: "10px",
              padding: "0.75rem 1rem",
              marginBottom: "1.5rem",
              color: "#fca5a5",
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>
              {reason === "rating"
                ? "Vous devez être connecté pour noter cette moto. Connectez-vous ci-dessous pour être redirigé vers la page."
                : reason === "favorite"
                ? "Vous devez être connecté pour sauvegarder cette moto dans vos favoris. Connectez-vous ci-dessous pour être redirigé vers la page."
                : "Vous devez être connecté pour déposer un avis. Connectez-vous ci-dessous pour être redirigé directement."}
            </span>
          </div>
        )}

        <SocialAuthButtons
          callbackUrl={callbackUrl}
          showGoogle={showGoogle}
          showFacebook={showFacebook}
          separatorPosition="bottom"
          separatorLabel="OU PAR EMAIL"
        />

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
              <Link
                href="/mot-de-passe-oublie"
                style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", textDecoration: "underline" }}
              >
                Mot de passe oublié ?
              </Link>
            </div>
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading} style={{ marginTop: "1rem" }}>
            {isLoading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <span className="spinner"></span> Connexion...
              </span>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <div style={{ marginTop: "2rem", textAlign: "center", fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>
          Pas encore de compte ?{" "}
          <Link
            href={`/inscription?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            style={{ color: "#ef4444", fontWeight: 700, textDecoration: "none" }}
          >
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConnexionClient(props: ConnexionClientProps) {
  return (
    <Suspense
      fallback={
        <div className="auth-page-container -mt-[80px] min-h-screen">
          <div className="auth-card" style={{ textAlign: "center", color: "#fff", padding: "3rem" }}>
            Chargement...
          </div>
        </div>
      }
    >
      <LoginForm {...props} />
    </Suspense>
  );
}
