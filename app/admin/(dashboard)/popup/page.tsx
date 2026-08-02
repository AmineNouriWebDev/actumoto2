import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { updatePopup } from "@/lib/admin-actions/popup";

export default async function AdminPopupPage() {
  const popup = await prisma.welcomePopup.findFirst();

  async function handleUpdate(formData: FormData) {
    "use server";
    await updatePopup(formData);
    redirect("/admin/popup?success=Popup+mise+à+jour+avec+succès");
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Popup d'Accueil</h1>
        <div className={`badge ${popup?.isEnabled ? "badge-green" : "badge-red"}`} style={{ padding: "0.4rem 1rem", fontSize: "0.875rem" }}>
          {popup?.isEnabled ? "🟢 Active" : "🔴 Désactivée"}
        </div>
      </div>

      {/* Preview */}
      {popup?.imageDesktop && (
        <div style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: "1rem", padding: "1.25rem", marginBottom: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "flex-start" }}>
          <p style={{ color: "#6b7280", fontSize: "0.8rem", margin: 0 }}>Aperçu actuel :</p>
          <picture>
            <source media="(min-width: 768px)" srcSet={popup.imageDesktop} />
            <img
              src={popup.imageMobile || popup.imageDesktop}
              alt="Popup preview"
              style={{ maxHeight: 200, borderRadius: "0.5rem", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}
            />
          </picture>
        </div>
      )}

      <div className="admin-card">
        <form action={handleUpdate}>
          {/* Toggle */}
          <div className="toggle-row">
            <label className="toggle-label">
              <div className="toggle-checkbox-wrap">
                <input type="checkbox" name="isEnabled" defaultChecked={popup?.isEnabled ?? true} className="toggle-checkbox" />
                <div className="toggle-slider" />
              </div>
              <div>
                <div className="toggle-text-title">Activer la popup</div>
                <div className="toggle-text-sub">Si désactivée, la popup ne s'affichera pas sur le site</div>
              </div>
            </label>
          </div>

          <div className="admin-form-grid">
            <div className="form-group span-2">
              <label>Image Desktop * <span className="form-dim-hint">(recommandé : 800×600px max)</span></label>
              <input type="file" name="imageDesktopFile" accept="image/*" style={{ background: "white", color: "black", padding: "0.4rem" }} />
              <span className="form-hint">L'image sera automatiquement convertie en WebP (laisser vide pour conserver l'actuelle)</span>
            </div>
            <div className="form-group span-2">
              <label>Image Mobile <span className="form-dim-hint">(recommandé : 400×600px max)</span></label>
              <input type="file" name="imageMobileFile" accept="image/*" style={{ background: "white", color: "black", padding: "0.4rem" }} />
            </div>
            <div className="form-group">
              <label>Lien cliquable (optionnel)</label>
              <input type="url" name="link" defaultValue={popup?.link || ""} placeholder="https://..." />
              <span className="form-hint">Si rempli, l'image sera cliquable et redirigera vers ce lien</span>
            </div>
            <div className="form-group">
              <label>Texte alternatif (SEO)</label>
              <input type="text" name="altText" defaultValue={popup?.altText || ""} placeholder="ex: Offre Spéciale" />
            </div>
            <div className="form-group">
              <label>Durée d'affichage (secondes)</label>
              <input type="number" name="durationSeconds" min="0" max="60" defaultValue={popup?.durationSeconds ?? 4} />
              <span className="form-hint">0 = la popup reste jusqu'à ce que l'utilisateur la ferme</span>
            </div>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn-primary">💾 Enregistrer la Popup</button>
          </div>
        </form>
      </div>
    </div>
  );
}
