"use server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { notifyAdminNewComment } from "@/lib/n8n";

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

  // Notifier l'administrateur via n8n/Telegram dès qu'un commentaire est en attente de validation
  if (trimmedComment.length > 0) {
    try {
      const [model, user] = await Promise.all([
        prisma.model.findUnique({
          where: { id: modelId },
          include: { brand: { select: { name: true } } },
        }),
        prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, email: true },
        }),
      ]);

      const targetName = model ? `${model.brand?.name || ""} ${model.name}`.trim() : "Modèle";
      const authorName = user?.name || session.user.name || "Client";
      const authorEmail = user?.email || session.user.email || "";

      notifyAdminNewComment({
        authorName,
        authorEmail,
        targetType: "model",
        targetName,
        rating,
        comment: trimmedComment,
      }).catch((err) => console.error("Notification n8n error:", err));
    } catch (notifErr) {
      console.error("Failed to prepare comment notification:", notifErr);
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/compte", "page");
  revalidatePath("/marques", "layout");
  return { success: true };
}

export async function addBrandReview(brandId: string, rating: number, comment: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Vous devez être connecté pour laisser un avis." };

  if (rating < 0 || rating > 5) return { error: "La note doit être entre 0 et 5." };

  const trimmedComment = comment.trim();
  if (rating === 0 && !trimmedComment) {
    return { error: "Veuillez laisser une note ou un commentaire." };
  }

  const isApproved = trimmedComment.length === 0;

  await prisma.review.upsert({
    where: {
      userId_brandId: { userId: session.user.id, brandId }
    },
    update: {
      rating,
      comment: trimmedComment || null,
      isApproved
    },
    create: {
      userId: session.user.id,
      brandId,
      rating,
      comment: trimmedComment || null,
      isApproved
    }
  });

  // Notifier l'administrateur via n8n/Telegram dès qu'un commentaire est en attente de validation
  if (trimmedComment.length > 0) {
    try {
      const [brand, user] = await Promise.all([
        prisma.brand.findUnique({
          where: { id: brandId },
          select: { name: true },
        }),
        prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, email: true },
        }),
      ]);

      const targetName = brand ? `Marque ${brand.name}` : "Marque";
      const authorName = user?.name || session.user.name || "Client";
      const authorEmail = user?.email || session.user.email || "";

      notifyAdminNewComment({
        authorName,
        authorEmail,
        targetType: "brand",
        targetName,
        rating,
        comment: trimmedComment,
      }).catch((err) => console.error("Notification n8n error:", err));
    } catch (notifErr) {
      console.error("Failed to prepare brand comment notification:", notifErr);
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/commentaires");
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

