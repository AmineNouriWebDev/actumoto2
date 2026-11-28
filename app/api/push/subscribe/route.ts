import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint, keys, deviceType } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: "Données d'abonnement push invalides." },
        { status: 400 }
      );
    }

    const session = await auth().catch(() => null);
    const userId = session?.user?.id || null;
    const userAgent = req.headers.get("user-agent") || null;

    const detectedDevice =
      deviceType ||
      (userAgent && /mobile|android|iphone|ipad|ipod/i.test(userAgent)
        ? "mobile"
        : "desktop");

    await (prisma as any).pushSubscription.upsert({
      where: { endpoint },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
        deviceType: detectedDevice,
        ...(userId ? { userId } : {}),
      },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
        deviceType: detectedDevice,
        userId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("POST /api/push/subscribe error:", err);
    return NextResponse.json(
      { error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint } = body;
    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint manquant" }, { status: 400 });
    }

    await (prisma as any).pushSubscription.deleteMany({
      where: { endpoint },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE /api/push/subscribe error:", err);
    return NextResponse.json(
      { error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
