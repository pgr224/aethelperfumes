'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroSlider() {
    const [slides, setSlides] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activePromo, setActivePromo] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        fetch('/api/hero')
            .then(res => res.json())
            .then(data => {
                setSlides(data.slides || []);
                setLoading(false);
            });
        
        // Fetch active promo for countdown
        fetch('/api/admin/promotions')
            .then(res => res.json())
            .then(data => {
                const active = data.promotions?.find(p => p.status === 'active');
                if (active) setActivePromo(active);
            });
    }, []);

    useEffect(() => {
        if (slides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % slides.length);
        }, 8000);
        return () => clearInterval(interval);
    }, [slides]);

    useEffect(() => {
        if (!activePromo) return;
        
        const tick = () => {
            const end = new Date(activePromo.endDate).getTime();
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft('');
                return;
            }

            // Only show if < 24 hours
            if (diff > 24 * 60 * 60 * 1000) {
                setTimeLeft('');
                return;
            }

            const h = Math.floor(diff / (1000 * 60 * 60));
            const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeLeft(`${h}h ${m}m ${s}s`);
        };

        const timer = setInterval(tick, 1000);
        tick();
        return () => clearInterval(timer);
    }, [activePromo]);

    if (loading) return <div className="hero skeleton"></div>;
    if (slides.length === 0) return null;

    return (
        <section className="hero">
            {slides.map((slide, index) => (
                <div key={slide.id} className={`hero-slide ${index === currentIndex ? 'active' : ''}`}>
                    <div
                        className="hero-bg"
                        style={{ backgroundImage: `url(${slide.image})`, backgroundColor: '#0a0a0a' }}
                    ></div>
                    <div className="hero-overlay"></div>
                    <div className="hero-content">
                        <span className="hero-subtitle">{slide.subtitle}</span>
                        <h1 className="hero-title">{slide.title}</h1>
                        <p className="hero-desc">{slide.description}</p>
                        
                        {timeLeft && (
                            <div className="hero-countdown" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ color: 'var(--color-gold)', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Offer Ends In:</span>
                                <span style={{ background: 'rgba(201,169,110,0.15)', color: 'var(--color-gold)', padding: '5px 12px', borderRadius: '4px', fontSize: '1.1rem', fontWeight: '700', fontFamily: 'monospace', border: '1px solid var(--color-gold-muted)' }}>
                                    {timeLeft}
                                </span>
                            </div>
                        )}

                        <div className="hero-ctas">
                            <Link href={slide.ctaLink} className="btn btn-primary btn-lg">
                                {slide.ctaText}
                            </Link>
                            {slide.cta2Text && (
                                <Link href={slide.cta2Link} className="btn btn-outline btn-lg">
                                    {slide.cta2Text}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            <div className="hero-nav">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`hero-dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                    ></button>
                ))}
            </div>
        </section>
    );
}
