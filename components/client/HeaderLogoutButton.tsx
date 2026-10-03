"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function HeaderLogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "transparent",
        border: "none",
        color: "#ef4444",
        cursor: "pointer",
        padding: "0.25rem",
        transition: "color 0.2s"
      }}
      title="Se déconnecter"
      aria-label="Se déconnecter"
      className="hover:text-red-400"
    >
      <LogOut size={20} />
    </button>
  );
}
