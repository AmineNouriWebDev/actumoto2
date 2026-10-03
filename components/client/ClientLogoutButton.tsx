"use client";

import { signOut } from "next-auth/react";

export default function ClientLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/connexion" })}
      className="btn-danger"
      style={{ padding: "0.6rem 1.25rem", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: "bold", border: "1px solid rgba(255,255,255,0.2)" }}
    >
      <span>🚪</span> Déconnexion
    </button>
  );
}
