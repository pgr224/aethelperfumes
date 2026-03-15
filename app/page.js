import prisma from '@/lib/prisma';
import HeroSlider from '@/components/HeroSlider';
import TrustBar from '@/components/TrustBar';
import CategoryGrid from '@/components/CategoryGrid';
import PromoBanners from '@/components/PromoBanners';
import ProductGrid from '@/components/ProductGrid';
import CTABanner from '@/components/CTABanner';
import TestimonialSlider from '@/components/TestimonialSlider';
import BlogSection from '@/components/BlogSection';

import Link from 'next/link';

export default async function Home() {
  // Fetch featured products for the "Bestsellers" section
  const productsRaw = await prisma.product.findMany({
    where: { featured: true },
    include: { category: true },
    take: 8,
    orderBy: { createdAt: 'desc' }
  });

  const featuredProducts = productsRaw.map(p => ({
    ...p,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images
  }));

  const settingsRaw = await prisma.siteSetting.findMany();
  const settings = settingsRaw.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});


  return (
    <>
      <HeroSlider />
      <TrustBar settings={settings} />
      

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">{settings.featuredSubtitle || 'Exquisite Fragrances'}</span>
            <h2 className="section-title">{settings.featuredTitle || 'The Bestsellers'}</h2>
            <p className="section-desc">Our most coveted creations, crafted with rare essences and timeless artistry.</p>
          </div>

          <ProductGrid products={featuredProducts} />

          <div className="section-cta">
            <Link href="/products" className="btn btn-outline-dark">
              Discover All Fragrances
            </Link>
          </div>
        </div>
      </section>

      <CategoryGrid settings={settings} />
      <PromoBanners />

      <section className="section section-darker">
        <div className="container">
          <div className="section-header">
            <span className="section-subtitle">New Arrivals</span>
            <h2 className="section-title">Just Unveiled</h2>
            <p className="section-desc">The newest additions to our olfactory library, pushing the boundaries of traditional perfumery.</p>
          </div>

          {/* Reuse ProductGrid for new arrivals too */}
          <ProductGrid products={featuredProducts.slice(0, 4)} />
        </div>
      </section>

      <CTABanner />
      <TestimonialSlider settings={settings} />
      <BlogSection />
    </>
  );
}
