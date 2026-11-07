import prisma from "@/lib/prisma";
import Link from "next/link";
import ClientCategoryList from "@/components/admin/ClientCategoryList";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { models: { select: { id: true } } },
    orderBy: { orderIndex: "asc" },
  });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Catégories</h1>
          <p className="admin-page-subtitle">{categories.length} catégories au total</p>
        </div>
        <Link href="/admin/categories/nouvelle" className="btn-primary">
          + Nouvelle Catégorie
        </Link>
      </div>

      <ClientCategoryList initialCategories={categories as any} />
    </div>
  );
}
