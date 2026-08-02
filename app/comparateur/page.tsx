"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatSpecification } from "@/lib/formatters";

const specLabels: Record<string, string> = {
  typeMoteur: "Type moteur",
  cylindree: "Cylindrée (cc)",
  puissance: "Puissance (ch)",
  coupleMaximal: "Couple Maximal (Nm)",
  refroidissement: "Refroidissement",
  vitesseMaximale: "Vitesse Maximale (km/h)",
  tankCapacity: "Réservoir (L)",
  autonomie: "Autonomie (km)",
  alimentation: "Alimentation",
  freinage: "Freinage",
  systemeFreinage: "Système de Freinage",
};

function formatPrice(price: number | null | undefined, currency: string = "DT"): string {
  if (price === null || price === undefined) return "En arrivage";
  return price.toLocaleString("fr-FR").replace(/\s/g, ",") + " " + currency;
}

function extractNumericValue(val: any): number | null {
  if (val === null || val === undefined || val === "") return null;
  const match = String(val).match(/[0-9]+([.,][0-9]+)?/);
  if (match) return parseFloat(match[0].replace(",", "."));
  return null;
}

interface CompareItem {
  brand: string;
  name: string;
}

interface FullModel extends Record<string, any> {
  brand: string;
  itemReferenceName: string;
}

export default function ComparateurPage() {
  const [compareList, setCompareList] = useState<CompareItem[]>([]);
  const [fullModels, setFullModels] = useState<FullModel[]>([]);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("comparateur_selection");
    const list: CompareItem[] = stored ? JSON.parse(stored) : [];
    setCompareList(list);
  }, []);

  // Resolve full model data from API
  useEffect(() => {
    if (compareList.length === 0) {
      setFullModels([]);
      return;
    }
    
    fetch("/api/models/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: compareList })
    })
    .then(res => res.json())
    .then(data => {
      if (data.models) {
        setFullModels(data.models);
      }
    })
    .catch(err => console.error("Failed to fetch comparison models:", err));
  }, [compareList]);

  const removeModel = useCallback((brand: string, name: string) => {
    const updated = compareList.filter((item) => !(item.brand === brand && item.name === name));
    setCompareList(updated);
    localStorage.setItem("comparateur_selection", JSON.stringify(updated));
  }, [compareList]);

  const clearAll = useCallback(() => {
    setCompareList([]);
    localStorage.setItem("comparateur_selection", JSON.stringify([]));
    window.location.href = "/";
  }, []);

  // Collect all spec keys that exist across models
  const allSpecKeys = new Set<string>();
  fullModels.forEach((m) => {
    if (m.specs) Object.keys(m.specs).forEach((k) => allSpecKeys.add(k));
  });
  const orderedKeys = Object.keys(specLabels).filter((k) => allSpecKeys.has(k));

  // Compute best values
  const specsToMaximize = ["cylindree", "puissance", "coupleMaximal", "vitesseMaximale", "tankCapacity", "autonomie"];
  const bestValues: Record<string, number> = {};

  const validPrices = fullModels.map((m) => m.price).filter((p) => p !== null && p !== undefined);
  if (validPrices.length > 0) bestValues.price = Math.min(...validPrices);

  specsToMaximize.forEach((key) => {
    if (orderedKeys.includes(key)) {
      const vals = fullModels
        .map((m) => (m.specs ? extractNumericValue(m.specs[key]) : null))
        .filter((v): v is number => v !== null);
      if (vals.length > 0) bestValues[key] = Math.max(...vals);
    }
  });

  return (
    <>
      {/* Floating back button */}
      <Link href="/" className="section-back-btn" title="Retour à l'accueil" aria-label="Retour à la page d'accueil">
        ←
      </Link>

      <section className="pt-24 pb-12 relative min-h-[60vh]" role="main">
        <div className="container mx-auto px-4">
          {/* Header actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div />
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md flex items-center gap-2"
              >
                <span className="text-lg leading-none">+</span> Ajouter une moto
              </Link>
              <button
                onClick={clearAll}
                className="bg-white border-2 border-red-100 hover:bg-red-50 text-red-600 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm"
              >
                Tout vider
              </button>
            </div>
          </div>

          {/* Empty state */}
          {compareList.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="text-6xl mb-4">🏍️</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Votre comparateur est vide</h2>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Parcourez notre catalogue et sélectionnez vos motos préférées pour comparer leurs caractéristiques en détail.
              </p>
              <Link
                href="/"
                className="inline-block bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider transition-all shadow-md"
              >
                Voir les marques
              </Link>
            </div>
          )}

          {/* Comparison table */}
          {fullModels.length > 0 && (
            <div id="comparateur-container" className="w-full">
              <div className="overflow-x-auto custom-scrollbar pb-4">
                <table className="compare-table">
                  <thead>
                    <tr>
                      <th className="spec-label bg-gray-50 border-b" style={{ verticalAlign: "middle" }}>
                        Modèle
                      </th>
                      {fullModels.map((m, i) => {
                        const mainImage = m.images?.[0] || m.image;
                        const isBestPrice = m.price !== null && m.price !== undefined && m.price === bestValues.price && fullModels.length > 1;
                        return (
                          <th key={i} className="min-w-[150px] sm:min-w-[250px] relative">
                            <button
                              className="remove-btn"
                              onClick={() => removeModel(m.brand, m.itemReferenceName)}
                              title="Retirer"
                            >
                              ×
                            </button>
                            <div className="model-img-wrapper">
                              <img
                                src={mainImage ? mainImage.replace(/^\.\//, "/") : "/img/placeholder-moto.jpg"}
                                alt={m.name}
                                className="model-img"
                                onError={(e) => { e.currentTarget.src = "/img/placeholder-moto.jpg"; }}
                              />
                            </div>
                            <div className="mb-1 text-gray-500 font-semibold uppercase tracking-wider text-xs">{m.brand}</div>
                            <h3 className="futurist-font text-base md:text-xl text-gray-900 leading-tight mb-2">{m.name}</h3>
                            <div className={`text-lg md:text-xl font-bold ${isBestPrice ? "best-price" : "text-red-600"}`}>
                              {formatPrice(m.price, m.currency)}
                            </div>
                            {m.fuelType === "Electrique" && (
                              <div className="mt-2 inline-block bg-cyan-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                                ⚡ ÉLECTRIQUE
                              </div>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {orderedKeys.map((key) => (
                      <tr key={key}>
                        <td className="spec-label">{specLabels[key]}</td>
                        {fullModels.map((m, i) => {
                          const rawVal = m.specs?.[key];
                          const display = rawVal !== undefined && rawVal !== null
                            ? formatSpecification(key, rawVal, m.fuelType)
                            : "-";
                          let isBest = false;
                          if (specsToMaximize.includes(key) && fullModels.length > 1 && rawVal !== undefined && rawVal !== null) {
                            const numVal = extractNumericValue(rawVal);
                            if (numVal !== null && numVal === bestValues[key]) isBest = true;
                          }
                          return (
                            <td key={i} className={`text-left sm:text-center text-gray-700 ${isBest ? "best-spec" : ""}`}>
                              {display}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {fullModels.length > 1 && (
                <div className="mt-6 flex items-center gap-2 text-sm text-gray-500 bg-white p-3 rounded-lg border border-gray-100 inline-flex">
                  <span className="w-3 h-3 rounded-full bg-green-100 border border-green-500 inline-block" />
                  <span>Indique la valeur la plus avantageuse parmi les motos sélectionnées</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
