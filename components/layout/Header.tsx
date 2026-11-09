import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import fs from "fs";
import path from "path";
import HeaderClient from "@/components/layout/HeaderClient";

export default async function Header() {
  const [session, categories] = await Promise.all([
    auth(),
    prisma.category.findMany({
      where: { isVisible: true },
      orderBy: { orderIndex: "asc" },
      select: { id: true, name: true, logo: true, isVisible: true },
    }),
  ]);

  const isLoggedIn = !!session?.user;
  const role = session?.user?.role;
  const dashboardUrl = role === "ADMIN" || role === "DEALER" ? "/admin" : "/compte";

  const hasLogo = fs.existsSync(
    path.join(process.cwd(), "public", "img", "logo-final.jpeg")
  );
  const defaultLogoSrc = hasLogo ? "/img/logo-final.jpeg" : "/img/logo2.webp";

  return (
    <HeaderClient
      isLoggedIn={isLoggedIn}
      dashboardUrl={dashboardUrl}
      categories={categories}
      defaultLogoSrc={defaultLogoSrc}
    />
  );
}
