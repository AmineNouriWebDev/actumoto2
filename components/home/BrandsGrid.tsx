"use client";

import Link from "next/link";

interface Brand {
  name: string;
  logo: string;
  comingSoon?: boolean;
}

export default function BrandsGrid({ brands }: { brands: Brand[] }) {
  return (
    <section className="py-6 relative" aria-labelledby="marques-main-title">
      <div className="container mx-auto px-4">
        {/* Titre masqué visuellement pour respecter la consigne (conservé sr-only pour SEO & accessibilité) */}
        <h2 id="marques-main-title" className="sr-only">
          Toutes les marques moto
        </h2>

        <div className="brands-grid" role="list" aria-label="Liste des marques de motos disponibles">
            {brands.map((brand, index) => {
              const href = brand.comingSoon 
                ? "/coming-soon" 
                : `/marques/${encodeURIComponent(brand.name)}`;

              return (
                <Link 
                  key={index} 
                  href={href}
                  className="brand-logo-card group cursor-pointer"
                  role="listitem"
                >
                  <img
                    src={brand.logo.startsWith('./') ? brand.logo.substring(1) : brand.logo}
                    alt={`${brand.name} - Marque de moto disponible chez actumoto.tn`}
                    className="brand-logo-img"
                    width={180}
                    height={80}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextSibling) nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="text-center hidden">
                    <div className="text-lg font-bold text-gray-800">{brand.name}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
  );
}
