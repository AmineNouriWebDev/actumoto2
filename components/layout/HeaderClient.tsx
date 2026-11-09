"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import HeaderSearch from "@/components/layout/HeaderSearch";
import BurgerMenu from "@/components/layout/BurgerMenu";
import UserNavButton from "@/components/layout/UserNavButton";

interface HeaderClientProps {
  isLoggedIn: boolean;
  dashboardUrl: string;
  categories: any[];
  defaultLogoSrc: string;
}

export default function HeaderClient({
  isLoggedIn,
  dashboardUrl,
  categories,
  defaultLogoSrc,
}: HeaderClientProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) {
    return (
      <header className="header-futurist header-home-rustic" role="banner">
        <div className="w-full px-3 sm:px-6 md:px-10 h-full">
          <div className="header-container">
            {/* Gauche : Bouton Recherche métallique avec dropdown */}
            <div className="header-search-container flex items-center justify-start">
              <HeaderSearch isHome={true} />
            </div>

            {/* Centre : Logo plaque métallique Actumoto.tn */}
            <div className="flex items-center justify-center">
              <h1 className="sr-only">actumoto.tn - Concessionnaire moto Tunisie</h1>
              <Link
                href="/"
                aria-label="Retour à l'accueil actumoto.tn"
                className="flex items-center justify-center"
              >
                <img
                  src="/img/header-logo.webp"
                  alt="actumoto.tn - Logo concessionnaire motos en Tunisie"
                  className="header-logo header-logo-home"
                  width={210}
                  height={70}
                  loading="eager"
                />
              </Link>
            </div>

            {/* Droite : Bouton Connexion/Déconnexion + Menu Burger métalliques */}
            <div className="header-burger-container flex items-center justify-end gap-2 sm:gap-3 md:gap-4">
              <UserNavButton isLoggedIn={isLoggedIn} isHome={true} />
              <BurgerMenu
                isLoggedIn={isLoggedIn}
                dashboardUrl={dashboardUrl}
                categories={categories}
                isHome={true}
              />
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Header standard actuel conservé intact pour toutes les autres pages
  return (
    <header className="header-futurist main-header" role="banner">
      <div className="w-full px-4 md:px-10 h-full">
        <div className="header-container">
          {/* Gauche : Barre de recherche instantanée standard */}
          <div className="header-search-container flex items-center justify-start">
            <HeaderSearch isHome={false} />
          </div>

          {/* Centre : Logo standard */}
          <div className="flex items-center">
            <h1 className="sr-only">actumoto.tn - Concessionnaire moto Tunisie</h1>
            <Link href="/" aria-label="Retour à l'accueil actumoto.tn">
              <img
                src={defaultLogoSrc}
                alt="actumoto.tn - Logo concessionnaire motos en Tunisie"
                className="header-logo main-header-logo"
                width={200}
                height={47}
              />
            </Link>
          </div>

          {/* Droite : Bouton Connexion/Déconnexion + Menu Burger standard */}
          <div className="header-burger-container flex items-center justify-end gap-2 md:gap-3">
            <UserNavButton isLoggedIn={isLoggedIn} isHome={false} />
            <BurgerMenu
              isLoggedIn={isLoggedIn}
              dashboardUrl={dashboardUrl}
              categories={categories}
              isHome={false}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

