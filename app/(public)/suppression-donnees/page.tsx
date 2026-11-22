import Link from "next/link";

export const metadata = {
  title: "Suppression des Données Utilisateur - actumoto.tn",
  description: "Instructions et procédure de suppression des données utilisateur associées à votre compte actumoto.tn et Facebook Login",
};

export default function SuppressionDonneesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
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
              Meta / Facebook Platform Compliance
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2 mb-3">
              Instructions de Suppression des Données Utilisateur
            </h1>
            <p className="text-sm text-gray-500">
              Conformément à la politique de confidentialité de Meta et au Règlement Général sur la Protection des Données (RGPD)
            </p>
          </div>

          <div className="space-y-8 text-gray-700 leading-relaxed text-sm sm:text-base">
            <p>
              Sur <strong>actumoto.tn</strong> (édité par la société <strong>Moto TN</strong>, RNE 1974179A), nous respectons scrupuleusement votre vie privée et vous garantissons un contrôle total sur vos données personnelles collectées lors de votre connexion via <strong>Facebook Login</strong> ou <strong>Google</strong>.
            </p>

            {/* Méthode 1 */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-sm">
                  1
                </span>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Supprimer les autorisations depuis votre compte Facebook
                </h2>
              </div>
              <p className="text-sm text-gray-600">
                Vous pouvez à tout moment révoquer l’accès accordé à actumoto.tn directement depuis l’interface de Facebook :
              </p>
              <ol className="list-decimal pl-6 space-y-1.5 text-sm text-gray-800 font-medium">
                <li>Connectez-vous à votre compte Facebook sur navigateur ou application mobile.</li>
                <li>Accédez à <strong>Paramètres et confidentialité</strong>, puis cliquez sur <strong>Paramètres</strong>.</li>
                <li>Dans le menu de gauche, rendez-vous dans la section <strong>Applications et sites web</strong>.</li>
                <li>Recherchez l'application <strong>Actumoto</strong> (ou <strong>Moto TN</strong>).</li>
                <li>Cochez la case correspondante et cliquez sur le bouton <strong>Supprimer</strong>.</li>
              </ol>
              <p className="text-xs text-gray-500 pt-1">
                Cette action révoque immédiatement tous les accès futurs de l’application à vos informations de profil Facebook.
              </p>
            </div>

            {/* Méthode 2 */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-sm">
                  2
                </span>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Demander la suppression définitive de toutes vos données sur actumoto.tn
                </h2>
              </div>
              <p className="text-sm text-gray-600">
                Pour effacer définitivement votre compte, votre historique de connexion, vos avis rédigés et vos motos favorites enregistrées dans notre base de données :
              </p>
              <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-2 text-sm">
                <p>
                  Envoyez simplement un email à notre équipe à l’adresse :
                </p>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                  <a
                    href="mailto:contact@actumoto.tn?subject=Demande%20de%20suppression%20de%20compte%20et%20donn%C3%A9es"
                    className="font-bold text-red-600 hover:text-red-700 text-base"
                  >
                    contact@actumoto.tn
                  </a>
                  <span className="block text-xs text-gray-500 mt-1">
                    (ou contactez actumoto.tn@gmail.com)
                  </span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-gray-600 pt-2">
                  <li><strong>Objet du message :</strong> « Demande de suppression de compte et données »</li>
                  <li><strong>Corps du message :</strong> Mentionnez l'adresse email associée à votre compte ou à votre identifiant Facebook.</li>
                </ul>
              </div>
            </div>

            {/* Délai et engagement */}
            <div className="border-t border-gray-200 pt-6 space-y-3">
              <h3 className="font-bold text-gray-900 text-base">
                Délai de traitement et confirmation
              </h3>
              <p className="text-sm text-gray-600">
                Dès réception de votre demande, vos données sont intégralement purgées de notre base sous <strong>48 heures ouvrées</strong>. Un email de confirmation attestant la suppression définitive vous est adressé en retour.
              </p>
            </div>

            {/* Coordonnées DPO */}
            <div className="bg-neutral-900 text-gray-200 rounded-xl p-5 text-xs sm:text-sm space-y-1">
              <p className="font-bold text-white uppercase tracking-wider text-xs mb-2">
                Coordonnées du Responsable du Traitement (DPO)
              </p>
              <p><strong>Société :</strong> Moto TN (SUARL) • Identifiant Unique RNE : 1974179A</p>
              <p><strong>Adresse :</strong> Bureau A1, Immeuble Taymayouz, Centre Urbain Nord, 1082 El Menzah, Tunis, Tunisie</p>
              <p><strong>Contact :</strong> contact@actumoto.tn</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
