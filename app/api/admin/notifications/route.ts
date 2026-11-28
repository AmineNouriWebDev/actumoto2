import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [totalSubscribers, mobileSubscribers, desktopSubscribers, campaigns, settings] =
      await Promise.all([
        (prisma as any).pushSubscription.count(),
        (prisma as any).pushSubscription.count({ where: { deviceType: "mobile" } }),
        (prisma as any).pushSubscription.count({ where: { deviceType: "desktop" } }),
        (prisma as any).pushCampaign.findMany({
          orderBy: { createdAt: "desc" },
        }),
        prisma.siteSettings.findFirst(),
      ]);

    return NextResponse.json({
      stats: {
        totalSubscribers,
        mobileSubscribers,
        desktopSubscribers,
      },
      pushPromptEnabled: (settings as any)?.pushPromptEnabled !== false,
      campaigns,
    });
  } catch (err: any) {
    console.error("GET /api/admin/notifications error:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, body: messageBody, url, imageUrl } = body;

    if (!title?.trim() || !messageBody?.trim()) {
      return NextResponse.json(
        { error: "Le titre et le message sont obligatoires." },
        { status: 400 }
      );
    }

    const campaign = await (prisma as any).pushCampaign.create({
      data: {
        title: title.trim(),
        body: messageBody.trim(),
        url: url?.trim() || "/",
        imageUrl: imageUrl?.trim() || null,
        status: "DRAFT",
      },
    });

    return NextResponse.json({ ok: true, campaign });
  } catch (err: any) {
    console.error("POST /api/admin/notifications error:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, action, title, body: messageBody, url, imageUrl } = body;

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    if (action === "duplicate") {
      const existing = await (prisma as any).pushCampaign.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: "Notification introuvable" }, { status: 404 });
      }
      const duplicated = await (prisma as any).pushCampaign.create({
        data: {
          title: existing.title,
          body: existing.body,
          url: existing.url,
          imageUrl: existing.imageUrl,
          status: "DRAFT",
        },
      });
      return NextResponse.json({ ok: true, campaign: duplicated });
    }

    if (!title?.trim() || !messageBody?.trim()) {
      return NextResponse.json(
        { error: "Le titre et le message sont obligatoires." },
        { status: 400 }
      );
    }

    const updated = await (prisma as any).pushCampaign.update({
      where: { id },
      data: {
        title: title.trim(),
        body: messageBody.trim(),
        url: url?.trim() || "/",
        imageUrl: imageUrl?.trim() || null,
      },
    });

    return NextResponse.json({ ok: true, campaign: updated });
  } catch (err: any) {
    console.error("PATCH /api/admin/notifications error:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    await (prisma as any).pushCampaign.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("DELETE /api/admin/notifications error:", err);
    return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
  }
}
