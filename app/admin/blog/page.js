'use client';
import { useState, useEffect } from 'react';
import Editor from '@/components/Admin/Editor';

export default function BlogAdmin() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPost, setEditingPost] = useState(null);
    const [message, setMessage] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        const res = await fetch('/api/admin/blog');
        const data = await res.json();
        setPosts(data.posts || []);
        setLoading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/admin/blog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingPost)
            });
            if (res.ok) {
                setMessage('Article published successfully');
                setEditingPost(null);
                fetchPosts();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this vision?')) return;
        await fetch(`/api/admin/blog?id=${id}`, { method: 'DELETE' });
        fetchPosts();
    };

    if (loading) return <div className="spinner" style={{ margin: '5rem auto' }}></div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <span className="section-subtitle">Editorial</span>
                    <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Journal & Storytelling</h1>
                </div>
                {!editingPost && (
                    <button 
                        className="btn btn-primary" 
                        onClick={() => setEditingPost({ title: '', excerpt: '', content: '', author: 'Editorial Team', image: '' })}
                    >
                        + Craft New Story
                    </button>
                )}
            </div>

            {editingPost ? (
                <div className="card-glass" style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <form onSubmit={handleSave}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            <div>
                                <label className="admin-label">STORY TITLE</label>
                                <input 
                                    className="newsletter-form input" 
                                    style={{ width: '100%', padding: '12px' }}
                                    value={editingPost.title}
                                    placeholder="The Essence of Grasse..."
                                    onChange={e => setEditingPost({...editingPost, title: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="admin-label">AUTHOR / TIER</label>
                                <input 
                                    className="newsletter-form input" 
                                    style={{ width: '100%', padding: '12px' }}
                                    value={editingPost.author}
                                    onChange={e => setEditingPost({...editingPost, author: e.target.value})}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label className="admin-label">NARRATIVE EXCERPT</label>
                            <textarea 
                                className="newsletter-form input" 
                                style={{ width: '100%', padding: '12px', minHeight: '80px' }}
                                value={editingPost.excerpt}
                                placeholder="A brief glimpse into the story..."
                                onChange={e => setEditingPost({...editingPost, excerpt: e.target.value})}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label className="admin-label">HEADER IMAGE URL</label>
                            <input 
                                className="newsletter-form input" 
                                style={{ width: '100%', padding: '12px' }}
                                value={editingPost.image || ''}
                                placeholder="https://..."
                                onChange={e => setEditingPost({...editingPost, image: e.target.value})}
                            />
                        </div>

                        <div style={{ marginBottom: '2.5rem' }}>
                            <label className="admin-label">MAIN CONTENT (WYSIWYG)</label>
                            <Editor 
                                value={editingPost.content}
                                onChange={content => setEditingPost({...editingPost, content})}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Publishing...' : 'Publish to Journal'}
                            </button>
                            <button type="button" onClick={() => setEditingPost(null)} className="btn btn-outline">Discard</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {posts.length === 0 ? (
                        <div style={{ padding: '4rem', textAlign: 'center', background: 'var(--color-black-light)', borderRadius: 'var(--border-radius-lg)', border: '1px dashed rgba(255,255,255,0.1)' }}>
                            <p style={{ color: 'var(--color-gray)' }}>No stories have been told yet. Start crafting your brand narrative.</p>
                        </div>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                padding: '1.5rem 2rem', 
                                background: 'var(--color-black-light)', 
                                borderRadius: 'var(--border-radius-lg)',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                                    {post.image && <img src={post.image} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />}
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{post.title}</h3>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                            {new Date(post.createdAt).toLocaleDateString()} — By {post.author}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => setEditingPost(post)} className="btn btn-sm btn-outline">Edit</button>
                                    <button onClick={() => handleDelete(post.id)} className="btn btn-sm btn-dark" style={{ color: 'var(--color-error)' }}>Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {message && (
                <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', padding: '1rem 2rem', background: 'var(--color-success)', color: '#fff', borderRadius: '4px', zIndex: 1000 }}>
                    {message}
                </div>
            )}
        </div>
    );
}
