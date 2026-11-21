import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let settings = await prisma.siteSettings.findFirst();
    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          carouselDelayMs: 4000,
          carouselVisible: true,
          carouselBottomVisible: false,
          useHomeNavEverywhere: true,
          hideFooterOnOtherPages: true,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (err: any) {
    console.error('API /admin/settings GET error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    let settings = await prisma.siteSettings.findFirst();

    const updateData: any = {};
    if (typeof body.useHomeNavEverywhere === 'boolean') {
      updateData.useHomeNavEverywhere = body.useHomeNavEverywhere;
    }
    if (typeof body.hideFooterOnOtherPages === 'boolean') {
      updateData.hideFooterOnOtherPages = body.hideFooterOnOtherPages;
    }
    if (typeof body.carouselVisible === 'boolean') {
      updateData.carouselVisible = body.carouselVisible;
    }
    if (typeof body.carouselBottomVisible === 'boolean') {
      updateData.carouselBottomVisible = body.carouselBottomVisible;
    }
    if (typeof body.carouselDelayMs === 'number') {
      updateData.carouselDelayMs = body.carouselDelayMs;
    }

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          carouselDelayMs: 4000,
          carouselVisible: true,
          carouselBottomVisible: false,
          useHomeNavEverywhere: true,
          hideFooterOnOtherPages: true,
          ...updateData,
        },
      });
    } else {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    revalidatePath('/');
    revalidatePath('/marques');
    revalidatePath('/modeles');
    revalidatePath('/occasion');
    revalidatePath('/comparateur');

    return NextResponse.json({ ok: true, settings });
  } catch (err: any) {
    console.error('API /admin/settings PATCH error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
