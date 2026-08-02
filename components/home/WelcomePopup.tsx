import prisma from "@/lib/prisma";
import WelcomePopupClient from "./WelcomePopupClient";

export default async function WelcomePopup() {
  const popup = await prisma.welcomePopup.findFirst();

  if (!popup || !popup.isEnabled) return null;

  return (
    <WelcomePopupClient
      imageDesktop={popup.imageDesktop || ""}
      imageMobile={popup.imageMobile || popup.imageDesktop || ""}
      link={popup.link}
      altText={popup.altText || "Offre Spéciale"}
      durationSeconds={popup.durationSeconds}
    />
  );
}
