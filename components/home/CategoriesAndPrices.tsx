"use client";

import { useState } from "react";
import Link from "next/link";

interface Category {
  name: string;
  logo: string;
}

const priceRanges = [
  { slug: "moins-de-4000",   label: <><span className="price-range-arrow">Moins de</span> <span className="price-range-text">4K</span></> },
  { slug: "4000-7000",       label: <>4K <span className="price-range-arrow">⇒</span> 7K</> },
  { slug: "7000-10000",      label: <>7K <span className="price-range-arrow">⇒</span> 10K</> },
  { slug: "10000-15000",     label: <>10K <span className="price-range-arrow">⇒</span> 15K</> },
  { slug: "15000-20000",     label: <>15K <span className="price-range-arrow">⇒</span> 20K</> },
  { slug: "plus-de-20000",   label: <><span className="price-range-arrow">Plus de</span> <span className="price-range-text">20K</span></> },
];

export default function CategoriesAndPrices({ categories }: { categories: Category[] }) {
  const [activeTab, setActiveTab] = useState<"categories" | "prices">("categories");

  return (
    <>
      {/* Navigation Tabs */}
      <section className="pt-4 pb-0">
        <div className="container mx-auto px-4">
          <div className="nav-tabs-container">
            <button
              className={`nav-tab-btn flex-1 md:flex-none justify-center ${activeTab === "categories" ? "active" : ""}`}
              onClick={() => setActiveTab("categories")}
            >
              Catégories
            </button>
            <button
              className={`nav-tab-btn flex-1 md:flex-none justify-center ${activeTab === "prices" ? "active" : ""}`}
              onClick={() => setActiveTab("prices")}
            >
              Budget
            </button>
          </div>
        </div>
      </section>

      {/* Categories Content */}
      <div className={activeTab === "categories" ? "" : "hidden-section"}>
        <section className="py-0 relative" aria-labelledby="categories-title">
          <div className="container mx-auto px-4">
            <h2 id="categories-title" className="sr-only">Catégories de motos</h2>
            <div className="categories-container" role="list" aria-label="Liste des catégories de motos disponibles">
              {categories.map((category: Category, index: number) => (
                <Link
                  key={index}
                  href={`/categories/${encodeURIComponent(category.name)}`}
                  className="category-card"
                  role="listitem"
                >
                  <img
                    src={category.logo.startsWith('./') ? category.logo.substring(1) : category.logo}
                    alt={`${category.name} - Catégorie de moto`}
                    className="category-icon"
                    width={328}
                    height={187}
                    loading="lazy"
                  />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Prices Content */}
      <section
        className={`py-0 ${activeTab === "prices" ? "" : "hidden-section"}`}
        aria-labelledby="prices-title"
      >
        <div className="container mx-auto px-4">
          <h2 id="prices-title" className="sr-only">Filtrer par prix</h2>
          <div className="price-ranges-grid">
            {priceRanges.map((range, index) => (
              <Link
                key={index}
                href={`/budget/${range.slug}`}
                className="price-range-card"
              >
                <div className="price-range-text">
                  {range.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
