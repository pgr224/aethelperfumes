'use client';
import { useState, useEffect } from 'react';
import Editor from '@/components/Admin/Editor';

export default function AdminPages() {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPage, setSelectedPage] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        const res = await fetch('/api/admin/pages');
        const data = await res.json();
        setPages(data.pages || []);
        setLoading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/admin/pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedPage)
            });

            if (res.ok) {
                setMessage('Page saved successfully');
                fetchPages();
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="spinner" style={{ margin: '5rem auto' }}></div>;

    return (
        <div>
            <div style={{ marginBottom: '3rem' }}>
                <span className="section-subtitle">Content</span>
                <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Static Pages Manager</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2rem' }}>
                <div style={{ background: 'var(--color-black-light)', borderRadius: 'var(--border-radius-lg)', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Available Pages</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {['about-us', 'terms', 'privacy-policy', 'shipping-policy'].map(slug => {
                            const existing = pages.find(p => p.slug === slug);
                            return (
                                <button 
                                    key={slug}
                                    onClick={() => setSelectedPage(existing || { title: slug.replace('-', ' ').toUpperCase(), slug, content: '' })}
                                    style={{
                                        textAlign: 'left',
                                        padding: '1rem',
                                        background: selectedPage?.slug === slug ? 'rgba(201, 169, 110, 0.1)' : 'transparent',
                                        border: '1px solid ' + (selectedPage?.slug === slug ? 'var(--color-gold)' : 'rgba(255,255,255,0.05)'),
                                        color: selectedPage?.slug === slug ? 'var(--color-gold)' : 'var(--color-white)',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {slug.replace('-', ' ').toUpperCase()}
                                    {existing ? '' : ' (NEW)'}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div>
                    {selectedPage ? (
                        <div style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <form onSubmit={handleSave}>
                                <div style={{ marginBottom: '2rem' }}>
                                    <label className="admin-label">PAGE TITLE</label>
                                    <input 
                                        className="newsletter-form input" 
                                        style={{ width: '100%', padding: '12px' }}
                                        value={selectedPage.title}
                                        onChange={e => setSelectedPage({...selectedPage, title: e.target.value})}
                                    />
                                </div>

                                <div style={{ marginBottom: '2rem' }}>
                                    <label className="admin-label">PAGE CONTENT (WYSIWYG)</label>
                                    <Editor 
                                        value={selectedPage.content}
                                        onChange={content => setSelectedPage({...selectedPage, content})}
                                    />
                                </div>

                                {message && (
                                    <div style={{ padding: '1rem', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', borderRadius: '4px', marginBottom: '1.5rem', border: '1px solid #2ecc71' }}>
                                        {message}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? 'Saving...' : 'Publish Page'}
                                    </button>
                                    <button type="button" onClick={() => setSelectedPage(null)} className="btn btn-outline">Cancel</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', background: 'var(--color-black-light)', borderRadius: 'var(--border-radius-lg)', border: '1px dashed rgba(255,255,255,0.1)', color: 'var(--color-gray)' }}>
                            Select a page from the sidebar to start editing its content.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
