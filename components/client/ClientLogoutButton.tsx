"use client";

import { signOut } from "next-auth/react";

export default function ClientLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/connexion" })}
      style={{ 
        padding: "0.6rem 1.25rem", 
        fontSize: "0.95rem", 
        display: "flex", 
        alignItems: "center", 
        gap: "0.5rem", 
        fontWeight: "bold", 
        border: "1px solid rgba(239, 68, 68, 0.4)",
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        color: "#fca5a5",
        borderRadius: "0.5rem",
        cursor: "pointer",
        transition: "all 0.2s"
      }}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.25)")}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.15)")}
    >
      <span>🚪</span> Déconnexion
    </button>
  );
}
