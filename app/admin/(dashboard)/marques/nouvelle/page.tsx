import { createBrand } from "@/lib/admin-actions/brands";
import Link from "next/link";
import { redirect } from "next/navigation";

async function handleCreate(formData: FormData) {
  "use server";
  await createBrand(formData);
  redirect("/admin/marques?success=Marque+ajoutée+avec+succès");
}

export default function NewBrandPage() {
  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link href="/admin/marques" className="admin-back-link">← Retour aux marques</Link>
          <h1 className="admin-page-title">Nouvelle Marque</h1>
        </div>
      </div>

      <div className="admin-card">
        <form action={handleCreate}>
          <div className="admin-form-grid">
            <div className="form-group">
              <label>Nom de la marque *</label>
              <input type="text" name="name" required placeholder="ex: Honda" />
            </div>
            <div className="form-group">
              <label>Logo de la marque *</label>
              <input type="file" name="logoFile" accept="image/*" required style={{ background: "white", color: "black", padding: "0.4rem" }} />
              <span className="form-hint">L'image sera automatiquement convertie en WebP</span>
            </div>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label className="toggle-label" style={{ cursor: "pointer", display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <div className="toggle-checkbox-wrap">
                <input type="checkbox" name="comingSoon" className="toggle-checkbox" />
                <div className="toggle-slider" />
              </div>
              <div>
                <div className="toggle-text-title">Mode "Coming Soon"</div>
                <div className="toggle-text-sub">Affiche la page coming soon au lieu du catalogue</div>
              </div>
            </label>
          </div>

          <div className="admin-form-grid" style={{ marginBottom: "1rem" }}>
            <div className="form-group span-2">
              <label>Mots-clés SEO (Optionnel)</label>
              <textarea
                name="seoKeywords"
                rows={2}
                placeholder="Ex: honda tunisie, moto honda prix, scooter honda tunisie..."
              />
              <span className="form-hint">Séparés par des virgules pour le référencement Google de la page marque.</span>
            </div>
            <div className="form-group">
              <label>Titre SEO personnalisé (Optionnel)</label>
              <input type="text" name="seoTitle" placeholder="Modèles Honda - actumoto.tn | Moto Tunisie" />
            </div>
            <div className="form-group">
              <label>Méta-description SEO (Optionnel)</label>
              <input type="text" name="seoDescription" placeholder="Découvrez tous les modèles Honda disponibles en Tunisie..." />
            </div>
          </div>

          <div className="admin-form-actions">
            <Link href="/admin/marques" className="btn-secondary">Annuler</Link>
            <button type="submit" className="btn-primary">✅ Créer la marque</button>
          </div>
        </form>
      </div>
    </div>
  );
}
