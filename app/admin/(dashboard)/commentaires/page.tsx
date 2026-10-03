import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import ConfirmForm from "@/components/admin/ConfirmForm";
import { approveReview, deleteReview } from "@/lib/admin-actions/reviews";
import Link from "next/link";

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ status?: string, q?: string }> }) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") redirect("/admin");

  const params = await searchParams;
  const statusFilter = params.status || "pending"; // 'pending', 'approved', 'all'
  const searchQ = params.q || "";

  let whereClause: any = {};
  
  if (statusFilter === "pending") {
    whereClause.isApproved = false;
  } else if (statusFilter === "approved") {
    whereClause.isApproved = true;
  }

  if (searchQ) {
    whereClause.OR = [
      { comment: { contains: searchQ, mode: "insensitive" } },
      { user: { name: { contains: searchQ, mode: "insensitive" } } },
      { user: { email: { contains: searchQ, mode: "insensitive" } } },
    ];
  }

  const reviews = await prisma.review.findMany({
    where: whereClause,
    include: {
      user: true,
      model: { include: { brand: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 500, // Limite raisonnable
  });

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Historique & Modération des Commentaires</h1>
          <p className="admin-page-desc">Gérez l'historique de tous les avis laissés par les clients.</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <form method="GET" style={{ display: "flex", gap: "0.5rem", flexGrow: 1, maxWidth: "500px" }}>
          <input 
            type="hidden" 
            name="status" 
            value={statusFilter} 
          />
          <input 
            type="text" 
            name="q" 
            placeholder="Rechercher (utilisateur, contenu...)" 
            defaultValue={searchQ}
            style={{ flexGrow: 1, padding: "0.5rem 1rem", border: "1px solid #d1d5db", borderRadius: "6px" }}
          />
          <button type="submit" className="btn-primary" style={{ padding: "0.5rem 1rem" }}>🔍</button>
        </form>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href="/admin/commentaires?status=pending" className={`btn-secondary ${statusFilter === 'pending' ? 'active-filter' : ''}`} style={statusFilter === 'pending' ? { background: '#f3f4f6', borderColor: '#d1d5db' } : {}}>En attente</Link>
          <Link href="/admin/commentaires?status=approved" className={`btn-secondary ${statusFilter === 'approved' ? 'active-filter' : ''}`} style={statusFilter === 'approved' ? { background: '#f3f4f6', borderColor: '#d1d5db' } : {}}>Approuvés</Link>
          <Link href="/admin/commentaires?status=all" className={`btn-secondary ${statusFilter === 'all' ? 'active-filter' : ''}`} style={statusFilter === 'all' ? { background: '#f3f4f6', borderColor: '#d1d5db' } : {}}>Tous</Link>
        </div>
      </div>

      <div className="admin-table-container">
        {reviews.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#6b7280" }}>
            Aucun commentaire trouvé pour ces filtres.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Statut</th>
                <th>Utilisateur</th>
                <th>Moto</th>
                <th>Note</th>
                <th>Commentaire</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review.id}>
                  <td>
                    {review.isApproved ? (
                      <span className="status-badge status-active">Approuvé</span>
                    ) : (
                      <span className="status-badge" style={{ background: "#fef3c7", color: "#b45309" }}>En attente</span>
                    )}
                  </td>
                  <td>
                    <strong>{review.user.name || "Anonyme"}</strong><br />
                    <span style={{ fontSize: "0.85em", color: "#6b7280" }}>{review.user.email}</span>
                  </td>
                  <td>{review.model.brand.name} {review.model.name}</td>
                  <td>⭐ {review.rating}/5</td>
                  <td style={{ maxWidth: "300px", whiteSpace: "normal" }}>
                    {review.comment ? review.comment : <em style={{ color: "#9ca3af" }}>Aucun texte</em>}
                  </td>
                  <td>{review.createdAt.toLocaleDateString("fr-FR")}</td>
                  <td>
                    <div className="row-actions">
                      {!review.isApproved && (
                        <form action={approveReview.bind(null, review.id) as any}>
                          <button type="submit" className="btn-primary" style={{ padding: "0.3rem 0.55rem" }} title="Approuver">
                            ✅
                          </button>
                        </form>
                      )}
                      <ConfirmForm
                        action={deleteReview.bind(null, review.id)}
                        confirmMessage="Supprimer définitivement cet avis ?"
                      >
                        <button type="submit" className="btn-danger" style={{ padding: "0.3rem 0.55rem" }} title="Supprimer">
                          🗑️
                        </button>
                      </ConfirmForm>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
