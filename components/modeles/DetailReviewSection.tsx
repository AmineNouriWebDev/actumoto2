"use client";

import { useState } from "react";

import { addReview } from "@/lib/client-actions/reviews";
import { toast } from "react-toastify";

export default function DetailReviewSection({ modelId, isLoggedIn }: { modelId: string, isLoggedIn: boolean }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Vous devez être connecté pour soumettre un avis.");
      return;
    }
    if (rating === 0) {
      toast.error("Veuillez sélectionner une note.");
      return;
    }
    
    setIsLoading(true);
    const res = await addReview(modelId, rating, review);
    setIsLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      setIsSubmitted(true);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 mt-8 mb-8">
      <div className="detail-card-section" style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}>
        <h3 className="detail-section-title">⭐ Donner votre avis sur cette moto</h3>
        
        {isSubmitted ? (
          <div style={{ padding: "2rem", textAlign: "center", background: "#ecfdf5", borderRadius: "8px", color: "#065f46" }}>
            <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}>✅</span>
            <strong>Merci pour votre avis !</strong>
            <p style={{ marginTop: "0.5rem" }}>Votre évaluation a été prise en compte.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
                Votre note sur 5
              </label>
              <div style={{ display: "flex", gap: "0.25rem" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "2rem",
                      color: star <= (hoverRating || rating) ? "#fbbf24" : "#d1d5db",
                      transition: "color 0.2s",
                      padding: 0,
                      lineHeight: 1
                    }}
                  >
                    ★
                  </button>
                ))}
                <span style={{ marginLeft: "1rem", color: "#6b7280", fontSize: "0.9rem", alignSelf: "center" }}>
                  {rating > 0 ? `${rating} / 5` : "Sélectionnez une note"}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
                Votre commentaire (optionnel)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Partagez votre expérience avec cette moto..."
                style={{
                  width: "100%",
                  minHeight: "100px",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                background: "#ff0000",
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: isLoading ? "not-allowed" : "pointer",
                transition: "opacity 0.2s",
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? "Envoi en cours..." : "Envoyer mon avis"}
            </button>
            
            {!isLoggedIn && (
              <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#6b7280" }}>
                <em>Vous devez être connecté pour laisser un avis. <a href="/connexion" style={{ color: "#ff0000", textDecoration: "underline" }}>Se connecter</a></em>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
