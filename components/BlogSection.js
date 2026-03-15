'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function BlogSection() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/blog')
            .then(res => res.json())
            .then(data => {
                setPosts(data.posts || []);
                setLoading(false);
            });
    }, []);

    if (loading) return null;

    return (
        <section className="section section-dark">
            <div className="container">
                <div className="section-header">
                    <span className="section-subtitle">The Atelier Diary</span>
                    <h2 className="section-title">Olfactory Insights</h2>
                    <p className="section-desc">Delve deeper into the world of luxury perfumery, from ingredient sourcing to the art of layering.</p>
                </div>

                <div className="blog-grid">
                    {posts.map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card">
                            <div className="blog-card-image">
                                <img src={post.image} alt={post.title} loading="lazy" />
                            </div>
                            <div className="blog-card-body">
                                <div className="blog-card-date">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                                <h3 className="blog-card-title">{post.title}</h3>
                                <p className="blog-card-excerpt">{post.excerpt}</p>
                                <span className="blog-card-link">Continue Reading →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
