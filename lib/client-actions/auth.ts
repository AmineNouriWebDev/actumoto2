"use server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendN8nEmail } from "@/lib/n8n";
import crypto from "crypto";

export async function registerClient(formData: FormData) {
  const name = (formData.get("name") as string || "").trim();
  const email = (formData.get("email") as string || "").trim();
  const password = formData.get("password") as string;

  if (!name || !email || !password) return { error: "Tous les champs sont requis." };
  if (password.length < 8) return { error: "Le mot de passe doit avoir au moins 8 caractères." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Cet email est déjà utilisé." };

  const hashed = await bcrypt.hash(password, 12);
  
  const user = await prisma.user.create({ 
    data: { 
      name,
      email,
      password: hashed, 
      role: "CLIENT"
    } 
  });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  const verificationLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/verify?token=${token}&email=${encodeURIComponent(email)}`;
  
  sendN8nEmail({
    action: "verify_email",
    email: user.email,
    name: user.name || "",
    link: verificationLink
  });
  
  return { success: true };
}
