import prisma from "@/lib/prisma";
import Link from "next/link";
import ClientModelList from "@/components/admin/ClientModelList";
import ModelFilters from "@/components/admin/ModelFilters";

export default async function AdminModelsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; brand?: string; page?: string }>;
}) {
  const { search, brand: brandFilter, page } = await searchParams;
  const currentPage = parseInt(page || "1");
  const perPage = 20;

  let models: any[] = [];
  let total = 0;
  const brands = await prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });

  const showList = brandFilter || search;

  if (showList) {
    const where: any = {};
    if (brandFilter) where.brandId = brandFilter;
    if (search) where.name = { contains: search, mode: "insensitive" };
    
    [models, total] = await Promise.all([
      prisma.model.findMany({
        where,
        include: { brand: true, category: true, images: { take: 1, orderBy: { orderIndex: "asc" } } },
        orderBy: [{ brand: { name: "asc" } }, { orderIndex: "asc" }],
        skip: (currentPage - 1) * perPage,
        take: perPage,
      }),
      prisma.model.count({ where }),
    ]);
  }

  const totalPages = Math.ceil(total / perPage);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Modèles de Motos</h1>
          <p className="admin-page-subtitle">{total} modèles au total</p>
        </div>
        <Link href="/admin/modeles/nouveau" className="btn-primary">+ Nouveau Modèle</Link>
      </div>

      {/* Filters */}
      <ModelFilters brands={brands} />

      {/* Models Table */}
      {!showList ? (
        <div className="admin-card" style={{ textAlign: "center", padding: "4rem 2rem", color: "#9ca3af" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏷️</div>
          <h2 style={{ fontSize: "1.25rem", color: "#e5e7eb", marginBottom: "0.5rem" }}>Sélectionnez une marque ou recherchez</h2>
          <p>Veuillez choisir une marque ou taper un nom pour afficher les modèles.</p>
        </div>
      ) : (
        <div className="admin-table-card">
          <ClientModelList initialModels={models as any} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="admin-pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/admin/modeles?page=${p}${search ? `&search=${search}` : ""}${brandFilter ? `&brand=${brandFilter}` : ""}`}
                  className={`page-link ${p === currentPage ? "active" : ""}`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
