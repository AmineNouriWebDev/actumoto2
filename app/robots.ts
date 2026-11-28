import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://actumoto.tn").replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/marques/", "/modeles", "/occasion", "/categories/", "/budget/"],
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/compte",
          "/connexion",
          "/inscription",
          "/verify",
          "/mot-de-passe-oublie",
          "/reinitialiser-mot-de-passe",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
