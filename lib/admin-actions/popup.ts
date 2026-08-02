"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { uploadAndConvertToWebp } from "@/lib/upload";

export async function updatePopup(formData: FormData) {
  const isEnabled = formData.get("isEnabled") === "on";
  const durationSeconds = parseInt(formData.get("durationSeconds") as string || "4");
  const link = (formData.get("link") as string || "").trim() || null;
  const altText = (formData.get("altText") as string || "").trim() || null;

  // Retrieve existing to fallback if files aren't updated
  const existing = await prisma.welcomePopup.findFirst();

  let imageDesktop = (formData.get("imageDesktop") as string || "").trim() || (existing?.imageDesktop || null);
  let imageMobile = (formData.get("imageMobile") as string || "").trim() || (existing?.imageMobile || null);

  const desktopFile = formData.get("imageDesktopFile") as File | null;
  const mobileFile = formData.get("imageMobileFile") as File | null;

  if (desktopFile && desktopFile.size > 0) {
    const uploaded = await uploadAndConvertToWebp(desktopFile, "popup");
    if (uploaded) imageDesktop = uploaded;
  }
  
  if (mobileFile && mobileFile.size > 0) {
    const uploaded = await uploadAndConvertToWebp(mobileFile, "popup");
    if (uploaded) imageMobile = uploaded;
  }

  if (existing) {
    await prisma.welcomePopup.update({
      where: { id: existing.id },
      data: { isEnabled, durationSeconds, imageDesktop, imageMobile, link, altText },
    });
  } else {
    await prisma.welcomePopup.create({
      data: { isEnabled, durationSeconds, imageDesktop, imageMobile, link, altText },
    });
  }
  revalidatePath("/admin/popup");
  revalidatePath("/");
}

export async function updateBanner(formData: FormData) {
  const altText = (formData.get("altText") as string || "").trim() || null;
  const isVisible = formData.get("isVisible") === "on";

  const existing = await prisma.homepageBanner.findFirst();

  let imageDesktop = (formData.get("imageDesktop") as string || "").trim() || (existing?.imageDesktop || "");
  let imageMobile = (formData.get("imageMobile") as string || "").trim() || (existing?.imageMobile || null);

  const desktopFile = formData.get("imageDesktopFile") as File | null;
  const mobileFile = formData.get("imageMobileFile") as File | null;

  if (desktopFile && desktopFile.size > 0) {
    const uploaded = await uploadAndConvertToWebp(desktopFile, "banniere");
    if (uploaded) imageDesktop = uploaded;
  }
  
  if (mobileFile && mobileFile.size > 0) {
    const uploaded = await uploadAndConvertToWebp(mobileFile, "banniere");
    if (uploaded) imageMobile = uploaded;
  }

  if (existing) {
    await prisma.homepageBanner.update({
      where: { id: existing.id },
      data: { imageDesktop, imageMobile, altText, isVisible },
    });
  } else {
    await prisma.homepageBanner.create({ data: { imageDesktop, imageMobile, altText, isVisible } });
  }
  revalidatePath("/admin/banniere");
  revalidatePath("/");
}
