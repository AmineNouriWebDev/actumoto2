import prisma from "@/lib/prisma";
import InscriptionClient from "@/components/auth/InscriptionClient";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const settings = await prisma.siteSettings.findFirst().catch(() => null);
  const showGoogle = (settings as any)?.showGoogleLogin !== false;
  const showFacebook = (settings as any)?.showFacebookLogin !== false;

  return <InscriptionClient showGoogle={showGoogle} showFacebook={showFacebook} />;
}
