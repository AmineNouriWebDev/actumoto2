import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import ClientLogoutButton from "@/components/client/ClientLogoutButton";

export default async function ClientDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/connexion");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      favorites: {
        include: {
          model: {
            include: { brand: true, images: { take: 1, orderBy: { orderIndex: "asc" } } }
          }
        }
      },
      reviews: {
        include: {
          model: {
            include: { brand: true }
          }
        },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!user) {
    redirect("/connexion");
  }

  return (
    <div className="auth-page-container" style={{ minHeight: "100vh", alignItems: "flex-start" }}>
      <div className="container" style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: "1200px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "2.5rem", fontWeight: 800, margin: 0, fontFamily: "Orbitron, sans-serif", color: "#fff" }}>Mon Compte</h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "1.1rem", marginTop: "0.5rem" }}>Bienvenue, <span style={{ color: "#fff", fontWeight: 600 }}>{user.name || user.email}</span></p>
          </div>
        <ClientLogoutButton />
      </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }}>
          
          {/* Favoris */}
          <div className="auth-card" style={{ maxWidth: "100%", padding: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", color: "#fff" }}>
              <span style={{ color: "#ef4444" }}>❤️</span> Mes Motos Favorites
            </h2>
            {user.favorites.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.5)", padding: "1rem 0" }}>Vous n'avez pas encore de favoris.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1.5rem" }}>
                {user.favorites.map(fav => (
                  <Link key={fav.id} href={`/marques/${encodeURIComponent(fav.model.brand.name)}/${encodeURIComponent(fav.model.name)}`} style={{ textDecoration: "none", color: "inherit" }}>
                    <div className="fav-card" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", overflow: "hidden", transition: "all 0.3s" }}>
                      <img src={fav.model.images[0]?.url || "/placeholder.png"} alt={fav.model.name} style={{ width: "100%", height: "160px", objectFit: "cover" }} />
                      <div style={{ padding: "1rem" }}>
                        <div style={{ fontSize: "0.8rem", color: "#ef4444", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>{fav.model.brand.name}</div>
                        <div style={{ fontWeight: 600, fontSize: "1.1rem", color: "#fff", marginTop: "0.25rem" }}>{fav.model.name}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Avis */}
          <div className="auth-card" style={{ maxWidth: "100%", padding: "2rem" }}>
            <h2 style={{ fontSize: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem", color: "#fff" }}>
              <span style={{ color: "#eab308" }}>⭐</span> Mes Avis
            </h2>
            {user.reviews.length === 0 ? (
              <p style={{ color: "rgba(255,255,255,0.5)", padding: "1rem 0" }}>Vous n'avez pas encore laissé d'avis.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {user.reviews.map(review => (
                  <div key={review.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "1.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                      <Link href={`/marques/${encodeURIComponent(review.model.brand.name)}/${encodeURIComponent(review.model.name)}`} style={{ fontWeight: 700, color: "#fff", textDecoration: "none", fontSize: "1.1rem" }}>
                        {review.model.brand.name} {review.model.name}
                      </Link>
                      <span style={{ color: "#eab308", fontWeight: 800, background: "rgba(234, 179, 8, 0.1)", padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.9rem" }}>{review.rating} / 5</span>
                    </div>
                    {review.comment && <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.95rem", margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>"{review.comment}"</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
