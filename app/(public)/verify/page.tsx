import { verifyEmail } from "@/lib/client-actions/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Vérification de l'email | actumoto.tn",
};

interface VerifyPageProps {
  searchParams: Promise<{
    token?: string;
    email?: string;
  }>;
}

export default async function VerifyPage(props: VerifyPageProps) {
  const searchParams = await props.searchParams;
  const { token, email } = searchParams;

  if (!token || !email) {
    redirect("/");
  }

  const result = await verifyEmail(token, email);

  return (
    <section className="pt-32 pb-24 min-h-[70vh] flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
        {result.success ? (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-green-600 text-4xl">✓</span>
            </div>
            <h1 className="futurist-font text-2xl text-gray-900 mb-4 uppercase">Compte Activé</h1>
            <p className="text-gray-600 mb-8">
              Félicitations, votre adresse email a été vérifiée avec succès. Vous pouvez maintenant vous connecter à votre compte.
            </p>
            <Link
              href="/connexion"
              className="inline-block bg-[#ff0000] text-white font-bold py-3 px-8 rounded-lg uppercase tracking-wider hover:bg-[#cc0000] transition-colors shadow-lg hover:shadow-xl w-full"
            >
              Me connecter
            </Link>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-red-600 text-4xl">!</span>
            </div>
            <h1 className="futurist-font text-2xl text-gray-900 mb-4 uppercase">Erreur de vérification</h1>
            <p className="text-gray-600 mb-8">
              {result.error || "Une erreur inconnue est survenue lors de la vérification."}
            </p>
            <Link
              href="/"
              className="inline-block bg-gray-800 text-white font-bold py-3 px-8 rounded-lg uppercase tracking-wider hover:bg-gray-900 transition-colors shadow-lg hover:shadow-xl w-full"
            >
              Retour à l'accueil
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
