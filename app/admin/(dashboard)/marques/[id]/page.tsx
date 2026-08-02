import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { updateBrand } from "@/lib/admin-actions/brands";

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = await prisma.brand.findUnique({ where: { id }, include: { dealerContact: true } });
  if (!brand) notFound();
  const dc = brand.dealerContact;

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateBrand(id, formData);
    redirect("/admin/marques?success=Marque+modifiée+avec+succès");
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link href="/admin/marques" className="admin-back-link">← Retour aux marques</Link>
          <h1 className="admin-page-title">Modifier : {brand.name}</h1>
        </div>
      </div>

      <form action={handleUpdate}>
        <div className="admin-card">
          <h2 className="admin-card-title">Informations de la Marque</h2>
          <div className="admin-form-grid">
            <div className="form-group">
              <label>Nom de la marque *</label>
              <input type="text" name="name" required defaultValue={brand.name} />
            </div>
            <div className="form-group">
              <label>Changer le logo (Optionnel)</label>
              <input type="file" name="logoFile" accept="image/*" style={{ background: "white", color: "black", padding: "0.4rem" }} />
              <div style={{ background: "white", borderRadius: "0.5rem", padding: "0.5rem", display: "inline-flex", alignItems: "center", height: 64, marginTop: "0.5rem" }}>
                <img src={brand.logo.startsWith("./") ? brand.logo.substring(1) : brand.logo} alt={brand.name} style={{ height: "48px", objectFit: "contain" }} />
              </div>
              <span className="form-hint">L'image sera automatiquement convertie en WebP</span>
            </div>
          </div>
          <div style={{ marginTop: "0.5rem" }}>
            <label className="toggle-label" style={{ cursor: "pointer", display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <div className="toggle-checkbox-wrap">
                <input type="checkbox" name="comingSoon" className="toggle-checkbox" defaultChecked={brand.comingSoon} />
                <div className="toggle-slider" />
              </div>
              <div>
                <div className="toggle-text-title">Mode "Coming Soon"</div>
                <div className="toggle-text-sub">Affiche la page coming soon au lieu du catalogue</div>
              </div>
            </label>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="admin-card-title">Concessionnaire / Contact</h2>
          <div className="admin-form-grid">
            <div className="form-group">
              <label>Téléphones (un par ligne)</label>
              <textarea name="phones" rows={3} placeholder="71 123 456&#10;98 765 432" defaultValue={dc?.phones?.join("\n") || ""} />
            </div>
            <div className="form-group">
              <label>Emails (un par ligne)</label>
              <textarea name="emails" rows={3} defaultValue={dc?.emails?.join("\n") || ""} />
            </div>
            <div className="form-group">
              <label>Site web</label>
              <input type="url" name="website" placeholder="https://..." defaultValue={dc?.website || ""} />
            </div>
            <div className="form-group">
              <label>Adresse Showroom</label>
              <input type="text" name="showroomAddress" defaultValue={dc?.showroomAddress || ""} />
            </div>
            <div className="form-group">
              <label>Lien Google Maps</label>
              <input type="url" name="showroomLocation" defaultValue={dc?.showroomLocation || ""} />
            </div>
          </div>
          <div style={{ borderTop: "1px solid #374151", paddingTop: "1rem", marginTop: "0.5rem" }}>
            <div style={{ color: "#d1d5db", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>Réseaux Sociaux</div>
            <div className="admin-form-grid">
              <div className="form-group">
                <label>📘 Facebook</label>
                <input type="url" name="facebook" defaultValue={dc?.facebook || ""} />
              </div>
              <div className="form-group">
                <label>📸 Instagram</label>
                <input type="url" name="instagram" defaultValue={dc?.instagram || ""} />
              </div>
              <div className="form-group">
                <label>▶️ YouTube</label>
                <input type="url" name="youtube" defaultValue={(dc as any)?.youtube || ""} />
              </div>
              <div className="form-group">
                <label>🎵 TikTok</label>
                <input type="url" name="tiktok" defaultValue={(dc as any)?.tiktok || ""} />
              </div>
            </div>
          </div>
        </div>

        <div className="admin-form-actions">
          <Link href="/admin/marques" className="btn-secondary">Annuler</Link>
          <button type="submit" className="btn-primary">💾 Enregistrer les modifications</button>
        </div>
      </form>
    </div>
  );
}
