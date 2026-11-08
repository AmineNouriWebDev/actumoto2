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
            Choisissez les motos et sélectionnez l&apos;image exacte affichée dans la section Nouveautés de la page d&apos;accueil
          </p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="btn-secondary">
          🌐 Voir le site en direct
        </a>
      </div>
      <AdminNouveautesClient />
    </div>
  );
}
