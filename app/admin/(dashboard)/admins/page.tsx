import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createAdmin, deleteAdmin } from "@/lib/admin-actions/admins";
import ConfirmForm from "@/components/admin/ConfirmForm";

async function handleCreate(formData: FormData) {
  "use server";
  const result = await createAdmin(formData);
  if (!result?.error) redirect("/admin/admins");
}

async function handleDelete(id: string) {
  "use server";
  await deleteAdmin(id);
  redirect("/admin/admins");
}

export default async function AdminUsersPage() {
  const admins = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Administrateurs</h1>
          <p className="admin-page-subtitle">{admins.length} compte(s) admin</p>
        </div>
      </div>

      {/* List */}
      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Créé le</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.id}>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                      color: "white", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.875rem", flexShrink: 0,
                    }}>
                      {admin.name?.charAt(0).toUpperCase() || "A"}
                    </div>
                    {admin.name || "—"}
                  </div>
                </td>
                <td><span style={{ color: "#93c5fd", fontSize: "0.875rem" }}>{admin.email}</span></td>
                <td><span style={{ color: "#6b7280", fontSize: "0.8rem" }}>{new Date(admin.createdAt).toLocaleDateString("fr-FR")}</span></td>
                <td>
                  <div className="row-actions">
                    <ConfirmForm action={handleDelete.bind(null, admin.id)}
                      confirmMessage={`Supprimer l'admin "${admin.email}" ?`}
                    >
                      <button type="submit" className="btn-danger" disabled={admins.length <= 1}>🗑️ Supprimer</button>
                    </ConfirmForm>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add new admin */}
      <div className="admin-card">
        <h2 className="admin-card-title">+ Ajouter un Administrateur</h2>
        <form action={handleCreate}>
          <div className="admin-form-grid-3">
            <div className="form-group">
              <label>Nom (optionnel)</label>
              <input type="text" name="name" placeholder="ex: Prénom Nom" />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" required placeholder="nouveau@actumoto.tn" />
            </div>
            <div className="form-group">
              <label>Mot de passe * (min. 8 caractères)</label>
              <input type="password" name="password" required minLength={8} placeholder="••••••••••" />
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn-primary">✅ Créer l'administrateur</button>
          </div>
        </form>
      </div>

      <div className="security-info">
        🔒 Les mots de passe sont stockés de manière cryptée (bcrypt). Il est impossible de les lire une fois enregistrés.
        Pour changer un mot de passe, supprimez et recréez le compte.
      </div>
    </div>
  );
}
