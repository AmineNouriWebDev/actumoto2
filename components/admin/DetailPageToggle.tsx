"use client";

import { useState } from "react";

interface DetailPageToggleProps {
  initialValue: boolean;
  brandName: string;
  modelName: string;
}

export default function DetailPageToggle({
  initialValue,
  brandName,
  modelName,
}: DetailPageToggleProps) {
  const [enabled, setEnabled] = useState(initialValue);

  return (
    <div>
      {/* Hidden input envoie "false" par défaut quand la checkbox n'est pas cochée */}
      <input type="hidden" name="hasDetailPage" value="false" />

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {/* Toggle track */}
        <div
          onClick={() => setEnabled(!enabled)}
          style={{
            width: "52px",
            height: "28px",
            borderRadius: "14px",
            background: enabled ? "#16a34a" : "#d1d5db",
            transition: "background 0.25s ease",
            cursor: "pointer",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "3px",
              left: "3px",
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
              transition: "transform 0.25s ease",
              transform: enabled ? "translateX(24px)" : "translateX(0)",
            }}
          />
        </div>

        {/* Real checkbox (hidden visually, synced with toggle state) */}
        <input
          type="checkbox"
          name="hasDetailPage"
          value="true"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
        />

        {/* Label */}
        <span
          style={{
            fontWeight: 700,
            fontSize: "0.95rem",
            color: enabled ? "#16a34a" : "#9ca3af",
          }}
        >
          {enabled ? "✅ Page de détail activée — visible sur le site" : "❌ Page de détail désactivée"}
        </span>
      </div>

      {/* Lien vers la page de détail */}
      {enabled && (
        <div style={{
          marginBottom: "1.25rem",
          padding: "0.75rem 1rem",
          background: "rgba(22,163,74,0.05)",
          border: "1px solid rgba(22,163,74,0.2)",
          borderRadius: "8px",
          fontSize: "0.85rem",
        }}>
          🔗 Page publique :{" "}
          <a
            href={`/marques/${encodeURIComponent(brandName)}/${encodeURIComponent(modelName)}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: "#ff0000", fontWeight: 600 }}
          >
            /marques/{brandName}/{modelName}
          </a>
        </div>
      )}
    </div>
  );
}
