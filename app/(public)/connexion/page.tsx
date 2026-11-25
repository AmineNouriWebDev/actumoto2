import prisma from "@/lib/prisma";
import ConnexionClient from "@/components/auth/ConnexionClient";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const settings = await prisma.siteSettings.findFirst().catch(() => null);
  const showGoogle = (settings as any)?.showGoogleLogin !== false;
  const showFacebook = (settings as any)?.showFacebookLogin !== false;

  return <ConnexionClient showGoogle={showGoogle} showFacebook={showFacebook} />;
}
