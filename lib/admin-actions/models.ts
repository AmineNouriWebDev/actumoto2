"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleModelVisibility(id: string, isVisible: boolean) {
  await prisma.model.update({ where: { id }, data: { isVisible: !isVisible } });
  revalidatePath("/admin/modeles");
  revalidatePath("/");
}

export async function deleteModel(id: string) {
  await prisma.model.delete({ where: { id } });
  revalidatePath("/admin/modeles");
  revalidatePath("/");
}

export async function createModel(formData: FormData) {
  const name = formData.get("name") as string;
  const brandId = formData.get("brandId") as string;
  const categoryId = (formData.get("categoryId") as string) || null;
  const fuelType = (formData.get("fuelType") as string) || null;
  const priceRaw = formData.get("price") as string;
  const price = priceRaw ? parseFloat(priceRaw) : null;
  const currency = (formData.get("currency") as string) || "DT";
  const imageUrls = (formData.get("imageUrls") as string || "")
    .split("\n").map(s => s.trim()).filter(Boolean);

  if (!name || !brandId) return { error: "Nom et marque sont requis." };

  const maxOrder = await prisma.model.findFirst({
    where: { brandId },
    orderBy: { orderIndex: 'desc' },
    select: { orderIndex: true }
  });
  const newOrderIndex = maxOrder ? maxOrder.orderIndex + 1 : 0;

  const model = await prisma.model.create({
    data: {
      name: name.trim(),
      brandId,
      categoryId: categoryId || undefined,
      fuelType,
      price,
      currency,
      isVisible: true,
      orderIndex: newOrderIndex,
    },
  });

  // Create specs
  const specs: any = {};
  const specFields = ["typeMoteur", "cylindree", "puissance", "coupleMaximal", "refroidissement", 
    "tankCapacity", "vitesseMaximale", "autonomie", "alimentation", "freinage", "systemeFreinage"];
  
  let hasSpecs = false;
  for (const field of specFields) {
    const val = (formData.get(field) as string || "").trim();
    if (val) { specs[field] = val; hasSpecs = true; }
  }

  if (hasSpecs) {
    await prisma.specs.create({ data: { modelId: model.id, ...specs } });
  }

  // Create images
  for (let i = 0; i < imageUrls.length; i++) {
    await prisma.image.create({ data: { modelId: model.id, url: imageUrls[i], orderIndex: i } });
  }

  revalidatePath("/admin/modeles");
  revalidatePath("/");
}

export async function updateModel(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const brandId = formData.get("brandId") as string;
  const categoryId = (formData.get("categoryId") as string) || null;
  const fuelType = (formData.get("fuelType") as string) || null;
  const priceRaw = formData.get("price") as string;
  const price = priceRaw ? parseFloat(priceRaw) : null;
  const currency = (formData.get("currency") as string) || "DT";
  const imageUrls = (formData.get("imageUrls") as string || "")
    .split("\n").map(s => s.trim()).filter(Boolean);

  await prisma.model.update({
    where: { id },
    data: { name: name.trim(), brandId, categoryId: categoryId || undefined, fuelType, price, currency },
  });

  // Update specs
  const specsData: any = {};
  const specFields = ["typeMoteur", "cylindree", "puissance", "coupleMaximal", "refroidissement",
    "tankCapacity", "vitesseMaximale", "autonomie", "alimentation", "freinage", "systemeFreinage"];
  
  for (const field of specFields) {
    const val = (formData.get(field) as string || "").trim();
    specsData[field] = val || null;
  }

  await prisma.specs.upsert({
    where: { modelId: id },
    update: specsData,
    create: { modelId: id, ...specsData },
  });

  // Replace images
  await prisma.image.deleteMany({ where: { modelId: id } });
  for (let i = 0; i < imageUrls.length; i++) {
    await prisma.image.create({ data: { modelId: id, url: imageUrls[i], orderIndex: i } });
  }

  revalidatePath("/admin/modeles");
  revalidatePath(`/admin/modeles/${id}`);
  revalidatePath("/");
}

export async function updateModelOrder(updates: { id: string; orderIndex: number }[]) {
  const promises = updates.map((update) =>
    prisma.model.update({
      where: { id: update.id },
      data: { orderIndex: update.orderIndex },
    })
  );
  await Promise.all(promises);
  revalidatePath("/admin/modeles");
  revalidatePath("/");
}
