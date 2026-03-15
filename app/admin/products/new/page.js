'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Editor from '@/components/Admin/Editor';

export default function NewProduct() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        shortDesc: '',
        price: 0,
        salePrice: null,
        stock: 0,
        inStock: true,
        volume: '100ml',
        categoryId: '',
        badge: null,
        exclusiveForTier: null,
        images: [''] // Start with one empty image field
    });

    useEffect(() => {
        fetch('/api/categories')
            .then(res => res.json())
            .then(data => {
                setCategories(data.categories || []);
                if (data.categories?.length > 0) {
                    setFormData(prev => ({ ...prev, categoryId: data.categories[0].id }));
                }
                setLoading(false);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.categoryId) {
            alert('Please select a category');
            return;
        }
        
        setSaving(true);
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                const toast = document.createElement('div');
                toast.className = 'toast show toast-success';
                toast.innerHTML = `<span>✨ Fragment created successfully</span>`;
                document.body.appendChild(toast);
                setTimeout(() => {
                    toast.remove();
                    router.push('/admin/products');
                }, 1500);
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create product');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData({ ...formData, images: newImages });
    };

    const addImageField = () => {
        setFormData({ ...formData, images: [...formData.images, ''] });
    };

    const removeImageField = (index) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData({ ...formData, images: newImages.length ? newImages : [''] });
    };

    const generateSlug = () => {
        const slug = formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        setFormData({ ...formData, slug });
    };

    if (loading) return <div className="spinner" style={{ margin: '5rem auto' }}></div>;

    return (
        <div>
            <div style={{ marginBottom: '3rem' }}>
                <Link href="/admin/products" style={{ color: 'var(--color-gold)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    ← Back to Catalog
                </Link>
                <h1 className="section-title" style={{ textAlign: 'left', marginTop: '1rem' }}>New Fragrance Creation</h1>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Main Info */}
                    <section className="admin-section" style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--color-gold)' }}>Core Identity</h3>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label">PRODUCT NAME</label>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="newsletter-form input"
                                    style={{ flex: 1, padding: '12px' }}
                                    placeholder="e.g. Midnight Oudh"
                                    required
                                />
                                <button type="button" onClick={generateSlug} className="btn btn-sm btn-dark" style={{ fontSize: '0.7rem' }}>Gen Slug</button>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label">URL SLUG</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                className="newsletter-form input"
                                style={{ width: '100%', padding: '12px' }}
                                placeholder="midnight-oudh"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label">DESCRIPTION (WYSIWYG)</label>
                            <Editor
                                value={formData.description}
                                onChange={(content) => setFormData({ ...formData, description: content })}
                            />
                        </div>
                    </section>

                    {/* Media Management */}
                    <section className="admin-section" style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--color-gold)' }}>Visual Gallery</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)', marginBottom: '1.5rem' }}>Provide image URLs for the product exhibit. The first URL will be the primary cover.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {formData.images.map((url, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '60px', height: '60px', background: '#222', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, border: '1px solid rgba(255,255,255,0.05)' }}>
                                        {url && <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                                    </div>
                                    <input
                                        type="text"
                                        value={url}
                                        onChange={(e) => handleImageChange(idx, e.target.value)}
                                        className="newsletter-form input"
                                        style={{ flex: 1, padding: '10px' }}
                                        placeholder="https://images.unsplash.com/..."
                                        required={idx === 0}
                                    />
                                    <button type="button" onClick={() => removeImageField(idx)} style={{ color: 'var(--color-error)', background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addImageField} className="btn btn-sm btn-outline-gold" style={{ marginTop: '1.5rem' }}>+ Another Angle</button>
                    </section>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Inventory & Pricing */}
                    <section className="admin-section" style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--color-gold)' }}>Commerce Details</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label className="admin-label">BASE PRICE ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    className="newsletter-form input"
                                    style={{ width: '100%', padding: '10px' }}
                                    required
                                />
                            </div>
                            <div>
                                <label className="admin-label">SALE PRICE ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.salePrice || ''}
                                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value ? parseFloat(e.target.value) : null })}
                                    className="newsletter-form input"
                                    style={{ width: '100%', padding: '10px' }}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label">INITIAL STOCK</label>
                            <input
                                type="number"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                className="newsletter-form input"
                                style={{ width: '100%', padding: '10px' }}
                                required
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', marginBottom: '2rem' }}>
                            <input
                                type="checkbox"
                                checked={formData.inStock}
                                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                                id="visible-check"
                            />
                            <label htmlFor="visible-check" style={{ color: 'var(--color-gray-light)' }}>List immediately on storefront</label>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={saving}
                        >
                            {saving ? 'Creating...' : 'Launch Fragrance'}
                        </button>
                    </section>

                    <section className="admin-section" style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--color-gold)' }}>Classification</h3>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label">CATEGORY</label>
                            <select
                                value={formData.categoryId}
                                onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                                className="newsletter-form input"
                                style={{ width: '100%', padding: '10px' }}
                                required
                            >
                                <option value="" disabled>Select Boutique</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label">VOLUME / SIZE</label>
                            <input
                                type="text"
                                value={formData.volume}
                                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                                className="newsletter-form input"
                                style={{ width: '100%', padding: '10px' }}
                                placeholder="100ml"
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label">CURATION BADGE</label>
                            <select
                                value={formData.badge || ''}
                                onChange={(e) => setFormData({ ...formData, badge: e.target.value || null })}
                                className="newsletter-form input"
                                style={{ width: '100%', padding: '10px' }}
                            >
                                <option value="">None</option>
                                <option value="new">New Arrival</option>
                                <option value="sale">Special Offer</option>
                                <option value="bestseller">Bestseller</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label" style={{ color: 'var(--color-gold)' }}>EXCLUSIVE TIER</label>
                            <select
                                value={formData.exclusiveForTier || ''}
                                onChange={(e) => setFormData({ ...formData, exclusiveForTier: e.target.value || null })}
                                className="newsletter-form input"
                                style={{ width: '100%', padding: '10px', borderColor: 'var(--color-gold)' }}
                            >
                                <option value="">Public Catalog</option>
                                <option value="GOLD">Gold Ambassadors Only</option>
                                <option value="SILVER">Silver/Gold Ambassadors Only</option>
                            </select>
                        </div>
                    </section>
                </div>
            </form>
        </div>
    );
}
