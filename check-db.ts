import prisma from "./lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const user = await prisma.user.findUnique({ where: { email: "admin@actumoto.tn" } });
  console.log("User:", user);
  if (user && user.password) {
    const isValid = await bcrypt.compare("Actumoto2025!", user.password);
    console.log("Password valid:", isValid);
  }
}

main().finally(() => prisma.$disconnect());
