"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    startTransition(async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email ou mot de passe incorrect.");
      } else {
        router.push("/admin");
        router.refresh();
      }
    });
  };

  return (
    <div className="admin-login-page">
      <div className="login-card">
        <div className="login-logo">
          <img src="/img/logo-principal-6.png" alt="actumoto.tn" />
        </div>
        <h1 className="login-title">Administration</h1>
        <p className="login-subtitle">Connectez-vous pour accéder au panneau d'administration</p>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Adresse Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@actumoto.tn"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                autoComplete="current-password"
                style={{ paddingRight: "3rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  padding: "0.5rem",
                }}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={isPending}>
            {isPending ? (
              <span className="btn-spinner">⏳ Connexion...</span>
            ) : (
              "Se connecter"
            )}
          </button>
        </form>

        <p className="login-footer">
          🔒 Accès réservé aux administrateurs
        </p>
      </div>

      <style jsx>{`
        .admin-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
          padding: 1rem;
        }
        .login-card {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1.5rem;
          padding: 3rem 2.5rem;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 25px 50px rgba(0,0,0,0.5);
        }
        .login-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }
        .login-logo img {
          height: 56px;
          object-fit: contain;
          filter: drop-shadow(0 0 12px rgba(220,38,38,0.5));
        }
        .login-title {
          color: #fff;
          font-size: 1.75rem;
          font-weight: 700;
          text-align: center;
          margin: 0 0 0.5rem;
          letter-spacing: 0.05em;
        }
        .login-subtitle {
          color: rgba(255,255,255,0.5);
          font-size: 0.875rem;
          text-align: center;
          margin: 0 0 2rem;
          line-height: 1.5;
        }
        .login-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .login-error {
          background: rgba(220,38,38,0.15);
          border: 1px solid rgba(220,38,38,0.4);
          color: #fca5a5;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label {
          color: rgba(255,255,255,0.7);
          font-size: 0.875rem;
          font-weight: 500;
        }
        .form-group input {
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 0.75rem;
          padding: 0.875rem 1rem;
          color: #fff;
          font-size: 1rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
          width: 100%;
        }
        .form-group input::placeholder { color: rgba(255,255,255,0.25); }
        .form-group input:focus {
          border-color: #dc2626;
          box-shadow: 0 0 0 3px rgba(220,38,38,0.15);
        }
        .login-btn {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: white;
          border: none;
          border-radius: 0.75rem;
          padding: 1rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.5rem;
          letter-spacing: 0.025em;
        }
        .login-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #b91c1c, #991b1b);
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(220,38,38,0.3);
        }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-footer {
          color: rgba(255,255,255,0.3);
          font-size: 0.75rem;
          text-align: center;
          margin: 1.5rem 0 0;
        }
      `}</style>
    </div>
  );
}
