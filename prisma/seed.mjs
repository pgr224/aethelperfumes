import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Clean existing data
    await prisma.cartItem.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.heroSlide.deleteMany();
    await prisma.testimonial.deleteMany();
    await prisma.blogPost.deleteMany();
    await prisma.siteSetting.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.referral.deleteMany();
    await prisma.user.deleteMany();

    // Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const testUser = await prisma.user.create({
        data: {
            email: 'test@lumiere.com',
            password: hashedPassword,
            firstName: 'Test',
            lastName: 'User',
            name: 'Test User',
            role: 'customer',
            referralCode: 'LUMIERE-TEST',
        }
    });

    const categories = await Promise.all([
        prisma.category.create({ data: { name: 'Eau de Parfum', slug: 'eau-de-parfum', description: 'Intense, long-lasting fragrances with 15-20% concentration', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop', productCount: 3 } }),
        prisma.category.create({ data: { name: 'Eau de Toilette', slug: 'eau-de-toilette', description: 'Light, refreshing scents perfect for everyday wear', image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop', productCount: 2 } }),
        prisma.category.create({ data: { name: 'Luxury Collection', slug: 'luxury-collection', description: 'Exclusive, rare ingredient compositions', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop', productCount: 2 } }),
        prisma.category.create({ data: { name: 'Gift Sets', slug: 'gift-sets', description: 'Beautifully curated fragrance gift boxes', image: 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?q=80&w=1000&auto=format&fit=crop', productCount: 1 } }),
        prisma.category.create({ data: { name: 'Samples', slug: 'samples', description: 'Experience our fragrances before committing to a full size.', image: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?q=80&w=1000&auto=format&fit=crop', productCount: 1 } }),
    ]);

    // Products
    const products = [
        { name: 'Midnight Oud Noir', slug: 'midnight-oud-noir', description: 'A captivating blend of rare oud wood and midnight jasmine, rounded with warm amber and a whisper of vanilla. This luxurious fragrance evokes the mystery of Arabian nights.', shortDesc: 'Oud · Jasmine · Amber', price: 189.00, salePrice: 159.00, images: JSON.stringify(['https://images.unsplash.com/photo-1583445013765-48c220019989?q=80&w=1000&auto=format&fit=crop']), categoryId: categories[0].id, badge: 'bestseller', rating: 4.8, reviewCount: 124, volume: '100ml', notes: 'Top: Bergamot, Saffron | Heart: Oud, Rose | Base: Amber, Vanilla', featured: true, stock: 50 },
        { name: 'Rose Velvet Dreams', slug: 'rose-velvet-dreams', description: 'An enchanting bouquet of Damascena rose petals, soft peony, and velvety musk. A modern feminine classic that blooms on the skin.', shortDesc: 'Rose · Peony · Musk', price: 145.00, images: JSON.stringify(['https://images.unsplash.com/photo-1557170334-a9632e77c6e4?q=80&w=1000&auto=format&fit=crop']), categoryId: categories[0].id, badge: 'new', rating: 4.9, reviewCount: 87, volume: '75ml', notes: 'Top: Pink Pepper, Pear | Heart: Rose, Peony | Base: White Musk, Sandalwood', featured: true, stock: 50 },
        { name: 'Amber Soleil', slug: 'amber-soleil', description: 'Warm golden amber meets sun-kissed citrus and creamy sandalwood. A radiant unisex fragrance that captures the warmth of Mediterranean sunsets.', shortDesc: 'Amber · Citrus · Sandalwood', price: 125.00, salePrice: 99.00, images: JSON.stringify(['https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1000&auto=format&fit=crop']), categoryId: categories[1].id, badge: 'sale', rating: 4.7, reviewCount: 203, volume: '100ml', notes: 'Top: Mandarin, Bergamot | Heart: Amber, Jasmine | Base: Sandalwood, Tonka', featured: true, stock: 50 },
        { name: 'Noir Mystique', slug: 'noir-mystique', description: 'Dark, seductive, and utterly magnetic. Black orchid intertwines with smoky incense and deep patchouli in this statement-making evening fragrance.', shortDesc: 'Orchid · Incense · Patchouli', price: 210.00, images: JSON.stringify(['https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1000&auto=format&fit=crop']), categoryId: categories[2].id, rating: 4.6, reviewCount: 56, volume: '50ml', notes: 'Top: Black Pepper, Cardamom | Heart: Black Orchid, Incense | Base: Patchouli, Leather', featured: true, stock: 50 },
        { name: 'Fresh Citron Breeze', slug: 'fresh-citron-breeze', description: 'A vibrant splash of Amalfi lemon, crisp green apple, and ocean-fresh aquatic notes. The perfect invigorating scent for active lifestyles.', shortDesc: 'Lemon · Apple · Aquatic', price: 85.00, images: JSON.stringify(['https://images.unsplash.com/photo-1595428774738-6677f8842ad6?q=80&w=1000&auto=format&fit=crop']), categoryId: categories[1].id, rating: 4.5, reviewCount: 142, volume: '100ml', notes: 'Top: Lemon, Apple | Heart: Marine Notes, Lily | Base: White Cedar, Musk', stock: 50 },
        { name: 'Royal Saffron', slug: 'royal-saffron', description: 'A regal composition of pure saffron strands, Bulgarian rose absolute, and precious agarwood. Each bottle is individually numbered.', shortDesc: 'Saffron · Rose · Agarwood', price: 350.00, images: JSON.stringify(['https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1000&auto=format&fit=crop']), categoryId: categories[2].id, badge: 'bestseller', rating: 5.0, reviewCount: 34, volume: '50ml', notes: 'Top: Saffron, Cinnamon | Heart: Rose Absolute, Iris | Base: Agarwood, Musk', featured: true, stock: 50 },
        { name: 'Whisper of Iris', slug: 'whisper-of-iris', description: 'Delicate Florentine iris meets powdery violet and soft cashmere woods. An understated elegance that speaks volumes in hushed tones.', shortDesc: 'Iris · Violet · Cashmere', price: 165.00, images: JSON.stringify(['https://images.unsplash.com/photo-1615484477778-ca3b77940c25?q=80&w=1000&auto=format&fit=crop']), categoryId: categories[0].id, rating: 4.8, reviewCount: 76, volume: '75ml', notes: 'Top: Pink Pepper, Grapefruit | Heart: Iris, Violet | Base: Cashmere Wood, Ambrette', featured: true, stock: 50 },
        { name: 'Signature Discovery Set', slug: 'signature-discovery-set', description: 'Experience our six bestselling fragrances in travel-ready 10ml atomizers. The perfect way to discover your signature scent.', shortDesc: '6 × 10ml Travel Set', price: 120.00, salePrice: 95.00, images: JSON.stringify(['https://images.unsplash.com/photo-1592914610354-fd354ea45e48?q=80&w=1000&auto=format&fit=crop']), categoryId: categories[3].id, badge: 'sale', rating: 4.9, reviewCount: 312, volume: '6×10ml', notes: 'Includes: Midnight Oud, Rose Velvet, Amber Soleil, Noir Mystique, Citron Breeze, Royal Saffron', stock: 50 },
        { name: '5ml Signature Sample', slug: '5ml-signature-sample', description: 'Experience Lumière with a complimentary 5ml sample. Just pay for premium delivery. A perfect way to test a fragrance before committing to the full bottle.', shortDesc: 'Complimentary Sample', price: 0.00, salePrice: 0.00, images: JSON.stringify(['https://images.unsplash.com/photo-1615484477778-ca3b77940c25?q=80&w=1000&auto=format&fit=crop']), categoryId: categories[4].id, badge: 'free', rating: 5.0, reviewCount: 1045, volume: '5ml', notes: 'Select your preferred sample at checkout', featured: false, stock: 500 },
    ];

    for (const p of products) {
        await prisma.product.create({ data: p });
    }

    // Hero Slides
    await prisma.heroSlide.createMany({
        data: [
            { title: 'The Art of Fragrance', subtitle: 'New Collection 2026', description: 'Discover scents crafted from the world\'s rarest ingredients', ctaText: 'Explore Collection', ctaLink: '/products', cta2Text: 'Our Story', cta2Link: '/about', image: 'https://images.unsplash.com/photo-1616950293282-eeb6f2c6999a?q=80&w=2000&auto=format&fit=crop', sortOrder: 1 },
            { title: 'Midnight Oud Noir', subtitle: 'Bestseller', description: 'An intoxicating journey through Arabian nights', ctaText: 'Shop Now', ctaLink: '/products/midnight-oud-noir', image: 'https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?q=80&w=2000&auto=format&fit=crop', sortOrder: 2 },
            { title: 'Gift the Extraordinary', subtitle: 'Luxury Gift Sets', description: 'Beautifully presented sets for every occasion', ctaText: 'View Gift Sets', ctaLink: '/products?category=gift-sets', image: 'https://images.unsplash.com/photo-1549465220-1a8c9d3c2739?q=80&w=2000&auto=format&fit=crop', sortOrder: 3 },
        ],
    });

    // Testimonials
    await prisma.testimonial.createMany({
        data: [
            { name: 'Sophia Laurent', rating: 5, content: 'Midnight Oud Noir is absolutely divine. The longevity is incredible — I still get compliments 12 hours after applying. Worth every penny.', role: 'Midnight Oud Noir Customer', avatar: 'SL', isActive: true },
            { name: 'James Chen', rating: 5, content: 'The Discovery Set was the perfect introduction. I ended up falling in love with Royal Saffron — it\'s unlike anything I\'ve ever worn.', role: 'James Chen', avatar: 'JC', isActive: true },
            { name: 'Amara Okafor', rating: 5, content: 'Rose Velvet Dreams is pure elegance in a bottle. The transition from fresh pear to deep rose is magical. My signature scent now.', role: 'Verified Purchaser', avatar: 'AO', isActive: true },
        ],
    });

    // Blog Posts
    await prisma.blogPost.createMany({
        data: [
            { title: 'The Science of Scent: How Fragrance Affects Your Mood', slug: 'science-of-scent', excerpt: 'Discover the fascinating neuroscience behind why certain fragrances make us feel calm, energized, or confident.', content: 'Full article content here...', image: 'https://images.unsplash.com/photo-1563170351-be82bc888bb4?q=80&w=1000&auto=format&fit=crop', author: 'Dr. Nadia Rose' },
            { title: 'A Guide to Layering Fragrances Like a Pro', slug: 'fragrance-layering-guide', excerpt: 'Master the art of combining scents to create a unique, personalized fragrance that\'s entirely your own.', content: 'Full article content here...', image: 'https://images.unsplash.com/photo-1512201066735-8575bc899e6b?q=80&w=1000&auto=format&fit=crop', author: 'Marc Dubois' },
            { title: 'From Field to Flacon: The Journey of Rose de Mai', slug: 'rose-de-mai-journey', excerpt: 'Follow the extraordinary journey of the most prized rose in perfumery, from Grasse fields to your vanity.', content: 'Full article content here...', image: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=1000&auto=format&fit=crop', author: 'Editorial Team' },
        ],
    });

    // Admin User
    const adminPassword = await import('bcryptjs').then(m => m.default.hash('admin123', 10));
    await prisma.user.create({
        data: {
            email: 'admin@lumiere.com',
            password: adminPassword,
            name: 'Lumière Admin',
            role: 'admin'
        }
    });

    // Site Settings
    await prisma.siteSetting.createMany({
        data: [
            { key: 'site_name', value: 'LUMIÈRE' },
            { key: 'tagline', value: 'The Art of Fragrance' },
            { key: 'currency', value: 'USD' },
            { key: 'currency_symbol', value: '$' },
            { key: 'free_shipping_threshold', value: '150' },
            { key: 'email', value: 'hello@lumiere-parfum.com' },
            { key: 'phone', value: '+1 (888) 555-LUXE' },
            { key: 'address', value: '42 Rue de Rivoli, Paris, France' },
        ],
    });

    console.log('✅ Database seeded successfully!');
    console.log('Admin Login: admin@lumiere.com / admin123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
