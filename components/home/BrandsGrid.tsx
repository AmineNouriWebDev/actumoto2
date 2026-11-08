"use client";

import Link from "next/link";

interface Brand {
  name: string;
  logo: string;
  comingSoon?: boolean;
}

export default function BrandsGrid({ brands }: { brands: Brand[] }) {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Titre masqué visuellement pour respecter la consigne (conservé sr-only pour SEO) */}
      <h2 id="marques-main-title" className="sr-only">
        Toutes les marques moto disponibles en Tunisie
      </h2>

      <div
        className="brands-grid"
        role="list"
        aria-label="Liste des marques de motos disponibles"
      >
        {brands.map((brand, index) => {
          const href = brand.comingSoon
            ? "/coming-soon"
            : `/marques/${encodeURIComponent(brand.name)}`;

          const logoSrc = brand.logo.startsWith("./")
            ? brand.logo.substring(1)
            : brand.logo;

          return (
            <Link
              key={brand.name || index}
              href={href}
              className="brand-logo-card group cursor-pointer"
              role="listitem"
              title={`Motos ${brand.name}`}
            >
              {/* Plaque métallique (ratio natif 940x618 = 1.521:1) */}
              <div className="brand-plaque-container">
                <img
                  src="/img/plaque.webp"
                  alt=""
                  className="brand-plaque-img"
                  aria-hidden="true"
                  loading="lazy"
                />

                {/* Logo de la marque centré dans la plaque */}
                <div className="brand-plaque-content">
                  <img
                    src={logoSrc}
                    alt={`${brand.name} - Marque de moto disponible chez actumoto.tn`}
                    className="brand-logo-img"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      const nextSibling = e.currentTarget
                        .nextElementSibling as HTMLElement;
                      if (nextSibling) nextSibling.style.display = "block";
                    }}
                  />
                  <div className="text-center hidden">
                    <span className="text-sm font-bold text-gray-900 tracking-wide">
                      {brand.name}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
