import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create sample countries
  const usa = await prisma.country.upsert({
    where: { code: 'US' },
    update: {},
    create: {
      name: 'United States',
      code: 'US',
    },
  });

  const canada = await prisma.country.upsert({
    where: { code: 'CA' },
    update: {},
    create: {
      name: 'Canada',
      code: 'CA',
    },
  });

  console.log('Created countries:', { usa, canada });

  // Create sample cities
  const newYork = await prisma.city.upsert({
    where: { name_countryId: { name: 'New York', countryId: usa.id } },
    update: {},
    create: {
      name: 'New York',
      countryId: usa.id,
    },
  });

  const toronto = await prisma.city.upsert({
    where: { name_countryId: { name: 'Toronto', countryId: canada.id } },
    update: {},
    create: {
      name: 'Toronto',
      countryId: canada.id,
    },
  });

  console.log('Created cities:', { newYork, toronto });

  // Create sample categories
  const food = await prisma.category.upsert({
    where: { slug: 'food-dining' },
    update: {},
    create: {
      name: 'Food & Dining',
      slug: 'food-dining',
      description: 'Restaurants, cafes, and food delivery services',
      icon: '🍽️',
    },
  });

  const shopping = await prisma.category.upsert({
    where: { slug: 'shopping' },
    update: {},
    create: {
      name: 'Shopping',
      slug: 'shopping',
      description: 'Retail stores and online shopping',
      icon: '🛍️',
    },
  });

  const entertainment = await prisma.category.upsert({
    where: { slug: 'entertainment' },
    update: {},
    create: {
      name: 'Entertainment',
      slug: 'entertainment',
      description: 'Movies, events, and entertainment venues',
      icon: '🎭',
    },
  });

  console.log('Created categories:', { food, shopping, entertainment });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
