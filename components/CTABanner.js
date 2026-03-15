import Link from 'next/link';

export default function CTABanner() {
    const bannerImage = 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=2000&auto=format&fit=crop';

    return (
        <section className="cta-banner">
            <div
                className="cta-banner-bg"
                style={{ backgroundImage: `url(${bannerImage})` }}
            ></div>
            <div className="cta-banner-overlay"></div>
            <div className="container">
                <div className="cta-banner-content">
                    <span className="section-subtitle">Artisanal Excellence</span>
                    <h2 className="cta-banner-title">Find Your Signature Presence</h2>
                    <p className="cta-banner-desc">
                        Fragrance is the most intense form of memory. Discover a scent that defines your legacy
                        and leaves an unforgettable trace wherever you go.
                    </p>
                    <Link href="/products" className="btn btn-white btn-lg">
                        Shop The Collection
                    </Link>
                </div>
            </div>
        </section>
    );
}
