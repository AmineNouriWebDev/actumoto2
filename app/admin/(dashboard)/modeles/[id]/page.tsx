import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateModel } from "@/lib/admin-actions/models";
import ModelImageUploader from "@/components/admin/ModelImageUploader";
import ModelColorsManager from "@/components/admin/ModelColorsManager";
import ModelVideoUploader from "@/components/admin/ModelVideoUploader";
import DetailPageToggle from "@/components/admin/DetailPageToggle";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default async function EditModelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [model, brands, categories] = await Promise.all([
    prisma.model.findUnique({
      where: { id },
      include: {
        images: { orderBy: { orderIndex: "asc" } },
        specs: true,
        brand: true,
        category: true,
        colors: { orderBy: { orderIndex: "asc" } },
      },
    }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!model) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateModel(id, formData);
    redirect("/admin/modeles?success=Mod%C3%A8le+modifi%C3%A9+avec+succ%C3%A8s");
  }

  const FUEL_TYPES = ["Thermique", "Electrique", "Hybride"];
  const CURRENCIES = ["DT", "EUR", "USD"];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link href="/admin/modeles" className="admin-back-link">← Retour aux modèles</Link>
          <h1 className="admin-page-title">Modifier : {model.name}</h1>
          <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>{model.brand.name}</span>
        </div>
      </div>

      {/*
        Structure du formulaire :
        1. Informations Générales
        2. Images  ← juste après les infos générales (demandé)
        3. Page de Détail (toggle + éditeur riche)
        4. Vidéo
        5. Caractéristiques Techniques
        [fin du <form>]
        6. Couleurs Disponibles  ← hors form (actions indépendantes)
        7. Boutons Annuler / Enregistrer  ← tout en bas (connectés au form via form="...")
      */}

      <form id="main-model-form" action={handleUpdate}>
        {/* ─── 1. Informations générales ─── */}
        <div className="admin-card">
          <h2 className="admin-card-title">🏍️ Informations Générales</h2>
          <div className="admin-form-grid-3">
            <div className="form-group span-2">
              <label>Nom du modèle *</label>
              <input type="text" name="name" required defaultValue={model.name} />
            </div>
            <div className="form-group">
              <label>Marque *</label>
              <select name="brandId" required defaultValue={model.brandId}>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Catégorie</label>
              <select name="categoryId" defaultValue={model.categoryId ?? ""}>
                <option value="">Aucune</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Type de carburant</label>
              <select name="fuelType" defaultValue={model.fuelType ?? ""}>
                <option value="">Non défini</option>
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Prix (vide = En arrivage)</label>
              <input type="number" name="price" min="0" step="1" defaultValue={model.price ?? ""} />
            </div>
            <div className="form-group">
              <label>Devise</label>
              <select name="currency" defaultValue={model.currency}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ─── 2. Images — juste après les infos générales ─── */}
        <div className="admin-card">
          <h2 className="admin-card-title">📸 Images (Glissez pour réorganiser)</h2>
          <div className="form-group">
            <ModelImageUploader initialImages={model.images} />
          </div>
        </div>

        {/* ─── 3. Page de détail (payant) ─── */}
        <div className="admin-card">
          <h2 className="admin-card-title">🔍 Page de Détail (Payant)</h2>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
            Activez la page de détail pour ce modèle. Le bouton <strong>"Voir les détails"</strong> apparaîtra sur la card publique.
          </p>

          {/* Toggle */}
          <DetailPageToggle
            initialValue={model.hasDetailPage}
            brandName={model.brand.name}
            modelName={model.name}
          />

          {/* Éditeur de description riche */}
          <div className="form-group" style={{ marginTop: "1.25rem" }}>
            <label style={{ marginBottom: "0.5rem", display: "block" }}>
              📝 Description / Présentation du modèle
              <span style={{ fontWeight: 400, color: "#9ca3af", marginLeft: "0.5rem", fontSize: "0.8rem" }}>
                (Gras, italique, titres, listes… le HTML sera rendu sur la page de détail)
              </span>
            </label>
            <RichTextEditor
              name="description"
              initialValue={model.description}
              placeholder="Décrivez ce modèle : points forts, public cible, utilisation recommandée..."
            />
          </div>
        </div>

        {/* ─── 4. Vidéo ─── */}
        <div className="admin-card">
          <h2 className="admin-card-title">🎬 Vidéo</h2>
          <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
            Ajoutez une vidéo en important un fichier MP4 ou en collant un lien YouTube.
          </p>
          <ModelVideoUploader
            initialVideoUrl={(model as any).videoUrl}
            initialYoutubeUrl={model.youtubeUrl}
          />
        </div>



      </form>

      {/* ─── 6. Couleurs Disponibles (hors form — actions indépendantes) ─── */}
      <div className="admin-card" style={{ marginTop: "1.5rem" }}>
        <h2 className="admin-card-title">🎨 Couleurs Disponibles</h2>
        <p style={{ color: "#6b7280", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
          Les couleurs sont affichées sur la page de détail (swatches cliquables). Les modifications sont sauvegardées immédiatement.
        </p>
        <ModelColorsManager
          modelId={model.id}
          initialColors={model.colors}
        />
      </div>

      {/* ─── 7. Boutons — tout en bas, connectés au form principal via form="..." ─── */}
      <div className="admin-form-actions" style={{ marginTop: "1.5rem", marginBottom: "3rem" }}>
        <Link href="/admin/modeles" className="btn-secondary">✕ Annuler</Link>
        <button type="submit" form="main-model-form" className="btn-primary">
          💾 Enregistrer les modifications
        </button>
      </div>
    </div>
  );
}
