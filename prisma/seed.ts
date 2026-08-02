import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { brands, categories, modelsData, dealersContacts, carouselSlides } from '../lib/data';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Categories
  console.log('Seeding categories...');
  const categoryMap = new Map();
  for (const cat of categories) {
    const createdCat = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: {
        name: cat.name,
        logo: cat.logo,
      },
    });
    categoryMap.set(cat.name.toLowerCase(), createdCat.id);
  }

  // 2. Brands and Dealer Contacts
  console.log('Seeding brands and dealer contacts...');
  const brandMap = new Map();
  for (const brand of brands) {
    const createdBrand = await prisma.brand.upsert({
      where: { name: brand.name },
      update: {},
      create: {
        name: brand.name,
        logo: brand.logo,
        comingSoon: brand.comingSoon || false,
      },
    });
    brandMap.set(brand.name, createdBrand.id);

    // Dealer Contacts
    const contactData = (dealersContacts as any)[brand.name];
    if (contactData) {
      await prisma.dealerContact.upsert({
        where: { brandId: createdBrand.id },
        update: {},
        create: {
          brandId: createdBrand.id,
          website: contactData.website || null,
          instagram: contactData.instagram || null,
          facebook: contactData.facebook || null,
          emails: contactData.emails || [],
          phones: contactData.phones || [],
          showroomAddress: contactData.showroom?.address || contactData.addresses?.[0] || null,
          showroomLocation: contactData.showroom?.location || null,
          salesParts: contactData.salesParts ? contactData.salesParts : null,
        },
      });
    }
  }

  // 3. Models, Specs, and Images
  console.log('Seeding models...');
  for (const brandName of Object.keys(modelsData)) {
    const brandId = brandMap.get(brandName);
    if (!brandId) {
      console.warn(`Brand ID not found for ${brandName}, skipping models.`);
      continue;
    }

    const models = (modelsData as any)[brandName];
    for (const model of models) {
      const categoryId = model.category ? categoryMap.get(model.category.toLowerCase()) : null;
      
      const createdModel = await prisma.model.create({
        data: {
          name: model.name,
          fuelType: model.fuelType,
          price: model.price,
          currency: model.currency || 'DT',
          brandId: brandId,
          categoryId: categoryId,
        },
      });

      // Images
      if (model.images && model.images.length > 0) {
        await prisma.image.createMany({
          data: model.images.map((url: string, index: number) => ({
            url,
            orderIndex: index,
            modelId: createdModel.id,
          })),
        });
      }

      // Specs
      if (model.specs) {
        const s = model.specs;
        await prisma.specs.create({
          data: {
            modelId: createdModel.id,
            typeMoteur: s.typeMoteur,
            cylindree: typeof s.cylindree === 'number' ? s.cylindree : parseFloat(s.cylindree) || null,
            puissance: typeof s.puissance === 'number' ? s.puissance : parseFloat(s.puissance) || null,
            coupleMaximal: typeof s.coupleMaximal === 'number' ? s.coupleMaximal : parseFloat(s.coupleMaximal) || null,
            refroidissement: s.refroidissement,
            tankCapacity: typeof s.tankCapacity === 'number' ? s.tankCapacity : parseFloat(s.tankCapacity) || null,
            vitesseMaximale: typeof s.vitesseMaximale === 'number' ? s.vitesseMaximale : parseFloat(s.vitesseMaximale) || null,
            autonomie: typeof s.autonomie === 'number' ? s.autonomie : parseFloat(s.autonomie) || null,
            alimentation: s.alimentation,
            freinage: s.freinage,
            systemeFreinage: s.systemeFreinage,
          },
        });
      }
    }
  }

  // 4. Carousel Slides
  console.log('Seeding carousel slides...');
  await prisma.carouselSlide.deleteMany(); // Clear existing
  for (let i = 0; i < carouselSlides.length; i++) {
    const slide = carouselSlides[i];
    await prisma.carouselSlide.create({
      data: {
        title: slide.title || null,
        alt: slide.alt || null,
        imageDesktop: slide.image_desktop,
        imageMobile: slide.image_mobile || slide.image_desktop,
        link: slide.link || null,
        orderIndex: i,
      },
    });
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
