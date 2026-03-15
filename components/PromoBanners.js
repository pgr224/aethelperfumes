import Link from 'next/link';

export default function PromoBanners() {
    const banners = [
        { title: 'The Night Bloom', link: '/products?category=eau-de-parfum', label: 'Limited Edition', image: 'https://images.unsplash.com/photo-1549465220-1a8c9d3c2739?q=80&w=1000&auto=format&fit=crop' },
        { title: 'Personalized Scent', link: '/consultation', label: 'Bespoke Services', image: 'https://images.unsplash.com/photo-1590736704728-f4730bb30770?q=80&w=1000&auto=format&fit=crop' },
        { title: 'Grasse Heritage', link: '/about', label: 'Since 1924', image: 'https://images.unsplash.com/photo-1563170351-be82bc888bb4?q=80&w=1000&auto=format&fit=crop' },
    ];

    return (
        <section className="section section-darker">
            <div className="container">
                <div className="promo-grid">
                    {banners.map((banner, index) => (
                        <Link key={index} href={banner.link} className="promo-card">
                            <div
                                className="promo-card-bg"
                                style={{ backgroundImage: `url(${banner.image})`, backgroundColor: '#111' }}
                            ></div>
                            <div className="promo-card-overlay"></div>
                            <div className="promo-card-content">
                                <span className="promo-card-label">{banner.label}</span>
                                <h3 className="promo-card-title">{banner.title}</h3>
                                <span className="btn btn-sm btn-outline">Explore</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
