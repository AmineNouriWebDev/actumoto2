"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadAndConvertToWebp, deletePhysicalImage } from "@/lib/upload";

export async function toggleSlideVisibility(id: string, isVisible: boolean) {
  await prisma.carouselSlide.update({ where: { id }, data: { isVisible: !isVisible } });
  revalidatePath("/admin/carrousel");
  revalidatePath("/");
}

export async function deleteSlide(id: string) {
  await prisma.carouselSlide.delete({ where: { id } });
  revalidatePath("/admin/carrousel");
  revalidatePath("/");
}

export async function createSlide(formData: FormData) {
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "CarouselSlide" ADD COLUMN IF NOT EXISTS "position" TEXT NOT NULL DEFAULT \'TOP\';'
    );
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "CarouselSlide" ADD COLUMN IF NOT EXISTS "badgeText" TEXT;'
    );
  } catch (e) {}

  const desktopFile = formData.get("imageDesktopFile") as File;
  const mobileFile = formData.get("imageMobileFile") as File | null;
  const title = (formData.get("title") as string || "").trim() || null;
  const alt = (formData.get("alt") as string || "").trim() || null;
  const link = (formData.get("link") as string || "").trim() || null;
  const badgeText = (formData.get("badgeText") as string || "").trim() || null;
  const position = ((formData.get("position") as string) || "TOP").toUpperCase();

  if (!desktopFile || desktopFile.size === 0) return { error: "Image desktop requise." };

  const imageDesktop = await uploadAndConvertToWebp(desktopFile, "carousel");
  if (!imageDesktop) return { error: "Erreur upload desktop" };
  
  let imageMobile = null;
  if (mobileFile && mobileFile.size > 0) {
    imageMobile = await uploadAndConvertToWebp(mobileFile, "carousel");
  }

  // Get max order
  const maxOrder = await prisma.carouselSlide.findFirst({
    orderBy: { orderIndex: 'desc' },
    select: { orderIndex: true }
  });
  const newOrderIndex = maxOrder ? maxOrder.orderIndex + 1 : 0;

  try {
    await prisma.carouselSlide.create({
      data: {
        imageDesktop,
        imageMobile,
        title,
        alt,
        link,
        orderIndex: newOrderIndex,
        isVisible: true,
        position: position as any,
        badgeText,
      },
    });
  } catch (err: any) {
    // Fallback robuste par SQL direct si le client Prisma en mémoire n'a pas encore rechargé le schéma
    const id = crypto.randomUUID();
    await prisma.$executeRawUnsafe(
      'INSERT INTO "CarouselSlide" ("id", "imageDesktop", "imageMobile", "title", "alt", "link", "orderIndex", "isVisible", "position", "badgeText") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);',
      id,
      imageDesktop,
      imageMobile,
      title,
      alt,
      link,
      newOrderIndex,
      true,
      position,
      badgeText
    );
  }
  revalidatePath("/admin/carrousel");
  revalidatePath("/");
}

export async function updateSlide(id: string, formData: FormData) {
  const imageDesktop = formData.get("imageDesktop") as string;
  const imageMobile = (formData.get("imageMobile") as string || "").trim() || null;
  const title = (formData.get("title") as string || "").trim() || null;
  const alt = (formData.get("alt") as string || "").trim() || null;
  const link = (formData.get("link") as string || "").trim() || null;
  const badgeText = (formData.get("badgeText") as string || "").trim() || null;
  const orderIndex = parseInt(formData.get("orderIndex") as string || "0");
  const position = ((formData.get("position") as string) || "TOP").toUpperCase();

  try {
    await prisma.carouselSlide.update({
      where: { id },
      data: {
        imageDesktop: imageDesktop.trim(),
        imageMobile,
        title,
        alt,
        link,
        orderIndex,
        position: position as any,
        badgeText,
      },
    });
  } catch (err: any) {
    await prisma.$executeRawUnsafe(
      'UPDATE "CarouselSlide" SET "imageDesktop" = $1, "imageMobile" = $2, "title" = $3, "alt" = $4, "link" = $5, "orderIndex" = $6, "position" = $7, "badgeText" = $8 WHERE "id" = $9;',
      imageDesktop.trim(),
      imageMobile,
      title,
      alt,
      link,
      orderIndex,
      position,
      badgeText,
      id
    );
  }
  revalidatePath("/admin/carrousel");
  revalidatePath("/");
}

export async function updateSlideBadge(id: string, badgeText: string | null) {
  const text = (badgeText || "").trim() || null;
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "CarouselSlide" ADD COLUMN IF NOT EXISTS "badgeText" TEXT;'
    );
  } catch (e) {}

  try {
    await prisma.carouselSlide.update({
      where: { id },
      data: { badgeText: text },
    });
  } catch (err: any) {
    await prisma.$executeRawUnsafe(
      'UPDATE "CarouselSlide" SET "badgeText" = $1 WHERE "id" = $2;',
      text,
      id
    );
  }
  revalidatePath("/admin/carrousel");
  revalidatePath("/");
}

