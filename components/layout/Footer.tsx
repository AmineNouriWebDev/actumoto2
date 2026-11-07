export default function Footer() {
  return (
    <footer className="footer bg-black text-white py-6 mt-0 border-t border-white/10" role="contentinfo">
      <div className="container mx-auto px-4">
        {/* Desktop Layout (>= 768px): 3 colonnes (Gauche: FB/IG, Centre: Copyright, Droite: YT/TikTok) */}
        <div className="hidden md:grid md:grid-cols-3 items-center">
          {/* Gauche : Facebook & Instagram */}
          <div className="flex items-center justify-start gap-3">
            <a
              href="https://www.facebook.com/profile.php?id=61584281323170"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center p-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-500/50"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook actumoto.tn"
            >
              <img src="/img/social/facebook.png" alt="Facebook" className="w-full h-full object-contain" />
            </a>
            <a
              href="https://www.instagram.com/actumoto.tn?stkn=MTRqNzhiczQ3aWFvNw=="
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center p-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-500/50"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram actumoto.tn"
            >
              <img src="/img/social/instagram.png" alt="Instagram" className="w-full h-full object-contain" />
            </a>
          </div>

          {/* Milieu : Copyright */}
          <div className="text-center">
            <p className="text-sm text-gray-300">
              Copyright © 2026 actumoto.tn - Tous droits réservés
            </p>
          </div>

          {/* Droite : YouTube & TikTok */}
          <div className="flex items-center justify-end gap-3">
            <a
              href="https://www.youtube.com/@ActumotoTn"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center p-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-500/50"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube actumoto.tn"
            >
              <img src="/img/social/youtube.png" alt="YouTube" className="w-full h-full object-contain" />
            </a>
            <a
              href="https://www.tiktok.com/@actumoto.tn?_r=1&_t=ZS-9AFrMJkO9jz"
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center p-1.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-500/50"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok actumoto.tn"
            >
              <img src="/img/social/tiktok.png" alt="TikTok" className="w-full h-full object-contain" />
            </a>
          </div>
        </div>

        {/* Mobile Layout (< 768px) : Alignés au même niveau (FB sur IG à gauche, Copyright au milieu, YT sur TikTok à droite) */}
        <div className="flex md:hidden items-center justify-between gap-2 w-full">
          {/* Gauche : Facebook sur Instagram */}
          <div className="flex flex-col gap-2 shrink-0">
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
          <div className="text-center px-2 flex-1">
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              Copyright © 2026 actumoto.tn<br />Tous droits réservés
            </p>
          </div>

          {/* Droite : YouTube sur TikTok */}
          <div className="flex flex-col gap-2 shrink-0">
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
