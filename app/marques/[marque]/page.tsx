import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ModelCard from "@/components/modeles/ModelCard";
import Link from "next/link";
import BrandContactsSection from "@/components/modeles/BrandContactsSection";
import ComparateurBar from "@/components/modeles/ComparateurBar";

export async function generateMetadata({ params }: { params: Promise<{ marque: string }> }) {
  const { marque } = await params;
  const brandName = decodeURIComponent(marque);
  return {
    title: `Modèles ${brandName} - actumoto.tn | Moto Tunisie`,
    description: `Découvrez tous les modèles ${brandName} disponibles chez actumoto.tn. Prix, photos et caractéristiques des motos ${brandName} en Tunisie.`,
  };
}

export async function generateStaticParams() {
  const brands = await prisma.brand.findMany({ select: { name: true } });
  return brands.map((b) => ({
    marque: encodeURIComponent(b.name),
  }));
}

export const revalidate = 3600;

export default async function MarquePage({ params }: { params: Promise<{ marque: string }> }) {
  const { marque } = await params;
  const brandName = decodeURIComponent(marque);
  
  const brand = await prisma.brand.findUnique({
    where: { name: brandName },
    include: {
      models: {
        include: { specs: true, images: { orderBy: { orderIndex: 'asc' } }, category: true }
      }
    }
  });

  if (!brand) {
    notFound();
  }

  // Map to match the structure expected by ModelCard
  const models = brand.models.map(m => ({
    ...m,
    images: m.images.map(img => img.url),
    category: m.category?.name
  }));

  // Original reverses the array before rendering
  const reversedModels = [...models].reverse();

  return (
    <>
      {/* Floating back button — exactly like original .section-back-btn */}
      <Link
        href="/"
        className="section-back-btn"
        title="Retour à l'accueil"
        aria-label="Retour à la page d'accueil"
      >
        ←
      </Link>

      <section className="pt-28 pb-8 relative" role="main">
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
          {reversedModels.length === 0 ? (
            <div className="flex items-center justify-center w-full min-h-[50vh] p-4">
              <img
                src="/img/banner3.webp"
                alt="Bientôt disponible"
                className="max-w-full h-auto rounded-lg shadow-lg"
                style={{ margin: "0 auto" }}
              />
            </div>
          ) : (
            <div
              id="models-container"
              role="list"
              aria-label="Liste des modèles de motos"
            >
              {reversedModels.map((model: any, index: number) => (
                <ModelCard key={index} model={model} brand={brandName} index={index} />
              ))}
            </div>
          )}

          {/* Brand contacts section */}
          <BrandContactsSection brand={brandName} />
        </div>
      </section>

      {/* Floating comparator bar */}
      <ComparateurBar />
    </>
  );
}
