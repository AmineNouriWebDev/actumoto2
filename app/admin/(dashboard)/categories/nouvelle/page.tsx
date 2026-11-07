import { createCategory } from "@/lib/admin-actions/categories";
import Link from "next/link";
import { redirect } from "next/navigation";

async function handleCreate(formData: FormData) {
  "use server";
  const res = await createCategory(formData);
  if (res?.error) {
    redirect(`/admin/categories/nouvelle?error=${encodeURIComponent(res.error)}`);
  }
  redirect("/admin/categories?success=Catégorie+ajoutée+avec+succès");
}

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link href="/admin/categories" className="admin-back-link">
            ← Retour aux catégories
          </Link>
          <h1 className="admin-page-title">Nouvelle Catégorie</h1>
        </div>
      </div>

      {error && (
        <div style={{ background: "#ef444420", border: "1px solid #ef4444", color: "#fca5a5", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1.25rem" }}>
          ⚠️ {error}
        </div>
      )}

      <div className="admin-card">
        <form action={handleCreate}>
          <div className="admin-form-grid">
            <div className="form-group">
              <label>Nom de la catégorie *</label>
              <input
                type="text"
                name="name"
                required
                placeholder="ex: Scooter, Roadster, Sportive..."
              />
            </div>
            <div className="form-group">
              <label>Image / Illustration de la catégorie *</label>
              <input
                type="file"
                name="logoFile"
                accept="image/*"
                required
                style={{ background: "white", color: "black", padding: "0.4rem" }}
              />
              <span className="form-hint">L'image sera automatiquement convertie en WebP</span>
            </div>
          </div>

          <div className="admin-form-actions">
            <Link href="/admin/categories" className="btn-secondary">
              Annuler
            </Link>
            <button type="submit" className="btn-primary">
              ✅ Créer la catégorie
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
