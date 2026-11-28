import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://actumoto.tn").replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/modeles`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/occasion`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${baseUrl}/comparateur`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  const budgetSlugs = [
    "moins-de-4000",
    "4000-7000",
    "7000-10000",
    "10000-15000",
    "15000-20000",
    "plus-de-20000",
  ];
  const budgetRoutes: MetadataRoute.Sitemap = budgetSlugs.map((slug) => ({
    url: `${baseUrl}/budget/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.65,
  }));

  try {
    const [brands, categories, models] = await Promise.all([
      prisma.brand.findMany({
        where: { isVisible: true },
        select: { name: true },
        orderBy: { orderIndex: "asc" },
      }),
      prisma.category.findMany({
        where: { isVisible: true },
        select: { name: true },
        orderBy: { orderIndex: "asc" },
      }),
      prisma.model.findMany({
        where: { isVisible: true, hasDetailPage: true, brand: { isVisible: true } },
        select: { name: true, brand: { select: { name: true } } },
      }),
    ]);

    const brandRoutes: MetadataRoute.Sitemap = brands.map((b) => ({
      url: `${baseUrl}/marques/${encodeURIComponent(b.name)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${baseUrl}/categories/${encodeURIComponent(c.name)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    const modelRoutes: MetadataRoute.Sitemap = models.map((m) => ({
      url: `${baseUrl}/marques/${encodeURIComponent(m.brand.name)}/${encodeURIComponent(m.name)}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [
      ...staticRoutes,
      ...brandRoutes,
      ...modelRoutes,
      ...categoryRoutes,
      ...budgetRoutes,
    ];
  } catch {
    return [...staticRoutes, ...budgetRoutes];
  }
}
