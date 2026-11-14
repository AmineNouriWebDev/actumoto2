"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadAndConvertToWebp } from "@/lib/upload";

// S'assure que la table BrandBanner existe avec un fallback SQL direct
async function ensureBrandBannerTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "BrandBanner" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "brandId" TEXT NOT NULL REFERENCES "Brand"("id") ON DELETE CASCADE,
        "imageDesktop" TEXT NOT NULL,
        "imageMobile" TEXT,
        "title" TEXT,
        "link" TEXT,
        "altText" TEXT,
        "position" TEXT NOT NULL DEFAULT 'TOP',
        "orderIndex" INTEGER NOT NULL DEFAULT 0,
        "isVisible" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "BrandBanner_brandId_idx" ON "BrandBanner"("brandId");
    `);
  } catch (e) {
    // ignore
  }
}

export async function getBrandBanners(brandId: string) {
  await ensureBrandBannerTable();
  try {
    return await prisma.brandBanner.findMany({
      where: { brandId },
      orderBy: [{ orderIndex: "asc" }, { createdAt: "desc" }],
    });
  } catch (err) {
    try {
      const rows = await prisma.$queryRawUnsafe<any[]>(
        'SELECT * FROM "BrandBanner" WHERE "brandId" = $1 ORDER BY "orderIndex" ASC, "createdAt" DESC;',
        brandId
      );
      return rows;
    } catch (e) {
      return [];
    }
  }
}

export async function createBrandBanner(brandId: string, formData: FormData) {
  await ensureBrandBannerTable();

  const desktopFile = formData.get("imageDesktopFile") as File;
  const mobileFile = formData.get("imageMobileFile") as File | null;
  const title = (formData.get("title") as string || "").trim() || null;
  const altText = (formData.get("altText") as string || "").trim() || null;
  const link = (formData.get("link") as string || "").trim() || null;
  const position = ((formData.get("position") as string) || "TOP").toUpperCase(); // TOP, BOTTOM, BOTH

  if (!desktopFile || desktopFile.size === 0) {
    return { error: "L'image desktop (PC) est obligatoire." };
  }

  const imageDesktop = await uploadAndConvertToWebp(desktopFile, "banners");
  if (!imageDesktop) {
    return { error: "Erreur lors de l'enregistrement de l'image PC." };
  }

  let imageMobile: string | null = null;
  if (mobileFile && mobileFile.size > 0) {
    imageMobile = await uploadAndConvertToWebp(mobileFile, "banners");
  }

  // Obtenir le nouvel orderIndex
  let newOrderIndex = 0;
  try {
    const maxOrder = await prisma.brandBanner.findFirst({
      where: { brandId },
      orderBy: { orderIndex: "desc" },
      select: { orderIndex: true },
    });
    newOrderIndex = maxOrder ? maxOrder.orderIndex + 1 : 0;
  } catch (e) {}

  const bannerId = crypto.randomUUID();

  try {
    await prisma.brandBanner.create({
      data: {
        id: bannerId,
        brandId,
        imageDesktop,
        imageMobile,
        title,
        altText,
        link,
        position,
        orderIndex: newOrderIndex,
        isVisible: true,
      },
    });
  } catch (err) {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "BrandBanner" ("id", "brandId", "imageDesktop", "imageMobile", "title", "altText", "link", "position", "orderIndex", "isVisible")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);`,
      bannerId,
      brandId,
      imageDesktop,
      imageMobile,
      title,
      altText,
      link,
      position,
      newOrderIndex,
      true
    );
  }

  // Revalidation
  try {
    const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { name: true } });
    revalidatePath("/admin/marques");
    revalidatePath(`/admin/marques/${brandId}`);
    if (brand?.name) {
      revalidatePath(`/marques/${encodeURIComponent(brand.name)}`);
      revalidatePath(`/marques/${brand.name}`);
    }
    revalidatePath("/");
  } catch (e) {}

  return { success: true };
}

export async function toggleBrandBannerVisibility(id: string, brandId: string, isVisible: boolean) {
  await ensureBrandBannerTable();
  const nextVal = !isVisible;

  try {
    await prisma.brandBanner.update({
      where: { id },
      data: { isVisible: nextVal },
    });
  } catch (err) {
    await prisma.$executeRawUnsafe(
      'UPDATE "BrandBanner" SET "isVisible" = $1 WHERE "id" = $2;',
      nextVal,
      id
    );
  }

  try {
    const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { name: true } });
    revalidatePath(`/admin/marques/${brandId}`);
    if (brand?.name) {
      revalidatePath(`/marques/${encodeURIComponent(brand.name)}`);
      revalidatePath(`/marques/${brand.name}`);
    }
  } catch (e) {}
}

export async function updateBrandBannerPosition(id: string, brandId: string, position: string) {
  await ensureBrandBannerTable();
  const pos = (position || "TOP").toUpperCase();

  try {
    await prisma.brandBanner.update({
      where: { id },
      data: { position: pos },
    });
  } catch (err) {
    await prisma.$executeRawUnsafe(
      'UPDATE "BrandBanner" SET "position" = $1 WHERE "id" = $2;',
      pos,
      id
    );
  }

  try {
    const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { name: true } });
    revalidatePath(`/admin/marques/${brandId}`);
    if (brand?.name) {
      revalidatePath(`/marques/${encodeURIComponent(brand.name)}`);
      revalidatePath(`/marques/${brand.name}`);
    }
  } catch (e) {}
}

export async function deleteBrandBanner(id: string, brandId: string) {
  await ensureBrandBannerTable();

  try {
    await prisma.brandBanner.delete({ where: { id } });
  } catch (err) {
    await prisma.$executeRawUnsafe('DELETE FROM "BrandBanner" WHERE "id" = $1;', id);
  }

  try {
    const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { name: true } });
    revalidatePath(`/admin/marques/${brandId}`);
    if (brand?.name) {
      revalidatePath(`/marques/${encodeURIComponent(brand.name)}`);
      revalidatePath(`/marques/${brand.name}`);
    }
  } catch (e) {}
}
