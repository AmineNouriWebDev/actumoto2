import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [models, brands] = await Promise.all([
    prisma.model.findMany({
      where: { isVisible: true },
      include: {
        brand: { select: { id: true, name: true, logo: true } },
        images: {
          orderBy: { orderIndex: 'asc' },
          select: { id: true, url: true, orderIndex: true },
        },
      },
      orderBy: [{ isNew: 'desc' }, { orderIndex: 'asc' }, { name: 'asc' }],
    }),
    prisma.brand.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return NextResponse.json({ models, brands });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const action = body.action || (typeof body.isNew === 'boolean' ? 'toggle_is_new' : null);

    if (action === 'toggle_is_new') {
      const { modelId, isNew } = body;
      if (!modelId || typeof isNew !== 'boolean') {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
      }

      await prisma.model.update({
        where: { id: modelId },
        data: { isNew },
      });

      revalidatePath('/');
      revalidatePath('/admin/nouveautes');
      return NextResponse.json({ ok: true });
    }

    if (action === 'set_cover_image') {
      const { modelId, imageId } = body;
      if (!modelId || !imageId) {
        return NextResponse.json({ error: 'modelId and imageId required' }, { status: 400 });
      }

      const images = await prisma.image.findMany({
        where: { modelId },
        orderBy: { orderIndex: 'asc' },
      });

      const selected = images.find((img) => img.id === imageId);
      if (!selected) {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
      }

      const others = images.filter((img) => img.id !== imageId);
      const updates = [
        prisma.image.update({ where: { id: imageId }, data: { orderIndex: 0 } }),
        ...others.map((img, idx) =>
          prisma.image.update({ where: { id: img.id }, data: { orderIndex: idx + 1 } })
        ),
      ];

      await prisma.$transaction(updates);

      const refreshedImages = await prisma.image.findMany({
        where: { modelId },
        orderBy: { orderIndex: 'asc' },
        select: { id: true, url: true, orderIndex: true },
      });

      revalidatePath('/');
      revalidatePath('/admin/nouveautes');
      return NextResponse.json({ ok: true, images: refreshedImages });
    }

    if (action === 'reorder') {
      const { items } = body; // Array of { id: string, orderIndex: number }
      if (!Array.isArray(items)) {
        return NextResponse.json({ error: 'Items array required' }, { status: 400 });
      }

      await prisma.$transaction(
        items.map((item) =>
          prisma.model.update({
            where: { id: item.id },
            data: { orderIndex: item.orderIndex },
          })
        )
      );

      revalidatePath('/');
      revalidatePath('/admin/nouveautes');
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('API /admin/nouveautes error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
