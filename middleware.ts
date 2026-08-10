import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role as string | undefined;
  
  const path = req.nextUrl.pathname;
  const isOnAdmin = path.startsWith("/admin");
  const isOnAdminLogin = path === "/admin/login";
  
  const isOnCompte = path.startsWith("/compte");
  const isOnClientLogin = path === "/connexion" || path === "/inscription";

  // 1. Protection de l'espace /admin
  if (isOnAdmin && !isOnAdminLogin) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/admin/login", req.nextUrl));
    }
    // Si connecté mais pas Admin/Dealer, on le jette
    if (role !== "ADMIN" && role !== "DEALER") {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }

  // 2. Redirection si déjà connecté sur /admin/login
  if (isOnAdminLogin && isLoggedIn) {
    if (role === "ADMIN" || role === "DEALER") {
      return NextResponse.redirect(new URL("/admin", req.nextUrl));
    } else {
      return NextResponse.redirect(new URL("/compte", req.nextUrl));
    }
  }

  // 3. Protection de l'espace /compte
  if (isOnCompte) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/connexion", req.nextUrl));
    }
    // Les Admins et Dealers peuvent théoriquement aller sur /compte, mais c'est surtout pour CLIENT
  }

  // 4. Redirection si déjà connecté sur /connexion ou /inscription
  if (isOnClientLogin && isLoggedIn) {
    if (role === "ADMIN" || role === "DEALER") {
      return NextResponse.redirect(new URL("/admin", req.nextUrl));
    } else {
      return NextResponse.redirect(new URL("/compte", req.nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/compte/:path*", "/connexion", "/inscription"],
};
