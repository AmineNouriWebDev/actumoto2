"use server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addReview(modelId: string, rating: number, comment: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Vous devez être connecté pour laisser un avis." };

  if (rating < 1 || rating > 5) return { error: "La note doit être entre 1 et 5." };

  await prisma.review.create({
    data: {
      userId: session.user.id,
      modelId,
      rating,
      comment: comment.trim() || null
    }
  });

  revalidatePath("/compte");
  revalidatePath(`/marques`); // Will revalidate all public model pages potentially
  return { success: true };
}
