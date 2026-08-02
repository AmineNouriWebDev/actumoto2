import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { createSlide } from "@/lib/admin-actions/carousel";
import ClientCarouselList from "@/components/admin/ClientCarouselList";

export default async function AdminCarouselPage() {
  const slides = await prisma.carouselSlide.findMany({ orderBy: { orderIndex: "asc" } });
  
  // Fetch delay setting
  const settings = await prisma.siteSettings.findFirst();
  const carouselDelayMs = settings?.carouselDelayMs || 4000;

  async function handleCreate(formData: FormData) {
    "use server";
    await createSlide(formData);
    redirect("/admin/carrousel");
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Carrousel</h1>
          <p className="admin-page-subtitle">{slides.length} slides ({slides.filter(s => s.isVisible).length} actifs)</p>
        </div>
      </div>

      {/* List and Settings */}
      <ClientCarouselList initialSlides={slides} initialDelayMs={carouselDelayMs} />

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
