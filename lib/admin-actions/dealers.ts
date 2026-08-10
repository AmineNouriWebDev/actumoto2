"use server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function createDealer(formData: FormData) {
  const email = (formData.get("email") as string || "").trim();
  const name = (formData.get("name") as string || "").trim();
  const password = formData.get("password") as string;
  const modelsQuota = parseInt(formData.get("modelsQuota") as string) || 0;
  
  const brandIds = formData.getAll("brandIds") as string[];

  if (!email || !password) return { error: "Email et mot de passe requis." };
  if (password.length < 8) return { error: "Le mot de passe doit avoir au moins 8 caractères." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Cet email est déjà utilisé." };

  const hashed = await bcrypt.hash(password, 12);
  
  await prisma.user.create({ 
    data: { 
      email, 
      name, 
      password: hashed, 
      role: "DEALER",
      modelsQuota,
      assignedBrands: {
        create: brandIds.map(brandId => ({ brandId }))
      }
    } 
  });
  
  revalidatePath("/admin/concessionnaires");
}

export async function updateDealer(id: string, formData: FormData) {
  const name = (formData.get("name") as string || "").trim();
  const modelsQuota = parseInt(formData.get("modelsQuota") as string) || 0;
  const brandIds = formData.getAll("brandIds") as string[];
  const password = formData.get("password") as string;

  const dataToUpdate: any = {
    name,
    modelsQuota,
  };

  if (password) {
    if (password.length < 8) return { error: "Min. 8 caractères pour le mot de passe." };
    dataToUpdate.password = await bcrypt.hash(password, 12);
  }

  // Transaction to update user and refresh assigned brands
  await prisma.$transaction([
    prisma.dealerBrand.deleteMany({ where: { userId: id } }),
    prisma.user.update({
      where: { id },
      data: {
        ...dataToUpdate,
        assignedBrands: {
          create: brandIds.map(brandId => ({ brandId }))
        }
      }
    })
  ]);

  revalidatePath("/admin/concessionnaires");
}

export async function deleteDealer(id: string) {
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/concessionnaires");
}
