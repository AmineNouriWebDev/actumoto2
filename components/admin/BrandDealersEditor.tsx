"use client";

import { useState } from "react";

export interface DealerData {
  name: string;
  city: string;
  address: string;
  phone: string;
  mapUrl: string;
}

export default function BrandDealersEditor({ initialDealers = [] }: { initialDealers?: any[] }) {
  const [dealers, setDealers] = useState<DealerData[]>(() => {
    return Array.isArray(initialDealers) ? initialDealers : [];
  });

  const addDealer = () => {
    setDealers([...dealers, { name: "", city: "", address: "", phone: "", mapUrl: "" }]);
  };

  const removeDealer = (index: number) => {
    setDealers(dealers.filter((_, i) => i !== index));
  };

  const updateDealer = (index: number, field: keyof DealerData, value: string) => {
    const updated = [...dealers];
    updated[index] = { ...updated[index], [field]: value };
    setDealers(updated);
  };

  return (
    <div style={{ borderTop: "1px solid #374151", paddingTop: "1.5rem", marginTop: "1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ color: "#d1d5db", fontSize: "1rem", fontWeight: 600, margin: 0 }}>🏪 Revendeurs / Points de vente</h3>
        <button type="button" onClick={addDealer} className="btn-secondary" style={{ padding: "0.25rem 0.75rem", fontSize: "0.85rem" }}>
          + Ajouter un revendeur
        </button>
      </div>

      <input type="hidden" name="salesParts" value={JSON.stringify(dealers)} />

      {dealers.length === 0 ? (
        <p style={{ color: "#6b7280", fontSize: "0.9rem", fontStyle: "italic" }}>Aucun revendeur configuré pour cette marque.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {dealers.map((dealer, index) => (
            <div key={index} style={{ background: "#1f2937", padding: "1rem", borderRadius: "0.5rem", border: "1px solid #374151" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <strong style={{ color: "#e5e7eb" }}>Revendeur #{index + 1}</strong>
                <button type="button" onClick={() => removeDealer(index)} style={{ color: "#ef4444", background: "transparent", border: "none", cursor: "pointer" }} title="Supprimer">
                  🗑️
                </button>
              </div>

              <div className="admin-form-grid">
                <div className="form-group">
                  <label>Nom du revendeur *</label>
                  <input type="text" value={dealer.name} onChange={(e) => updateDealer(index, "name", e.target.value)} placeholder="Ex: GSM GOUIAA MOTO" required />
                </div>
                <div className="form-group">
                  <label>Ville</label>
                  <input type="text" value={dealer.city} onChange={(e) => updateDealer(index, "city", e.target.value)} placeholder="Ex: Sfax" />
                </div>
                <div className="form-group span-2">
                  <label>Adresse complète</label>
                  <input type="text" value={dealer.address} onChange={(e) => updateDealer(index, "address", e.target.value)} placeholder="Ex: Route de l'Afrane, Km 4" />
                </div>
                <div className="form-group">
                  <label>Téléphone</label>
                  <input type="text" value={dealer.phone} onChange={(e) => updateDealer(index, "phone", e.target.value)} placeholder="Ex: +216 26 678 300" />
                </div>
                <div className="form-group">
                  <label>Lien Maps / Localisation</label>
                  <input type="text" value={dealer.mapUrl} onChange={(e) => updateDealer(index, "mapUrl", e.target.value)} placeholder="Ex: https://goo.gl/maps/..." />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
