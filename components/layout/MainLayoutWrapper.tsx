"use client";

import { usePathname } from "next/navigation";

export default function MainLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <main role="main" className={isHome ? "pt-[80px]" : "pt-0"}>
      {children}
    </main>
  );
}
