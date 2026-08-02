"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CompareItem {
  brand: string;
  name: string;
  price: number | null;
  image: string;
}

export default function ComparateurBar() {
  const [compareList, setCompareList] = useState<CompareItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const KEY = "comparateur_selection";
    
    const updateList = () => {
      const list: CompareItem[] = JSON.parse(localStorage.getItem(KEY) || "[]");
      setCompareList(list);
    };

    // Initial load
    updateList();

    // Listen to our custom event + standard storage event
    window.addEventListener("comparateur_updated", updateList);
    window.addEventListener("storage", updateList);

    return () => {
      window.removeEventListener("comparateur_updated", updateList);
      window.removeEventListener("storage", updateList);
    };
  }, []);

  if (!isMounted) return null; // Don't render on server to avoid hydration mismatch

  const showBar = compareList.length > 0;

  const removeItem = (indexToRemove: number) => {
    const KEY = "comparateur_selection";
    const newList = compareList.filter((_, idx) => idx !== indexToRemove);
    setCompareList(newList);
    localStorage.setItem(KEY, JSON.stringify(newList));
    window.dispatchEvent(new Event("comparateur_updated"));
  };

  return (
    <div
      id="comparateur-bar"
      className="fixed bottom-0 left-0 w-full bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-[2000] transition-transform duration-300 border-t-4 border-red-600"
      style={{ transform: showBar ? "translateY(0)" : "translateY(100%)" }}
    >
      <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div
          className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 hide-scrollbar"
          id="comparateur-items"
        >
          {compareList.map((item, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-sm font-semibold whitespace-nowrap relative pr-8">
              {item.image && (
                <img src={item.image} alt={item.name} className="w-10 h-7 object-cover rounded bg-white" />
              )}
              <div className="flex flex-col leading-none justify-center">
                <span className="text-gray-500 text-[10px] uppercase">{item.brand}</span>
                <span className="text-xs">{item.name}</span>
              </div>
              <button
                onClick={() => removeItem(index)}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full p-0.5 shadow-sm border border-gray-100 flex items-center justify-center w-5 h-5 text-[10px]"
                title="Retirer"
                aria-label={`Retirer ${item.name}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end flex-shrink-0 pt-1 border-t sm:border-none border-gray-100">
          <span className="text-sm font-semibold text-gray-600" id="comparateur-count">
            {compareList.length} moto{compareList.length > 1 ? "s" : ""}
          </span>
          <Link
            href="/comparateur"
            id="comparateur-btn-go"
            className={`specs-btn whitespace-nowrap shadow-lg flex items-center justify-center text-center text-sm ${
              !showBar ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
            }`}
            style={{ textDecoration: "none" }}
          >
            Comparer
          </Link>
        </div>
      </div>
    </div>
  );
}
