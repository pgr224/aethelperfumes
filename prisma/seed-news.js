const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const emails = [
    'sophie.vogue@example.com',
    'marcus.luxury@example.com',
    'elena.grasse@culture.fr',
    'collector@fragrancehall.com'
  ];

  for (const email of emails) {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email }
    });
  }

  console.log('Seed subscribers added.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
