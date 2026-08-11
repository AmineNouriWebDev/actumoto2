"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { updateUser, deleteUser, resetUserPassword } from "@/lib/admin-actions/users";
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
  const router = useRouter();

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
              <th>Statut</th>
              <th>Date d'inscription</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>Aucun utilisateur trouvé.</td>
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
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
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

    </div>
  );
}
