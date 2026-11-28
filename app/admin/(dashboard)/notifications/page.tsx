import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNotificationsClient from "@/components/admin/AdminNotificationsClient";

export default async function AdminNotificationsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin/login");

  const hasVapidKeys = Boolean(
    (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY) &&
      process.env.VAPID_PRIVATE_KEY
  );

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">🔔 Notifications Push</h1>
          <p className="admin-page-subtitle">
            Préparez vos messages promotionnels, nouveautés et alertes et envoyez-les instantanément à vos visiteurs abonnés.
          </p>
        </div>
        <a href="/" target="_blank" rel="noreferrer" className="btn-secondary">
          🌐 Voir le site
        </a>
      </div>

      <AdminNotificationsClient hasVapidKeys={hasVapidKeys} />
    </div>
  );
}
