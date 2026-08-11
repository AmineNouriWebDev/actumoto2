import prisma from "@/lib/prisma";
import Link from "next/link";
import ClientOccasionList from "@/components/admin/ClientOccasionList";

export default async function AdminOccasionPage() {
  const occasions = await prisma.occasion.findMany({
    include: { images: { orderBy: { orderIndex: 'asc' } } },
    orderBy: { orderIndex: "asc" },
  });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Motos d'occasion</h1>
          <p className="admin-page-subtitle">{occasions.length} annonces au total</p>
        </div>
        <Link href="/admin/occasion/nouveau" className="btn-primary">+ Nouvelle Annonce</Link>
      </div>

      <ClientOccasionList initialOccasions={occasions as any} />
    </div>
  );
}
