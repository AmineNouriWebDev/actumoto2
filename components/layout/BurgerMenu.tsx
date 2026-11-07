"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Menu,
  X,
  Tag,
  User,
  LogIn,
  LogOut,
  Mail,
  ChevronRight,
  Sliders,
  Sparkles,
} from "lucide-react";

interface CategoryItem {
  id?: string;
  name: string;
  logo: string;
  isVisible?: boolean;
}

interface BurgerMenuProps {
  isLoggedIn: boolean;
  dashboardUrl: string;
  categories: CategoryItem[];
}

function cleanImgSrc(src?: string | null): string {
  if (!src) return "";
  return src.startsWith("./") ? src.substring(1) : src;
}

const priceRanges = [
  { slug: "moins-de-4000", label: "Moins de 4K DT" },
  { slug: "4000-7000", label: "4K – 7K DT" },
  { slug: "7000-10000", label: "7K – 10K DT" },
  { slug: "10000-15000", label: "10K – 15K DT" },
  { slug: "15000-20000", label: "15K – 20K DT" },
  { slug: "plus-de-20000", label: "Plus de 20K DT" },
];

export default function BurgerMenu({
  isLoggedIn,
  dashboardUrl,
  categories,
}: BurgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sliderPrice, setSliderPrice] = useState(30000);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloquer le scroll du body quand le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Fermer avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const closeMenu = () => setIsOpen(false);

  const handleApplyPriceFilter = () => {
    closeMenu();
    router.push(`/modeles?maxPrice=${sliderPrice}`);
  };

  const drawerContent = (
    <>
      {/* Overlay Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998] transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Drawer Panel Latéral - Thème clair et lumineux pour contraste parfait des icônes noires */}
      <aside
        className={`fixed top-0 right-0 h-[100dvh] w-full max-w-[420px] bg-white border-l border-gray-200 shadow-2xl z-[99999] flex flex-col justify-between overflow-hidden transition-transform duration-300 ease-out transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Menu"
      >
        {/* En-tête du Drawer : Logo actumoto à gauche + bouton X à droite */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/70">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center"
            aria-label="Accueil actumoto.tn"
          >
            <img
              src="/img/logo-principal-6.png"
              alt="actumoto.tn"
              className="h-7 w-auto object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={closeMenu}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-red-600 text-gray-500 hover:text-white flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corps déroulant du Drawer */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6 scrollbar-thin scrollbar-thumb-gray-300">
          {/* SECTION 1 : LIENS DE NAVIGATION (OCCASION + CONNEXION) */}
          <section aria-label="Navigation principale" className="space-y-2.5">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Navigation
            </h3>

            {/* Lien Occasion (sans sous-titre) */}
            <Link
              href="/occasion"
              onClick={closeMenu}
              className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-red-50/80 border border-gray-200 hover:border-red-500/50 text-gray-900 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 border border-red-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Tag className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-gray-900 group-hover:text-red-600 transition-colors">
                  Motos d'Occasion
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
            </Link>

            {/* Lien Connexion ou Mon Compte */}
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  href={dashboardUrl}
                  onClick={closeMenu}
                  className="flex-1 flex items-center justify-between p-3.5 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-500/50 text-gray-900 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 border border-blue-200 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm block text-gray-900 group-hover:text-blue-600 transition-colors">
                        Mon Espace
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Tableau de bord
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    signOut({ callbackUrl: "/" });
                  }}
                  className="w-12 h-14 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 flex items-center justify-center transition-all cursor-pointer"
                  title="Déconnexion"
                  aria-label="Se déconnecter"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/connexion"
                onClick={closeMenu}
                className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white transition-all shadow-md group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/20 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">
                      Connexion
                    </span>
                    <span className="text-[11px] text-red-100">
                      Accéder à votre compte
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-all" />
              </Link>
            )}
          </section>

          {/* SECTION 2 : FILTRE PAR CATÉGORIES AVEC LEURS ICÔNES BIEN VISIBLES */}
          {categories && categories.length > 0 && (
            <section aria-labelledby="burger-categories-title" className="space-y-2">
              <div className="flex items-center justify-between mb-1">
                <h3
                  id="burger-categories-title"
                  className="text-[11px] font-bold uppercase tracking-wider text-gray-500"
                >
                  Catégories
                </h3>
                <span className="text-[10px] font-mono text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 font-semibold">
                  {categories.length}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {categories.map((cat, idx) => (
                  <Link
                    key={cat.id || idx}
                    href={`/categories/${encodeURIComponent(cat.name)}`}
                    onClick={closeMenu}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-50 hover:bg-white border border-gray-200 hover:border-red-500 hover:shadow-md transition-all duration-200 group text-center"
                  >
                    {/* Conteneur blanc pour contraste parfait sur les icônes noires */}
                    <div className="w-full h-10 flex items-center justify-center mb-1.5 bg-white rounded-lg p-1 border border-gray-100 shadow-2xs">
                      <img
                        src={cleanImgSrc(cat.logo)}
                        alt={cat.name}
                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-200"
                        loading="lazy"
                      />
                    </div>
                    <span className="text-[11px] font-bold text-gray-800 group-hover:text-red-600 transition-colors truncate w-full">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 3 : FILTRE PAR PRIX (SOUS FORME DE RANG / SLIDER) */}
          <section aria-labelledby="burger-price-title" className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h3
                id="burger-price-title"
                className="text-[11px] font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-red-600" />
                Filtre par Prix (Budget)
              </h3>
            </div>

            {/* Curseur de prix interactif (Range Slider) */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">Budget max :</span>
                <span className="text-sm font-bold text-red-600 font-mono">
                  {sliderPrice.toLocaleString("fr-FR")} DT
                </span>
              </div>

              <input
                type="range"
                min="2000"
                max="60000"
                step="1000"
                value={sliderPrice}
                onChange={(e) => setSliderPrice(Number(e.target.value))}
                className="w-full accent-red-600 cursor-pointer h-2 bg-gray-200 rounded-lg"
                aria-label="Sélectionner le prix maximum"
              />

              <div className="flex justify-between text-[10px] text-gray-500 font-mono font-medium">
                <span>2 000 DT</span>
                <span>30 000 DT</span>
                <span>60 000 DT+</span>
              </div>

              <button
                type="button"
                onClick={handleApplyPriceFilter}
                className="w-full py-2.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Voir les modèles jusqu'à {sliderPrice.toLocaleString("fr-FR")} DT
              </button>
            </div>

            {/* Tranches de prix rapides (Ranges) */}
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1.5">
                Tranches de prix rapides
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {priceRanges.map((range) => (
                  <Link
                    key={range.slug}
                    href={`/budget/${range.slug}`}
                    onClick={closeMenu}
                    className="px-2.5 py-2 rounded-lg bg-gray-50 hover:bg-red-50 border border-gray-200 hover:border-red-500/50 text-[11px] font-semibold text-gray-700 hover:text-red-600 transition-all text-center truncate"
                  >
                    {range.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* PIED DU DRAWER : ADRESSE EMAIL (SUPPRIMÉE DU FOOTER) */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/70">
          <a
            href="mailto:actumoto.tn@gmail.com"
            className="flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-red-50 border border-gray-200 hover:border-red-500/40 transition-all group shadow-2xs"
            aria-label="Nous contacter par email"
          >
            <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 border border-red-200 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-gray-500 block uppercase tracking-wider font-semibold">
                Contact & Support
              </span>
              <span className="text-xs font-bold text-gray-900 group-hover:text-red-600 transition-colors truncate block">
                actumoto.tn@gmail.com
              </span>
            </div>
          </a>
        </div>
      </aside>
    </>
  );

  return (
    <>
      {/* Bouton Burger dans le Header (Mobile & Desktop) - Uniquement l'icône, pas de mot "Menu" */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white hover:text-red-400 flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer group"
        aria-label="Ouvrir le menu"
        aria-expanded={isOpen}
      >
        <Menu className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Rendu via Portal pour s'affranchir du backdrop-filter du header et être au-dessus du slider */}
      {mounted && createPortal(drawerContent, document.body)}
    </>
  );
}
