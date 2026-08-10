"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleModelVisibility(id: string, isVisible: boolean) {
  const session = await auth();
  if (session?.user?.role === "DEALER") {
    const model = await prisma.model.findUnique({ where: { id }, select: { brandId: true } });
    if (model) {
      const dealer = await prisma.user.findUnique({ where: { id: session.user.id }, include: { assignedBrands: true } });
      if (!dealer?.assignedBrands.some(ab => ab.brandId === model.brandId)) {
        throw new Error("Non autorisé");
      }
    }
  }

  await prisma.model.update({ where: { id }, data: { isVisible: !isVisible } });
  revalidatePath("/admin/modeles");
  revalidatePath("/");
}

export async function deleteModel(id: string) {
  const session = await auth();
  if (session?.user?.role === "DEALER") {
    const model = await prisma.model.findUnique({ where: { id }, select: { brandId: true } });
    if (model) {
      const dealer = await prisma.user.findUnique({ where: { id: session.user.id }, include: { assignedBrands: true } });
      if (!dealer?.assignedBrands.some(ab => ab.brandId === model.brandId)) {
        throw new Error("Non autorisé");
      }
    }
  }

  await prisma.model.delete({ where: { id } });
  revalidatePath("/admin/modeles");
  revalidatePath("/");
}

import { auth } from "@/lib/auth";

export async function createModel(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role as string | undefined;

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

  if (role === "DEALER" && userId) {
    const dealerUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { assignedBrands: true }
    });
    
    if (!dealerUser) return { error: "Utilisateur introuvable." };
    if (!dealerUser.assignedBrands.some(ab => ab.brandId === brandId)) {
      return { error: "Vous n'êtes pas autorisé à ajouter un modèle pour cette marque." };
    }
    
    const allowedBrandIds = dealerUser.assignedBrands.map(ab => ab.brandId);
    const dynamicCount = await prisma.model.count({
      where: { brandId: { in: allowedBrandIds } }
    });
    
    if (dynamicCount >= dealerUser.modelsQuota) {
      return { error: "Quota de modèles atteint. Veuillez contacter l'administrateur." };
    }
  }

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

  // Remove modelsCreatedCount increment

  revalidatePath("/admin/modeles");
  revalidatePath("/");
  return { id: model.id };
}

export async function updateModel(id: string, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role as string | undefined;

  const name = formData.get("name") as string;
  const brandId = formData.get("brandId") as string;
  const categoryId = (formData.get("categoryId") as string) || null;
  const fuelType = (formData.get("fuelType") as string) || null;
  const priceRaw = formData.get("price") as string;
  const price = priceRaw ? parseFloat(priceRaw) : null;
  const currency = (formData.get("currency") as string) || "DT";
  
  if (!name || !brandId) return { error: "Nom et marque sont requis." };

  if (role === "DEALER" && userId) {
    const dealerUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { assignedBrands: true }
    });
    
    if (!dealerUser || !dealerUser.assignedBrands.some(ab => ab.brandId === brandId)) {
      return { error: "Vous n'êtes pas autorisé à modifier un modèle pour cette marque." };
    }
  }

  const hasDetailPage = formData.getAll("hasDetailPage").includes("true");
  const description = (formData.get("description") as string || "").trim() || null;
  const youtubeUrl = (formData.get("youtubeUrl") as string || "").trim() || null;
  const videoUrl = (formData.get("videoUrl") as string || "").trim() || null;
  const imageUrls = (formData.get("imageUrls") as string || "")
    .split("\n").map(s => s.trim()).filter(Boolean);

  // Get brand name for cache revalidation
  const existing = await prisma.model.findUnique({
    where: { id },
    include: { brand: true },
  });

  await prisma.model.update({
    where: { id },
    data: {
      name: name.trim(),
      brandId,
      categoryId: categoryId ?? null,
      fuelType: fuelType ?? null,
      price,
      currency,
      hasDetailPage,
      description,
      youtubeUrl,
      videoUrl,
    },
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
  // Revalidate the public detail page
  if (existing?.brand?.name) {
    revalidatePath(`/marques/${encodeURIComponent(existing.brand.name)}/${encodeURIComponent(name.trim())}`);
    revalidatePath(`/marques/${encodeURIComponent(existing.brand.name)}`);
  }
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

// ─── Couleurs disponibles ────────────────────────────────────────────────────

export async function addModelColor(modelId: string, name: string, hex: string) {
  const maxOrder = await prisma.modelColor.findFirst({
    where: { modelId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });
  await prisma.modelColor.create({
    data: { modelId, name, hex, orderIndex: maxOrder ? maxOrder.orderIndex + 1 : 0 },
  });
  revalidatePath(`/admin/modeles/${modelId}`);
}

export async function deleteModelColor(colorId: string, modelId: string) {
  await prisma.modelColor.delete({ where: { id: colorId } });
  revalidatePath(`/admin/modeles/${modelId}`);
}

export async function updateModelColors(
  modelId: string,
  colors: { id?: string; name: string; hex: string; orderIndex: number }[]
) {
  // Delete all existing colors for this model
  await prisma.modelColor.deleteMany({ where: { modelId } });
  // Recreate
  for (const color of colors) {
    await prisma.modelColor.create({
      data: { modelId, name: color.name, hex: color.hex, orderIndex: color.orderIndex },
    });
  }
  revalidatePath(`/admin/modeles/${modelId}`);
}
