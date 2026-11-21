import Link from "next/link";

export const metadata = {
  title: "Politique de Confidentialité - actumoto.tn",
  description: "Politique de confidentialité et protection des données personnelles sur actumoto.tn",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="pt-28 pb-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 mb-6 transition-colors"
          >
            ← Retour à l'accueil
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-4">
            Politique de Confidentialité et Protection des Données
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Dernière mise à jour : 21 Novembre 2026
          </p>

          <div className="space-y-6 text-gray-700 leading-relaxed text-sm sm:text-base">
            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                1. Introduction
              </h2>
              <p>
                Le site <strong>actumoto.tn</strong> s'engage à protéger la vie privée des utilisateurs de sa plateforme. Cette politique détaille les données que nous collectons, la façon dont nous les utilisons et vos droits concernant vos informations personnelles.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                2. Données collectées
              </h2>
              <p className="mb-2">
                Lorsque vous créez un compte ou vous connectez via des fournisseurs tiers (Google, Facebook) :
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Nom et prénom</strong> : pour personnaliser votre profil et afficher vos avis.</li>
                <li><strong>Adresse email</strong> : pour l'authentification et les notifications relatives à votre compte.</li>
                <li><strong>Photo de profil</strong> : fournie éventuellement par le service tiers pour identifier votre compte.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                3. Utilisation de la connexion tierce (Google & Facebook Login)
              </h2>
              <p>
                L'utilisation de Facebook Login et Google Sign-In a pour unique but de faciliter votre inscription et votre connexion rapide sur notre site. Nous n'avons jamais accès à vos mots de passe Facebook ou Google et nous ne publions rien sur vos réseaux sociaux sans votre consentement explicite.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                4. Conservation et sécurité des données
              </h2>
              <p>
                Vos informations sont conservées de façon sécurisée sur nos serveurs hébergés en conformité avec les normes de sécurité en vigueur. Nous ne vendons ni ne louons vos données personnelles à des tiers.
              </p>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                5. Suppression des données (Instructions de suppression)
              </h2>
              <p className="mb-2">
                Conformément aux exigences de Meta (Facebook) et aux réglementations sur la protection des données, vous avez le droit de demander la suppression complète de vos données :
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>
                  Vous pouvez supprimer l'accès de l'application depuis les paramètres de votre compte Facebook (Paramètres et confidentialité &gt; Paramètres &gt; Applications et sites web &gt; actumoto &gt; Supprimer).
                </li>
                <li>
                  Vous pouvez également demander la suppression définitive de votre compte et de toutes les données associées (favoris, commentaires, notes) en envoyant un email à notre équipe à l'adresse suivante : <strong>contact@actumoto.tn</strong>. Vos données seront effacées sous 48 heures ouvrées.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                6. Contact
              </h2>
              <p>
                Pour toute question concernant cette politique de confidentialité, vous pouvez nous contacter directement par email à : <strong>contact@actumoto.tn</strong>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
