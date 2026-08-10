"use client";

import { signOut } from "next-auth/react";

export default function ClientLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/connexion" })}
      className="btn-secondary"
      style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
    >
      Déconnexion
    </button>
  );
}
