"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ExternalLink } from "lucide-react";

interface SearchModelResult {
  id: string;
  name: string;
  brand: string;
  brandLogo?: string | null;
  price?: number | null;
  currency: string;
  image?: string | null;
  href: string;
}

interface SearchBrandResult {
  name: string;
  logo: string;
  href: string;
}

interface SearchResponse {
  models: SearchModelResult[];
  brands: SearchBrandResult[];
}

function cleanImgSrc(src?: string | null): string {
  if (!src) return "";
  return src.startsWith("./") ? src.substring(1) : src;
}

export default function HeaderSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounced search fetch
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setIsOpen(true);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Search fetch error:", err);
        }
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsMobileOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsMobileOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelect = (href: string) => {
    setIsOpen(false);
    setIsMobileOpen(false);
    setQuery("");
    router.push(href);
  };

  const hasBrands = results && results.brands.length > 0;
  const hasModels = results && results.models.length > 0;
  const hasNoResults =
    results && !hasBrands && !hasModels && query.trim().length >= 2 && !isLoading;

  return (
    <div ref={containerRef} className="relative w-full max-w-[280px] xl:max-w-[340px]">
      {/* Desktop Search Bar Input */}
      <div className="hidden lg:flex items-center w-full bg-white/10 hover:bg-white/15 focus-within:bg-white/20 focus-within:border-red-500/80 border border-white/20 rounded-xl px-3 py-1.5 transition-all duration-300 backdrop-blur-sm group">
        <Search className="w-4 h-4 text-gray-300 group-focus-within:text-red-500 transition-colors shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          placeholder="Rechercher moto, marque..."
          className="w-full bg-transparent border-none outline-none text-white text-xs xl:text-sm px-2 placeholder-gray-400 font-sans"
          aria-label="Recherche instantanée"
        />
        {isLoading && (
          <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin shrink-0" />
        )}
        {!isLoading && query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults(null);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer p-0.5"
            aria-label="Effacer la recherche"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Mobile / Tablet: Bouton loupe compact qui ouvre la barre de recherche */}
      <div className="lg:hidden flex items-center">
        <button
          type="button"
          onClick={() => {
            setIsMobileOpen(!isMobileOpen);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
          aria-label="Ouvrir la recherche"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Mobile Drawer / Input Expand */}
      {isMobileOpen && (
        <div className="lg:hidden absolute top-full left-0 mt-2 w-[280px] sm:w-[320px] bg-[#121620] border border-white/20 rounded-xl p-2 shadow-2xl z-50">
          <div className="flex items-center w-full bg-white/10 border border-white/20 rounded-lg px-2.5 py-1.5">
            <Search className="w-4 h-4 text-gray-300 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher moto, marque..."
              className="w-full bg-transparent border-none outline-none text-white text-xs px-2 placeholder-gray-400 font-sans"
              autoFocus
            />
            {isLoading && (
              <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin shrink-0" />
            )}
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults(null);
                }}
                className="text-gray-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Dropdown Popover */}
      {isOpen && (hasBrands || hasModels || hasNoResults) && (
        <div className="absolute top-full left-0 mt-2 w-[320px] sm:w-[380px] xl:w-[440px] max-w-[90vw] bg-[#111827]/98 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-50 text-white animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[70vh] overflow-y-auto p-2 divide-y divide-white/10 scrollbar-thin scrollbar-thumb-gray-600">
            {/* Section Marques */}
            {hasBrands && (
              <div className="pb-2 mb-1">
                <div className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase px-2 py-1 flex items-center justify-between">
                  <span>Marques</span>
                  <span className="text-red-500 font-mono">{results.brands.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 mt-1">
                  {results.brands.map((b) => (
                    <button
                      key={b.name}
                      type="button"
                      onClick={() => handleSelect(b.href)}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/5 hover:border-red-500/40 transition-all text-left group cursor-pointer"
                    >
                      {b.logo ? (
                        <img
                          src={cleanImgSrc(b.logo)}
                          alt={b.name}
                          className="w-7 h-5 object-contain bg-white/10 rounded px-1"
                        />
                      ) : (
                        <div className="w-7 h-5 rounded bg-gray-700 flex items-center justify-center text-[10px] font-bold">
                          {b.name.substring(0, 2)}
                        </div>
                      )}
                      <span className="text-xs font-semibold text-gray-200 group-hover:text-red-400 transition-colors truncate">
                        {b.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Section Modèles */}
            {hasModels && (
              <div className="pt-2">
                <div className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase px-2 py-1 flex items-center justify-between">
                  <span>Modèles de motos</span>
                  <span className="text-red-500 font-mono">{results.models.length}</span>
                </div>
                <div className="space-y-1 mt-1">
                  {results.models.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelect(m.href)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 transition-all text-left group cursor-pointer"
                    >
                      {/* Image du modèle */}
                      <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                        {m.image ? (
                          <img
                            src={cleanImgSrc(m.image)}
                            alt={m.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <span className="text-[9px] text-gray-500">Pas d'image</span>
                        )}
                      </div>

                      {/* Infos modèle */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800/40">
                            {m.brand}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-gray-100 group-hover:text-red-400 transition-colors truncate">
                          {m.name}
                        </h4>
                      </div>

                      {/* Prix */}
                      <div className="text-right shrink-0">
                        {m.price ? (
                          <span className="text-xs font-bold text-red-500 whitespace-nowrap">
                            {m.price.toLocaleString("fr-FR")} {m.currency}
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400">N.C.</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Aucun résultat */}
            {hasNoResults && (
              <div className="p-4 text-center">
                <p className="text-xs text-gray-400">
                  Aucune moto ou marque trouvée pour{" "}
                  <span className="text-red-400 font-semibold">« {query} »</span>
                </p>
                <Link
                  href="/modeles"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 underline"
                >
                  Voir tout le catalogue de motos <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
