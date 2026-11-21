import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNouveautesClient from "@/components/admin/AdminNouveautesClient";

export default async function AdminNouveautesPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin/login");

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">✨ Gestion des Nouveautés</h1>
          <p className="admin-page-subtitle">
            Gérez les nouveautés du Haut (Section 2) et du Bas (Section 4), modifiez les titres, prix et photos en temps réel.
          </p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="btn-secondary">
          🌐 Voir le site en direct
        </a>
      </div>
      <Suspense fallback={<div style={{ padding: "3rem", textAlign: "center", color: "#9ca3af" }}>Chargement...</div>}>
        <AdminNouveautesClient />
      </Suspense>
    </div>
  );
}
