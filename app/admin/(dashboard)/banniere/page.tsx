import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { updateBanner } from "@/lib/admin-actions/popup";

export default async function AdminBannierePage() {
  const banner = await prisma.homepageBanner.findFirst();

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateBanner(formData);
    redirect("/admin/banniere");
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Bannière d'Accueil</h1>
          <p className="admin-page-subtitle">Image en bas de la page d'accueil</p>
        </div>
        <div className={`badge ${banner?.isVisible ? "badge-green" : "badge-red"}`} style={{ padding: "0.4rem 1rem", fontSize: "0.875rem" }}>
          {banner?.isVisible ? "🟢 Visible" : "🔴 Cachée"}
        </div>
      </div>

      {banner?.imageDesktop && (
        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1rem" }}>
          <p style={{ color: "#6b7280", fontSize: "0.8rem", margin: "0 0 0.75rem" }}>Aperçu actuel :</p>
          <img
            src={banner.imageDesktop}
            alt={banner.altText || "Bannière"}
            style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: "0.5rem" }}
          />
        </div>
      )}

      <div className="admin-card">
        <form action={handleUpdate}>
          <div className="toggle-row">
            <label className="toggle-label">
              <div className="toggle-checkbox-wrap">
                <input type="checkbox" name="isVisible" defaultChecked={banner?.isVisible ?? true} className="toggle-checkbox" />
                <div className="toggle-slider" />
              </div>
              <div>
                <div className="toggle-text-title">Afficher la bannière</div>
                <div className="toggle-text-sub">Si désactivée, la bannière ne s'affichera pas sur la page d'accueil</div>
              </div>
            </label>
          </div>

          <div className="admin-form-grid">
            <div className="form-group span-2">
              <label>Image Desktop * <span className="form-dim-hint">(recommandé : 1920×400px max)</span></label>
              <input type="text" name="imageDesktop" required defaultValue={banner?.imageDesktop || ""} placeholder="/img/banner3.webp" />
            </div>
            <div className="form-group span-2">
              <label>Image Mobile <span className="form-dim-hint">(recommandé : 640×300px max)</span></label>
              <input type="text" name="imageMobile" defaultValue={banner?.imageMobile || ""} placeholder="/img/banner3-mobile.webp" />
            </div>
            <div className="form-group">
              <label>Texte alternatif (SEO)</label>
              <input type="text" name="altText" defaultValue={banner?.altText || ""} placeholder="ex: Pièces et accessoires moto" />
            </div>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn-primary">💾 Enregistrer la Bannière</button>
          </div>
        </form>
      </div>
    </div>
  );
}
