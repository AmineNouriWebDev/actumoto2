"use server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(modelId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Vous devez être connecté." };

  const existing = await prisma.favorite.findUnique({
    where: { userId_modelId: { userId: session.user.id, modelId } }
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({
      data: { userId: session.user.id, modelId }
    });
  }

  revalidatePath("/compte");
  return { success: true, isFavorite: !existing };
}

export async function checkFavorite(modelId: string) {
  const session = await auth();
  if (!session?.user?.id) return false;

  const existing = await prisma.favorite.findUnique({
    where: { userId_modelId: { userId: session.user.id, modelId } }
  });

  return !!existing;
}
