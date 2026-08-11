"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// Helper for admin check
async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Non autorisé. Seul un administrateur peut effectuer cette action.");
  }
}

export async function getUsers() {
  await checkAdmin();
  const users = await prisma.user.findMany({
    where: { role: { not: "ADMIN" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      modelsQuota: true,
      modelsCreatedCount: true,
      createdAt: true,
    }
  });
  return users;
}

export async function updateUser(id: string, data: { name?: string; email?: string; role?: "ADMIN" | "DEALER" | "CLIENT"; modelsQuota?: number; emailVerified?: boolean }) {
  await checkAdmin();

  // Handle email changes (check if exists)
  if (data.email) {
    data.email = data.email.toLowerCase().trim();
    const existing = await prisma.user.findFirst({
      where: { email: data.email, id: { not: id } }
    });
    if (existing) {
      return { error: "Cet email est déjà utilisé par un autre utilisateur." };
    }
  }

  const updateData: any = { ...data };
  
  if (data.emailVerified !== undefined) {
    if (data.emailVerified) {
      updateData.emailVerified = new Date();
    } else {
      updateData.emailVerified = null;
    }
  }

  await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return { success: true };
}

export async function resetUserPassword(id: string, newPassword?: string) {
  await checkAdmin();

  let passwordToSet = newPassword;
  let isGenerated = false;

  if (!passwordToSet) {
    // Generate a secure random password if not provided
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    passwordToSet = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    isGenerated = true;
  }

  if (passwordToSet.length < 8) {
    return { error: "Le mot de passe doit faire au moins 8 caractères." };
  }

  const hashed = await bcrypt.hash(passwordToSet, 12);

  await prisma.user.update({
    where: { id },
    data: { password: hashed },
  });

  return { success: true, newPassword: passwordToSet, isGenerated };
}

export async function deleteUser(id: string) {
  await checkAdmin();
  
  // To avoid self-deletion
  const session = await auth();
  if (session?.user?.id === id) {
    return { error: "Vous ne pouvez pas supprimer votre propre compte." };
  }

  await prisma.user.delete({
    where: { id },
  });

  return { success: true };
}
