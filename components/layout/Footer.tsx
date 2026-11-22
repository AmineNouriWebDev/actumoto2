"use client";

import { usePathname } from "next/navigation";

interface FooterProps {
  hideFooterOnOtherPages?: boolean;
}

export default function Footer({ hideFooterOnOtherPages = true }: FooterProps) {
  const pathname = usePathname();
  // Masquer totalement le footer sur la page de connexion
  if (pathname === "/connexion") {
    return null;
  }

  const isHome = pathname === "/";
  // Masquer le footer sur les autres pages si l'option est activée
  if (hideFooterOnOtherPages && !isHome) {
    return null;
  }

  return (
    <footer
      className={`footer text-white py-6 mt-0 ${
        isHome
          ? "footer-home-rustic"
          : "bg-black border-t border-white/10"
      }`}
      role="contentinfo"
    >
      <div className="container mx-auto px-4">
        {/* Desktop Layout (>= 768px): Centré, boutons agrandis et rapprochés du copyright */}
        <div className="hidden md:flex items-center justify-center gap-6 lg:gap-10">
          {/* Gauche : Facebook & Instagram */}
          <div className="flex items-center gap-3.5">
            <a
              href="https://www.facebook.com/profile.php?id=61584281323170"
              className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center p-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-500/50 shadow-sm"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook actumoto.tn"
            >
              <img src="/img/social/facebook.png" alt="Facebook" className="w-full h-full object-contain" />
            </a>
            <a
              href="https://www.instagram.com/actumoto.tn?stkn=MTRqNzhiczQ3aWFvNw=="
              className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center p-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-500/50 shadow-sm"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram actumoto.tn"
            >
              <img src="/img/social/instagram.png" alt="Instagram" className="w-full h-full object-contain" />
            </a>
          </div>

          {/* Milieu : Copyright */}
          <div className="text-center px-2">
            <p className="text-sm lg:text-base text-gray-300 font-medium whitespace-nowrap">
              Copyright © 2026 actumoto.tn - Tous droits réservés
            </p>
          </div>

          {/* Droite : YouTube & TikTok */}
          <div className="flex items-center gap-3.5">
            <a
              href="https://www.youtube.com/@ActumotoTn"
              className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center p-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-500/50 shadow-sm"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube actumoto.tn"
            >
              <img src="/img/social/youtube.png" alt="YouTube" className="w-full h-full object-contain" />
            </a>
            <a
              href="https://www.tiktok.com/@actumoto.tn?_r=1&_t=ZS-9AFrMJkO9jz"
              className="w-10 h-10 lg:w-11 lg:h-11 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center p-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-500/50 shadow-sm"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok actumoto.tn"
            >
              <img src="/img/social/tiktok.png" alt="TikTok" className="w-full h-full object-contain" />
            </a>
          </div>
        </div>

        {/* Mobile Layout (< 768px) : Alignés côte à côte (FB & IG à gauche, Copyright au milieu, YT & TikTok à droite) */}
        <div className="flex md:hidden items-center justify-between gap-1.5 w-full">
          {/* Gauche : Facebook & Instagram côte à côte */}
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href="https://www.facebook.com/profile.php?id=61584281323170"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center p-1.5 transition-all"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook actumoto.tn"
            >
              <img src="/img/social/facebook.png" alt="Facebook" className="w-full h-full object-contain" />
            </a>
            <a
              href="https://www.instagram.com/actumoto.tn?stkn=MTRqNzhiczQ3aWFvNw=="
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center p-1.5 transition-all"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram actumoto.tn"
            >
              <img src="/img/social/instagram.png" alt="Instagram" className="w-full h-full object-contain" />
            </a>
          </div>

          {/* Milieu : Copyright au même niveau */}
          <div className="text-center px-1 flex-1">
            <p className="text-[0.68rem] leading-tight text-gray-300 font-medium">
              Copyright © 2026 actumoto.tn<br />Tous droits réservés
            </p>
          </div>

          {/* Droite : YouTube & TikTok côte à côte */}
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href="https://www.youtube.com/@ActumotoTn"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center p-1.5 transition-all"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube actumoto.tn"
            >
              <img src="/img/social/youtube.png" alt="YouTube" className="w-full h-full object-contain" />
            </a>
            <a
              href="https://www.tiktok.com/@actumoto.tn?_r=1&_t=ZS-9AFrMJkO9jz"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center p-1.5 transition-all"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok actumoto.tn"
            >
              <img src="/img/social/tiktok.png" alt="TikTok" className="w-full h-full object-contain" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
