"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadAndConvertToWebp, deletePhysicalImage } from "@/lib/upload";

export async function toggleBrandVisibility(id: string, isVisible: boolean) {
  await prisma.brand.update({ where: { id }, data: { isVisible: !isVisible } });
  revalidatePath("/admin/marques");
  revalidatePath("/");
}

export async function toggleBrandComingSoon(id: string, comingSoon: boolean) {
  await prisma.brand.update({ where: { id }, data: { comingSoon: !comingSoon } });
  revalidatePath("/admin/marques");
  revalidatePath("/");
}

export async function deleteBrand(id: string) {
  await prisma.brand.delete({ where: { id } });
  revalidatePath("/admin/marques");
  revalidatePath("/");
}

export async function createBrand(formData: FormData) {
  const name = formData.get("name") as string;
  const logoFile = formData.get("logoFile") as File;
  const comingSoon = formData.get("comingSoon") === "on";

  if (!name || !logoFile || logoFile.size === 0) return { error: "Nom et logo sont requis." };

  const logoUrl = await uploadAndConvertToWebp(logoFile, "marques");
  if (!logoUrl) return { error: "Erreur lors de l'upload du logo." };

  const maxOrder = await prisma.brand.findFirst({
    orderBy: { orderIndex: 'desc' },
    select: { orderIndex: true }
  });
  const newOrderIndex = maxOrder ? maxOrder.orderIndex + 1 : 0;

  await prisma.brand.create({ data: { name: name.trim(), logo: logoUrl, comingSoon, orderIndex: newOrderIndex } });
  revalidatePath("/admin/marques");
  revalidatePath("/");
}

export async function updateBrand(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const logoFile = formData.get("logoFile") as File | null;
  const comingSoon = formData.get("comingSoon") === "on";

  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) return { error: "Marque introuvable" };

  let logoUrl = brand.logo;

  if (logoFile && logoFile.size > 0) {
    const newLogoUrl = await uploadAndConvertToWebp(logoFile, "marques");
    if (newLogoUrl) {
      // Delete old logo physically if it's a generated one
      if (brand.logo.startsWith("/img/marques/")) {
        await deletePhysicalImage(brand.logo);
      }
      logoUrl = newLogoUrl;
    }
  }

  await prisma.brand.update({
    where: { id },
    data: { name: name.trim(), logo: logoUrl, comingSoon },
  });

  // Dealer contact fields
  const phones = (formData.get("phones") as string || "").split("\n").map(s => s.trim()).filter(Boolean);
  const emails = (formData.get("emails") as string || "").split("\n").map(s => s.trim()).filter(Boolean);
  const website = (formData.get("website") as string || "").trim() || null;
  const facebook = (formData.get("facebook") as string || "").trim() || null;
  const instagram = (formData.get("instagram") as string || "").trim() || null;
  const youtube = (formData.get("youtube") as string || "").trim() || null;
  const tiktok = (formData.get("tiktok") as string || "").trim() || null;
  const showroomAddress = (formData.get("showroomAddress") as string || "").trim() || null;
  let showroomLocationRaw = (formData.get("showroomLocation") as string || "").trim() || null;
  
  let showroomLocation = showroomLocationRaw;
  if (showroomLocationRaw && !showroomLocationRaw.startsWith("http")) {
    // Treat as coordinates or zone name and build a Maps search URL
    showroomLocation = `https://maps.google.com/maps?q=${encodeURIComponent(showroomLocationRaw)}`;
  }
  
  // Parse sales parts (resellers)
  let salesParts = null;
  try {
    const rawSalesParts = formData.get("salesParts") as string;
    if (rawSalesParts) {
      const parsed = JSON.parse(rawSalesParts);
      if (Array.isArray(parsed)) {
        salesParts = parsed.map(dealer => {
          if (dealer.mapUrl && !dealer.mapUrl.startsWith("http")) {
            dealer.mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(dealer.mapUrl)}`;
          }
          return dealer;
        });
      }
    }
  } catch(e) {
    console.error("Error parsing salesParts", e);
  }

  await prisma.dealerContact.upsert({
    where: { brandId: id },
    update: { phones, emails, website, facebook, instagram, youtube, tiktok, showroomAddress, showroomLocation, salesParts },
    create: { brandId: id, phones, emails, website, facebook, instagram, youtube, tiktok, showroomAddress, showroomLocation, salesParts },
  });

  revalidatePath("/admin/marques");
  revalidatePath(`/admin/marques/${id}`);
  revalidatePath("/");
}

export async function updateBrandOrder(updates: { id: string; orderIndex: number }[]) {
  const promises = updates.map((update) =>
    prisma.brand.update({
      where: { id: update.id },
      data: { orderIndex: update.orderIndex },
    })
  );
  await Promise.all(promises);
  revalidatePath("/admin/marques");
  revalidatePath("/");
}
