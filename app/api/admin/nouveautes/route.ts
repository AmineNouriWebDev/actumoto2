import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { uploadAndConvertToWebp, deletePhysicalImage } from '@/lib/upload';

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Auto-seed from existing models where isNew = true if NouveauteItem table is empty
    const count = await prisma.nouveauteItem.count();
    if (count === 0) {
      const existingNewModels = await prisma.model.findMany({
        where: { isVisible: true, isNew: true },
        include: {
          brand: { select: { id: true, name: true } },
          images: { orderBy: { orderIndex: 'asc' }, select: { url: true } },
        },
        orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
      });

      if (existingNewModels.length > 0) {
        for (let i = 0; i < existingNewModels.length; i++) {
          const m = existingNewModels[i];
          const brandName = m.brand?.name || '';
          const autoUrl = brandName
            ? `/marques/${encodeURIComponent(brandName)}/${encodeURIComponent(m.name)}`
            : null;

          await prisma.nouveauteItem.create({
            data: {
              title: m.name,
              subtitle: brandName || null,
              imageUrl: m.images[0]?.url || '/img/placeholder-moto.jpg',
              linkUrl: autoUrl,
              price: m.price,
              promoPrice: m.promoPrice,
              currency: m.currency || 'DT',
              orderIndex: i,
              modelId: m.id,
              isVisible: true,
            },
          });
        }
      }
    }

    // 2. Fetch all active NouveauteItem records
    const rawItems = await prisma.nouveauteItem.findMany({
      orderBy: { orderIndex: 'asc' },
    });

    // 3. For items linked to a catalog model, fetch that model's images & brand
    const linkedModelIds = rawItems
      .map((item) => item.modelId)
      .filter(Boolean) as string[];

    const linkedModels = linkedModelIds.length > 0
      ? await prisma.model.findMany({
          where: { id: { in: linkedModelIds } },
          include: {
            brand: { select: { id: true, name: true } },
            images: {
              orderBy: { orderIndex: 'asc' },
              select: { id: true, url: true, orderIndex: true },
            },
          },
        })
      : [];

    const linkedModelMap = new Map(linkedModels.map((m) => [m.id, m]));

    const items = rawItems.map((item) => {
      const lm = item.modelId ? linkedModelMap.get(item.modelId) : null;
      const autoUrl = lm?.brand?.name && item.title
        ? `/marques/${encodeURIComponent(lm.brand.name)}/${encodeURIComponent(item.title)}`
        : null;

      return {
        ...item,
        linkedModelImages: lm?.images || [],
        defaultModelUrl: autoUrl,
        brandName: lm?.brand?.name || item.subtitle || '',
      };
    });

    // 4. Fetch all catalog models & brands for the "+ Ajouter un modèle du catalogue" section
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
        orderBy: [{ brand: { name: 'asc' } }, { name: 'asc' }],
      }),
      prisma.brand.findMany({
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({ items, models, brands });
  } catch (err: any) {
    console.error('API /admin/nouveautes GET error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// POST : Uploader une image spécialement pour la section Nouveautés
export async function POST(req: Request) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = formData.get('title')?.toString().trim() || 'Nouveauté';
    const subtitle = formData.get('subtitle')?.toString().trim() || null;
    let linkUrl = formData.get('linkUrl')?.toString().trim() || null;
    if (linkUrl === '') linkUrl = null;

    const priceRaw = formData.get('price')?.toString();
    const promoPriceRaw = formData.get('promoPrice')?.toString();
    const currency = formData.get('currency')?.toString().trim() || 'DT';

    const price = priceRaw && !isNaN(parseFloat(priceRaw)) ? parseFloat(priceRaw) : null;
    const promoPrice = promoPriceRaw && !isNaN(parseFloat(promoPriceRaw)) ? parseFloat(promoPriceRaw) : null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'Une image est obligatoire.' }, { status: 400 });
    }

    const uploadedUrl = await uploadAndConvertToWebp(file, 'nouveautes');
    if (!uploadedUrl) {
      return NextResponse.json({ error: "Erreur lors de l'enregistrement de l'image." }, { status: 500 });
    }

    const maxOrder = await prisma.nouveauteItem.aggregate({ _max: { orderIndex: true } });
    const nextOrder = (maxOrder._max.orderIndex ?? -1) + 1;

    const newItem = await prisma.nouveauteItem.create({
      data: {
        title,
        subtitle,
        imageUrl: uploadedUrl,
        linkUrl,
        price,
        promoPrice,
        currency,
        orderIndex: nextOrder,
        isVisible: true,
      },
    });

    revalidatePath('/');
    revalidatePath('/admin/nouveautes');

    return NextResponse.json({ ok: true, item: newItem });
  } catch (err: any) {
    console.error('API /admin/nouveautes POST error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// PATCH : Actions sur les nouveautés
export async function PATCH(req: Request) {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const action = body.action;

    // 1. Ajouter un modèle existant du catalogue aux nouveautés
    if (action === 'add_model') {
      const { modelId } = body;
      if (!modelId) {
        return NextResponse.json({ error: 'modelId is required' }, { status: 400 });
      }

      // Vérifier s'il n'est pas déjà dans les nouveautés
      const existing = await prisma.nouveauteItem.findFirst({
        where: { modelId },
      });
      if (existing) {
        return NextResponse.json({ error: 'Ce modèle est déjà dans les nouveautés' }, { status: 400 });
      }

      const model = await prisma.model.findUnique({
        where: { id: modelId },
        include: {
          brand: { select: { id: true, name: true } },
          images: { orderBy: { orderIndex: 'asc' }, select: { url: true } },
        },
      });

      if (!model) {
        return NextResponse.json({ error: 'Modèle introuvable' }, { status: 404 });
      }

      const maxOrder = await prisma.nouveauteItem.aggregate({ _max: { orderIndex: true } });
      const nextOrder = (maxOrder._max.orderIndex ?? -1) + 1;

      // URL automatique pré-remplie
      const autoUrl = model.brand?.name
        ? `/marques/${encodeURIComponent(model.brand.name)}/${encodeURIComponent(model.name)}`
        : null;

      const createdItem = await prisma.nouveauteItem.create({
        data: {
          title: model.name,
          subtitle: model.brand?.name || null,
          imageUrl: model.images[0]?.url || '/img/placeholder-moto.jpg',
          linkUrl: autoUrl,
          price: model.price,
          promoPrice: model.promoPrice,
          currency: model.currency || 'DT',
          orderIndex: nextOrder,
          modelId: model.id,
          isVisible: true,
        },
      });

      // Synchroniser isNew sur le modèle
      await prisma.model.update({
        where: { id: modelId },
        data: { isNew: true },
      });

      revalidatePath('/');
      revalidatePath('/admin/nouveautes');
      return NextResponse.json({ ok: true, item: createdItem });
    }

    // 2. Mettre à jour les informations d'un élément (URL, titre, prix, visibilité)
    if (action === 'update_item') {
      const { itemId, linkUrl, title, subtitle, price, promoPrice, isVisible } = body;
      if (!itemId) {
        return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
      }

      const updateData: any = {};
      if (linkUrl !== undefined) {
        // Si vide ou blanc -> null (non cliquable)
        updateData.linkUrl = typeof linkUrl === 'string' && linkUrl.trim() !== '' ? linkUrl.trim() : null;
      }
      if (title !== undefined) updateData.title = title.trim();
      if (subtitle !== undefined) updateData.subtitle = subtitle.trim() || null;
      if (price !== undefined) updateData.price = typeof price === 'number' ? price : null;
      if (promoPrice !== undefined) updateData.promoPrice = typeof promoPrice === 'number' ? promoPrice : null;
      if (typeof isVisible === 'boolean') updateData.isVisible = isVisible;

      const updated = await prisma.nouveauteItem.update({
        where: { id: itemId },
        data: updateData,
      });

      revalidatePath('/');
      revalidatePath('/admin/nouveautes');
      return NextResponse.json({ ok: true, item: updated });
    }

    // 3. Définir l'image choisie pour cet élément
    if (action === 'set_item_image') {
      const { itemId, imageUrl } = body;
      if (!itemId || !imageUrl) {
        return NextResponse.json({ error: 'itemId and imageUrl required' }, { status: 400 });
      }

      const updated = await prisma.nouveauteItem.update({
        where: { id: itemId },
        data: { imageUrl },
      });

      revalidatePath('/');
      revalidatePath('/admin/nouveautes');
      return NextResponse.json({ ok: true, item: updated });
    }

    // 4. Réorganiser l'ordre d'affichage
    if (action === 'reorder') {
      const { items } = body; // Array of { id: string, orderIndex: number }
      if (!Array.isArray(items)) {
        return NextResponse.json({ error: 'Items array required' }, { status: 400 });
      }

      await prisma.$transaction(
        items.map((item) =>
          prisma.nouveauteItem.update({
            where: { id: item.id },
            data: { orderIndex: item.orderIndex },
          })
        )
      );

      revalidatePath('/');
      revalidatePath('/admin/nouveautes');
      return NextResponse.json({ ok: true });
    }

    // 5. Supprimer / Retirer une nouveauté
    if (action === 'delete_item') {
      const { itemId } = body;
      if (!itemId) {
        return NextResponse.json({ error: 'itemId required' }, { status: 400 });
      }

      const item = await prisma.nouveauteItem.findUnique({
        where: { id: itemId },
      });

      if (!item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      // Si c'était un modèle du catalogue, décocher isNew
      if (item.modelId) {
        await prisma.model.update({
          where: { id: item.modelId },
          data: { isNew: false },
        });
      } else if (item.imageUrl && item.imageUrl.startsWith('/img/nouveautes/')) {
        // Si c'était une image custom uploadée, supprimer le fichier physique
        await deletePhysicalImage(item.imageUrl);
      }

      await prisma.nouveauteItem.delete({
        where: { id: itemId },
      });

      revalidatePath('/');
      revalidatePath('/admin/nouveautes');
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('API /admin/nouveautes PATCH error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
