import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateOccasion } from "@/lib/admin-actions/occasions";
import ModelImageUploader from "@/components/admin/ModelImageUploader";
import { auth } from "@/lib/auth";

export default async function EditOccasionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const { id } = await params;
  const occasion = await prisma.occasion.findUnique({
    where: { id },
    include: {
      images: { orderBy: { orderIndex: "asc" } },
      specs: true,
    },
  });

  if (!occasion) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateOccasion(id, formData);
    redirect("/admin/occasion?success=Annonce+modifiée+avec+succès");
  }

  const FUEL_TYPES = ["Thermique", "Electrique", "Hybride"];
  const CURRENCIES = ["DT", "EUR", "USD"];
  const COOLING_OPTIONS = ["Air", "Liquide", "Air/Huile"];
  const FEEDING_OPTIONS = ["Carburateur", "Injection électronique", "Injection directe"];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link href="/admin/occasion" className="admin-back-link">← Retour aux annonces</Link>
          <h1 className="admin-page-title">Modifier : {occasion.name}</h1>
          <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>{occasion.marque}</span>
        </div>
      </div>

      <form id="main-occasion-form" action={handleUpdate}>
        {/* ─── 1. Informations générales ─── */}
        <div className="admin-card">
          <h2 className="admin-card-title">🏍️ Informations Générales</h2>
          <div className="admin-form-grid-3">
            <div className="form-group span-2">
              <label>Nom du modèle *</label>
              <input type="text" name="name" required defaultValue={occasion.name} />
            </div>
            <div className="form-group">
              <label>Marque (texte libre) *</label>
              <input type="text" name="marque" required defaultValue={occasion.marque} />
            </div>
            <div className="form-group">
              <label>Catégorie (texte libre)</label>
              <input type="text" name="category" defaultValue={occasion.category ?? ""} />
            </div>
            <div className="form-group">
              <label>Type de carburant</label>
              <select name="fuelType" defaultValue={occasion.fuelType ?? ""}>
                <option value="">Non défini</option>
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Prix</label>
              <input type="number" name="price" min="0" step="1" defaultValue={occasion.price ?? ""} />
            </div>
            <div className="form-group">
              <label>Devise</label>
              <select name="currency" defaultValue={occasion.currency}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ─── 2. Caractéristiques Techniques ─── */}
        <div className="admin-card">
          <h2 className="admin-card-title">⚙️ Caractéristiques Techniques</h2>
          <div className="admin-form-grid">
            <div className="form-group">
              <label>Kilométrage (km)</label>
              <input type="text" name="kilometrage" defaultValue={occasion.specs?.kilometrage ?? ""} />
            </div>
            <div className="form-group">
              <label>Année</label>
              <input type="text" name="annee" defaultValue={occasion.specs?.annee ?? ""} />
            </div>
            <div className="form-group">
              <label>Type de moteur</label>
              <input type="text" name="typeMoteur" defaultValue={occasion.specs?.typeMoteur ?? ""} list="motorTypes" />
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
              <input type="text" name="cylindree" defaultValue={occasion.specs?.cylindree ?? ""} />
            </div>
            <div className="form-group">
              <label>Puissance max (en ch / W)</label>
              <input type="text" name="puissance" defaultValue={occasion.specs?.puissance ?? ""} />
            </div>
            <div className="form-group">
              <label>Couple maximal (en Nm)</label>
              <input type="text" name="coupleMaximal" defaultValue={occasion.specs?.coupleMaximal ?? ""} />
            </div>
            <div className="form-group">
              <label>Refroidissement</label>
              <input type="text" name="refroidissement" defaultValue={occasion.specs?.refroidissement ?? ""} list="coolingTypes" />
              <datalist id="coolingTypes">
                {COOLING_OPTIONS.map(o => <option key={o} value={o} />)}
              </datalist>
            </div>
            <div className="form-group">
              <label>Vitesse maximale (en km/h)</label>
              <input type="text" name="vitesseMaximale" defaultValue={occasion.specs?.vitesseMaximale ?? ""} />
            </div>
            <div className="form-group">
              <label>Capacité réservoir (en Litres)</label>
              <input type="text" name="tankCapacity" defaultValue={occasion.specs?.tankCapacity ?? ""} />
            </div>
            <div className="form-group">
              <label>Autonomie électrique (en km)</label>
              <input type="text" name="autonomie" defaultValue={occasion.specs?.autonomie ?? ""} />
            </div>
            <div className="form-group">
              <label>Alimentation</label>
              <input type="text" name="alimentation" defaultValue={occasion.specs?.alimentation ?? ""} list="feedingTypes" />
              <datalist id="feedingTypes">
                {FEEDING_OPTIONS.map(o => <option key={o} value={o} />)}
              </datalist>
            </div>
            <div className="form-group">
              <label>Freinage</label>
              <input type="text" name="freinage" defaultValue={occasion.specs?.freinage ?? ""} />
            </div>
            <div className="form-group span-2">
              <label>Système de freinage</label>
              <input type="text" name="systemeFreinage" defaultValue={occasion.specs?.systemeFreinage ?? ""} />
            </div>
          </div>
        </div>

        {/* ─── 3. Images ─── */}
        <div className="admin-card">
          <h2 className="admin-card-title">📸 Images (Glissez pour réorganiser)</h2>
          <div className="form-group">
            <ModelImageUploader initialImages={occasion.images as any} />
          </div>
        </div>

      </form>

      {/* ─── Boutons ─── */}
      <div className="admin-form-actions" style={{ marginTop: "1.5rem", marginBottom: "3rem" }}>
        <Link href="/admin/occasion" className="btn-secondary">✕ Annuler</Link>
        <button type="submit" form="main-occasion-form" className="btn-primary">
          💾 Enregistrer les modifications
        </button>
      </div>
    </div>
  );
}
