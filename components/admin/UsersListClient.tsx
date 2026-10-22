"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { updateUser, deleteUser, resetUserPassword, getUserDetails } from "@/lib/admin-actions/users";
import { approveReview, deleteReview } from "@/lib/admin-actions/reviews";
import { EyeIcon, EyeOffIcon } from "lucide-react";

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: "ADMIN" | "DEALER" | "CLIENT";
  emailVerified: Date | null;
  modelsQuota: number;
  modelsCreatedCount: number;
  createdAt: Date;
  _count?: {
    favorites: number;
    reviews: number;
  };
};

export default function UsersListClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Client Details Modal state
  const [detailsUser, setDetailsUser] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsTab, setDetailsTab] = useState<"reviews" | "favorites">("reviews");

  const router = useRouter();

  // Open details modal
  const handleOpenDetails = async (user: User) => {
    setDetailsUser({ ...user, favorites: [], reviews: [] });
    setLoadingDetails(true);
    try {
      const fullData = await getUserDetails(user.id);
      if (fullData) {
        setDetailsUser(fullData);
      }
    } catch (err) {
      toast.error("Erreur lors de la récupération des détails.");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Moderate review from modal
  const handleApproveReviewInModal = async (reviewId: string) => {
    const res = await approveReview(reviewId);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Avis approuvé avec succès !");
      setDetailsUser((prev: any) => ({
        ...prev,
        reviews: prev.reviews.map((r: any) =>
          r.id === reviewId ? { ...r, isApproved: true } : r
        ),
      }));
      router.refresh();
    }
  };

  const handleDeleteReviewInModal = async (reviewId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cet avis ?")) return;
    const res = await deleteReview(reviewId);
    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Avis supprimé.");
      setDetailsUser((prev: any) => ({
        ...prev,
        reviews: prev.reviews.filter((r: any) => r.id !== reviewId),
      }));
      setUsers((prev) =>
        prev.map((u) =>
          u.id === detailsUser?.id
            ? {
                ...u,
                _count: {
                  favorites: u._count?.favorites || 0,
                  reviews: Math.max(0, (u._count?.reviews || 1) - 1),
                },
              }
            : u
        )
      );
      router.refresh();
    }
  };

  // Filtres
  const filteredUsers = users.filter((u) => {
    const matchesSearch = (u.name?.toLowerCase().includes(search.toLowerCase()) || "") ||
                          (u.email?.toLowerCase().includes(search.toLowerCase()) || "");
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Sauvegarde des modifications
  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as "ADMIN" | "DEALER" | "CLIENT";
    const modelsQuota = parseInt(formData.get("modelsQuota") as string) || 0;
    const isVerified = formData.get("emailVerified") === "on";

    const res = await updateUser(editingUser.id, { 
      name, email, role, modelsQuota, emailVerified: isVerified 
    });

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Utilisateur mis à jour avec succès.");
      setUsers(users.map(u => u.id === editingUser.id ? { 
        ...u, name, email, role, modelsQuota, emailVerified: isVerified ? new Date() : null 
      } : u));
      setEditingUser(null);
      router.refresh();
    }
    setIsSubmitting(false);
  };

  // Suppression
  const handleDelete = async () => {
    if (!deletingUserId) return;
    setIsSubmitting(true);
    const res = await deleteUser(deletingUserId);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Utilisateur supprimé.");
      setUsers(users.filter(u => u.id !== deletingUserId));
      setDeletingUserId(null);
      router.refresh();
    }
    setIsSubmitting(false);
  };

  // Réinitialisation mot de passe
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!passwordUser) return;
    setIsSubmitting(true);
    
    const res = await resetUserPassword(passwordUser.id, passwordInput.trim() === "" ? undefined : passwordInput);
    if (res.error) {
      toast.error(res.error);
    } else {
      if (res.isGenerated) {
        // Optionnel : Vous pouvez utiliser prompt ou alert pour copier
        alert(`Le nouveau mot de passe généré est : ${res.newPassword}\nVeuillez le copier et le transmettre à l'utilisateur.`);
        toast.success("Mot de passe généré et mis à jour.");
      } else {
        toast.success("Le mot de passe a été réinitialisé.");
      }
      setPasswordUser(null);
      setPasswordInput("");
    }
    setIsSubmitting(false);
  };

  // Toggle Vérification Rapide
  const handleToggleVerification = async (user: User) => {
    setIsSubmitting(true);
    const newVerified = user.emailVerified ? null : new Date();
    const res = await updateUser(user.id, { emailVerified: !!newVerified });
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Statut mis à jour : ${newVerified ? 'Vérifié' : 'En attente'}`);
      setUsers(users.map(u => u.id === user.id ? { ...u, emailVerified: newVerified } : u));
    }
    setIsSubmitting(false);
  };

  return (
    <div>
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
          <input 
            type="text" 
            placeholder="Rechercher (nom, email)..." 
            className="form-input" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: "250px" }}
          />
          <select 
            className="form-select" 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{ width: "200px" }}
          >
            <option value="ALL">Tous les rôles</option>
            <option value="CLIENT">Clients</option>
            <option value="DEALER">Concessionnaires</option>
          </select>
        </div>
      </div>

      <div className="admin-card" style={{ overflowX: "auto" }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Activité</th>
              <th>Statut</th>
              <th>Date d'inscription</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>Aucun utilisateur trouvé.</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td style={{ fontWeight: 500 }}>{user.name || "N/A"}</td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{ 
                      padding: "0.25rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.75rem", fontWeight: 700,
                      background: user.role === "DEALER" ? "#3b82f620" : "#10b98120",
                      color: user.role === "DEALER" ? "#3b82f6" : "#10b981"
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                      <span
                        title={`${user._count?.favorites || 0} favori(s) — Cliquez pour voir`}
                        style={{
                          fontSize: "0.75rem",
                          background: "rgba(239, 68, 68, 0.12)",
                          color: "#f87171",
                          padding: "0.2rem 0.45rem",
                          borderRadius: "4px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setDetailsTab("favorites");
                          handleOpenDetails(user);
                        }}
                      >
                        ❤️ {user._count?.favorites || 0}
                      </span>
                      <span
                        title={`${user._count?.reviews || 0} avis/commentaire(s) — Cliquez pour voir`}
                        style={{
                          fontSize: "0.75rem",
                          background: "rgba(245, 158, 11, 0.12)",
                          color: "#fbbf24",
                          padding: "0.2rem 0.45rem",
                          borderRadius: "4px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setDetailsTab("reviews");
                          handleOpenDetails(user);
                        }}
                      >
                        ⭐ {user._count?.reviews || 0}
                      </span>
                    </div>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleToggleVerification(user)}
                      disabled={isSubmitting}
                      style={{
                        background: "none", border: "none", cursor: "pointer", 
                        padding: "0.25rem 0.5rem", borderRadius: "0.25rem",
                        transition: "background 0.2s"
                      }}
                      className="hover:bg-gray-100"
                      title="Cliquez pour changer le statut"
                    >
                      {user.emailVerified ? (
                        <span style={{ color: "#10b981", fontSize: "0.875rem" }}>✅ Vérifié</span>
                      ) : (
                        <span style={{ color: "#f59e0b", fontSize: "0.875rem" }}>⏳ En attente</span>
                      )}
                    </button>
                  </td>
                  <td style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                    {new Date(user.createdAt).toLocaleDateString("fr-TN")}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                      <button
                        className="action-btn details"
                        onClick={() => {
                          setDetailsTab("reviews");
                          handleOpenDetails(user);
                        }}
                        title="Consulter la fiche client (favoris, avis, commentaires)"
                      >
                        👁️
                      </button>
                      <button className="action-btn edit" onClick={() => setEditingUser(user)} title="Modifier">✏️</button>
                      <button className="action-btn" onClick={() => setPasswordUser(user)} title="Réinitialiser MDP">🔑</button>
                      <button className="action-btn delete" onClick={() => setDeletingUserId(user.id)} title="Supprimer">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Edition Utilisateur */}
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Modifier {editingUser.name || "l'utilisateur"}</h2>
            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label>Nom complet</label>
                <input type="text" name="name" className="form-input" defaultValue={editingUser.name || ""} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" className="form-input" defaultValue={editingUser.email || ""} required />
              </div>
              <div className="form-group">
                <label>Rôle</label>
                <select name="role" className="form-select" defaultValue={editingUser.role}>
                  <option value="CLIENT">Client</option>
                  <option value="DEALER">Concessionnaire (PRO)</option>
                </select>
              </div>
              {editingUser.role === "DEALER" && (
                <div className="form-group">
                  <label>Quota de modèles (Pour Concessionnaire)</label>
                  <input type="number" name="modelsQuota" className="form-input" defaultValue={editingUser.modelsQuota} min={0} />
                  <small style={{ color: "#9ca3af" }}>Modèles créés : {editingUser.modelsCreatedCount}</small>
                </div>
              )}
              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setEditingUser(null)} style={{ flex: 1 }}>Annuler</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ flex: 1 }}>
                  {isSubmitting ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Réinitialisation MDP */}
      {passwordUser && (
        <div className="modal-overlay" onClick={() => setPasswordUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>Réinitialiser le mot de passe</h2>
            <p style={{ color: "#9ca3af", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Pour l'utilisateur <strong>{passwordUser.email}</strong>.<br />
              Laissez vide pour générer un mot de passe aléatoire sécurisé, ou tapez un nouveau mot de passe (8 caractères minimum).
            </p>
            <form onSubmit={handleResetPassword}>
              <div className="form-group relative">
                <label>Nouveau mot de passe</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-input pr-10" 
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Générer aléatoirement (Laisser vide)" 
                    minLength={passwordInput.length > 0 ? 8 : 0}
                  />
                  {passwordInput.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      title={showPassword ? "Masquer" : "Afficher"}
                    >
                      {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                    </button>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setPasswordUser(null)} style={{ flex: 1 }}>Annuler</button>
                <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ flex: 1 }}>
                  {isSubmitting ? "En cours..." : (passwordInput ? "Valider le mot de passe" : "Générer un mot de passe")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmation de Suppression */}
      {deletingUserId && typeof document !== "undefined" && createPortal(
        <div className="custom-modal-overlay" onClick={() => setDeletingUserId(null)}>
          <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
            <div className="custom-modal-icon">⚠️</div>
            <h3 className="custom-modal-title">Confirmation requise</h3>
            <p className="custom-modal-text">
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible et toutes les données associées seront perdues.
            </p>
            <div className="custom-modal-actions">
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => setDeletingUserId(null)}
              >
                Annuler
              </button>
              <button 
                type="button" 
                className="btn-danger" 
                onClick={handleDelete} 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Suppression..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Détails Client (Favoris & Avis / Commentaires) */}
      {detailsUser && (
        <div className="modal-overlay" onClick={() => setDetailsUser(null)}>
          <div
            className="modal-content modal-content-lg"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "800px" }}
          >
            {/* Header modal */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", borderBottom: "1px solid #374151", paddingBottom: "1rem" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: "1.35rem", fontWeight: 700, margin: 0, color: "#f9fafb" }}>
                    👤 {detailsUser.name || "Client"}
                  </h2>
                  <span style={{
                    padding: "0.2rem 0.6rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700,
                    background: detailsUser.role === "DEALER" ? "rgba(59, 130, 246, 0.2)" : "rgba(16, 185, 129, 0.2)",
                    color: detailsUser.role === "DEALER" ? "#60a5fa" : "#34d399",
                    border: `1px solid ${detailsUser.role === "DEALER" ? "rgba(59, 130, 246, 0.4)" : "rgba(16, 185, 129, 0.4)"}`
                  }}>
                    {detailsUser.role}
                  </span>
                  {detailsUser.emailVerified ? (
                    <span style={{ fontSize: "0.8rem", color: "#34d399" }}>✅ Vérifié</span>
                  ) : (
                    <span style={{ fontSize: "0.8rem", color: "#fbbf24" }}>⏳ En attente de vérification</span>
                  )}
                </div>
                <p style={{ color: "#9ca3af", margin: "0.35rem 0 0", fontSize: "0.875rem" }}>
                  📧 {detailsUser.email} &bull; Inscrit le {new Date(detailsUser.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsUser(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#9ca3af",
                  fontSize: "1.4rem",
                  cursor: "pointer",
                  lineHeight: 1,
                  padding: "0.25rem",
                }}
                title="Fermer"
              >
                ✕
              </button>
            </div>

            {loadingDetails ? (
              <div style={{ textAlign: "center", padding: "3rem", color: "#9ca3af" }}>
                <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>⏳</div>
                Chargement des informations du client...
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", borderBottom: "1px solid #374151" }}>
                  <button
                    type="button"
                    onClick={() => setDetailsTab("reviews")}
                    style={{
                      background: "none",
                      border: "none",
                      borderBottom: detailsTab === "reviews" ? "2px solid #eab308" : "2px solid transparent",
                      color: detailsTab === "reviews" ? "#facc15" : "#9ca3af",
                      fontWeight: 700,
                      padding: "0.6rem 1rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      fontSize: "0.92rem",
                    }}
                  >
                    ⭐ Avis & Notations ({detailsUser.reviews?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailsTab("favorites")}
                    style={{
                      background: "none",
                      border: "none",
                      borderBottom: detailsTab === "favorites" ? "2px solid #ef4444" : "2px solid transparent",
                      color: detailsTab === "favorites" ? "#f87171" : "#9ca3af",
                      fontWeight: 700,
                      padding: "0.6rem 1rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      fontSize: "0.92rem",
                    }}
                  >
                    ❤️ Motos Favorites / Wishlist ({detailsUser.favorites?.length || 0})
                  </button>
                </div>

                {/* Tab content : Reviews */}
                {detailsTab === "reviews" && (
                  <div>
                    {!detailsUser.reviews || detailsUser.reviews.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "#111827", borderRadius: "0.75rem", color: "#6b7280" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>💬</div>
                        <p style={{ margin: 0 }}>Aucun avis ni commentaire n'a encore été laissé par cet utilisateur.</p>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {detailsUser.reviews.map((rev: any) => {
                          const modelImg = rev.model?.images?.[0]?.url?.replace(/^\.\//, "/") || "/img/placeholder-moto.jpg";
                          const modelUrl = rev.model?.hasDetailPage
                            ? `/marques/${encodeURIComponent(rev.model.brand?.name)}/${encodeURIComponent(rev.model.name)}`
                            : `/marques/${encodeURIComponent(rev.model.brand?.name)}`;

                          return (
                            <div
                              key={rev.id}
                              style={{
                                background: "#111827",
                                border: "1px solid #374151",
                                borderRadius: "0.75rem",
                                padding: "1.25rem",
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.75rem",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                  <img
                                    src={modelImg}
                                    alt={rev.model?.name}
                                    style={{ width: "50px", height: "40px", objectFit: "cover", borderRadius: "6px", border: "1px solid #374151" }}
                                    onError={(e) => { e.currentTarget.src = "/img/placeholder-moto.jpg"; }}
                                  />
                                  <div>
                                    <a
                                      href={modelUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: "#f9fafb", fontWeight: 700, textDecoration: "none", fontSize: "1rem" }}
                                      className="hover:underline"
                                    >
                                      {rev.model?.brand?.name} {rev.model?.name} ↗
                                    </a>
                                    <div style={{ color: "#fbbf24", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.2rem" }}>
                                      <span>{"★".repeat(rev.rating)}{"☆".repeat(Math.max(0, 5 - rev.rating))}</span>
                                      <strong style={{ color: "#f9fafb", fontSize: "0.85rem" }}>({rev.rating}/5)</strong>
                                    </div>
                                  </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  {rev.isApproved ? (
                                    <span style={{ fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.15)", color: "#34d399", padding: "0.2rem 0.5rem", borderRadius: "4px", border: "1px solid rgba(16, 185, 129, 0.3)", fontWeight: 600 }}>
                                      ✅ Approuvé
                                    </span>
                                  ) : (
                                    <span style={{ fontSize: "0.75rem", background: "rgba(245, 158, 11, 0.15)", color: "#fbbf24", padding: "0.2rem 0.5rem", borderRadius: "4px", border: "1px solid rgba(245, 158, 11, 0.3)", fontWeight: 600 }}>
                                      ⏳ En attente
                                    </span>
                                  )}
                                  <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                    {new Date(rev.createdAt).toLocaleDateString("fr-FR")}
                                  </span>
                                </div>
                              </div>

                              {rev.comment ? (
                                <div style={{ background: "rgba(255, 255, 255, 0.03)", borderLeft: "3px solid #eab308", padding: "0.75rem 1rem", borderRadius: "0 6px 6px 0", color: "#e5e7eb", fontSize: "0.9rem", fontStyle: "italic", lineHeight: 1.5 }}>
                                  "{rev.comment}"
                                </div>
                              ) : (
                                <div style={{ color: "#6b7280", fontSize: "0.825rem", fontStyle: "italic" }}>
                                  (Note attribuée directement sans commentaire texte)
                                </div>
                              )}

                              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", paddingTop: "0.25rem" }}>
                                {!rev.isApproved && (
                                  <button
                                    type="button"
                                    onClick={() => handleApproveReviewInModal(rev.id)}
                                    style={{
                                      background: "rgba(16, 185, 129, 0.2)",
                                      color: "#34d399",
                                      border: "1px solid rgba(16, 185, 129, 0.4)",
                                      borderRadius: "6px",
                                      padding: "0.3rem 0.75rem",
                                      fontSize: "0.8rem",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                    }}
                                  >
                                    ✓ Approuver
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteReviewInModal(rev.id)}
                                  style={{
                                    background: "rgba(239, 68, 68, 0.2)",
                                    color: "#f87171",
                                    border: "1px solid rgba(239, 68, 68, 0.4)",
                                    borderRadius: "6px",
                                    padding: "0.3rem 0.75rem",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                  }}
                                >
                                  🗑️ Supprimer l'avis
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab content : Favorites */}
                {detailsTab === "favorites" && (
                  <div>
                    {!detailsUser.favorites || detailsUser.favorites.length === 0 ? (
                      <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "#111827", borderRadius: "0.75rem", color: "#6b7280" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>❤️</div>
                        <p style={{ margin: 0 }}>Ce client n'a ajouté aucune moto à ses favoris pour le moment.</p>
                      </div>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                        {detailsUser.favorites.map((fav: any) => {
                          const motoImg = fav.model?.images?.[0]?.url?.replace(/^\.\//, "/") || "/img/placeholder-moto.jpg";
                          const motoUrl = fav.model?.hasDetailPage
                            ? `/marques/${encodeURIComponent(fav.model.brand?.name)}/${encodeURIComponent(fav.model.name)}`
                            : `/marques/${encodeURIComponent(fav.model.brand?.name)}`;

                          return (
                            <div
                              key={fav.id}
                              style={{
                                background: "#111827",
                                border: "1px solid #374151",
                                borderRadius: "0.75rem",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <img
                                src={motoImg}
                                alt={fav.model?.name}
                                style={{ width: "100%", height: "130px", objectFit: "cover" }}
                                onError={(e) => { e.currentTarget.src = "/img/placeholder-moto.jpg"; }}
                              />
                              <div style={{ padding: "0.9rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                                <div>
                                  <div style={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: 700, textTransform: "uppercase" }}>
                                    {fav.model?.brand?.name}
                                  </div>
                                  <div style={{ color: "#f9fafb", fontWeight: 700, fontSize: "1rem", marginTop: "0.2rem" }}>
                                    {fav.model?.name}
                                  </div>
                                  {fav.model?.price && (
                                    <div style={{ color: "#d1d5db", fontSize: "0.85rem", marginTop: "0.3rem" }}>
                                      {fav.model.price.toLocaleString("fr-FR")} {fav.model.currency || "DT"}
                                    </div>
                                  )}
                                </div>
                                <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                                    Ajouté le {new Date(fav.createdAt).toLocaleDateString("fr-FR")}
                                  </span>
                                  <a
                                    href={motoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      fontSize: "0.75rem",
                                      color: "#60a5fa",
                                      textDecoration: "none",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Voir ↗
                                  </a>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem", borderTop: "1px solid #374151", paddingTop: "1rem" }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setDetailsUser(null)}
                  >
                    Fermer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

