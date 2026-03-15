const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const pages = [
    {
      title: 'Our Story',
      slug: 'about-us',
      content: '<h2>The Essence of Lumière</h2><p>Born in the narrow streets of Grasse and inspired by the golden light of the Mediterranean...</p>'
    },
    {
      title: 'Terms & Conditions',
      slug: 'terms',
      content: '<h2>Terms of Service</h2><p>By using Lumière Parfums, you agree to our terms of service...</p>'
    },
    {
      title: 'Shipping Policy',
      slug: 'shipping-policy',
      content: '<h2>Shipping Information</h2><p>We provide global shipping from our ateliers. India orders are dispatched via premium express...</p>'
    },
    {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        content: '<h2>Privacy Policy</h2><p>We respect your privacy and handle your data with the care it deserves.</p>'
    }
  ];

  for (const page of pages) {
    await prisma.staticPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page
    });
  }

  console.log('Static pages seeded.');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
