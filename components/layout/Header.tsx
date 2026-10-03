import Link from "next/link";
import { auth } from "@/lib/auth";
import HeaderLogoutButton from "@/components/client/HeaderLogoutButton";

export default async function Header() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;
  const dashboardUrl = (role === "ADMIN" || role === "DEALER") ? "/admin" : "/compte";

  return (
    <>
      <header className="header-futurist main-header" role="banner">
        <div className="w-full px-4 md:px-10 h-full">
          <div className="header-container">
            {/* Left Social Bar (Desktop) */}
            <div className="header-social-bar">
              <a
                href="https://www.facebook.com/profile.php?id=61584281323170"
                className="header-social-btn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <img src="/img/social/facebook.png" alt="Facebook" />
              </a>
              <a
                href="https://www.instagram.com/marwen_actumoto/"
                className="header-social-btn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <img src="/img/social/instagram.png" alt="Instagram" />
              </a>
              <a
                href="https://www.youtube.com/@ActumotoTn"
                className="header-social-btn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <img src="/img/social/youtube.png" alt="YouTube" />
              </a>
              <a
                href="https://www.tiktok.com/@marwenactumoto"
                className="header-social-btn"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
              >
                <img src="/img/social/tiktok.png" alt="TikTok" />
              </a>
            </div>

            {/* Logo (Center) */}
            <div className="flex items-center">
              <h1 className="sr-only">actumoto.tn - Concessionnaire moto Tunisie</h1>
              <Link href="/" aria-label="Retour à l'accueil actumoto.tn">
                <img
                  src="/img/logo-principal-6.png"
                  alt="actumoto.tn - Logo concessionnaire motos en Tunisie"
                  className="header-logo main-header-logo"
                  width={250}
                  height={31}
                />
              </Link>
            </div>

            {/* Right Links */}
            <div className="nav-links" style={{ display: "flex", alignItems: "center" }}>
              <Link href="/occasion" className="nav-link">
                Occasion
              </Link>
              {isLoggedIn ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <Link href={dashboardUrl} className="nav-link" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <span style={{ fontSize: "1.1rem" }}>👤</span>
                    <span className="hidden md:inline">Mon compte</span>
                  </Link>
                  <HeaderLogoutButton />
                </div>
              ) : (
                <Link href="/connexion" className="nav-link" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                  <span style={{ fontSize: "1.1rem" }}>🔑</span>
                  <span className="hidden md:inline">Connexion</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
