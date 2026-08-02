import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { items } = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    if (items.length === 0) {
      return NextResponse.json({ models: [] });
    }

    // We can query all requested models. Prisma OR might be tricky with multiple { brand, name } pairs.
    // We can do a findMany with OR.
    const orConditions = items.map((item: any) => ({
      brand: { name: item.brand },
      name: item.name,
    }));

    const models = await prisma.model.findMany({
      where: {
        OR: orConditions,
      },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { orderIndex: 'asc' } },
        specs: true,
      }
    });

    // Format models to match what the frontend expects
    const formattedModels = models.map((m) => ({
      ...m,
      brand: m.brand.name,
      itemReferenceName: m.name,
      images: m.images.map((img) => img.url),
      category: m.category?.name,
    }));

    // Reorder them according to the input `items` order
    const orderedModels = items.map(item => 
      formattedModels.find(m => m.brand === item.brand && m.itemReferenceName === item.name)
    ).filter(Boolean);

    return NextResponse.json({ models: orderedModels });
  } catch (error) {
    console.error("Error fetching compare models:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
