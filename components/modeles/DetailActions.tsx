"use client";

import { useState, useEffect } from "react";
import { toggleFavorite as toggleFavoriteAction } from "@/lib/client-actions/favorites";
import { rateModel } from "@/lib/client-actions/reviews";
import { toast } from "react-toastify";

interface DetailActionsProps {
  modelId: string;
  brandName: string;
  modelName: string;
  modelPrice: number | null;
  mainImage: string;
  initialIsFavorite: boolean;
  initialUserRating?: number;
  initialAverageRating?: number;
  initialTotalRatings?: number;
  isLoggedIn?: boolean;
}

export default function DetailActions({
  modelId,
  brandName,
  modelName,
  modelPrice,
  mainImage,
  initialIsFavorite,
  initialUserRating = 0,
  initialAverageRating = 0,
  initialTotalRatings = 0,
  isLoggedIn = false,
}: DetailActionsProps) {
  const [isCompared, setIsCompared] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoadingFav, setIsLoadingFav] = useState(false);

  // Rating state
  const [userRating, setUserRating] = useState(Number(initialUserRating || 0));
  const [avgRating, setAvgRating] = useState(Number(initialAverageRating || 0));
  const [totalRatings, setTotalRatings] = useState(Number(initialTotalRatings || 0));
  const [hoverRating, setHoverRating] = useState(0);
  const [isLoadingRating, setIsLoadingRating] = useState(false);

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  useEffect(() => {
    setUserRating(Number(initialUserRating || 0));
    setAvgRating(Number(initialAverageRating || 0));
    setTotalRatings(Number(initialTotalRatings || 0));
  }, [initialUserRating, initialAverageRating, initialTotalRatings]);

  // Two-way synchronization with brand page and other components
  useEffect(() => {
    const handleModelSync = (e: any) => {
      if (e.detail?.modelId === modelId) {
        if (e.detail.isFavorite !== undefined) setIsFavorite(e.detail.isFavorite);
        if (e.detail.userRating !== undefined) setUserRating(e.detail.userRating);
        if (e.detail.avgRating !== undefined) setAvgRating(e.detail.avgRating);
        if (e.detail.totalRatings !== undefined) setTotalRatings(e.detail.totalRatings);
      }
    };
    window.addEventListener("model_interaction_updated", handleModelSync);
    return () => window.removeEventListener("model_interaction_updated", handleModelSync);
  }, [modelId]);

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
    if (!isLoggedIn) {
      toast.info("Veuillez vous connecter pour sauvegarder cette moto dans vos favoris.", {
        position: "top-right",
        autoClose: 3500,
      });
      return;
    }

    setIsLoadingFav(true);
    const prevFav = isFavorite;
    setIsFavorite(!prevFav);
    const res = await toggleFavoriteAction(modelId);
    setIsLoadingFav(false);

    if (res?.error) {
      setIsFavorite(prevFav);
      toast.error(res.error);
    } else if (res?.success) {
      setIsFavorite(res.isFavorite);
      if (res.isFavorite) toast.success("Ajouté aux favoris !");
      else toast.info("Retiré des favoris.");

      // Broadcast update
      window.dispatchEvent(
        new CustomEvent("model_interaction_updated", {
          detail: {
            modelId,
            isFavorite: res.isFavorite,
          },
        })
      );
    }
  };

  const handleRate = async (e: React.MouseEvent, star: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.info("Veuillez vous connecter pour noter cette moto.", {
        position: "top-right",
        autoClose: 3500,
      });
      return;
    }

    if (isLoadingRating) return;

    const previousRating = userRating;
    const previousAvg = avgRating;
    const previousTotal = totalRatings;

    // Optimistic calculation
    setUserRating(star);
    let newTotal = previousTotal;
    let newAvg = previousAvg;

    if (previousRating === 0) {
      newTotal = previousTotal + 1;
      newAvg = (previousAvg * previousTotal + star) / newTotal;
    } else {
      newAvg = (previousAvg * previousTotal - previousRating + star) / (previousTotal || 1);
    }

    setTotalRatings(newTotal);
    setAvgRating(newAvg);

    setIsLoadingRating(true);
    const res = await rateModel(modelId, star);
    setIsLoadingRating(false);

    if (res?.error) {
      setUserRating(previousRating);
      setAvgRating(previousAvg);
      setTotalRatings(previousTotal);
      toast.error(res.error);
    } else {
      const finalAvg = res.averageRating ?? newAvg;
      const finalTotal = res.totalRatings ?? newTotal;
      if (res.averageRating !== undefined) setAvgRating(res.averageRating);
      if (res.totalRatings !== undefined) setTotalRatings(res.totalRatings);
      toast.success(`Note de ${star}/5 enregistrée !`);

      // Broadcast update
      window.dispatchEvent(
        new CustomEvent("model_interaction_updated", {
          detail: {
            modelId,
            userRating: star,
            avgRating: finalAvg,
            totalRatings: finalTotal,
          },
        })
      );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
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
          title={isFavorite ? "Retirer de vos favoris" : "Ajouter aux favoris"}
          style={{ opacity: isLoadingFav ? 0.7 : 1, cursor: isLoadingFav ? "not-allowed" : "pointer" }}
        >
          <span>{isLoadingFav ? "..." : isFavorite ? "❤️ Favoris" : "🤍 Favoris"}</span>
        </button>
      </div>

      {/* Barre Rating 5 Étoiles & Moyenne des avis */}
      <div
        className="detail-rating-actions-box"
        style={{
          marginTop: 0,
          padding: "0.65rem 0.85rem",
          background: "#f9fafb",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        <div
          className="model-rating-group"
          style={{ width: "100%", justifyContent: "space-between", display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}
          title={
            userRating > 0
              ? `Votre note : ${userRating}/5 (Cliquez sur une étoile pour modifier)`
              : avgRating > 0
              ? `Note moyenne : ${avgRating.toFixed(1)}/5 (${totalRatings} avis)`
              : "Notez cette moto (sur 5 étoiles)"
          }
        >
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
            <div className="stars-wrapper">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled =
                  star <= (hoverRating || (userRating > 0 ? userRating : Math.round(avgRating)));
                return (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${isFilled ? "filled" : ""}`}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={(e) => handleRate(e, star)}
                    disabled={isLoadingRating}
                    aria-label={`Donner ${star} étoile${star > 1 ? "s" : ""}`}
                    style={{ fontSize: "1.35rem" }}
                  >
                    ★
                  </button>
                );
              })}
            </div>
            <span className="rating-score-label">
              <strong style={{ fontSize: "0.95rem", color: "#111827" }}>
                {avgRating > 0 ? avgRating.toFixed(1) : "0.0"}/5
              </strong>
              <span style={{ color: "#6b7280", marginLeft: "0.3rem", fontSize: "0.82rem" }}>
                ({totalRatings} avis)
              </span>
            </span>
          </div>

          {userRating > 0 && (
            <span
              className="user-score-badge"
              title="Votre évaluation enregistrée"
              style={{ fontSize: "0.78rem" }}
            >
              Votre note : {userRating}★
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

