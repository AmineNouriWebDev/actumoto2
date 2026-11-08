import HeroCarousel from "@/components/home/HeroCarousel";
import BrandsGrid from "@/components/home/BrandsGrid";
import NewModelsSection from "@/components/home/NewModelsSection";
// import CategoriesAndPrices from "@/components/home/CategoriesAndPrices";
import WelcomePopup from "@/components/home/WelcomePopup";
import prisma from "@/lib/prisma";

export default async function Home() {
  const [slides, brands, categories, banner, settings, newModels] = await Promise.all([
    prisma.carouselSlide.findMany({ where: { isVisible: true }, orderBy: { orderIndex: 'asc' } }),
    prisma.brand.findMany({ where: { isVisible: true }, orderBy: { orderIndex: 'asc' } }),
    prisma.category.findMany({ where: { isVisible: true }, orderBy: { orderIndex: 'asc' } }),
    prisma.homepageBanner.findFirst({ where: { isVisible: true } }),
    prisma.siteSettings.findFirst(),
    prisma.model.findMany({
      where: { isVisible: true, isNew: true },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { orderIndex: 'asc' } },
        specs: true,
      },
      orderBy: [{ orderIndex: 'asc' }, { name: 'asc' }],
    }),
  ]);

  const formattedNewModels = newModels.map((m) => ({
    ...m,
    brand: m.brand.name,
    category: m.category?.name,
    images: m.images.map((img: any) => img.url),
  }));
  return (
    <>
      <WelcomePopup />
      
      {/* 1. SLIDER EN PREMIER */}
      <HeroCarousel slides={slides} slideInterval={settings?.carouselDelayMs} />

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
      <div className="home-nouveautes-wrapper">
        <NewModelsSection models={formattedNewModels} />
      </div>

      {/* 4. SECTION MARQUES */}
      <div className="home-brands-bottom-wrapper">
        <BrandsGrid brands={brands} />
      </div>

      {/* SECTION BANNIÈRE DYNAMIQUE */}
      {banner && (
        <section 
          className="accessories-section-wrapper bg-black" 
          aria-labelledby="accessoires-title"
          style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", width: "100%", overflow: "hidden" }}
        >
          <div className="accessories-image-container w-full" style={{ margin: 0, padding: 0, backgroundColor: "#000" }}>
            <picture style={{ display: "block", width: "100%", height: "100%", margin: 0, padding: 0 }}>
              <source media="(max-width: 767px)" srcSet={banner.imageMobile || banner.imageDesktop} />
              <img
                src={banner.imageDesktop}
                alt={banner.altText || 'Bannière actumoto'}
                className="accessories-image"
                style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", margin: 0, padding: 0 }}
              />
            </picture>
          </div>
        </section>
      )}
    </>
  );
}
