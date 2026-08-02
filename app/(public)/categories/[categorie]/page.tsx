import { notFound } from "next/navigation";
import { Fragment } from "react";
import prisma from "@/lib/prisma";
import ModelCard from "@/components/modeles/ModelCard";
import Link from "next/link";
import ComparateurBar from "@/components/modeles/ComparateurBar";

const CATEGORIES = ["Sportive", "Trail", "Roadster", "Scooter", "Electrique", "Motocube", "Custom", "Motocross", "Mobylette"];

export async function generateMetadata({ params }: { params: Promise<{ categorie: string }> }) {
  const { categorie } = await params;
  const categoryName = decodeURIComponent(categorie);
  return {
    title: `${categoryName} en Tunisie - Prix et Modèles | actumoto.tn`,
    description: `Découvrez tous les modèles de la catégorie ${categoryName} disponibles en Tunisie. Prix, fiches techniques et comparateur.`,
  };
}

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({ select: { name: true } });
  return categories.map((c) => ({ categorie: encodeURIComponent(c.name) }));
}

export const revalidate = 3600;

export default async function CategoriePage({ params }: { params: Promise<{ categorie: string }> }) {
  const { categorie } = await params;
  const categoryName = decodeURIComponent(categorie);

  let modelsData: any[] = [];
  if (categoryName.toLowerCase() === "electrique") {
    modelsData = await prisma.model.findMany({
      where: { fuelType: { equals: "Electrique", mode: "insensitive" } },
      include: { brand: true, category: true, images: { orderBy: { orderIndex: "asc" } }, specs: true },
    });
  } else {
    modelsData = await prisma.model.findMany({
      where: { category: { name: { equals: categoryName, mode: "insensitive" } } },
      include: { brand: true, category: true, images: { orderBy: { orderIndex: "asc" } }, specs: true },
    });
  }

  // Collect models grouped by brand
  const groupedByBrand: Record<string, { models: any[]; brandOrder: number }> = {};
  const brands = await prisma.brand.findMany({ orderBy: { id: "asc" } });

  modelsData.forEach((model) => {
    const brandName = model.brand.name;
    if (!groupedByBrand[brandName]) {
      const brandOrder = brands.findIndex((b) => b.id === model.brandId);
      groupedByBrand[brandName] = {
        models: [],
        brandOrder: brandOrder === -1 ? 999 : brandOrder,
      };
    }
    groupedByBrand[brandName].models.push({
      ...model,
      images: model.images.map((img: any) => img.url),
      category: model.category?.name,
    });
  });

  const sortedBrands = Object.keys(groupedByBrand).sort(
    (a, b) => groupedByBrand[a].brandOrder - groupedByBrand[b].brandOrder
  );

  if (sortedBrands.length === 0) {
    notFound();
  }

  return (
    <>
      {/* Floating back button — exact .section-back-btn */}
      <Link href="/" className="section-back-btn" title="Retour à l'accueil" aria-label="Retour à la page d'accueil">
        ←
      </Link>

      <section className="pt-28 pb-8 relative" role="main">
        <div className="container mx-auto px-4">
          <div className="sr-only">
            <h1>Catalogue {categoryName} - Motos et Scooters en Tunisie</h1>
            <p>Découvrez tous les modèles de {categoryName.toLowerCase()} disponibles avec prix et caractéristiques.</p>
          </div>

          <div id="models-container" role="list" aria-label="Liste des modèles de motos">
            {sortedBrands.map((brandKey) => (
              <Fragment key={brandKey}>
                {/* Brand group header — same as original .brand-group-header */}
                <div key={`header-${brandKey}`} className="brand-group-header">
                  {brandKey}
                </div>
                {groupedByBrand[brandKey].models.map((model: any, index: number) => (
                  <ModelCard key={`${brandKey}-${model.id || index}`} model={model} brand={brandKey} index={index} />
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Comparator bar */}
      <ComparateurBar />
    </>
  );
}
