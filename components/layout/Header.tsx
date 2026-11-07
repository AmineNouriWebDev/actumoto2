import Link from "next/link";
import { auth } from "@/lib/auth";
import HeaderSearch from "@/components/layout/HeaderSearch";
import BurgerMenu from "@/components/layout/BurgerMenu";
import prisma from "@/lib/prisma";

export default async function Header() {
  const [session, categories] = await Promise.all([
    auth(),
    prisma.category.findMany({
      where: { isVisible: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, logo: true, isVisible: true },
    }),
  ]);

  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;
  const dashboardUrl = (role === "ADMIN" || role === "DEALER") ? "/admin" : "/compte";

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
                src="/img/logo-principal-6.png"
                alt="actumoto.tn - Logo concessionnaire motos en Tunisie"
                className="header-logo main-header-logo"
                width={250}
                height={31}
              />
            </Link>
          </div>

          {/* Droite : Menu Burger (Mobile & Desktop) */}
          <div className="header-burger-container flex items-center justify-end">
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
