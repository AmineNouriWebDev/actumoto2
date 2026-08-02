import Link from "next/link";
import Image from "next/image";

export default function Header() {
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

            {/* Right Links (Desktop) */}
            <div className="nav-links">
              <Link href="/occasion" className="nav-link">
                Occasion
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Occasion Link (Replaces Burger Menu) */}
      <Link href="/occasion" className="mobile-occasion-link" aria-label="Occasion">
        Occasion
      </Link>
    </>
  );
}
