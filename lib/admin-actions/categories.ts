"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadAndConvertToWebp, deletePhysicalImage } from "@/lib/upload";

export async function toggleCategoryVisibility(id: string, isVisible: boolean) {
  const newVisibility = !isVisible;
  await prisma.category.update({ where: { id }, data: { isVisible: newVisibility } });

  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function updateCategoryOrder(updates: { id: string; orderIndex: number }[]) {
  const promises = updates.map((update) =>
    prisma.category.update({
      where: { id: update.id },
      data: { orderIndex: update.orderIndex },
    })
  );
  await Promise.all(promises);
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function createCategory(formData: FormData) {
  const name = formData.get("name") as string;
  const logoFile = formData.get("logoFile") as File;

  if (!name || !name.trim()) return { error: "Le nom de la catégorie est requis." };
  if (!logoFile || logoFile.size === 0) return { error: "L'image de la catégorie est requise." };

  const existing = await prisma.category.findUnique({
    where: { name: name.trim() },
  });
  if (existing) {
    return { error: `La catégorie "${name.trim()}" existe déjà.` };
  }

  const logoUrl = await uploadAndConvertToWebp(logoFile, "category");
  if (!logoUrl) return { error: "Erreur lors de l'upload et de la conversion de l'image." };

  const maxOrder = await prisma.category.findFirst({
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });
  const newOrderIndex = maxOrder ? maxOrder.orderIndex + 1 : 0;

  await prisma.category.create({
    data: {
      name: name.trim(),
      logo: logoUrl,
      orderIndex: newOrderIndex,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const logoFile = formData.get("logoFile") as File | null;

  if (!name || !name.trim()) return { error: "Le nom de la catégorie est requis." };

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return { error: "Catégorie introuvable." };

  // Vérifier si un autre modèle porte déjà ce nom
  if (name.trim().toLowerCase() !== category.name.toLowerCase()) {
    const existing = await prisma.category.findUnique({
      where: { name: name.trim() },
    });
    if (existing) {
      return { error: `Une autre catégorie porte déjà le nom "${name.trim()}".` };
    }
  }

  let logoUrl = category.logo;

  if (logoFile && logoFile.size > 0) {
    const newLogoUrl = await uploadAndConvertToWebp(logoFile, "category");
    if (newLogoUrl) {
      // Supprimer l'ancienne image si elle a été générée/téléversée dans /img/category/
      if (category.logo.startsWith("/img/category/")) {
        await deletePhysicalImage(category.logo);
      }
      logoUrl = newLogoUrl;
    }
  }

  await prisma.category.update({
    where: { id },
    data: {
      name: name.trim(),
      logo: logoUrl,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath(`/categories/${encodeURIComponent(category.name)}`);
  revalidatePath(`/categories/${encodeURIComponent(name.trim())}`);
  revalidatePath("/");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return;

  // Supprimer l'image physique si personnalisée
  if (category.logo.startsWith("/img/category/")) {
    await deletePhysicalImage(category.logo);
  }

  await prisma.category.delete({ where: { id } });

  revalidatePath("/admin/categories");
  revalidatePath("/");
}
