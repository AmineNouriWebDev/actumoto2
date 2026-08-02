import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = "Actumoto2025!";
  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.upsert({
    where: { email: "admin@actumoto.tn" },
    update: {},
    create: {
      email: "admin@actumoto.tn",
      password: hashedPassword,
      name: "Administrateur",
    },
  });
  console.log("✅ Admin user created:", admin.email);

  // Seed initial popup if none exists
  const popupCount = await prisma.welcomePopup.count();
  if (popupCount === 0) {
    await prisma.welcomePopup.create({
      data: {
        isEnabled: true,
        durationSeconds: 4,
        imageDesktop: "/img/popup/mc/desktop.webp",
        imageMobile: "/img/popup/mc/mobile.jpeg",
        altText: "Offre Spéciale",
      },
    });
    console.log("✅ Default popup created.");
  }

  // Seed homepage banner if none exists
  const bannerCount = await prisma.homepageBanner.count();
  if (bannerCount === 0) {
    await prisma.homepageBanner.create({
      data: {
        imageDesktop: "/img/banner3.webp",
        imageMobile: "/img/banner3.webp",
        altText: "Pièces et accessoires moto",
        isVisible: true,
      },
    });
    console.log("✅ Default homepage banner created.");
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
