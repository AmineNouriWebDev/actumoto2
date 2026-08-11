import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "mohamedamine.nouri1987@gmail.com" }
  });
  console.log("USER:", user);
  
  const tokens = await prisma.verificationToken.findMany({
    where: { identifier: "mohamedamine.nouri1987@gmail.com" }
  });
  console.log("TOKENS:", tokens);
}
main().catch(console.error).finally(() => prisma.$disconnect());
