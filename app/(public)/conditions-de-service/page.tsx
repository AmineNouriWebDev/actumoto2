import Link from "next/link";

export const metadata = {
  title: "Conditions Générales d'Utilisation - actumoto.tn",
  description: "Conditions de service et d'utilisation du portail comparateur actumoto.tn édité par Moto TN",
};

export default function ConditionsDeServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Bouton retour en flux direct */}
        <div className="flex justify-start mb-6">
          <Link
            href="/"
            className="section-back-btn-inline inline-flex items-center justify-center text-sm font-semibold"
            title="Retour à l'accueil"
            aria-label="Retour à l'accueil actumoto.tn"
          >
            ←
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10">
          <div className="border-b border-gray-200 pb-6 mb-8">
            <span className="text-xs font-bold tracking-widest text-red-600 uppercase">
              Cadre Contractuel
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-3">
              Conditions de Service & d'Utilisation
            </h1>
            <p className="text-sm text-gray-500">
              En vigueur à compter du 22 Novembre 2026 • Société Moto TN
            </p>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
            {/* 1. Mentions légales */}
            <section className="bg-gray-50 rounded-xl p-5 border border-gray-200/80">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                1. Informations légales & Éditeur de la plateforme
              </h2>
              <p className="mb-2">
                Le site web accessible à l'adresse <strong>actumoto.tn</strong> (ci-après désigné « la Plateforme ») est édité par :
              </p>
              <ul className="space-y-1 text-sm text-gray-800 font-medium">
                <li><strong>Société éditrice :</strong> Moto TN (متو تن)</li>
                <li><strong>Statut juridique :</strong> Société Unipersonnelle à Responsabilité Limitée (SUARL)</li>
                <li><strong>Matricule / Identifiant Unique (RNE) :</strong> 1974179A</li>
                <li><strong>Siège social :</strong> Bureau A1, Immeuble Taymayouz, Centre Urbain Nord, 1082 El Menzah, Tunis, Tunisie</li>
                <li><strong>Activité principale :</strong> Activités informatiques & Portails Internet (Code 72)</li>
                <li><strong>Contact direct :</strong> contact@actumoto.tn / actumoto.tn@gmail.com</li>
              </ul>
            </section>

            {/* 2. Objet du site */}
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                2. Objet du service
              </h2>
              <p>
                <strong>actumoto.tn</strong> est un portail comparateur et informatif dédié aux motos, scooters, quads et deux-roues en Tunisie. La Plateforme permet aux utilisateurs de :
              </p>
              <ul className="list-disc pl-6 space-y-1.5 mt-2">
                <li>Consulter les caractéristiques techniques, photos et prix indicatifs des véhicules neufs commercialisés en Tunisie.</li>
                <li>Comparer simultanément plusieurs modèles et analyser leurs spécifications.</li>
                <li>Déposer des avis, retours d'expérience et notes vérifiées sur les modèles.</li>
                <li>Consulter et publier des annonces d'occasion vérifiées.</li>
                <li>Accéder aux coordonnées des concessionnaires et distributeurs officiels agréés en Tunisie.</li>
              </ul>
            </section>

            {/* 3. Inscription et compte */}
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                3. Compte utilisateur & Authentification (Google / Facebook)
              </h2>
              <p className="mb-2">
                La consultation du catalogue est libre et sans obligation d’inscription. La création d’un compte utilisateur est requise pour poster des avis, enregistrer des favoris ou soumettre des annonces.
              </p>
              <p className="mb-2">
                L’utilisateur peut s'inscrire soit par son adresse email et mot de passe, soit par <strong>Google Sign-In</strong> ou <strong>Facebook Login</strong>. L’utilisateur garantit l’exactitude des informations fournies et est seul responsable de la garde de ses identifiants.
              </p>
            </section>

            {/* 4. Règles de conduite */}
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                4. Règles de publication des avis et contenus
              </h2>
              <p className="mb-2">
                Tout utilisateur s'engage à publier des avis authentiques, constructifs et respectueux. Sont formellement prohibés :
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm sm:text-base">
                <li>Les propos diffamatoires, injurieux, haineux ou contraires aux bonnes mœurs.</li>
                <li>Les commentaires publicitaires déguisés ou le spam commercial non sollicité.</li>
                <li>Les fausses déclarations sur la propriété ou l'état d'un véhicule.</li>
              </ul>
              <p className="mt-2 text-sm text-gray-600">
                L'éditeur se réserve le droit de modérer, refuser ou supprimer tout contenu ne respectant pas ces directives sans préavis.
              </p>
            </section>

            {/* 5. Propriété intellectuelle */}
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                5. Propriété intellectuelle
              </h2>
              <p>
                L'architecture, le graphisme, les fonctionnalités et les contenus originaux du site actumoto.tn sont protégés par le droit de la propriété intellectuelle. Les marques, logos et visuels de constructeurs motos appartiennent à leurs détenteurs respectifs et sont utilisés à titre informatif d'identification des modèles.
              </p>
            </section>

            {/* 6. Limitation de responsabilité */}
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                6. Limitation de responsabilité
              </h2>
              <p>
                Les prix et données techniques affichés sur actumoto.tn sont collectés avec soin auprès des importateurs et concessionnaires officiels. Ces informations sont fournies à titre indicatif et ne constituent pas une offre contractuelle directe. Moto TN ne saurait être tenue responsable des variations tarifaires appliquées en concession.
              </p>
            </section>

            {/* 7. Droit applicable */}
            <section className="border-t border-gray-200 pt-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                7. Droit applicable et juridiction compétente
              </h2>
              <p className="mb-4">
                Les présentes conditions de service sont régies par le droit tunisien. En cas de litige relatif à l’interprétation ou à l’exécution des présentes, les tribunaux compétents de Tunis seront seuls habilités à trancher.
              </p>
              <p className="text-sm text-gray-500">
                Pour toute assistance ou question relative à nos conditions d'utilisation, écrivez-nous à : <strong className="text-gray-900">contact@actumoto.tn</strong>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
