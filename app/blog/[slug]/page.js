import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function BlogPostDetailPage({ params }) {
    const { slug } = await params;

    const post = await prisma.blogPost.findUnique({
        where: { slug }
    });

    if (!post) {
        notFound();
    }

    return (
        <div className="blog-detail-page" style={{ background: 'var(--color-black)', minHeight: '100vh', paddingTop: '140px' }}>
            <article className="blog-article">
                <header className="article-header" style={{ marginBottom: '4rem' }}>
                    <div className="container" style={{ maxWidth: '900px', textAlign: 'center' }}>
                        <div className="article-meta" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', fontSize: '0.8rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                            <span>BY {post.author.toUpperCase()}</span>
                            <span style={{ color: 'var(--color-gray)' }}>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        <h1 className="section-title" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', lineHeight: '1.2' }}>{post.title}</h1>
                    </div>
                </header>

                {post.image && (
                    <div className="article-featured-image" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto 6rem', borderRadius: 'var(--border-radius-xl)', overflow: 'hidden' }}>
                        <div className="container">
                            <img src={post.image} alt={post.title} style={{ width: '100%', maxHeight: '600px', objectFit: 'cover' }} />
                        </div>
                    </div>
                )}

                <div className="article-content">
                    <div className="container" style={{ maxWidth: '800px' }}>
                        <div className="content-body" style={{ color: 'var(--color-gray-light)', fontSize: '1.15rem', lineHeight: '1.9' }}>
                            <p className="lead" style={{ fontSize: '1.4rem', color: 'var(--color-white)', fontStyle: 'italic', marginBottom: '3rem', borderLeft: '3px solid var(--color-gold)', paddingLeft: '2rem' }}>
                                {post.excerpt}
                            </p>
                            <div 
                                className="text-content" 
                                dangerouslySetInnerHTML={{ __html: post.content }} 
                                style={{ marginBottom: '6rem' }}
                            />

                            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', marginBottom: '4rem' }} />
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Link href="/blog" style={{ color: 'var(--color-gold)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em', fontWeight: 'bold' }}>
                                    ← Back to Journal
                                </Link>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {/* Placeholder for sharing icons */}
                                    <span style={{ color: 'var(--color-gray)', fontSize: '0.8rem' }}>SHARE THIS STORY</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            {/* Premium spacing at bottom */}
            <div style={{ height: '10rem' }}></div>
        </div>
    );
}
