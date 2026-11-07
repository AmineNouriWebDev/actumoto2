import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q || q.length < 1) {
      return NextResponse.json({ models: [], brands: [] });
    }

    const [models, brands] = await Promise.all([
      prisma.model.findMany({
        where: {
          isVisible: true,
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { brand: { name: { contains: q, mode: "insensitive" } } },
          ],
        },
        take: 8,
        orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
        include: {
          brand: { select: { name: true, logo: true } },
          images: { orderBy: { orderIndex: "asc" }, take: 1, select: { url: true } },
        },
      }),
      prisma.brand.findMany({
        where: {
          isVisible: true,
          name: { contains: q, mode: "insensitive" },
        },
        take: 4,
        orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
        select: { name: true, logo: true },
      }),
    ]);

    const formattedModels = models.map((m) => ({
      id: m.id,
      name: m.name,
      brand: m.brand.name,
      brandLogo: m.brand.logo,
      price: m.promoPrice || m.price,
      currency: m.currency,
      image: m.images[0]?.url || null,
      href: `/marques/${encodeURIComponent(m.brand.name)}/${encodeURIComponent(m.name)}`,
    }));

    const formattedBrands = brands.map((b) => ({
      name: b.name,
      logo: b.logo,
      href: `/marques/${encodeURIComponent(b.name)}`,
    }));

    return NextResponse.json({
      models: formattedModels,
      brands: formattedBrands,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ models: [], brands: [] }, { status: 500 });
  }
}
