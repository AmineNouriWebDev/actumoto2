"use client";

import { useState, useEffect } from "react";
import { toggleFavorite as toggleFavoriteAction } from "@/lib/client-actions/favorites";
import { toast } from "react-toastify";

interface DetailActionsProps {
  modelId: string;
  brandName: string;
  modelName: string;
  modelPrice: number | null;
  mainImage: string;
  initialIsFavorite: boolean;
}

export default function DetailActions({
  modelId,
  brandName,
  modelName,
  modelPrice,
  mainImage,
  initialIsFavorite,
}: DetailActionsProps) {
  const [isCompared, setIsCompared] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoadingFav, setIsLoadingFav] = useState(false);

  useEffect(() => {
    // Vérifie si le modèle est déjà dans le comparateur
    const KEY = "comparateur_selection";
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    const exists = list.some(
      (item: any) => item.brand === brandName && item.name === modelName
    );
    setIsCompared(exists);

    // Écouter les changements du comparateur depuis ailleurs (header, cards)
    const handleStorageChange = () => {
      const currentList = JSON.parse(localStorage.getItem(KEY) || "[]");
      const currentExists = currentList.some(
        (item: any) => item.brand === brandName && item.name === modelName
      );
      setIsCompared(currentExists);
    };

    window.addEventListener("comparateur_updated", handleStorageChange);
    return () => window.removeEventListener("comparateur_updated", handleStorageChange);
  }, [brandName, modelName]);

  const toggleCompare = () => {
    const KEY = "comparateur_selection";
    const list = JSON.parse(localStorage.getItem(KEY) || "[]");
    const existsIdx = list.findIndex(
      (item: any) => item.brand === brandName && item.name === modelName
    );

    if (existsIdx >= 0) {
      list.splice(existsIdx, 1);
      setIsCompared(false);
    } else {
      if (list.length >= 3) {
        alert("Vous pouvez comparer jusqu'à 3 motos maximum.");
        return;
      }
      list.push({ brand: brandName, name: modelName, price: modelPrice, image: mainImage });
      setIsCompared(true);
    }
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("comparateur_updated"));
  };

  const handleToggleFavorite = async () => {
    setIsLoadingFav(true);
    const res = await toggleFavoriteAction(modelId);
    setIsLoadingFav(false);

    if (res?.error) {
      toast.error(res.error);
    } else if (res?.success) {
      setIsFavorite(res.isFavorite);
      if (res.isFavorite) toast.success("Ajouté aux favoris !");
      else toast.info("Retiré des favoris.");
    }
  };

  return (
    <div style={{ display: "flex", gap: "0.75rem" }}>
      
      {/* Bouton Comparer */}
      <button
        onClick={toggleCompare}
        className={`compare-btn flex-1 py-2 px-0 rounded-md border-2 transition-all flex items-center justify-center shadow-sm gap-1 font-bold text-sm leading-none ${
          isCompared
            ? "bg-gray-800 border-gray-800 text-white"
            : "bg-transparent border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
        }`}
        title="Ajouter au comparateur"
      >
        <span>{isCompared ? "✓ Comparateur" : "⚖️ Comparer"}</span>
      </button>

      {/* Bouton Favoris */}
      <button
        onClick={handleToggleFavorite}
        disabled={isLoadingFav}
        className={`flex-1 py-2 px-0 rounded-md border-2 transition-all flex items-center justify-center shadow-sm gap-1 font-bold text-sm leading-none ${
          isFavorite
            ? "bg-red-600 border-red-600 text-white"
            : "bg-transparent border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
        }`}
        title="Ajouter aux favoris"
        style={{ opacity: isLoadingFav ? 0.7 : 1, cursor: isLoadingFav ? "not-allowed" : "pointer" }}
      >
        <span>{isLoadingFav ? "..." : isFavorite ? "❤️ Favoris" : "🤍 Favoris"}</span>
      </button>

    </div>
  );
}
