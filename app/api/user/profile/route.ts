import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

const PROFILE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  hasWhatsapp: true,
  city: true,
  profilePromptDismissed: true,
} as const;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ authenticated: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: PROFILE_SELECT,
    });

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ authenticated: true, user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
    }

    // L'adresse email, le rôle et le mot de passe ne sont jamais modifiables via cet endpoint
    const updateData: {
      name?: string | null;
      phone?: string | null;
      hasWhatsapp?: boolean;
      city?: string | null;
      profilePromptDismissed?: boolean;
    } = {};

    if (typeof body.name === "string") {
      const trimmedName = body.name.trim().slice(0, 100);
      updateData.name = trimmedName || null;
    }

    if (body.phone !== undefined) {
      if (body.phone === null || String(body.phone).trim() === "") {
        updateData.phone = null;
        updateData.hasWhatsapp = false;
      } else {
        const cleanedPhone = String(body.phone).trim().slice(0, 25);
        const digitCount = cleanedPhone.replace(/\D/g, "").length;
        if (!/^[+\d\s().-]+$/.test(cleanedPhone) || digitCount < 6) {
          return NextResponse.json(
            { error: "Veuillez saisir un numéro de téléphone valide (au moins 6 chiffres)." },
            { status: 400 }
          );
        }
        updateData.phone = cleanedPhone;
      }
    }

    if (typeof body.hasWhatsapp === "boolean") {
      // Ne peut être activé que si un téléphone est conservé ou envoyé
      updateData.hasWhatsapp = updateData.phone === null ? false : body.hasWhatsapp;
    }

    if (body.city !== undefined) {
      updateData.city =
        typeof body.city === "string"
          ? body.city.trim().slice(0, 80) || null
          : null;
    }

    if (typeof body.profilePromptDismissed === "boolean") {
      updateData.profilePromptDismissed = body.profilePromptDismissed;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Aucune donnée à mettre à jour." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: PROFILE_SELECT,
    });

    return NextResponse.json({ ok: true, user: updatedUser });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ error: "Erreur lors de la mise à jour du profil." }, { status: 500 });
  }
}
