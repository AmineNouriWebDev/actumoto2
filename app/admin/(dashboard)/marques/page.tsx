import prisma from "@/lib/prisma";
import Link from "next/link";
import ClientBrandList from "@/components/admin/ClientBrandList";

export default async function AdminBrandsPage() {
  const brands = await prisma.brand.findMany({
    include: { models: { select: { id: true } }, dealerContact: { select: { id: true } } },
    orderBy: { orderIndex: "asc" },
  });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Marques</h1>
          <p className="admin-page-subtitle">{brands.length} marques au total</p>
        </div>
        <Link href="/admin/marques/nouvelle" className="btn-primary">+ Nouvelle Marque</Link>
      </div>

      <ClientBrandList initialBrands={brands as any} />
    </div>
  );
}
