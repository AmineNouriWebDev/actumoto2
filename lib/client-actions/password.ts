"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendN8nEmail } from "@/lib/n8n";
import crypto from "crypto";

export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  
  if (!email) return { error: "Veuillez fournir une adresse email." };

  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    // Pour des raisons de sécurité, on renvoie "success" même si l'email n'existe pas
    return { success: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  
  await prisma.verificationToken.create({
    data: {
      identifier: `reset:${email}`,
      token,
      expires: new Date(Date.now() + 1000 * 60 * 60), // 1 heure
    }
  });

  const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reinitialiser-mot-de-passe?token=${token}&email=${encodeURIComponent(email)}`;
  
  await sendN8nEmail({
    action: "reset_password",
    email: user.email,
    name: user.name || "",
    link: resetLink
  });

  return { success: true };
}

export async function resetPassword(formData: FormData) {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  
  if (!email || !token || !password) return { error: "Données manquantes." };
  if (password.length < 8) return { error: "Le mot de passe doit faire au moins 8 caractères." };

  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      identifier: `reset:${email}`,
      token: token,
      expires: { gt: new Date() } // Vérifie que le token n'a pas expiré
    }
  });

  if (!verificationToken) {
    return { error: "Lien invalide ou expiré." };
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email },
    data: { password: hashed }
  });

  // On supprime le token pour qu'il ne soit plus réutilisable
  await prisma.verificationToken.delete({
    where: {
      identifier_token: {
        identifier: `reset:${email}`,
        token: token
      }
    }
  });

  return { success: true };
}
