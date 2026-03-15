'use client';
import { useState, useEffect } from 'react';

export default function TestimonialSlider({ settings = {} }) {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/testimonials')
            .then(res => res.json())
            .then(data => {
                setTestimonials(data.testimonials || []);
                setLoading(false);
            });
    }, []);

    if (loading) return null;

    return (
        <section className="section section-ivory">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">{settings.testimonialsSubtitle || 'Real Experiences'}</span>
                    <h2 className="section-title">{settings.testimonialsTitle || 'The Aethel Collective'}</h2>
                    <p className="section-desc">Join thousands of discerning individuals who have found their signature scent in our collection.</p>
                </div>

                <div className="testimonial-grid">
                    {testimonials.map((t) => (
                        <div key={t.id} className="testimonial-card">
                            <div className="testimonial-stars">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} className={i < t.rating ? 'star' : 'star-empty'}>★</span>
                                ))}
                            </div>
                            <p className="testimonial-text">"{t.content}"</p>
                            <div className="testimonial-author">
                                <div className="testimonial-avatar" style={{ background: 'var(--color-gold)', color: '#000' }}>{t.avatar || t.name.charAt(0)}</div>
                                <div>
                                    <div className="testimonial-name">{t.name}</div>
                                    <div className="testimonial-product">{t.role || 'Verified Customer'}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
