import prisma from '@/lib/prisma';
import Link from 'next/link';

export default async function BlogPage() {
    const posts = await prisma.blogPost.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="blog-page" style={{ paddingTop: '120px', background: 'var(--color-black)' }}>
            <section className="blog-hero" style={{ padding: '80px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <span className="section-subtitle">Aethel Journal</span>
                    <h1 className="section-title">The Atelier Stories</h1>
                    <p className="section-desc">Join us behind the scenes as we explore the rare essences, the ancient techniques, and the artisans who define the Aethel journey.</p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="blog-list-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '3rem' }}>
                        {posts.map((post) => (
                            <Link key={post.id} href={`/blog/${post.slug}`} className="blog-entry" style={{ display: 'block', group: 'true' }}>
                                <div className="blog-entry-image" style={{ aspectRatio: '16/9', overflow: 'hidden', borderRadius: 'var(--border-radius-lg)', marginBottom: '1.5rem', background: '#1a1a1a' }}>
                                    {post.image && (
                                        <img 
                                            src={post.image} 
                                            alt={post.title} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }}
                                            className="hover-scale"
                                        />
                                    )}
                                </div>
                                <div className="blog-entry-content">
                                    <div className="blog-meta" style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-gold)' }}>
                                        <span>PERFUMERY</span>
                                        <span style={{ color: 'var(--color-gray)' }}>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <h2 style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', color: 'var(--color-white)', marginBottom: '1rem' }}>{post.title}</h2>
                                    <p style={{ color: 'var(--color-gray-light)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>{post.excerpt}</p>
                                    <span className="btn-link" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--color-gold)', fontWeight: '600' }}>Read Journal Entry →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                    {posts.length === 0 && (
                        <div style={{ padding: '100px 0', textAlign: 'center', color: 'var(--color-gray)' }}>
                            <p>Our artisans are currently crafting new stories. Please check back soon.</p>
                        </div>
                    )}
                </div>
            </section>

        </div>
    );
}

