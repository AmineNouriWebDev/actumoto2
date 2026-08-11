import Link from "next/link";
import { redirect } from "next/navigation";
import { createOccasion } from "@/lib/admin-actions/occasions";
import ModelImageUploader from "@/components/admin/ModelImageUploader";
import { auth } from "@/lib/auth";

const FUEL_TYPES = ["Thermique", "Electrique", "Hybride"];
const CURRENCIES = ["DT", "EUR", "USD"];
const COOLING_OPTIONS = ["Air", "Liquide", "Air/Huile"];
const FEEDING_OPTIONS = ["Carburateur", "Injection électronique", "Injection directe"];

export default async function NewOccasionPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  async function handleCreate(formData: FormData) {
    "use server";
    await createOccasion(formData);
    redirect("/admin/occasion?success=Annonce+ajoutée+avec+succès");
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link href="/admin/occasion" className="admin-back-link">← Retour aux annonces</Link>
          <h1 className="admin-page-title">Nouvelle Annonce (Occasion)</h1>
        </div>
      </div>

      <form action={handleCreate}>
        {/* Basic Info */}
        <div className="admin-card">
          <h2 className="admin-card-title">🏍️ Informations Générales</h2>
          <div className="admin-form-grid-3">
            <div className="form-group span-2">
              <label>Nom du modèle *</label>
              <input type="text" name="name" required placeholder="ex: Honda CB500F" />
            </div>
            <div className="form-group">
              <label>Marque (texte libre) *</label>
              <input type="text" name="marque" required placeholder="ex: Honda" />
            </div>
            <div className="form-group">
              <label>Catégorie (texte libre)</label>
              <input type="text" name="category" placeholder="ex: Roadster" />
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
              <input type="number" name="price" min="0" step="1" placeholder="ex: 12500" />
            </div>
            <div className="form-group">
              <label>Devise</label>
              <select name="currency">
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Specs */}
        <div className="admin-card">
          <h2 className="admin-card-title">⚙️ Caractéristiques Techniques</h2>
          <div className="admin-form-grid">
            <div className="form-group">
              <label>Kilométrage (km)</label>
              <input type="text" name="kilometrage" placeholder="ex: 15000" />
            </div>
            <div className="form-group">
              <label>Année</label>
              <input type="text" name="annee" placeholder="ex: 2020" />
            </div>
            <div className="form-group">
              <label>Type de moteur</label>
              <input type="text" name="typeMoteur" placeholder="ex: Monocylindre 4 temps" list="motorTypes" />
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

        <div className="admin-card">
          <h2 className="admin-card-title">📸 Images (Glissez pour réorganiser)</h2>
          <div className="form-group">
            <ModelImageUploader initialImages={[]} />
            <span className="form-hint">La première image sera l'image principale.</span>
          </div>
        </div>

        <div className="admin-form-actions">
          <Link href="/admin/occasion" className="btn-secondary">Annuler</Link>
          <button type="submit" className="btn-primary">✅ Créer l'annonce</button>
        </div>
      </form>
    </div>
  );
}
