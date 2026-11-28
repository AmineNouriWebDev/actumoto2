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
          showGoogleLogin: true,
          showFacebookLogin: true,
          pushPromptEnabled: true,
          ga4MeasurementId: 'G-WGY6N6E618',
          ga4Enabled: true,
          metaPixelId: '2443539866090948',
          metaPixelEnabled: false,
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
    if (typeof body.showGoogleLogin === 'boolean') {
      updateData.showGoogleLogin = body.showGoogleLogin;
    }
    if (typeof body.showFacebookLogin === 'boolean') {
      updateData.showFacebookLogin = body.showFacebookLogin;
    }
    if (typeof body.pushPromptEnabled === 'boolean') {
      updateData.pushPromptEnabled = body.pushPromptEnabled;
    }
    if (typeof body.ga4Enabled === 'boolean') {
      updateData.ga4Enabled = body.ga4Enabled;
    }
    if (typeof body.ga4MeasurementId === 'string') {
      updateData.ga4MeasurementId = body.ga4MeasurementId.trim();
    }
    if (typeof body.googleSiteVerification === 'string') {
      updateData.googleSiteVerification = body.googleSiteVerification.trim() || null;
    }
    if (typeof body.metaPixelEnabled === 'boolean') {
      updateData.metaPixelEnabled = body.metaPixelEnabled;
    }
    if (typeof body.metaPixelId === 'string') {
      updateData.metaPixelId = body.metaPixelId.trim() || null;
    }
    if (typeof body.seoSiteTitle === 'string') {
      updateData.seoSiteTitle = body.seoSiteTitle.trim() || null;
    }
    if (typeof body.seoSiteDescription === 'string') {
      updateData.seoSiteDescription = body.seoSiteDescription.trim() || null;
    }
    if (typeof body.seoKeywords === 'string') {
      updateData.seoKeywords = body.seoKeywords.trim() || null;
    }

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          carouselDelayMs: 4000,
          carouselVisible: true,
          carouselBottomVisible: false,
          useHomeNavEverywhere: true,
          hideFooterOnOtherPages: true,
          showGoogleLogin: true,
          showFacebookLogin: true,
          pushPromptEnabled: true,
          ga4MeasurementId: 'G-WGY6N6E618',
          ga4Enabled: true,
          metaPixelId: '2443539866090948',
          metaPixelEnabled: false,
          ...updateData,
        },
      });
    } else {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    }

    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/marques');
    revalidatePath('/modeles');
    revalidatePath('/occasion');
    revalidatePath('/comparateur');
    revalidatePath('/connexion');
    revalidatePath('/inscription');

    return NextResponse.json({ ok: true, settings });
  } catch (err: any) {
    console.error('API /admin/settings PATCH error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
