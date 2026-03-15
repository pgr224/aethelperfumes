'use client';
import { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, Image as ImageIcon, ExternalLink, Save } from 'lucide-react';

export default function CategoryAdmin() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(null); // id of category being edited
    const [formData, setFormData] = useState({ name: '', slug: '', description: '', image: '' });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/admin/categories');
            const data = await res.json();
            if (data.categories) setCategories(data.categories);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (cat) => {
        setIsEditing(cat.id);
        setFormData({ name: cat.name, slug: cat.slug, description: cat.description || '', image: cat.image || '' });
        setShowForm(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const url = isEditing ? `/api/admin/categories/${isEditing}` : '/api/admin/categories';
        const method = isEditing ? 'PATCH' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                fetchCategories();
                setShowForm(false);
                setIsEditing(null);
                setFormData({ name: '', slug: '', description: '', image: '' });
                alert('Gallery updated successfully');
            }
        } catch (err) {
            alert('Failed to save category');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure? This will remove the gallery entry if no products are linked.')) return;
        try {
            const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) {
                setCategories(categories.filter(c => c.id !== id));
            } else {
                alert(data.error);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="admin-container">Loading Gallery Architect...</div>;

    return (
        <div className="admin-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <span className="section-subtitle">Visual Curation</span>
                    <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Category Navigator</h1>
                </div>
                <button onClick={() => { setShowForm(!showForm); setIsEditing(null); setFormData({name: '', slug: '', description: '', image: ''}); }} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} /> New Collection
                </button>
            </div>

            {showForm && (
                <div style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-gold-muted)', marginBottom: '3rem' }}>
                    <h3 style={{ marginBottom: '2rem', color: 'var(--color-gold)' }}>{isEditing ? 'Curate Collection' : 'Architect New Collection'}</h3>
                    <form onSubmit={handleSave}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                            <div>
                                <label className="admin-label">COLLECTION NAME</label>
                                <input 
                                    className="newsletter-form input" 
                                    style={{ width: '100%', padding: '12px' }}
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="admin-label">NAVIGATOR SLUG</label>
                                <input 
                                    className="newsletter-form input" 
                                    style={{ width: '100%', padding: '12px' }}
                                    value={formData.slug}
                                    onChange={e => setFormData({...formData, slug: e.target.value})}
                                    required
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="admin-label">VISUAL ASSET URL (IMAGE)</label>
                                <input 
                                    className="newsletter-form input" 
                                    style={{ width: '100%', padding: '12px' }}
                                    placeholder="https://images.unsplash.com/..."
                                    value={formData.image}
                                    onChange={e => setFormData({...formData, image: e.target.value})}
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="admin-label">COLLECTION PHILOSOPHY (DESCRIPTION)</label>
                                <textarea 
                                    className="newsletter-form input" 
                                    style={{ width: '100%', padding: '12px', minHeight: '100px' }}
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <Save size={18} /> Commit Changes
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="btn btn-dark" style={{ flex: 0.3 }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                {categories.map(cat => (
                    <div key={cat.id} style={{ 
                        background: 'var(--color-black-light)', 
                        borderRadius: 'var(--border-radius-lg)', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        overflow: 'hidden',
                        transition: 'transform 0.3s, border-color 0.3s'
                    }} className="category-admin-card">
                        <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
                            <img 
                                src={cat.image || 'https://placehold.co/600x400?text=Luxury+Collection'} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} 
                            />
                            <div style={{ position: 'absolute', bottom: '1rem', left: '1.5rem', background: 'var(--color-gold)', color: '#000', padding: '4px 12px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {cat._count.products} Assets Linked
                            </div>
                        </div>
                        <div style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{cat.name}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleEdit(cat)} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--color-gray-light)', cursor: 'pointer', padding: '8px', borderRadius: '4px' }}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(cat.id)} style={{ background: 'rgba(231, 76, 60, 0.1)', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: '8px', borderRadius: '4px' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <p style={{ color: 'var(--color-gray)', fontSize: '0.8rem', lineHeight: '1.6', marginBottom: '1.5rem', height: '3.2rem', overflow: 'hidden' }}>
                                {cat.description || 'No philosophy defined for this collection.'}
                            </p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--color-gray)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Slug: /{cat.slug}
                                </div>
                                <a href={`/products?category=${cat.slug}`} target="_blank" style={{ color: 'var(--color-gold)', textDecoration: 'none', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    Preview <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
