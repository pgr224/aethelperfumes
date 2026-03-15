'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CategoryGrid({ settings = {} }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                setCategories(data.categories || []);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <section className="section section-dark">
                <div className="container">
                    <div className="category-grid">
                        {[1, 2, 3, 4].map(i => <div key={i} className="category-card skeleton" style={{ borderRadius: 'var(--border-radius-lg)', minHeight: '380px', backgroundColor: 'rgba(255,255,255,0.05)' }}></div>)}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="section section-dark">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">{settings.catSubtitle || 'The Collections'}</span>
                    <h2 className="section-title">{settings.catTitle || 'Olfactory Households'}</h2>
                    <p className="section-desc">Explore our curated selection of fragrances, categorized by their distinct character and concentration.</p>
                </div>

                <div className="category-grid">
                    {categories.map((cat) => (
                        <Link key={cat.id} href={`/products?category=${cat.slug}`} className="category-card">
                            <div
                                className="category-card-bg"
                                style={{ backgroundImage: `url(${cat.image})`, backgroundColor: '#111' }}
                            ></div>
                            <div className="category-card-overlay"></div>
                            <div className="category-card-content">
                                <span className="category-card-count">{cat.productCount} Fragrances</span>
                                <h3 className="category-card-name">{cat.name}</h3>
                                <span className="category-card-link">View Collection →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
