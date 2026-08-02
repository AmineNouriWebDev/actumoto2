import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";

import ToastProvider from "@/components/admin/ToastProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-layout-root">
      <ToastProvider />
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}
