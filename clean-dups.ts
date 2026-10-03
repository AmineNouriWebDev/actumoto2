import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function cleanDuplicates() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "asc" }
  });

  const seen = new Set();
  const toDelete = [];

  for (const r of reviews) {
    const key = `${r.userId}-${r.modelId}`;
    if (seen.has(key)) {
      toDelete.push(r.id);
    } else {
      seen.add(key);
    }
  }

  if (toDelete.length > 0) {
    await prisma.review.deleteMany({
      where: { id: { in: toDelete } }
    });
    console.log(`Deleted ${toDelete.length} duplicate reviews.`);
  } else {
    console.log("No duplicates found.");
  }
}

cleanDuplicates().catch(console.error).finally(() => prisma.$disconnect());
