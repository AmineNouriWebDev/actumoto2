import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { setVapidDetails, sendNotification } from "web-push";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const publicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || "";
  const privateKey = process.env.VAPID_PRIVATE_KEY || "";
  const subject = process.env.VAPID_SUBJECT || "mailto:contact@actumoto.tn";

  if (!publicKey || !privateKey) {
    return NextResponse.json(
      { error: "Les clés VAPID ne sont pas configurées sur le serveur." },
      { status: 500 }
    );
  }

  setVapidDetails(subject, publicKey, privateKey);

  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "ID de campagne manquant" }, { status: 400 });
    }

    const campaign = await (prisma as any).pushCampaign.findUnique({ where: { id } });
    if (!campaign) {
      return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
    }

    const subscriptions = await (prisma as any).pushSubscription.findMany();

    const payload = JSON.stringify({
      title: campaign.title,
      body: campaign.body,
      url: campaign.url || "/",
      image: campaign.imageUrl || undefined,
      icon: "/img/icon-192x192.png",
      badge: "/img/favicon-32x32.png",
      tag: `actumoto-${campaign.id}`,
    });

    let sentCount = 0;
    let failedCount = 0;
    const staleIds: string[] = [];

    // Envoi en lots parallèles de 25 pour éviter de surcharger la RAM/réseau
    const batchSize = 25;
    for (let i = 0; i < subscriptions.length; i += batchSize) {
      const batch = subscriptions.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (sub: any) => {
          try {
            await sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.p256dh,
                  auth: sub.auth,
                },
              },
              payload
            );
            sentCount++;
          } catch (err: any) {
            failedCount++;
            // 410 Gone ou 404 Not Found -> abonnement révoqué/expiré, on nettoie
            if (err?.statusCode === 410 || err?.statusCode === 404) {
              staleIds.push(sub.id);
            }
          }
        })
      );
    }

    if (staleIds.length > 0) {
      await (prisma as any).pushSubscription.deleteMany({
        where: { id: { in: staleIds } },
      });
    }

    const updatedCampaign = await (prisma as any).pushCampaign.update({
      where: { id: campaign.id },
      data: {
        status: "SENT",
        sentCount,
        failedCount,
        sentAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      sentCount,
      failedCount,
      cleanedCount: staleIds.length,
      campaign: updatedCampaign,
    });
  } catch (err: any) {
    console.error("POST /api/admin/notifications/send error:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
