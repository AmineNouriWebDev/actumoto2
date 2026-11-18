import HeroCarousel from "@/components/home/HeroCarousel";
import BottomCarouselSection from "@/components/home/BottomCarouselSection";
import BrandsGrid from "@/components/home/BrandsGrid";
import NewModelsSection from "@/components/home/NewModelsSection";
// import CategoriesAndPrices from "@/components/home/CategoriesAndPrices";
import WelcomePopup from "@/components/home/WelcomePopup";
import prisma from "@/lib/prisma";

export default async function Home() {
  const [slides, brands, categories, banner, settings, nouveautesItems] = await Promise.all([
    prisma.carouselSlide.findMany({ where: { isVisible: true }, orderBy: { orderIndex: 'asc' } }).catch(() => []),
    prisma.brand.findMany({ where: { isVisible: true }, orderBy: { orderIndex: 'asc' } }).catch(() => []),
    prisma.category.findMany({ where: { isVisible: true }, orderBy: { orderIndex: 'asc' } }).catch(() => []),
    prisma.homepageBanner.findFirst({ where: { isVisible: true } }).catch(() => null),
    prisma.siteSettings.findFirst().catch(() => null),
    (prisma as any).nouveauteItem
      ? prisma.nouveauteItem
          .findMany({
            where: { isVisible: true },
            orderBy: { orderIndex: 'asc' },
          })
          .catch(() => [])
      : Promise.resolve([]),
  ]);

  let displayedNouveautes = nouveautesItems;
  if (displayedNouveautes.length === 0) {
    const fallbackModels = await prisma.model
      .findMany({
        where: { isVisible: true, isNew: true },
        include: {
          brand: true,
          category: true,
          images: { orderBy: { orderIndex: 'asc' } },
          specs: true,
        },
        orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
      })
      .catch(() => []);
    displayedNouveautes = fallbackModels.map((m, idx) => ({
      id: m.id,
      title: m.name,
      subtitle: m.brand.name,
      imageUrl: m.images[0]?.url || "/img/placeholder-moto.jpg",
      linkUrl: `/marques/${encodeURIComponent(m.brand.name)}/${encodeURIComponent(m.name)}`,
      price: m.price,
      promoPrice: m.promoPrice,
      currency: m.currency || "DT",
      orderIndex: idx,
      isVisible: true,
      modelId: m.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  const isCarouselTopVisible = (settings as any)?.carouselVisible !== false;
  const isCarouselBottomVisible = (settings as any)?.carouselBottomVisible === true;

  const topSlides = slides.filter(
    (s: any) => (s.position || "TOP") === "TOP" || s.position === "BOTH"
  );
  const bottomSlides = slides.filter(
    (s: any) => s.position === "BOTTOM" || s.position === "BOTH"
  );

  return (
    <>
      <WelcomePopup />
      
      {/* Flux d'accueil continu et harmonieux */}
      <main className="home-main-flow">
        {/* 1. SLIDER EN HAUT (SI ACTIVÉ DANS L'ADMINISTRATION) */}
        {isCarouselTopVisible && topSlides.length > 0 && (
          <HeroCarousel
            slides={topSlides}
            slideInterval={settings?.carouselDelayMs}
            variant="top"
            showScrollDown={true}
          />
        )}

        {/* SECTION SEO - CONTENU OPTIMISÉ (visually hidden for SEO) */}
        <section className="sr-only">
          <h1>Comparateur de Prix Motos & Scooters en Tunisie</h1>
          <h2>Motos Neuves au Meilleur Prix</h2>
          <p>
            Découvrez notre sélection complète de motos neuves en Tunisie.
            Comparez les prix des plus grandes marques : Peugeot, CFMOTO, Suzuki,
            Harley-Davidson et bien d'autres. Trouvez la moto de vos rêves au
            meilleur prix sur actumoto.tn.
          </p>
          <h2>Scooters Tunisie - Électriques & Thermiques</h2>
          <p>
            Explorez notre large gamme de scooters en Tunisie : scooters
            électriques écologiques, scooters thermiques économiques et scooters
            de luxe. Consultez les prix actualisés et comparez facilement pour
            trouver votre scooter idéal.
          </p>
          <p>
            <strong>actumoto.tn</strong> est votre
            <strong>comparateur de prix de motos et scooters N°1 en Tunisie</strong>. 
            Accédez à des prix actualisés, des fiches techniques détaillées et
            des coordonnées de concessionnaires officiels pour tous les modèles
            disponibles sur le marché tunisien.
          </p>
        </section>

        {/* 2. SECTION NOUVEAUTÉS */}
        <section className="home-nouveautes-section" aria-label="Nouveautés motos en Tunisie">
          <div className="home-nouveautes-wrapper">
            <NewModelsSection items={displayedNouveautes} />
          </div>
        </section>

        {/* 3. SECTION MARQUES : MUR INDUSTRIEL RÉPÉTÉ AVEC PLAQUES MÉTALLIQUES */}
        <section className="home-brands-section" aria-label="Marques motos en Tunisie">
          <BrandsGrid brands={brands} />
        </section>

        {/* 4. SECTION DU BAS : CARROUSEL BAS DÉFILANT SUR LE MÊME MUR INDUSTRIEL */}
        {isCarouselBottomVisible && bottomSlides.length > 0 && (
          <section 
            className="home-bottom-carousel-section" 
            aria-label="Carrousel inférieur"
          >
            <BottomCarouselSection
              slides={bottomSlides}
              slideInterval={settings?.carouselDelayMs}
            />
          </section>
        )}
      </main>
    </>
  );
}
