import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatSpecification } from "@/lib/formatters";
import DetailGallery from "@/components/modeles/DetailGallery";
import DetailActions from "@/components/modeles/DetailActions";
import DetailReviewSection from "@/components/modeles/DetailReviewSection";
import ComparateurBar from "@/components/modeles/ComparateurBar";
import type { Metadata } from "next";

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatPrice(price: number | null | undefined, currency: string) {
  if (price === null || price === undefined) return null;
  return price.toLocaleString("fr-FR").replace(/\s/g, ",") + " " + currency;
}

function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([^&\n?#]+)/;
  const match = url.match(regExp);
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1` : null;
}

// ─── Metadata dynamique (SEO) ────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ marque: string; modele: string }>;
}): Promise<Metadata> {
  const { marque, modele } = await params;
  const brandName = decodeURIComponent(marque);
  const modelName = decodeURIComponent(modele);

  const model = await prisma.model.findFirst({
    where: { name: modelName, brand: { name: brandName }, hasDetailPage: true },
    include: { specs: true, images: { orderBy: { orderIndex: "asc" }, take: 1 } },
  });

  if (!model) {
    return {
      title: `${modelName} - ${brandName} | actumoto.tn`,
      description: `Fiche technique et prix de la ${brandName} ${modelName} en Tunisie.`,
    };
  }

  const priceText = model.price
    ? `À partir de ${model.price.toLocaleString("fr-FR")} ${model.currency}`
    : "En arrivage";

  const mainImage = model.images[0]?.url;

  return {
    title: `${brandName} ${modelName} — Prix & Fiche Technique en Tunisie | actumoto.tn`,
    description: `${priceText} — Découvrez la ${brandName} ${modelName} en Tunisie : prix en ${model.currency}, fiche technique complète, photos et caractéristiques.`,
    openGraph: {
      title: `${brandName} ${modelName} — Prix & Fiche Technique`,
      description: `${priceText} — Fiche complète de la ${brandName} ${modelName}`,
      images: mainImage ? [{ url: mainImage, width: 1200, height: 630 }] : undefined,
      type: "website",
    },
    alternates: {
      canonical: `/marques/${encodeURIComponent(brandName)}/${encodeURIComponent(modelName)}`,
    },
  };
}

// ─── Static Params (SSG — pré-rendu à la compilation) ────────────────────────

export async function generateStaticParams() {
  const models = await prisma.model.findMany({
    where: { hasDetailPage: true, isVisible: true },
    include: { brand: true },
  });
  return models.map((m) => ({
    marque: encodeURIComponent(m.brand.name),
    modele: encodeURIComponent(m.name),
  }));
}

export const revalidate = 3600;

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ marque: string; modele: string }>;
}) {
  const { marque, modele } = await params;
  const brandName = decodeURIComponent(marque);
  const modelName = decodeURIComponent(modele);

  const model = await prisma.model.findFirst({
    where: { name: modelName, brand: { name: brandName }, hasDetailPage: true },
    include: {
      brand: true,
      category: true,
      specs: true,
      images: { orderBy: { orderIndex: "asc" } },
      colors: { orderBy: { orderIndex: "asc" } },
    },
  });

  if (!model) notFound();

  const images = model.images.map((img) => img.url);
  const fuelType = model.fuelType ?? "Thermique";
  const isElectric = fuelType === "Electrique";
  const priceFormatted = formatPrice(model.price, model.currency);
  const youtubeEmbed = getYouTubeEmbedUrl(model.youtubeUrl);
  const localVideoUrl = (model as any).videoUrl as string | null | undefined;

  // Specs list
  const specs = model.specs;
  const specRows: { label: string; value: string }[] = [];
  if (specs) {
    if (model.category?.name) specRows.push({ label: "Catégorie", value: model.category.name });
    specRows.push({ label: "Type moteur", value: formatSpecification("typeMoteur", specs.typeMoteur, fuelType) });
    specRows.push({ label: "Cylindrée", value: formatSpecification("cylindree", specs.cylindree, fuelType) });
    specRows.push({ label: "Puissance", value: formatSpecification("puissance", specs.puissance, fuelType) });
    specRows.push({ label: "Couple maximal", value: formatSpecification("coupleMaximal", specs.coupleMaximal, fuelType) });
    specRows.push({ label: "Refroidissement", value: formatSpecification("refroidissement", specs.refroidissement, fuelType) });
    specRows.push({ label: "Vitesse maximale", value: formatSpecification("vitesseMaximale", specs.vitesseMaximale, fuelType) });
    if (!isElectric && specs.tankCapacity) {
      specRows.push({ label: "Réservoir", value: formatSpecification("tankCapacity", specs.tankCapacity, fuelType) });
    }
    if (isElectric && specs.autonomie) {
      specRows.push({ label: "Autonomie", value: formatSpecification("autonomie", specs.autonomie, fuelType) });
    }
    specRows.push({ label: "Alimentation", value: formatSpecification("alimentation", specs.alimentation, fuelType) });
    let frein = formatSpecification("freinage", specs.freinage ?? "-", fuelType);
    if (specs.systemeFreinage) frein += ` — ${specs.systemeFreinage}`;
    specRows.push({ label: "Freinage", value: frein });
  }

  // JSON-LD structured data (Schema.org Vehicle/Product)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${brandName} ${modelName}`,
    brand: { "@type": "Brand", name: brandName },
    description: model.description ?? `${brandName} ${modelName} — Prix et fiche technique en Tunisie`,
    image: images[0] ?? undefined,
    offers: model.price
      ? {
          "@type": "Offer",
          priceCurrency: model.currency === "DT" ? "TND" : model.currency,
          price: model.price,
          availability: "https://schema.org/InStock",
          seller: { "@type": "Organization", name: "actumoto.tn" },
        }
      : undefined,
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header section */}
      <section className="pt-24 pb-4 md:pt-28 md:pb-6 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-[1200px]">
          {/* Breadcrumb */}
          <nav className="detail-breadcrumb mb-4" aria-label="Fil d'Ariane">
            <Link href="/">Accueil</Link>
            <span className="sep">›</span>
            <Link href={`/marques/${encodeURIComponent(brandName)}`}>{brandName}</Link>
            <span className="sep">›</span>
            <span className="current">{modelName}</span>
          </nav>

          {/* H1 pour le SEO */}
          <h1 className="sr-only">
            {brandName} {modelName} — Prix &amp; Fiche Technique en Tunisie
          </h1>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="py-6 md:py-10 bg-white" role="main">
        <div className="detail-page-layout">
          {/* Colonne gauche — Galerie */}
          <DetailGallery images={images} modelName={modelName} brandName={brandName} />

          {/* Colonne droite — Infos */}
          <div className="detail-info-panel">
            {/* Nom & badges */}
            <div className="detail-model-header">
              <div className="detail-brand-badge">{brandName}</div>
              <h2 className="detail-model-name">{modelName}</h2>
              <div className="detail-badges">
                {model.category?.name && (
                  <span className="detail-badge">🏍️ {model.category.name}</span>
                )}
                {isElectric ? (
                  <span className="detail-badge electric">⚡ Électrique</span>
                ) : (
                  <span className="detail-badge">⛽ {fuelType}</span>
                )}
              </div>
            </div>

            {/* Prix */}
            <div className="detail-price-block">
              <div className="detail-price-label">Prix conseillé</div>
              {priceFormatted ? (
                <div className="detail-price-value">
                  {model.price!.toLocaleString("fr-FR").replace(/\s/g, ",")}
                  <span>{model.currency}</span>
                </div>
              ) : (
                <div className="detail-price-en-arrivage">En arrivage</div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {/* Bouton retour */}
              <div className="detail-action-btns">
                <Link
                  href={`/marques/${encodeURIComponent(brandName)}`}
                  className="detail-btn-back"
                >
                  ← Retour aux modèles
                </Link>
              </div>

              {/* Couleurs disponibles */}
              {model.colors.length > 0 && (
                <div className="detail-card-section" style={{ padding: "1rem 1.5rem" }}>
                  <h3 className="detail-section-title">🎨 Couleurs disponibles</h3>
                  <div className="detail-colors-list">
                    {model.colors.map((color) => (
                      <div key={color.id} className="detail-color-item">
                        <div
                          className="detail-color-swatch"
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                        <span className="detail-color-name">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions (Comparer & Favoris) */}
              <DetailActions
                brandName={brandName}
                modelName={modelName}
                modelPrice={model.price}
                mainImage={model.images[0]?.url || ""}
              />
            </div>

          </div>
        </div>

        {/* Fiche technique — pleine largeur sous le layout 2 colonnes */}
        {specRows.length > 0 && (
          <div className="max-w-[1200px] mx-auto px-4 mt-6">
            <div className="detail-card-section">
              <h3 className="detail-section-title">⚙️ Fiche technique</h3>
              <table className="detail-specs-table">
                <tbody>
                  {specRows
                    .filter((r) => r.value && r.value !== "–" && r.value !== "-")
                    .map((row, i) => (
                      <tr key={i}>
                        <td>{row.label}</td>
                        <td>{row.value}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Description — HTML riche, après la fiche technique */}
        {model.description && (
          <div className="max-w-[1200px] mx-auto px-4 mt-6">
            <div className="detail-card-section">
              <h3 className="detail-section-title">📋 Description</h3>
              <div
                className="detail-rich-content"
                dangerouslySetInnerHTML={{ __html: model.description }}
              />
            </div>
          </div>
        )}

        {/* Vidéo — MP4 local en priorité, sinon YouTube */}
        {(localVideoUrl || youtubeEmbed) && (
          <div className="max-w-[1200px] mx-auto px-4 mt-6">
            <div className="detail-card-section">
              <h3 className="detail-section-title">▶️ Vidéo</h3>
              {localVideoUrl ? (
                <video
                  src={localVideoUrl}
                  controls
                  playsInline
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    maxHeight: "480px",
                    background: "#000",
                  }}
                >
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              ) : (
                <div className="detail-video-wrap">
                  <iframe
                    src={youtubeEmbed!}
                    title={`Vidéo ${brandName} ${modelName}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section Avis / Notation */}
        <DetailReviewSection />

        {/* Section commentaires — placeholder pour plus tard */}
        <div className="max-w-[1200px] mx-auto px-4 mt-6 mb-12">
          <div className="detail-card-section">
            <h3 className="detail-section-title">💬 Commentaires & Avis</h3>
            <p className="text-gray-500 text-sm italic">
              Connectez-vous pour laisser un avis sur ce modèle. Système de commentaires à venir.
            </p>
          </div>
        </div>

        <ComparateurBar />
      </section>
    </>
  );
}
