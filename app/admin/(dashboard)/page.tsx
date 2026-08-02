import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const [brands, models, slides, admins] = await Promise.all([
    prisma.brand.findMany({ select: { id: true, isVisible: true, comingSoon: true } }),
    prisma.model.findMany({ select: { id: true, isVisible: true } }),
    prisma.carouselSlide.findMany({ select: { id: true, isVisible: true } }),
    prisma.adminUser.findMany({ select: { id: true } }),
  ]);

  const stats = [
    { label: "Marques", value: brands.length, sub: `${brands.filter(b => !b.isVisible).length} cachées`, icon: "🏷️", colorVar: "#3b82f6", href: "/admin/marques" },
    { label: "Modèles", value: models.length, sub: `${models.filter(m => !m.isVisible).length} cachés`, icon: "🏍️", colorVar: "#8b5cf6", href: "/admin/modeles" },
    { label: "Slides Carrousel", value: slides.length, sub: `${slides.filter(s => s.isVisible).length} actifs`, icon: "🖼️", colorVar: "#10b981", href: "/admin/carrousel" },
    { label: "Administrateurs", value: admins.length, sub: "comptes admin", icon: "👤", colorVar: "#f59e0b", href: "/admin/admins" },
  ];

  const quickActions = [
    { label: "Ajouter une Marque", href: "/admin/marques/nouvelle", icon: "➕" },
    { label: "Ajouter un Modèle", href: "/admin/modeles/nouveau", icon: "🏍️" },
    { label: "Gérer le Carrousel", href: "/admin/carrousel", icon: "🖼️" },
    { label: "Modifier la Popup", href: "/admin/popup", icon: "📢" },
    { label: "Modifier la Bannière", href: "/admin/banniere", icon: "🖼" },
    { label: "Gérer les Admins", href: "/admin/admins", icon: "👤" },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Tableau de Bord</h1>
          <p className="admin-page-subtitle">Gérez tout le contenu de actumoto.tn depuis ici</p>
        </div>
        <a href="/" target="_blank" className="btn-secondary">🌐 Voir le site en direct</a>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} style={{ textDecoration: "none" }}>
            <div className="admin-card" style={{ display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "0.75rem", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "1.5rem", flexShrink: 0,
                background: `${stat.colorVar}20`, color: stat.colorVar,
              }}>{stat.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#f9fafb", fontSize: "1.75rem", fontWeight: 700, lineHeight: 1, marginBottom: "0.25rem" }}>{stat.value}</div>
                <div style={{ color: "#d1d5db", fontSize: "0.875rem", fontWeight: 600 }}>{stat.label}</div>
                <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>{stat.sub}</div>
              </div>
              <span style={{ color: stat.colorVar, fontSize: "1.25rem" }}>→</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ color: "#d1d5db", fontSize: "1.125rem", fontWeight: 600, margin: "0 0 1rem" }}>Actions Rapides</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "0.75rem" }}>
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href} style={{ textDecoration: "none" }}>
              <div className="admin-card" style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem",
                textAlign: "center", cursor: "pointer",
              }}>
                <span style={{ fontSize: "1.75rem" }}>{action.icon}</span>
                <span style={{ color: "#d1d5db", fontSize: "0.875rem", fontWeight: 500, lineHeight: 1.3 }}>{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
