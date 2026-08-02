import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createModel } from "@/lib/admin-actions/models";
import ModelImageUploader from "@/components/admin/ModelImageUploader";

const FUEL_TYPES = ["Thermique", "Electrique", "Hybride"];
const CURRENCIES = ["DT", "EUR", "USD"];
const COOLING_OPTIONS = ["Air", "Liquide", "Air/Huile"];
const FEEDING_OPTIONS = ["Carburateur", "Injection électronique", "Injection directe"];

export default async function NewModelPage() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ where: { isVisible: true }, select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  async function handleCreate(formData: FormData) {
    "use server";
    await createModel(formData);
    redirect("/admin/modeles?success=Modèle+ajouté+avec+succès");
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link href="/admin/modeles" className="admin-back-link">← Retour aux modèles</Link>
          <h1 className="admin-page-title">Nouveau Modèle</h1>
        </div>
      </div>

      <form action={handleCreate}>
        {/* Basic Info */}
        <div className="admin-card">
          <h2 className="admin-card-title">🏍️ Informations Générales</h2>
          <div className="admin-form-grid-3">
            <div className="form-group span-2">
              <label>Nom du modèle *</label>
              <input type="text" name="name" required placeholder="ex: Honda CB500F 2024" />
            </div>
            <div className="form-group">
              <label>Marque *</label>
              <select name="brandId" required>
                <option value="">Sélectionner...</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Catégorie</label>
              <select name="categoryId">
                <option value="">Aucune catégorie</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Type de carburant</label>
              <select name="fuelType">
                <option value="">Non défini</option>
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Prix</label>
              <input type="number" name="price" min="0" step="1" placeholder="ex: 12500 (vide = En arrivage)" />
            </div>
            <div className="form-group">
              <label>Devise</label>
              <select name="currency">
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h2 className="admin-card-title">📸 Images (Glissez pour réorganiser)</h2>
          <div className="form-group">
            <ModelImageUploader initialImages={[]} />
            <span className="form-hint">La première image sera l'image principale du modèle.</span>
          </div>
        </div>

        {/* Specs */}
        <div className="admin-card">
          <h2 className="admin-card-title">⚙️ Caractéristiques Techniques</h2>
          <div className="admin-form-grid">
            <div className="form-group">
              <label>Type de moteur</label>
              <input type="text" name="typeMoteur" placeholder="ex: Monocylindre 4 temps, DOHC" list="motorTypes" />
              <datalist id="motorTypes">
                <option value="Monocylindre 4 temps" />
                <option value="Bicylindre en ligne 4 temps" />
                <option value="Tricylindre en ligne 4 temps" />
                <option value="V-Twin 4 temps" />
                <option value="Boxer bicylindre 4 temps" />
                <option value="4 cylindres en ligne 4 temps" />
                <option value="Moteur électrique" />
              </datalist>
            </div>
            <div className="form-group">
              <label>Cylindrée (en cc)</label>
              <input type="text" name="cylindree" placeholder="ex: 471" />
            </div>
            <div className="form-group">
              <label>Puissance max (en ch / W)</label>
              <input type="text" name="puissance" placeholder="ex: 47" />
            </div>
            <div className="form-group">
              <label>Couple maximal (en Nm)</label>
              <input type="text" name="coupleMaximal" placeholder="ex: 43" />
            </div>
            <div className="form-group">
              <label>Refroidissement</label>
              <input type="text" name="refroidissement" placeholder="ex: Liquide" list="coolingTypes" />
              <datalist id="coolingTypes">
                {COOLING_OPTIONS.map(o => <option key={o} value={o} />)}
              </datalist>
            </div>
            <div className="form-group">
              <label>Vitesse maximale (en km/h)</label>
              <input type="text" name="vitesseMaximale" placeholder="ex: 180" />
            </div>
            <div className="form-group">
              <label>Capacité réservoir (en Litres)</label>
              <input type="text" name="tankCapacity" placeholder="ex: 17.7" />
            </div>
            <div className="form-group">
              <label>Autonomie électrique (en km)</label>
              <input type="text" name="autonomie" placeholder="ex: 150" />
            </div>
            <div className="form-group">
              <label>Alimentation</label>
              <input type="text" name="alimentation" placeholder="ex: Injection électronique" list="feedingTypes" />
              <datalist id="feedingTypes">
                {FEEDING_OPTIONS.map(o => <option key={o} value={o} />)}
              </datalist>
            </div>
            <div className="form-group">
              <label>Freinage</label>
              <input type="text" name="freinage" placeholder="ex: Double disque AV, disque AR" />
            </div>
            <div className="form-group span-2">
              <label>Système de freinage</label>
              <input type="text" name="systemeFreinage" placeholder="ex: ABS" />
            </div>
          </div>
        </div>

        <div className="admin-form-actions">
          <Link href="/admin/modeles" className="btn-secondary">Annuler</Link>
          <button type="submit" className="btn-primary">✅ Créer le modèle</button>
        </div>
      </form>
    </div>
  );
}
