"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { addBrandReview } from "@/lib/client-actions/reviews";
import { toast } from "react-toastify";
import Link from "next/link";

interface BrandReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date | string;
  user?: {
    name: string | null;
  } | null;
}

interface BrandReviewSectionProps {
  brandId: string;
  brandName: string;
  isLoggedIn: boolean;
  existingReview?: { rating: number; comment: string | null } | null;
  approvedReviews: BrandReviewItem[];
}

export default function BrandReviewSection({
  brandId,
  brandName,
  isLoggedIn,
  existingReview,
  approvedReviews,
}: BrandReviewSectionProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleRequireLogin = () => {
    const targetUrl = pathname || `/marques/${encodeURIComponent(brandName)}`;
    router.push(`/connexion?callbackUrl=${encodeURIComponent(targetUrl)}&needLogin=1`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      handleRequireLogin();
      return;
    }
    if (rating === 0 && comment.trim() === "") {
      toast.error("Veuillez laisser une note ou un commentaire.");
      return;
    }

    setIsLoading(true);
    const res = await addBrandReview(brandId, rating, comment);
    setIsLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      setIsSubmitted(true);
      toast.success("Votre commentaire a été soumis avec succès.");
    }
  };

  const loginRedirectUrl = `/connexion?callbackUrl=${encodeURIComponent(
    pathname || `/marques/${encodeURIComponent(brandName)}`
  )}&needLogin=1`;

  return (
    <div className="max-w-[1200px] mx-auto px-4 mt-10 mb-12">
      {/* Formulaire d'avis / commentaire sur la marque */}
      <div className="detail-card-section mb-8" style={{ background: "#f9fafb", border: "1px solid #e5e7eb" }}>
        <h3 className="detail-section-title">
          {existingReview ? `✏️ Modifier votre avis sur ${brandName}` : `⭐ Donner votre avis sur ${brandName}`}
        </h3>

        {isSubmitted ? (
          <div style={{ padding: "2rem", textAlign: "center", background: "#ecfdf5", borderRadius: "12px", color: "#065f46" }}>
            <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}>✅</span>
            <strong style={{ fontSize: "1.1rem" }}>Merci pour votre avis sur {brandName} !</strong>
            <p style={{ marginTop: "0.5rem", color: "#047857" }}>
              Votre commentaire a été envoyé et sera visible publiquement après validation par l'administrateur.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Note sur 5 */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
                Votre note sur 5 (optionnelle)
              </label>
              <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => {
                      if (!isLoggedIn) {
                        handleRequireLogin();
                        return;
                      }
                      setRating(star);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "2rem",
                      color: star <= (hoverRating || rating) ? "#fbbf24" : "#d1d5db",
                      transition: "color 0.2s",
                      padding: 0,
                      lineHeight: 1,
                    }}
                    aria-label={`Noter ${star} sur 5`}
                  >
                    ★
                  </button>
                ))}
                <span style={{ marginLeft: "1rem", color: "#6b7280", fontSize: "0.9rem" }}>
                  {rating > 0 ? `${rating} / 5` : "Aucune note sélectionnée"}
                </span>
              </div>
            </div>

            {/* Commentaire texte */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontWeight: 600, color: "#374151", marginBottom: "0.5rem" }}>
                Votre commentaire sur la marque {brandName}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onFocus={() => {
                  if (!isLoggedIn) {
                    handleRequireLogin();
                  }
                }}
                placeholder={`Partagez votre avis, vos retours d'expérience ou vos questions sur ${brandName}...`}
                style={{
                  width: "100%",
                  minHeight: "110px",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit",
                  background: "#fff",
                }}
              />
            </div>

            {/* Bouton d'action */}
            {isLoggedIn ? (
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
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading ? "Envoi en cours..." : (existingReview ? "Modifier mon commentaire" : "Publier mon commentaire")}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRequireLogin}
                style={{
                  background: "#ff0000",
                  color: "#fff",
                  border: "none",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Se connecter pour commenter
              </button>
            )}

            {!isLoggedIn && (
              <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#6b7280" }}>
                <em>
                  Vous devez être connecté pour laisser un commentaire.{" "}
                  <Link href={loginRedirectUrl} style={{ color: "#ff0000", textDecoration: "underline", fontWeight: 600 }}>
                    Se connecter maintenant
                  </Link>
                </em>
              </p>
            )}
          </form>
        )}
      </div>

      {/* Liste des commentaires et avis approuvés */}
      <div className="detail-card-section" style={{ background: "#fff", border: "1px solid #e5e7eb" }}>
        <h3 className="detail-section-title">
          💬 Commentaires & Avis sur {brandName}
        </h3>

        {!approvedReviews || approvedReviews.length === 0 ? (
          <p className="text-gray-500 text-sm italic" style={{ padding: "1rem 0" }}>
            Aucun commentaire pour le moment. Soyez le premier à donner votre avis sur {brandName} !
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1.5rem" }}>
            {approvedReviews.map((rev) => (
              <div
                key={rev.id}
                style={{
                  padding: "1.25rem",
                  background: "#f9fafb",
                  borderRadius: "12px",
                  border: "1px solid #f3f4f6",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.5rem",
                  }}
                >
                  <strong style={{ color: "#374151" }}>{rev.user?.name || "Client actumoto"}</strong>
                  <span style={{ fontSize: "0.85em", color: "#9ca3af" }}>
                    {new Date(rev.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                {rev.rating > 0 && (
                  <div style={{ color: "#fbbf24", marginBottom: "0.5rem", fontSize: "1.1em" }}>
                    {"⭐".repeat(rev.rating)}
                  </div>
                )}
                {rev.comment && (
                  <p style={{ color: "#4b5563", lineHeight: "1.5", margin: 0, whiteSpace: "pre-wrap" }}>
                    {rev.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
