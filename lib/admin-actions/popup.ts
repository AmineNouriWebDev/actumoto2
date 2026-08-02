"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePopup(formData: FormData) {
  const isEnabled = formData.get("isEnabled") === "on";
  const durationSeconds = parseInt(formData.get("durationSeconds") as string || "4");
  const imageDesktop = (formData.get("imageDesktop") as string || "").trim() || null;
  const imageMobile = (formData.get("imageMobile") as string || "").trim() || null;
  const link = (formData.get("link") as string || "").trim() || null;
  const altText = (formData.get("altText") as string || "").trim() || null;

  const existing = await prisma.welcomePopup.findFirst();
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
  const imageDesktop = (formData.get("imageDesktop") as string || "").trim();
  const imageMobile = (formData.get("imageMobile") as string || "").trim() || null;
  const altText = (formData.get("altText") as string || "").trim() || null;
  const isVisible = formData.get("isVisible") === "on";

  const existing = await prisma.homepageBanner.findFirst();
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
