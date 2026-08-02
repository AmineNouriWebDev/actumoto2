import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isOnAdmin = req.nextUrl.pathname.startsWith("/admin");
  const isOnLogin = req.nextUrl.pathname.startsWith("/admin/login");

  if (isOnAdmin && !isOnLogin && !isLoggedIn) {
    const loginUrl = new URL("/admin/login", req.nextUrl);
    return NextResponse.redirect(loginUrl);
  }

  if (isOnLogin && isLoggedIn) {
    const adminUrl = new URL("/admin", req.nextUrl);
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
