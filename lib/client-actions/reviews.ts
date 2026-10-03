"use server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addReview(modelId: string, rating: number, comment: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Vous devez être connecté pour laisser un avis." };

  if (rating < 0 || rating > 5) return { error: "La note doit être entre 0 et 5." };

  const trimmedComment = comment.trim();
  const isApproved = trimmedComment.length === 0;

  await prisma.review.upsert({
    where: {
      userId_modelId: { userId: session.user.id, modelId }
    },
    update: {
      rating,
      comment: trimmedComment || null,
      isApproved
    },
    create: {
      userId: session.user.id,
      modelId,
      rating,
      comment: trimmedComment || null,
      isApproved
    }
  });

  revalidatePath("/compte");
  revalidatePath(`/marques`); // Will revalidate all public model pages potentially
  return { success: true };
}
