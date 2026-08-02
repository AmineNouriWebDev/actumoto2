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
  const desktopFile = formData.get("imageDesktopFile") as File;
  const mobileFile = formData.get("imageMobileFile") as File | null;
  const title = (formData.get("title") as string || "").trim() || null;
  const alt = (formData.get("alt") as string || "").trim() || null;
  const link = (formData.get("link") as string || "").trim() || null;

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

  await prisma.carouselSlide.create({
    data: { imageDesktop, imageMobile, title, alt, link, orderIndex: newOrderIndex, isVisible: true },
  });
  revalidatePath("/admin/carrousel");
  revalidatePath("/");
}

export async function updateSlide(id: string, formData: FormData) {
  const imageDesktop = formData.get("imageDesktop") as string;
  const imageMobile = (formData.get("imageMobile") as string || "").trim() || null;
  const title = (formData.get("title") as string || "").trim() || null;
  const alt = (formData.get("alt") as string || "").trim() || null;
  const link = (formData.get("link") as string || "").trim() || null;
  const orderIndex = parseInt(formData.get("orderIndex") as string || "0");

  await prisma.carouselSlide.update({
    where: { id },
    data: { imageDesktop: imageDesktop.trim(), imageMobile, title, alt, link, orderIndex },
  });
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
  const settings = await prisma.siteSettings.findFirst();
  if (settings) {
    await prisma.siteSettings.update({ where: { id: settings.id }, data: { carouselDelayMs: delayMs } });
  } else {
    await prisma.siteSettings.create({ data: { carouselDelayMs: delayMs } });
  }
  revalidatePath("/admin/carrousel");
  revalidatePath("/");
}
