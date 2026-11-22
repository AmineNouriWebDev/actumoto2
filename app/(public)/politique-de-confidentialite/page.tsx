import Link from "next/link";

export const metadata = {
  title: "Politique de Confidentialité - actumoto.tn",
  description: "Politique de confidentialité et protection des données personnelles sur actumoto.tn éditée par Moto TN",
};

export default function PolitiqueConfidentialitePage() {
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
              Mentions Légales & RGPD
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mt-2 mb-3">
              Politique de Confidentialité
            </h1>
            <p className="text-sm text-gray-500">
              Dernière mise à jour : 22 Novembre 2026 • Version 2.0
            </p>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
            {/* 1. Responsable du traitement */}
            <section className="bg-gray-50 rounded-xl p-5 border border-gray-200/80">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">
                1. Identité du responsable du traitement
              </h2>
              <p className="mb-2">
                Le site internet <strong>actumoto.tn</strong> est édité et exploité par la société :
              </p>
              <ul className="space-y-1 text-sm text-gray-800 font-medium">
                <li><strong>Dénomination sociale :</strong> Moto TN (متو تن)</li>
                <li><strong>Forme juridique :</strong> Société Unipersonnelle à Responsabilité Limitée (SUARL)</li>
                <li><strong>Identifiant Unique (RNE) :</strong> 1974179A</li>
                <li><strong>Numéro de gestion interne :</strong> B50130882026</li>
                <li><strong>Capital social :</strong> 2 000 DT</li>
                <li><strong>Siège social & Adresse d'activité :</strong> Bureau A1, Immeuble Taymayouz, Centre Urbain Nord, 1082 El Menzah, Tunis, Tunisie</li>
                <li><strong>Email officiel :</strong> contact@actumoto.tn / actumoto.tn@gmail.com</li>
              </ul>
            </section>

            {/* 2. Données collectées */}
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                2. Données personnelles collectées
              </h2>
              <p className="mb-3">
                Dans le cadre de l’utilisation de notre plateforme, nous pouvons être amenés à collecter les catégories de données suivantes :
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base">
                <li>
                  <strong>Données d'identification :</strong> Nom, prénom, adresse e-mail lors de votre inscription directe ou via des services d'authentification tiers (Google Sign-In, Facebook Login).
                </li>
                <li>
                  <strong>Données de profil public :</strong> Photo de profil transmise facultativement par le fournisseur d'authentification pour personnaliser votre espace membre.
                </li>
                <li>
                  <strong>Données d'activité :</strong> Avis et évaluations déposés sur les modèles de motos, fiches sauvegardées en favoris, demandes de contact ou de devis auprès de concessionnaires.
                </li>
                <li>
                  <strong>Données techniques de connexion :</strong> Adresse IP, type de navigateur, horodatage des visites et pages consultées à des fins exclusives de sécurité et d'optimisation technique.
                </li>
              </ul>
            </section>

            {/* 3. Finalités du traitement */}
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                3. Finalités et bases légales du traitement
              </h2>
              <p className="mb-2">Vos informations sont traitées pour des finalités précises et légitimes :</p>
              <ul className="list-disc pl-6 space-y-1 text-sm sm:text-base">
                <li>Gestion de votre compte utilisateur et sécurisation des accès.</li>
                <li>Publication de vos avis, notes et commentaires sur les motos et scooters.</li>
                <li>Sauvegarde de vos favoris et de vos préférences de comparaison.</li>
                <li>Mise en relation avec des concessionnaires officiels à votre demande expresse.</li>
                <li>Respect de nos obligations légales et réglementaires.</li>
              </ul>
            </section>

            {/* 4. Connexion via tiers (Facebook & Google Login) */}
            <section className="bg-red-50/50 rounded-xl p-5 border border-red-100">
              <h2 className="text-lg sm:text-xl font-bold text-red-900 mb-3">
                4. Utilisation de la connexion Facebook & Google Login
              </h2>
              <p className="text-sm sm:text-base text-gray-800 leading-relaxed mb-3">
                L'utilisation de <strong>Facebook Login</strong> et de <strong>Google Sign-In</strong> sert exclusivement à simplifier et accélérer votre identification sur notre plateforme sans avoir à créer un mot de passe distinct.
              </p>
              <ul className="list-disc pl-6 space-y-1 text-sm text-gray-800">
                <li>Nous ne demandons que les permissions minimales strictement nécessaires (nom, prénom, adresse email vérifiée).</li>
                <li>Nous n'avons jamais accès à vos mots de passe Google ou Facebook.</li>
                <li>Nous ne publions aucun contenu sur vos profils ou vos fils d'actualités.</li>
                <li>Vous pouvez révoquer cette autorisation à tout moment depuis les paramètres de votre compte Facebook ou Google.</li>
              </ul>
            </section>

            {/* 5. Conservation et sécurité */}
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                5. Conservation et sécurité des données
              </h2>
              <p className="text-sm sm:text-base">
                Les données sont stockées sur des serveurs sécurisés protégés par des protocoles de chiffrement conformes aux standards de l'industrie. Vos données personnelles sont conservées tant que votre compte reste actif. Elles sont immédiatement et définitivement supprimées en cas de désinscription ou sur simple demande.
              </p>
            </section>

            {/* 6. Délégué à la Protection des Données (DPO) & Droits des utilisateurs */}
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                6. Vos droits & Contact du Délégué à la Protection des Données (DPO)
              </h2>
              <p className="mb-3">
                Conformément à la réglementation sur la protection des données personnelles, vous disposez d'un droit d'accès, de rectification, de portabilité et de suppression de vos données :
              </p>
              <div className="bg-gray-100 rounded-lg p-4 text-sm space-y-1 font-mono text-gray-800">
                <p><strong>Référent DPO :</strong> Délégué à la Protection des Données — Société Moto TN</p>
                <p><strong>Email direct :</strong> contact@actumoto.tn</p>
                <p><strong>Adresse postale :</strong> Moto TN, Bureau A1, Immeuble Taymayouz, Centre Urbain Nord, 1082 El Menzah, Tunis, Tunisie</p>
              </div>
            </section>

            {/* 7. Suppression des données */}
            <section className="border-t border-gray-200 pt-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">
                7. Procédure de suppression des données
              </h2>
              <p className="mb-3 text-sm sm:text-base">
                Pour supprimer votre compte ou effacer les données associées à votre profil Facebook ou Google, vous pouvez consulter notre page dédiée aux instructions :
              </p>
              <Link
                href="/suppression-donnees"
                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-bold underline"
              >
                Consulter les instructions de suppression des données utilisateur →
              </Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
