"use client";

import Link from "next/link";
import { brands } from "@/lib/data";

export default function BrandsGrid() {
  return (
    <>
      <section className="pt-16 md:pt-8 pb-4">
        <div className="container mx-auto px-4 text-center">
          <h2 id="marques-main-title" className="futurist-font text-xl md:text-2xl text-gray-900 mb-2">
            TOUTES LES MARQUES <span className="text-red-600">MOTO</span>
          </h2>

          <div className="social-separator">
            <div className="separator-line"></div>
            <div className="red-square"></div>
            <div className="separator-line"></div>
          </div>
        </div>
      </section>

      <section className="py-5 relative" aria-labelledby="marques-main-title">
        <div className="container mx-auto px-4">
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
    </>
  );
}
