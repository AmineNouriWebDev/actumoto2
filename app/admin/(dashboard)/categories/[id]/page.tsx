import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { updateCategory } from "@/lib/admin-actions/categories";

export default async function EditCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const category = await prisma.category.findUnique({
    where: { id },
    include: { models: { select: { id: true, name: true } } },
  });
  if (!category) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    const res = await updateCategory(id, formData);
    if (res?.error) {
      redirect(`/admin/categories/${id}?error=${encodeURIComponent(res.error)}`);
    }
    redirect("/admin/categories?success=Catégorie+modifiée+avec+succès");
  }

  const logoSrc = category.logo.startsWith("./") ? category.logo.substring(1) : category.logo;

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link href="/admin/categories" className="admin-back-link">
            ← Retour aux catégories
          </Link>
          <h1 className="admin-page-title">Modifier : {category.name}</h1>
          <p className="admin-page-subtitle">{category.models.length} modèles associés</p>
        </div>
      </div>

      {error && (
        <div style={{ background: "#ef444420", border: "1px solid #ef4444", color: "#fca5a5", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1.25rem" }}>
          ⚠️ {error}
        </div>
      )}

      <form action={handleUpdate}>
        <div className="admin-card">
          <h2 className="admin-card-title">Informations de la Catégorie</h2>
          <div className="admin-form-grid">
            <div className="form-group">
              <label>Nom de la catégorie *</label>
              <input
                type="text"
                name="name"
                required
                defaultValue={category.name}
              />
            </div>
            <div className="form-group">
              <label>Changer l'image / illustration (Optionnel)</label>
              <input
                type="file"
                name="logoFile"
                accept="image/*"
                style={{ background: "white", color: "black", padding: "0.4rem" }}
              />
              <div
                style={{
                  background: "white",
                  borderRadius: "0.5rem",
                  padding: "0.5rem",
                  display: "inline-flex",
                  alignItems: "center",
                  height: 64,
                  marginTop: "0.5rem",
                }}
              >
                <img
                  src={logoSrc}
                  alt={category.name}
                  style={{ height: "48px", objectFit: "contain" }}
                />
              </div>
              <span className="form-hint">L'image sera automatiquement convertie en WebP</span>
            </div>
          </div>

          <div className="admin-form-actions" style={{ marginTop: "1.5rem" }}>
            <Link href="/admin/categories" className="btn-secondary">
              Annuler
            </Link>
            <button type="submit" className="btn-primary">
              💾 Enregistrer les modifications
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
