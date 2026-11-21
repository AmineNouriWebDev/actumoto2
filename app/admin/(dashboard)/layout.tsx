import type { Metadata } from "next";
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminScripts from "@/components/admin/AdminScripts";

import ToastProvider from "@/components/admin/ToastProvider";

import { auth } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const role = session?.user?.role as string | undefined;

  let pendingReviewsCount = 0;
  if (role === "ADMIN") {
    pendingReviewsCount = await prisma.review.count({ where: { isApproved: false } });
  }

  return (
    <div className="admin-layout-root">
      <AdminScripts />
      <ToastProvider />
      <Suspense fallback={<aside className="admin-sidebar" />}>
        <AdminSidebar role={role} pendingReviewsCount={pendingReviewsCount} />
      </Suspense>
      <main className="admin-main">
        <div className="admin-content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}
