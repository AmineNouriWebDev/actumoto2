"use server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function approveReview(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Non autorisé" };

  await prisma.review.update({
    where: { id },
    data: { isApproved: true },
  });

  revalidatePath("/admin/commentaires");
  revalidatePath("/marques");
  return { success: true };
}

export async function deleteReview(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Non autorisé" };

  await prisma.review.delete({
    where: { id },
  });

  revalidatePath("/admin/commentaires");
  revalidatePath("/marques");
  return { success: true };
}
