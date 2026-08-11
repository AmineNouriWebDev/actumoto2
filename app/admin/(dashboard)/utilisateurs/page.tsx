import { getUsers } from "@/lib/admin-actions/users";
import UsersListClient from "@/components/admin/UsersListClient";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Gestion des Utilisateurs | Administration",
};

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/admin");
  }

  const users = await getUsers();

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Utilisateurs</h1>
          <p className="admin-page-subtitle">Gérez les comptes clients, professionnels et administrateurs.</p>
        </div>
      </div>
      <UsersListClient initialUsers={users as any[]} />
    </div>
  );
}
