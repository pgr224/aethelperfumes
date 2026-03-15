import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Aethel Parfums data...');

    // Clean existing data
    await prisma.cartItem.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.siteSetting.deleteMany();

    // Site Settings
    await prisma.siteSetting.createMany({
        data: [
            { key: 'site_name', value: 'AETHEL PARFUMS' },
            { key: 'tagline', value: 'Secret for a Luxurious Life' },
            { key: 'logo', value: '/aethel_logo.png' },
            { key: 'currency', value: 'USD' },
            { key: 'currency_symbol', value: '$' },
            { key: 'free_shipping_threshold', value: '200' },
            { key: 'email', value: 'concierge@aethelparfums.com' },
        ],
    });

    // Categories
    const categories = await Promise.all([
        prisma.category.create({
            data: {
                name: 'Kings Collection',
                slug: 'kings-collection',
                description: 'Noble and powerful fragrances inspired by legendary rulers.',
                image: '/aethel_hero.png', // Use the confirmed correct AETHEL image
                productCount: 5
            }
        }),
        prisma.category.create({
            data: {
                name: 'Queens Collection',
                slug: 'queens-collection',
                description: 'Ethereal and elegant scents for the modern royal.',
                image: 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?q=80&w=1000&auto=format&fit=crop',
                productCount: 5
            }
        }),
        prisma.category.create({
            data: {
                name: 'Kingdom Mystics Collection',
                slug: 'kingdom-mystics-collection',
                description: 'Mysterious and enchanting blends of rare ingredients.',
                image: 'https://images.unsplash.com/photo-1583445013765-48c220019989?q=80&w=1000&auto=format&fit=crop',
                productCount: 5
            }
        }),
        prisma.category.create({
            data: {
                name: 'Noble Court Collection',
                slug: 'noble-court-collection',
                description: 'Sophisticated and refined aromas for the elite.',
                image: 'https://images.unsplash.com/photo-1616950293282-eeb6f2c6999a?q=80&w=1000&auto=format&fit=crop',
                productCount: 5
            }
        }),
    ]);

    // Hero Slides
    await prisma.heroSlide.createMany({
        data: [
            { 
                title: 'AETHEL PARFUMS', 
                subtitle: 'Secret for a Luxurious Life', 
                description: 'Discover the Kings and Queens Collections, where ancient legacy meets modern luxury.', 
                ctaText: 'Shop Collections', 
                ctaLink: '/products', 
                image: '/aethel_hero.png', 
                sortOrder: 1 
            },
            { 
                title: 'Kingdom Mystics', 
                subtitle: 'Beyond the Ordinary', 
                description: 'Explore the enigmatic scents of Midnight Oud and Frozen Lavender.', 
                ctaText: 'Explore Mystics', 
                ctaLink: '/products?category=kingdom-mystics-collection', 
                image: 'https://images.unsplash.com/photo-1512201066735-8575bc899e6b?q=80&w=1000&auto=format&fit=crop', 
                sortOrder: 2 
            },
            { 
                title: 'Noble Court', 
                subtitle: 'Sophisticated Presence', 
                description: 'Refined citrus and leather compositions for the distinguished individual.', 
                ctaText: 'View Noble Court', 
                ctaLink: '/products?category=noble-court-collection', 
                image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop', 
                sortOrder: 3 
            },
        ],
    });

    const data = [
        // Kings Collection
        { name: 'ATHELSTAN', notes: 'Imperial Oud', cat: 0, img: 'https://images.unsplash.com/photo-1583445013765-48c220019989?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: A majestic blend of rich oud and regal spices. AETHEL PARFUMS - Secret for a Luxurious Life' },
        { name: 'UHTRED', notes: 'Warrior Smoke', cat: 0, img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: A bold, smoky fragrance that evokes the heat of battle. AETHEL PARFUMS - Secret for a Luxurious Life' },
        { name: 'ATHELRED', notes: 'Dark Amber', cat: 0, img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: Deep amber notes layered with ancient resins. AETHEL PARFUMS - Secret for a Luxurious Life' },
        { name: 'ATHELWALD', notes: 'Iron Wood', cat: 0, img: 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: Cold iron meet warm oak in this striking composition. AETHEL PARFUMS - Secret for a Luxurious Life' },
        { name: 'ATHELRIC', notes: 'Noble Vetiver', cat: 0, img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: Earthbound vetiver refined for the highest courts. AETHEL PARFUMS - Secret for a Luxurious Life' },

        // Queens Collection
        { name: 'ATHELFLAED', notes: 'Velvet Amber', cat: 1, img: 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: Soft yet commanding amber with velvet floral undertones. AETHEL PARFUMS - Secret for a Luxurious Life' },
        { name: 'ATHELWYN', notes: 'Golden Musk', cat: 1, img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: Luminous musk that shimmers like gold on the skin. AETHEL PARFUMS - Secret for a Luxurious Life' },
        { name: 'ATHELGIFU', notes: 'Royal Jasmine', cat: 1, img: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: Intoxicating jasmine absolute fit for a queen. AETHEL PARFUMS - Secret for a Luxurious Life' },
        { name: 'ATHELTHRYTH', notes: 'Sacred Lily', cat: 1, img: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: Purity and power combined in a sacred lily bouquet. AETHEL PARFUMS - Secret for a Luxurious Life' },
        { name: 'ATHELBURG', notes: 'Crimson Rose', cat: 1, img: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: A deep, passionate rose scent with regal depth. AETHEL PARFUMS - Secret for a Luxurious Life' },

        // Kingdom Mystics Collection
        { name: 'ATHEL NOIR', notes: 'Midnight Oud', cat: 2, img: 'https://images.unsplash.com/photo-1583445013765-48c220019989?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: Dark oud distilled under the full moon. AETHEL PARFUMS - Secret for a Luxurious Life' },
        { name: 'ATHEL AUREA', notes: 'Golden Amber', cat: 2, img: 'https://images.unsplash.com/photo-1512201066735-8575bc899e6b?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: The mystical glow of amber in a bottle. AETHEL PARFUMS - Secret for a Luxurious Life' },
        { name: 'ATHEL OBSIDIAN', notes: 'Dark Resin', cat: 2, img: 'https://images.unsplash.com/photo-1595428774738-6677f8842ad6?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: Sharp, resinous, and profoundly mysterious. AETHEL PARFUMS - Secret for a Luxurious Life' },
        { name: 'ATHEL EMBER', notes: 'Smoked Vanilla', cat: 2, img: 'https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: Sweet vanilla tempered by mystical smoke. AETHEL PARFUMS - Secret for a Luxurious Life' },
        { name: 'ATHEL FROST', notes: 'Frozen Lavender', cat: 2, img: 'https://images.unsplash.com/photo-1549465220-1a8c9d3c2739?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: Crisp, cold lavender from the high mystic peaks. AETHEL PARFUMS - Secret for a Luxurious Life' },

        // Noble Court Collection
        { name: 'ATHEL CROWN', notes: 'Royal Citrus', cat: 3, img: 'https://images.unsplash.com/photo-1616950293282-eeb6f2c6999a?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: Bright, zesty citrus for a refreshing royal entrance. AETHEL PARFUMS - Secret for a Luxurious Life' },
        { name: 'ATHEL GOLD', notes: 'Golden Rose', cat: 3, img: 'https://images.unsplash.com/photo-1563170351-be82bc888bb4?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: Rose petals dipped in golden nectar. AETHEL PARFUMS - Secret for a Luxurious Life' },
        { name: 'ATHEL KNIGHT', notes: 'Leather Vetiver', cat: 3, img: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: The scent of fine leather and courtly honor. AETHEL PARFUMS - Secret for a Luxurious Life' },
        { name: 'ATHEL FOREST', notes: 'Emerald Woods', cat: 3, img: 'https://images.unsplash.com/photo-1592914610354-fd354ea45e48?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: Lush greenery and ancient woods of the kingdom. AETHEL PARFUMS - Secret for a Luxurious Life' },
        { name: 'ATHEL LEGACY', notes: 'Amber Crown', cat: 3, img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop', desc: 'Writing: A legacy of amber, passed down through generations. AETHEL PARFUMS - Secret for a Luxurious Life' },
    ];

    for (const item of data) {
        await prisma.product.create({
            data: {
                name: item.name,
                slug: item.name.toLowerCase().replace(/ /g, '-') + '-' + item.notes.toLowerCase().replace(/ /g, '-'),
                description: item.desc,
                shortDesc: item.notes,
                price: 250.00,
                images: JSON.stringify([item.img]),
                categoryId: categories[item.cat].id,
                notes: item.notes,
                stock: 100,
                volume: '100ml',
                featured: true,
                badge: item.cat === 0 ? 'bestseller' : (item.cat === 1 ? 'new' : null)
            }
        });
    }

    // Site Settings Updates
    await prisma.siteSetting.upsert({
        where: { key: 'featuredTitle' },
        update: { value: 'AETHEL Collection' },
        create: { key: 'featuredTitle', value: 'AETHEL Collection' }
    });
    await prisma.siteSetting.upsert({
        where: { key: 'featuredSubtitle' },
        update: { value: 'Secret for a Luxurious Life' },
        create: { key: 'featuredSubtitle', value: 'Secret for a Luxurious Life' }
    });

    console.log('✅ Aethel Parfums seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
