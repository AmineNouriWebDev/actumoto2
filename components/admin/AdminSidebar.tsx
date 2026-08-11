"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const allNavItems = [
  { href: "/admin", label: "Dashboard", icon: "📊", exact: true, roles: ["ADMIN", "DEALER"] },
  { href: "/admin/marques", label: "Marques", icon: "🏷️", roles: ["ADMIN"] },
  { href: "/admin/modeles", label: "Modèles", icon: "🏍️", roles: ["ADMIN", "DEALER"] },
  { href: "/admin/occasion", label: "Occasions", icon: "🔄", roles: ["ADMIN", "DEALER"] },
  { href: "/admin/carrousel", label: "Carrousel", icon: "🖼️", roles: ["ADMIN"] },
  { href: "/admin/popup", label: "Popup", icon: "📢", roles: ["ADMIN"] },
  { href: "/admin/banniere", label: "Bannière", icon: "🖼", roles: ["ADMIN"] },
  { href: "/admin/admins", label: "Administrateurs", icon: "👤", roles: ["ADMIN"] },
  { href: "/admin/concessionnaires", label: "Concessionnaires", icon: "🏢", roles: ["ADMIN"] },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "👥", roles: ["ADMIN"] },
];

export default function AdminSidebar({ role }: { role?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const navItems = allNavItems.filter((item) => {
    if (!role) return false;
    return item.roles.includes(role);
  });

  const SidebarContent = () => (
    <div className="sidebar-inner">
      <div className="sidebar-header">
        <img src="/img/logo-principal-6.png" alt="actumoto" className="sidebar-logo" />
        <span className="sidebar-badge">Admin</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item ${isActive(item.href, item.exact) ? "active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <a href="/" target="_blank" className="view-site-btn">
          <span>🌐</span> Voir le site
        </a>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="logout-btn"
        >
          <span>🚪</span> Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="mobile-topbar">
        <button
          className="hamburger"
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu"
        >
          ☰
        </button>
        <img src="/img/logo-principal-6.png" alt="actumoto" className="mobile-logo" />
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)}>
          <div className="mobile-sidebar" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setMobileOpen(false)}>✕</button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="desktop-sidebar">
        <SidebarContent />
      </aside>

    </>
  );
}
