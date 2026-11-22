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
  useHomeNavEverywhere?: boolean;
}

export default function HeaderClient({
  isLoggedIn,
  dashboardUrl,
  categories,
  defaultLogoSrc,
  useHomeNavEverywhere = true,
}: HeaderClientProps) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  // Le header (menu nav) est UNIQUEMENT affiché sur la page d'accueil
  if (!isHome) {
    return null;
  }

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
                  src="/img/header-logo-version2.webp"
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

