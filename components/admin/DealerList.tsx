"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { createDealer, updateDealer, deleteDealer } from "@/lib/admin-actions/dealers";

type Brand = { id: string; name: string };
type Dealer = {
  id: string;
  email: string | null;
  name: string | null;
  modelsQuota: number;
  modelsCreatedCount: number;
  assignedBrands: { brand: Brand }[];
};

export default function DealerList({ dealers, allBrands }: { dealers: Dealer[], allBrands: Brand[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const id = formData.get("id") as string;

    const res = id
      ? await updateDealer(id, formData)
      : await createDealer(formData);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(id ? "Concessionnaire modifié" : "Concessionnaire ajouté");
      setShowForm(false);
      setEditingId(null);
    }
    setIsLoading(false);
  }

  async function handleDelete(id: string) {
    await deleteDealer(id);
    toast.success("Concessionnaire supprimé");
    setShowConfirm(null);
  }

  const editingDealer = editingId ? dealers.find(d => d.id === editingId) : null;
  const initialBrandIds = editingDealer?.assignedBrands.map(b => b.brand.id) || [];

  return (
    <div className="admin-card">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
        <h2>Liste des Concessionnaires</h2>
        <button className="btn-primary" onClick={() => { setEditingId(null); setShowForm(true); }}>
          + Nouveau Pro
        </button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Marques Assignées</th>
            <th>Quota Modèles</th>
            <th className="action-col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {dealers.map((dealer) => (
            <tr key={dealer.id}>
              <td>{dealer.name || "-"}</td>
              <td>{dealer.email}</td>
              <td>
                {dealer.assignedBrands.length > 0
                  ? dealer.assignedBrands.map(b => <span key={b.brand.id} className="detail-badge" style={{ marginRight: '4px' }}>{b.brand.name}</span>)
                  : <span style={{ color: "#9ca3af" }}>Aucune</span>}
              </td>
              <td>
                <strong style={{ color: dealer.modelsCreatedCount >= dealer.modelsQuota ? "#ef4444" : "#10b981" }}>
                  {dealer.modelsCreatedCount}
                </strong> / {dealer.modelsQuota}
              </td>
              <td className="action-col">
                <button
                  className="btn-secondary"
                  onClick={() => { setEditingId(dealer.id); setShowForm(true); }}
                >
                  ✏️ Modifier
                </button>
                <button
                  className="btn-danger"
                  onClick={() => setShowConfirm(dealer.id)}
                  style={{ marginLeft: "0.5rem" }}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
          {dealers.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
                Aucun concessionnaire.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <h2>{editingId ? "Modifier Concessionnaire" : "Nouveau Concessionnaire"}</h2>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
              {editingId && <input type="hidden" name="id" value={editingId} />}

              <div className="form-group">
                <label>Nom de l'entreprise ou contact</label>
                <input type="text" name="name" className="form-input" defaultValue={editingDealer?.name || ""} required />
              </div>

              <div className="form-group">
                <label>Email de connexion</label>
                <input type="email" name="email" className="form-input" defaultValue={editingDealer?.email || ""} required={!editingId} disabled={!!editingId} />
              </div>

              <div className="form-group">
                <label>{editingId ? "Nouveau Mot de passe (laisser vide pour ne pas changer)" : "Mot de passe"}</label>
                <input type="password" name="password" className="form-input" minLength={8} required={!editingId} />
              </div>

              <div className="form-group">
                <label>Quota de modèles autorisés</label>
                <input type="number" name="modelsQuota" className="form-input" min="0" defaultValue={editingDealer?.modelsQuota || 5} required />
              </div>

              <div className="form-group">
                <label>Marques assignées</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {allBrands.map(brand => (
                    <label key={brand.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                      <input 
                        type="checkbox" 
                        name="brandIds" 
                        value={brand.id} 
                        defaultChecked={initialBrandIds.includes(brand.id)}
                      />
                      {brand.name}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)} style={{ flex: 1 }}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary" disabled={isLoading} style={{ flex: 1 }}>
                  {isLoading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmer la suppression</h3>
            <p>Voulez-vous vraiment supprimer ce compte pro ? Ses modèles resteront mais il n'aura plus d'accès.</p>
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button className="btn-secondary" onClick={() => setShowConfirm(null)}>Annuler</button>
              <button className="btn-danger" onClick={() => handleDelete(showConfirm)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
