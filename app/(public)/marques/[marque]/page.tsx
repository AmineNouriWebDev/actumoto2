import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import ModelCard from "@/components/modeles/ModelCard";
import Link from "next/link";
import BrandContactsSection from "@/components/modeles/BrandContactsSection";
import BrandReviewSection from "@/components/modeles/BrandReviewSection";
import BrandBannerSection from "@/components/modeles/BrandBannerSection";
import ComparateurBar from "@/components/modeles/ComparateurBar";
import ComingSoonBanner from "@/components/modeles/ComingSoonBanner";

export async function generateMetadata({ params }: { params: Promise<{ marque: string }> }) {
  const { marque } = await params;
  const brandName = decodeURIComponent(marque);
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://actumoto.tn").replace(/\/$/, "");

  const brand = (await prisma.brand
    .findFirst({
      where: { name: { equals: brandName, mode: "insensitive" } },
      select: { name: true, logo: true, seoKeywords: true, seoTitle: true, seoDescription: true },
    })
    .catch(() => null)) as any;

  const actualName = brand?.name || brandName;
  const title = brand?.seoTitle?.trim() || `Modèles ${actualName} - actumoto.tn | Moto Tunisie`;
  const description =
    brand?.seoDescription?.trim() ||
    `Découvrez tous les modèles ${actualName} disponibles chez actumoto.tn. Prix, photos et caractéristiques des motos ${actualName} en Tunisie.`;
  const defaultKeywords = `${actualName} tunisie, moto ${actualName}, scooter ${actualName}, prix ${actualName} tunisie, fiche technique ${actualName}, actumoto.tn`;
  const keywords = brand?.seoKeywords?.trim()
    ? `${brand.seoKeywords.trim()}, ${defaultKeywords}`
    : defaultKeywords;
  const canonicalPath = `/marques/${encodeURIComponent(actualName)}`;
  const ogLogo = brand?.logo
    ? brand.logo.startsWith("./")
      ? brand.logo.substring(1)
      : brand.logo
    : "/img/og-preview2.png";

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: `${baseUrl}${canonicalPath}`,
      images: [{ url: ogLogo }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function MarquePage({ params }: { params: Promise<{ marque: string }> }) {
  const { marque } = await params;
  const brandName = decodeURIComponent(marque);
  const session = await auth();
  const currentUserId = session?.user?.id;

  const brand = await prisma.brand.findFirst({
    where: { name: { equals: brandName, mode: "insensitive" } },
    include: {
      models: {
        where: { isVisible: true },
        orderBy: { orderIndex: 'asc' },
        include: {
          specs: true,
          images: { orderBy: { orderIndex: 'asc' } },
          category: true,
          reviews: {
            where: currentUserId
              ? { OR: [{ isApproved: true }, { userId: currentUserId }] }
              : { isApproved: true },
            select: { rating: true, userId: true, isApproved: true },
          },
          ...(currentUserId
            ? {
                favorites: {
                  where: { userId: currentUserId },
                  select: { id: true },
                },
              }
            : {}),
        },
      },
    },
  });

  if (!brand) {
    notFound();
  }

  // Récupérer les bannières spécifiques à cette marque
  let brandBanners: any[] = [];
  try {
    brandBanners = await prisma.brandBanner.findMany({
      where: { brandId: brand.id, isVisible: true },
      orderBy: { orderIndex: "asc" },
    });
  } catch (err) {
    try {
      brandBanners = await prisma.$queryRawUnsafe<any[]>(
        'SELECT * FROM "BrandBanner" WHERE "brandId" = $1 AND "isVisible" = true ORDER BY "orderIndex" ASC;',
        brand.id
      );
    } catch (e) {
      brandBanners = [];
    }
  }

  const topBanners = brandBanners.filter(
    (b: any) => (b.position || "TOP") === "TOP" || b.position === "BOTH"
  );
  const bottomBanners = brandBanners.filter(
    (b: any) => b.position === "BOTTOM" || b.position === "BOTH"
  );

  const [approvedBrandReviews, existingUserBrandReview] = await Promise.all([
    prisma.review.findMany({
      where: { brandId: brand.id, isApproved: true },
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    currentUserId
      ? prisma.review.findUnique({
          where: { userId_brandId: { userId: currentUserId, brandId: brand.id } },
          select: { rating: true, comment: true },
        })
      : null,
  ]);

  // Map to match the structure expected by ModelCard
  const models = brand.models.map((m) => {
    const validRatings = m.reviews.filter((r) => r.isApproved && r.rating > 0);
    const totalRatings = validRatings.length;
    const averageRating =
      totalRatings > 0
        ? validRatings.reduce((acc, curr) => acc + curr.rating, 0) / totalRatings
        : 0;
    const userReview = currentUserId
      ? m.reviews.find((r) => r.userId === currentUserId)
      : null;
    const isFavorite = currentUserId
      ? Boolean((m as any).favorites && (m as any).favorites.length > 0)
      : false;

    return {
      ...m,
      images: m.images.map((img) => img.url),
      category: m.category?.name,
      userRating: userReview?.rating || 0,
      averageRating,
      totalRatings,
      isFavorite,
    };
  });

  const orderedModels = [...models];

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://actumoto.tn").replace(/\/$/, "");
  const brandUrl = `${baseUrl}/marques/${encodeURIComponent(brandName)}`;
  const validBrandRatings = approvedBrandReviews.filter((r) => r.rating > 0);
  const brandAvgRating =
    validBrandRatings.length > 0
      ? Number(
          (
            validBrandRatings.reduce((acc, r) => acc + r.rating, 0) /
            validBrandRatings.length
          ).toFixed(1)
        )
      : 0;

  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Modèles ${brandName} en Tunisie`,
    description:
      (brand as any).seoDescription ||
      `Catalogue des modèles de motos et scooters ${brandName} disponibles en Tunisie avec prix et fiches techniques.`,
    url: brandUrl,
    ...(validBrandRatings.length > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: brandAvgRating,
            reviewCount: validBrandRatings.length,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    mainEntity: {
      "@type": "ItemList",
      name: `Catalogue ${brandName}`,
      numberOfItems: orderedModels.length,
      itemListElement: orderedModels.map((m: any, idx: number) => {
        const effPrice = m.promoPrice || m.price;
        const firstImg = m.images?.[0]
          ? m.images[0].startsWith("./")
            ? `${baseUrl}${m.images[0].substring(1)}`
            : m.images[0].startsWith("/")
            ? `${baseUrl}${m.images[0]}`
            : m.images[0]
          : undefined;
        return {
          "@type": "ListItem",
          position: idx + 1,
          item: {
            "@type": "Product",
            name: `${brandName} ${m.name}`,
            brand: { "@type": "Brand", name: brandName },
            category: m.category || "Moto",
            ...(firstImg ? { image: firstImg } : {}),
            url: m.hasDetailPage
              ? `${brandUrl}/${encodeURIComponent(m.name)}`
              : brandUrl,
            ...(effPrice
              ? {
                  offers: {
                    "@type": "Offer",
                    priceCurrency: m.currency === "DT" || !m.currency ? "TND" : m.currency,
                    price: effPrice,
                    availability: "https://schema.org/InStock",
                    seller: { "@type": "Organization", name: "actumoto.tn" },
                  },
                }
              : {}),
          },
        };
      }),
    },
  };

  const brandBreadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: baseUrl },
      { "@type": "ListItem", position: 2, name: brandName, item: brandUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandBreadcrumbSchema) }}
      />
      {/* BANNIÈRE HAUT OU CARROUSEL (PLEINE LARGEUR) */}
      {topBanners.length > 0 && (
        <BrandBannerSection
          banners={topBanners}
          position="top"
          brandName={brandName}
        />
      )}

      {/* Flèche retour fixe entre la bannière et les cards de motos, avec marge top et bottom de 2px */}
      <div className="container mx-auto px-4 flex justify-end items-center my-[2px]">
        <Link
          href="/"
          className="section-back-btn-inline"
          title="Retour à l'accueil"
          aria-label="Retour à la page d'accueil"
        >
          ←
        </Link>
      </div>

      <section className="pt-[2px] pb-8 relative" role="main">
        <div className="container mx-auto px-4">
          {/* SEO hidden title */}
          <div className="sr-only">
            <h1>Catalogue de Motos et Scooters par Marque — {brandName}</h1>
            <p>
              Découvrez nos modèles de motos et scooters avec les meilleurs prix
              en Tunisie. Comparez les fiches techniques, prix et caractéristiques
              de chaque modèle.
            </p>
          </div>

          {/* Models grid — same ID as original */}
          {brand.comingSoon || orderedModels.length === 0 ? (
            <ComingSoonBanner />
          ) : (
            <div
              id="models-container"
              role="list"
              aria-label="Liste des modèles de motos"
            >
              {orderedModels.map((model: any, index: number) => (
                <ModelCard
                  key={model.id || index}
                  model={model}
                  brand={brandName}
                  index={index}
                  isLoggedIn={!!currentUserId}
                />
              ))}
            </div>
          )}

          {/* Brand contacts section (avec carte Google Maps interactive) */}
          <BrandContactsSection brand={brandName} />

          {/* Section Avis et Commentaires sur la marque */}
          <BrandReviewSection
            brandId={brand.id}
            brandName={brandName}
            isLoggedIn={!!currentUserId}
            existingReview={existingUserBrandReview}
            approvedReviews={approvedBrandReviews}
          />
        </div>
      </section>

      {/* BANNIÈRE BAS OU CARROUSEL (PLEINE LARGEUR, SOUS LES COMMENTAIRES) */}
      {bottomBanners.length > 0 && (
        <BrandBannerSection
          banners={bottomBanners}
          position="bottom"
          brandName={brandName}
        />
      )}

      {/* Floating comparator bar */}
      <ComparateurBar />
    </>
  );
}
