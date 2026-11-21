import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSettingsClient from "@/components/admin/AdminSettingsClient";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin/login");

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">⚙️ Paramètres du Site</h1>
          <p className="admin-page-subtitle">
            Gérez l&apos;application du menu navigation et la visibilité du pied de page sur le site.
          </p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="btn-secondary">
          🌐 Voir le site en direct
        </a>
      </div>
      <AdminSettingsClient />
    </div>
  );
}
