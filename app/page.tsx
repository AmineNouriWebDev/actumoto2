import HeroCarousel from "@/components/home/HeroCarousel";
import BrandsGrid from "@/components/home/BrandsGrid";
import CategoriesAndPrices from "@/components/home/CategoriesAndPrices";
import WelcomePopup from "@/components/home/WelcomePopup";

export default function Home() {
  return (
    <>
      <WelcomePopup />
      
      {/* HERO SECTION */}
      <HeroCarousel />

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

      {/* Social Media Mobile */}
      <section className="py-4 lg:hidden" aria-label="Réseaux sociaux">
        <div className="container mx-auto px-4">
          <div className="social-bar" role="navigation" aria-label="Liens vers nos réseaux sociaux">
            <a href="https://www.facebook.com/profile.php?id=61584281323170" className="social-btn facebook" aria-label="Facebook (lien)" target="_blank" rel="noreferrer">
              <img src="/img/social/facebook.png" alt="Facebook actumoto.tn" />
            </a>
            <a href="https://www.instagram.com/marwen_actumoto/" className="social-btn instagram" aria-label="Instagram (lien)" target="_blank" rel="noreferrer">
              <img src="/img/social/instagram.png" alt="Instagram actumoto.tn" />
            </a>
            <a href="https://www.youtube.com/@ActumotoTn" className="social-btn youtube" aria-label="YouTube (lien)" target="_blank" rel="noreferrer">
              <img src="/img/social/youtube.png" alt="YouTube actumoto.tn" />
            </a>
            <a href="https://www.tiktok.com/@marwenactumoto" className="social-btn tiktok" aria-label="TikTok (lien)" target="_blank" rel="noreferrer">
              <img src="/img/social/tiktok.png" alt="TikTok actumoto.tn" />
            </a>
          </div>
        </div>
      </section>

      {/* Navigation Catégories / Prix */}
      <CategoriesAndPrices />

      {/* Section Marques */}
      <BrandsGrid />

      {/* SECTION ACCESSOIRES */}
      <section className="py-0 accessories-section-wrapper" aria-labelledby="accessoires-title">
        <div className="accessories-image-container">
          <img
            src="/img/banner3.webp"
            alt="Pièces et accessoires moto - SIMCC Motorsports"
            className="accessories-image"
          />
        </div>
      </section>
    </>
  );
}
