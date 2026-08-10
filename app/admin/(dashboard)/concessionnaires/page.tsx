import prisma from "@/lib/prisma";
import Link from "next/link";
import DealerList from "@/components/admin/DealerList";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DealersPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/admin"); // Seul l'admin a accès
  }

  const dbDealers = await prisma.user.findMany({
    where: { role: "DEALER" },
    include: {
      assignedBrands: {
        include: {
          brand: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const dealers = await Promise.all(dbDealers.map(async (dealer) => {
    const brandIds = dealer.assignedBrands.map(ab => ab.brandId);
    const dynamicCount = brandIds.length > 0 
      ? await prisma.model.count({ where: { brandId: { in: brandIds } } })
      : 0;
      
    return {
      ...dealer,
      modelsCreatedCount: dynamicCount // override with the true dynamic count
    };
  }));

  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Concessionnaires</h1>
          <p className="admin-page-subtitle">Gérez les accès professionnels (Pros)</p>
        </div>
      </div>

      <DealerList dealers={dealers} allBrands={brands} />
    </div>
  );
}
