"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface UserNavButtonProps {
  isLoggedIn: boolean;
}

export default function UserNavButton({ isLoggedIn }: UserNavButtonProps) {
  const pathname = usePathname();

  if (!isLoggedIn) {
    const loginUrl =
      pathname &&
      !pathname.startsWith("/connexion") &&
      !pathname.startsWith("/inscription")
        ? `/connexion?callbackUrl=${encodeURIComponent(pathname)}`
        : "/connexion";

    return (
      <Link
        href={loginUrl}
        className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white hover:text-red-400 flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer group"
        aria-label="Se connecter"
        title="Connexion"
      >
        <User className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-white/10 hover:bg-red-600/80 border border-white/20 hover:border-red-500 text-white flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer group"
      aria-label="Se déconnecter"
      title="Déconnexion"
    >
      <LogOut className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
    </button>
  );
}
