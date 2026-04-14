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

    // Mock groupings for demonstration, in a real app these could come from API
    const sections = [
        {
            title: settings.catTitle || 'Shop by Collection',
            items: categories.length > 0 ? categories : [
                { id: 1, name: 'Floral', slug: 'floral', image: '/icons/floral.svg' },
                { id: 2, name: 'Woody', slug: 'woody', image: '/icons/woody.svg' },
                { id: 3, name: 'Citrus', slug: 'citrus', image: '/icons/citrus.svg' },
                { id: 4, name: 'Oriental', slug: 'oriental', image: '/icons/oriental.svg' },
                { id: 5, name: 'Fresh', slug: 'fresh', image: '/icons/fresh.svg' },
            ]
        },
        {
            title: 'Shop by Intensity',
            items: [
                { id: 'p', name: 'Parfum', slug: 'parfum', image: '/icons/parfum.svg' },
                { id: 'edp', name: 'Eau de Parfum', slug: 'edp', image: '/icons/edp.svg' },
                { id: 'edt', name: 'Eau de Toilette', slug: 'edt', image: '/icons/edt.svg' },
                { id: 'c', name: 'Cologne', slug: 'cologne', image: '/icons/cologne.svg' },
            ]
        }
    ];

    if (loading) {
        return (
            <section className="section bg-white">
                <div className="container">
                    <div className="circle-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="circle-item">
                                <div className="circle-icon skeleton" style={{ border: 'none' }}></div>
                                <div className="skeleton" style={{ height: '12px', width: '60px' }}></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="section bg-white">
            <div className="container">
                {sections.map((section, idx) => (
                    <div key={idx} className="shop-section">
                        <h2 className="shop-section-title">{section.title}</h2>
                        <div className="circle-grid">
                            {section.items.map((item) => (
                                <Link 
                                    key={item.id} 
                                    href={`/products?category=${item.slug}`} 
                                    className="circle-item"
                                >
                                    <div className="circle-icon">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} />
                                        ) : (
                                            <div className="circle-placeholder">
                                                {item.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <span className="circle-name">{item.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
