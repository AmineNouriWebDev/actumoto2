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

  revalidatePath("/", "layout");
  revalidatePath("/compte", "page");
  revalidatePath("/marques", "layout");
  return { success: true };
}

export async function rateModel(modelId: string, rating: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Vous devez être connecté pour noter cette moto." };

  if (rating < 1 || rating > 5) return { error: "La note doit être entre 1 et 5." };

  const existing = await prisma.review.findUnique({
    where: {
      userId_modelId: { userId: session.user.id, modelId }
    }
  });

  if (existing) {
    await prisma.review.update({
      where: { id: existing.id },
      data: {
        rating,
        // If there was no comment, make sure it remains approved; if there was a comment, preserve its status
        ...(existing.comment ? {} : { isApproved: true })
      }
    });
  } else {
    await prisma.review.create({
      data: {
        userId: session.user.id,
        modelId,
        rating,
        comment: null,
        isApproved: true
      }
    });
  }

  // Calculate fresh average and total ratings for this model
  const allApproved = await prisma.review.findMany({
    where: { modelId, isApproved: true, rating: { gt: 0 } },
    select: { rating: true },
  });
  const totalRatings = allApproved.length;
  const averageRating =
    totalRatings > 0
      ? allApproved.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

  revalidatePath("/", "layout");
  revalidatePath("/compte", "page");
  revalidatePath("/marques", "layout");
  return { success: true, rating, averageRating, totalRatings };
}

