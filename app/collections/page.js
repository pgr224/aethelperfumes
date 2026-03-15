import prisma from '@/lib/prisma';
import Link from 'next/link';

export const metadata = {
    title: 'Collections | AETHEL Paris',
    description: 'Explore our curated fragrance collections — from Eau de Parfum to rare Oriental compositions and fresh Colognes.'
};

export default async function CollectionsPage() {
    const categories = await prisma.category.findMany({
        include: {
            _count: { select: { products: true } }
        },
        orderBy: { id: 'asc' }
    });

    const formatted = categories.map((cat, i) => ({
        ...cat,
        productCount: cat._count.products,
        flipped: i % 2 !== 0
    }));

    return (
        <div className="collections-page">
            {/* Hero */}
            <section className="collections-hero">
                <div className="collections-hero-bg" />
                <div className="container">
                    <div className="collections-hero-content">
                        <span className="hero-eyebrow">Curated for You</span>
                        <h1 className="collections-hero-title">Our Collections</h1>
                        <p className="collections-hero-desc">
                            Each collection is a world unto itself — a carefully composed olfactory narrative that speaks to a distinct character, spirit, and occasion.
                        </p>
                        <Link href="/products" className="btn btn-outline-dark">
                            Browse All Fragrances
                        </Link>
                    </div>
                </div>
            </section>

            {/* Collection Entries - Alternating Layout */}
            <section className="collections-entries">
                <div className="container">
                    {formatted.map((cat, i) => (
                        <article
                            key={cat.id}
                            className={`collection-entry ${cat.flipped ? 'flipped' : ''}`}
                        >
                            {/* Image Panel */}
                            <div className="collection-image-panel">
                                {cat.image ? (
                                    <img src={cat.image} alt={cat.name} className="collection-image" />
                                ) : (
                                    <div className="collection-image-placeholder">
                                        <span>{cat.name.charAt(0)}</span>
                                    </div>
                                )}
                                <div className="collection-image-overlay" />
                                <span className="collection-number">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                            </div>

                            {/* Text Panel */}
                            <div className="collection-text-panel">
                                <div className="collection-text-inner">
                                    <span className="collection-eyebrow">Collection</span>
                                    <h2 className="collection-name">{cat.name}</h2>
                                    <p className="collection-description">
                                        {cat.description ||
                                            `A distinguished selection of ${cat.name.toLowerCase()} fragrances, each crafted to leave an unforgettable impression. Explore the full range and find your signature scent within this collection.`}
                                    </p>
                                    <div className="collection-meta">
                                        <span className="collection-count">{cat.productCount} Fragrances</span>
                                    </div>
                                    <Link
                                        href={`/products?category=${cat.slug}`}
                                        className="collection-cta-btn"
                                    >
                                        Explore Collection
                                        <span className="cta-arrow">→</span>
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="collections-bottom-cta">
                <div className="container">
                    <div className="bottom-cta-card">
                        <span className="section-subtitle">Bespoke Discovery</span>
                        <h2>Not sure where to start?</h2>
                        <p>Browse our full boutique and use filters to discover fragrances by price, character, and availability.</p>
                        <Link href="/products" className="btn btn-primary">
                            Enter The Boutique
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    );
}