export async function updateSlideDetails(
  id: string,
  data: {
    title?: string | null;
    alt?: string | null;
    link?: string | null;
    badgeText?: string | null;
    position?: string;
  }
) {
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "CarouselSlide" ADD COLUMN IF NOT EXISTS "badgeText" TEXT;'
    );
  } catch (e) {}

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title ? data.title.trim() : null;
  if (data.alt !== undefined) updateData.alt = data.alt ? data.alt.trim() : null;
  if (data.link !== undefined) updateData.link = data.link ? data.link.trim() : null;
  if (data.badgeText !== undefined) updateData.badgeText = data.badgeText ? data.badgeText.trim() : null;
  if (data.position !== undefined) updateData.position = data.position.toUpperCase();

  try {
    await prisma.carouselSlide.update({
      where: { id },
      data: updateData,
    });
  } catch (err: any) {
    const fields = Object.keys(updateData);
    if (fields.length > 0) {
      const setClause = fields.map((f, i) => `"${f}" = $${i + 1}`).join(", ");
      const values = fields.map((f) => updateData[f]);
      values.push(id);
      await prisma.$executeRawUnsafe(
        `UPDATE "CarouselSlide" SET ${setClause} WHERE "id" = $${values.length};`,
        ...values
      );
    }
  }
  revalidatePath("/admin/carrousel");
  revalidatePath("/");
}

export async function updateSlidePosition(id: string, position: string) {
  const pos = (position || "TOP").toUpperCase();
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "CarouselSlide" ADD COLUMN IF NOT EXISTS "position" TEXT NOT NULL DEFAULT \'TOP\';'
    );
  } catch (e) {}

  try {
    await prisma.$executeRawUnsafe(
      'UPDATE "CarouselSlide" SET "position" = $1 WHERE "id" = $2;',
      pos,
      id
    );
  } catch (e) {
    await (prisma.carouselSlide as any).update({
      where: { id },
      data: { position: pos },
    });
  }
  revalidatePath("/admin/carrousel");
  revalidatePath("/");
}

export async function updateSlideOrder(slides: { id: string; orderIndex: number }[]) {
  for (const s of slides) {
    await prisma.carouselSlide.update({ where: { id: s.id }, data: { orderIndex: s.orderIndex } });
  }
  revalidatePath("/admin/carrousel");
  revalidatePath("/");
}

export async function updateCarouselDelay(delayMs: number) {
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "carouselVisible" BOOLEAN NOT NULL DEFAULT true;'
    );
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "carouselBottomVisible" BOOLEAN NOT NULL DEFAULT false;'
    );
  } catch (e) {}

  const settings = await prisma.siteSettings.findFirst();
  if (settings) {
    await prisma.siteSettings.update({ where: { id: settings.id }, data: { carouselDelayMs: delayMs } });
  } else {
    await prisma.siteSettings.create({ data: { carouselDelayMs: delayMs, carouselVisible: true, carouselBottomVisible: false } });
  }
  revalidatePath("/admin/carrousel");
  revalidatePath("/");
}

export async function toggleCarouselVisibility(visible: boolean) {
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "carouselVisible" BOOLEAN NOT NULL DEFAULT true;'
    );
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "carouselBottomVisible" BOOLEAN NOT NULL DEFAULT false;'
    );
  } catch (e) {}

  try {
    const updatedCount = await prisma.$executeRawUnsafe(
      'UPDATE "SiteSettings" SET "carouselVisible" = $1;',
      visible
    );
    if (updatedCount === 0) {
      await prisma.$executeRawUnsafe(
        'INSERT INTO "SiteSettings" ("id", "carouselDelayMs", "carouselVisible", "carouselBottomVisible") VALUES ($1, $2, $3, $4);',
        crypto.randomUUID(), 4000, visible, false
      );
    }
  } catch (e) {
    const settings = await prisma.siteSettings.findFirst();
    if (settings) {
      await (prisma.siteSettings as any).update({
        where: { id: settings.id },
        data: { carouselVisible: visible },
      });
    }
  }
  revalidatePath("/admin/carrousel");
  revalidatePath("/");
}

export async function toggleCarouselBottomVisibility(visible: boolean) {
  try {
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "carouselVisible" BOOLEAN NOT NULL DEFAULT true;'
    );
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "SiteSettings" ADD COLUMN IF NOT EXISTS "carouselBottomVisible" BOOLEAN NOT NULL DEFAULT false;'
    );
  } catch (e) {}

  try {
    const updatedCount = await prisma.$executeRawUnsafe(
      'UPDATE "SiteSettings" SET "carouselBottomVisible" = $1;',
      visible
    );
    if (updatedCount === 0) {
      await prisma.$executeRawUnsafe(
        'INSERT INTO "SiteSettings" ("id", "carouselDelayMs", "carouselVisible", "carouselBottomVisible") VALUES ($1, $2, $3, $4);',
        crypto.randomUUID(), 4000, true, visible
      );
    }
  } catch (e) {
    const settings = await prisma.siteSettings.findFirst();
    if (settings) {
      await (prisma.siteSettings as any).update({
        where: { id: settings.id },
        data: { carouselBottomVisible: visible },
      });
    }
  }
  revalidatePath("/admin/carrousel");
  revalidatePath("/");
}
