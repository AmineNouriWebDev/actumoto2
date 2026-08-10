import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";

import ToastProvider from "@/components/admin/ToastProvider";

import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role as string | undefined;

  return (
    <div className="admin-layout-root">
      <ToastProvider />
      <AdminSidebar role={role} />
      <main className="admin-main">
        <div className="admin-content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}
