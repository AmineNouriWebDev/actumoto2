"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadAndConvertToWebp } from "@/lib/upload";

export async function toggleOccasionVisibility(id: string, isVisible: boolean) {
  await prisma.occasion.update({ where: { id }, data: { isVisible: !isVisible } });
  revalidatePath("/admin/occasion");
  revalidatePath("/occasion");
}

export async function deleteOccasion(id: string) {
  await prisma.occasion.delete({ where: { id } });
  revalidatePath("/admin/occasion");
  revalidatePath("/occasion");
}

export async function updateOccasionOrder(updates: { id: string; orderIndex: number }[]) {
  const promises = updates.map((update) =>
    prisma.occasion.update({
      where: { id: update.id },
      data: { orderIndex: update.orderIndex },
    })
  );
  await Promise.all(promises);
  revalidatePath("/admin/occasion");
  revalidatePath("/occasion");
}

export async function createOccasion(formData: FormData) {
  const name = formData.get("name") as string;
  const marque = formData.get("marque") as string;
  const price = formData.get("price") as string;
  const category = formData.get("category") as string;
  const fuelType = formData.get("fuelType") as string;

  if (!name || !marque) return { error: "Nom et marque sont requis." };

  const imageUrls = (formData.get("imageUrls") as string || "")
    .split("\n").map(s => s.trim()).filter(Boolean);

  const maxOrder = await prisma.occasion.findFirst({
    orderBy: { orderIndex: 'desc' },
    select: { orderIndex: true }
  });
  const newOrderIndex = maxOrder ? maxOrder.orderIndex + 1 : 0;

  await prisma.occasion.create({
    data: {
      name: name.trim(),
      marque: marque.trim(),
      price: price.trim() || null,
      category: category.trim() || null,
      fuelType: fuelType?.trim() || null,
      orderIndex: newOrderIndex,
      specs: {
        create: {
          kilometrage: (formData.get("kilometrage") as string)?.trim() || null,
          annee: (formData.get("annee") as string)?.trim() || null,
          typeMoteur: (formData.get("typeMoteur") as string)?.trim() || null,
          cylindree: (formData.get("cylindree") as string)?.trim() || null,
          puissance: (formData.get("puissance") as string)?.trim() || null,
          coupleMaximal: (formData.get("coupleMaximal") as string)?.trim() || null,
          refroidissement: (formData.get("refroidissement") as string)?.trim() || null,
          tankCapacity: (formData.get("tankCapacity") as string)?.trim() || null,
          vitesseMaximale: (formData.get("vitesseMaximale") as string)?.trim() || null,
          autonomie: (formData.get("autonomie") as string)?.trim() || null,
          alimentation: (formData.get("alimentation") as string)?.trim() || null,
          freinage: (formData.get("freinage") as string)?.trim() || null,
          systemeFreinage: (formData.get("systemeFreinage") as string)?.trim() || null,
        }
      },
      images: {
        create: imageUrls.map((url, idx) => ({ url, orderIndex: idx }))
      }
    }
  });

  revalidatePath("/admin/occasion");
  revalidatePath("/occasion");
  return { success: true };
}

export async function updateOccasion(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const marque = formData.get("marque") as string;
  const price = formData.get("price") as string;
  const category = formData.get("category") as string;
  const fuelType = formData.get("fuelType") as string;

  if (!name || !marque) return { error: "Nom et marque sont requis." };

  await prisma.occasion.update({
    where: { id },
    data: {
      name: name.trim(),
      marque: marque.trim(),
      price: price.trim() || null,
      category: category.trim() || null,
      fuelType: fuelType?.trim() || null,
      specs: {
        update: {
          kilometrage: (formData.get("kilometrage") as string)?.trim() || null,
          annee: (formData.get("annee") as string)?.trim() || null,
          typeMoteur: (formData.get("typeMoteur") as string)?.trim() || null,
          cylindree: (formData.get("cylindree") as string)?.trim() || null,
          puissance: (formData.get("puissance") as string)?.trim() || null,
          coupleMaximal: (formData.get("coupleMaximal") as string)?.trim() || null,
          refroidissement: (formData.get("refroidissement") as string)?.trim() || null,
          tankCapacity: (formData.get("tankCapacity") as string)?.trim() || null,
          vitesseMaximale: (formData.get("vitesseMaximale") as string)?.trim() || null,
          autonomie: (formData.get("autonomie") as string)?.trim() || null,
          alimentation: (formData.get("alimentation") as string)?.trim() || null,
          freinage: (formData.get("freinage") as string)?.trim() || null,
          systemeFreinage: (formData.get("systemeFreinage") as string)?.trim() || null,
        }
      }
    }
  });

  const imageUrls = (formData.get("imageUrls") as string || "")
    .split("\n").map(s => s.trim()).filter(Boolean);

  // Replace images
  await prisma.occasionImage.deleteMany({ where: { occasionId: id } });
  for (let i = 0; i < imageUrls.length; i++) {
    await prisma.occasionImage.create({ data: { occasionId: id, url: imageUrls[i], orderIndex: i } });
  }

  revalidatePath("/admin/occasion");
  revalidatePath(`/admin/occasion/${id}`);
  revalidatePath("/occasion");
  return { success: true };
}

export async function deleteOccasionImage(imageId: string) {
  await prisma.occasionImage.delete({ where: { id: imageId } });
  revalidatePath("/admin/occasion");
  revalidatePath("/occasion");
}
