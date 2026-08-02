import Link from "next/link";
import ComparateurBar from "@/components/modeles/ComparateurBar";

export const metadata = {
  title: "Bientôt disponible - actumoto.tn",
  description: "Cette marque ou ce modèle sera bientôt disponible sur actumoto.tn.",
};

export default function ComingSoonPage() {
  return (
    <>
      <Link
        href="/"
        className="section-back-btn"
        title="Retour à l'accueil"
        aria-label="Retour à la page d'accueil"
      >
        ←
      </Link>

      <section className="pt-28 pb-8 relative min-h-[70vh] flex flex-col items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">
            Bientôt Disponible
          </h1>
          <div className="flex items-center justify-center w-full p-4">
            <img
              src="/img/banner3.webp"
              alt="Bientôt disponible"
              className="max-w-full h-auto rounded-lg shadow-lg"
              style={{ margin: "0 auto", maxHeight: "400px", objectFit: "contain" }}
            />
          </div>
          <p className="mt-8 text-gray-600 text-lg">
            Cette marque arrive très prochainement sur notre comparateur. Restez à l'écoute !
          </p>
        </div>
      </section>

      <ComparateurBar />
    </>
  );
}
