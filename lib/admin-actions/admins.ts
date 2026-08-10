"use server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createAdmin(formData: FormData) {
  const email = (formData.get("email") as string || "").trim();
  const name = (formData.get("name") as string || "").trim();
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Email et mot de passe requis." };
  if (password.length < 8) return { error: "Le mot de passe doit avoir au moins 8 caractères." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Cet email est déjà utilisé." };

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { email, name, password: hashed, role: "ADMIN" } });
  revalidatePath("/admin/admins");
}

export async function updateAdminPassword(id: string, formData: FormData) {
  const password = formData.get("password") as string;
  if (!password || password.length < 8) return { error: "Min. 8 caractères." };

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { id }, data: { password: hashed } });
  revalidatePath("/admin/admins");
}

export async function deleteAdmin(id: string) {
  const count = await prisma.user.count({ where: { role: "ADMIN" } });
  if (count <= 1) return { error: "Impossible de supprimer le dernier administrateur." };

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/admins");
}
