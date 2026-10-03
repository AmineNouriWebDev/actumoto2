"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function requestAdminOtp(formData: FormData) {
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Veuillez fournir un email et un mot de passe." };
  }

  // 1. Verify user exists and check role
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user || !user.password) {
    return { error: "Email ou mot de passe incorrect." };
  }

  if (user.role !== "ADMIN") {
    // We only require OTP for ADMIN. If they are not ADMIN, we can just tell the frontend to proceed without OTP.
    return { success: true, requireOtp: false };
  }

  // 2. Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return { error: "Email ou mot de passe incorrect." };
  }

  // 3. Generate 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const identifier = `admin-otp:${email}`;

  // 4. Clean up any existing OTP for this user
  await prisma.verificationToken.deleteMany({
    where: { identifier }
  });

  // 5. Save new OTP (expires in 10 minutes)
  const expiry = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.verificationToken.create({
    data: {
      identifier,
      token: otp,
      expires: expiry
    }
  });

  // 6. Send webhook to n8n
  try {
    const webhookUrl = "https://n8n.deposark.com/webhook/e86c68d1-7b6e-438c-8e6e-249256051df5";
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: user.name || email,
        code: otp,
        expiry: "10 minutes",
        ip: "Serveur (Actumoto)", 
      }),
    });
  } catch (err) {
    console.error("Failed to send 2FA webhook:", err);
    // Non-blocking error
  }

  return { success: true, requireOtp: true };
}
