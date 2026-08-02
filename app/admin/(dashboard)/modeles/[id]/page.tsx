import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateModel } from "@/lib/admin-actions/models";
import ModelImageUploader from "@/components/admin/ModelImageUploader";

export default async function EditModelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [model, brands, categories] = await Promise.all([
    prisma.model.findUnique({
      where: { id },
      include: { images: { orderBy: { orderIndex: "asc" } }, specs: true, brand: true, category: true },
    }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!model) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateModel(id, formData);
    redirect("/admin/modeles");
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

      <form action={handleUpdate}>
        <div className="admin-card">
          <h2 className="admin-card-title">🏍️ Informations Générales</h2>
          <div className="admin-form-grid-3">
            <div className="form-group span-2">
              <label>Nom du modèle *</label>
              <input type="text" name="name" required defaultValue={model.name} />
            </div>
            <div className="form-group">
              <label>Marque *</label>
              <select name="brandId" required>
                {brands.map((b) => (
                  <option key={b.id} value={b.id} selected={b.id === model.brandId}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Catégorie</label>
              <select name="categoryId">
                <option value="">Aucune</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} selected={c.id === model.categoryId}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Type de carburant</label>
              <select name="fuelType">
                <option value="">Non défini</option>
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f} selected={f === model.fuelType}>{f}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Prix (vide = En arrivage)</label>
              <input type="number" name="price" min="0" step="1" defaultValue={model.price ?? ""} />
            </div>
            <div className="form-group">
              <label>Devise</label>
              <select name="currency">
                {CURRENCIES.map((c) => (
                  <option key={c} value={c} selected={c === model.currency}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="admin-card-title">📸 Images (Glissez pour réorganiser)</h2>
          <div className="form-group">
            <ModelImageUploader initialImages={model.images} />
          </div>
        </div>

        <div className="admin-card">
          <h2 className="admin-card-title">⚙️ Caractéristiques Techniques</h2>
          <div className="admin-form-grid">
            {[
              { name: "typeMoteur", label: "Type de moteur", placeholder: "ex: Monocylindre 4 temps" },
              { name: "cylindree", label: "Cylindrée (en cc)", placeholder: "ex: 471" },
              { name: "puissance", label: "Puissance max (en ch / W)", placeholder: "ex: 47" },
              { name: "coupleMaximal", label: "Couple maximal (en Nm)", placeholder: "ex: 43" },
              { name: "refroidissement", label: "Refroidissement", placeholder: "ex: Liquide" },
              { name: "vitesseMaximale", label: "Vitesse maximale (en km/h)", placeholder: "ex: 180" },
              { name: "tankCapacity", label: "Capacité réservoir (en Litres)", placeholder: "ex: 17.7" },
              { name: "autonomie", label: "Autonomie électrique (en km)", placeholder: "ex: 150" },
              { name: "alimentation", label: "Alimentation", placeholder: "ex: Injection" },
              { name: "freinage", label: "Freinage", placeholder: "ex: Double disque AV" },
              { name: "systemeFreinage", label: "Système freinage", placeholder: "ex: ABS" },
            ].map((f) => (
              <div key={f.name} className="form-group">
                <label>{f.label}</label>
                <input
                  type="text"
                  name={f.name}
                  placeholder={f.placeholder}
                  defaultValue={(model.specs as any)?.[f.name] || ""}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="admin-form-actions">
          <Link href="/admin/modeles" className="btn-secondary">Annuler</Link>
          <button type="submit" className="btn-primary">💾 Enregistrer</button>
        </div>
      </form>
    </div>
  );
}
