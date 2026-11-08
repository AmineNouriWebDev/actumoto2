import Link from "next/link";
import { auth } from "@/lib/auth";
import HeaderSearch from "@/components/layout/HeaderSearch";
import BurgerMenu from "@/components/layout/BurgerMenu";
import UserNavButton from "@/components/layout/UserNavButton";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";

export default async function Header() {
  const [session, categories] = await Promise.all([
    auth(),
    prisma.category.findMany({
      where: { isVisible: true },
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true, logo: true, isVisible: true },
    }),
  ]);

  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;
  const dashboardUrl = (role === "ADMIN" || role === "DEALER") ? "/admin" : "/compte";

  const hasLogo = fs.existsSync(path.join(process.cwd(), "public", "img", "logo-final.jpeg"));
  const logoSrc = hasLogo ? "/img/logo-final.jpeg" : "/img/logo2.webp";

  return (
    <header className="header-futurist main-header" role="banner">
      <div className="w-full px-4 md:px-10 h-full">
        <div className="header-container">
          {/* Gauche : Barre de recherche instantanée */}
          <div className="header-search-container flex items-center justify-start">
            <HeaderSearch />
          </div>

          {/* Centre : Logo principal */}
          <div className="flex items-center">
            <h1 className="sr-only">actumoto.tn - Concessionnaire moto Tunisie</h1>
            <Link href="/" aria-label="Retour à l'accueil actumoto.tn">
              <img
                src={logoSrc}
                alt="actumoto.tn - Logo concessionnaire motos en Tunisie"
                className="header-logo main-header-logo"
                width={200}
                height={47}
              />
            </Link>
          </div>

          {/* Droite : Bouton Connexion/Déconnexion + Menu Burger */}
          <div className="header-burger-container flex items-center justify-end gap-2 md:gap-3">
            <UserNavButton isLoggedIn={isLoggedIn} />
            <BurgerMenu
              isLoggedIn={isLoggedIn}
              dashboardUrl={dashboardUrl}
              categories={categories}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
