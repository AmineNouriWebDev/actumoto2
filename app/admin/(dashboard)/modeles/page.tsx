import prisma from "@/lib/prisma";
import Link from "next/link";
import ClientModelList from "@/components/admin/ClientModelList";
import ModelFilters from "@/components/admin/ModelFilters";
import { auth } from "@/lib/auth";

export default async function AdminModelsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; brand?: string; page?: string }>;
}) {
  const session = await auth();
  const role = session?.user?.role as string | undefined;
  const userId = session?.user?.id as string | undefined;

  const { search, brand: brandFilter, page } = await searchParams;
  const currentPage = parseInt(page || "1");
  const perPage = 20;

  let models: any[] = [];
  let total = 0;
  
  // 1. Déterminer les marques autorisées et les quotas
  let brands: any[] = [];
  let allowedBrandIds: string[] | null = null; // null = all brands allowed (ADMIN)
  let quotaReached = false;
  let dealerInfo = null;

  if (role === "DEALER" && userId) {
    const dealerUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { assignedBrands: { include: { brand: true } } }
    });
    brands = dealerUser?.assignedBrands.map(ab => ab.brand).sort((a, b) => a.name.localeCompare(b.name)) || [];
    allowedBrandIds = brands.map(b => b.id);
    
    if (dealerUser) {
      const dynamicCount = await prisma.model.count({
        where: { brandId: { in: allowedBrandIds } }
      });
      quotaReached = dynamicCount >= dealerUser.modelsQuota;
      dealerInfo = { count: dynamicCount, quota: dealerUser.modelsQuota };
    }
  } else {
    brands = await prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } });
  }

  const showList = brandFilter || search || role === "DEALER"; // Dealers should probably see the list immediately if they only have a few brands

  if (showList) {
    const where: any = {};
    if (brandFilter) {
      if (allowedBrandIds && !allowedBrandIds.includes(brandFilter)) {
        where.brandId = "NOT_ALLOWED"; // Force empty result if they try to access another brand
      } else {
        where.brandId = brandFilter;
      }
    } else if (allowedBrandIds) {
      where.brandId = { in: allowedBrandIds }; // If no filter selected, only show allowed brands
    }

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
          {role === "DEALER" && dealerInfo && (
            <p style={{ fontSize: "0.85rem", color: quotaReached ? "#ef4444" : "#10b981", marginTop: "0.25rem" }}>
              Quota : {dealerInfo.count} / {dealerInfo.quota} modèles utilisés
            </p>
          )}
        </div>
        
        {quotaReached ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
            <button className="btn-secondary" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>+ Nouveau Modèle</button>
            <span style={{ fontSize: "0.75rem", color: "#ef4444" }}>Quota atteint. Veuillez contacter l'administrateur.</span>
          </div>
        ) : (
          <Link href="/admin/modeles/nouveau" className="btn-primary">+ Nouveau Modèle</Link>
        )}
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
