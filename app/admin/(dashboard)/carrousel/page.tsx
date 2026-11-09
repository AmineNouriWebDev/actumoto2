import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createSlide } from "@/lib/admin-actions/carousel";
import ClientCarouselList from "@/components/admin/ClientCarouselList";

export default async function AdminCarouselPage() {
  const slides = await prisma.carouselSlide.findMany({ orderBy: { orderIndex: "asc" } });
  
  // Fetch delay and visibility settings
  const settings = await prisma.siteSettings.findFirst();
  const carouselDelayMs = settings?.carouselDelayMs || 4000;
  const carouselVisible = (settings as any)?.carouselVisible !== false;

  async function handleCreate(formData: FormData) {
    "use server";
    await createSlide(formData);
    redirect("/admin/carrousel?success=Slide+ajouté+avec+succès");
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Carrousel</h1>
          <p className="admin-page-subtitle">{slides.length} slides ({slides.filter(s => s.isVisible).length} actifs)</p>
        </div>
        <div className={`badge ${carouselVisible ? "badge-green" : "badge-red"}`} style={{ padding: "0.4rem 1rem", fontSize: "0.875rem" }}>
          {carouselVisible ? "🟢 Visible sur l'accueil" : "🔴 Masqué de l'accueil"}
        </div>
      </div>

      {/* List and Settings */}
      <ClientCarouselList
        initialSlides={slides}
        initialDelayMs={carouselDelayMs}
        initialVisible={carouselVisible}
      />

      {/* Add new slide */}
      <div className="admin-card">
        <h2 className="admin-card-title">+ Ajouter un Slide</h2>
        <form action={handleCreate}>
          <div className="admin-form-grid">
            <div className="form-group span-2">
              <label>Image Desktop * <span className="form-dim-hint">(recommandé : 1920×600px)</span></label>
              <input type="file" name="imageDesktopFile" accept="image/*" required style={{ background: "white", color: "black", padding: "0.4rem" }} />
              <span className="form-hint">L'image sera automatiquement convertie en WebP</span>
            </div>
            <div className="form-group span-2">
              <label>Image Mobile <span className="form-dim-hint">(recommandé : 400×400px)</span></label>
              <input type="file" name="imageMobileFile" accept="image/*" style={{ background: "white", color: "black", padding: "0.4rem" }} />
            </div>
            <div className="form-group">
              <label>Titre (optionnel)</label>
              <input type="text" name="title" placeholder="Titre du slide" />
            </div>
            <div className="form-group">
              <label>Texte alternatif</label>
              <input type="text" name="alt" placeholder="Description de l'image" />
            </div>
            <div className="form-group span-2">
              <label>Lien (optionnel)</label>
              <input type="url" name="link" placeholder="https://..." />
            </div>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn-primary">✅ Ajouter le slide</button>
          </div>
        </form>
      </div>
    </div>
  );
}
