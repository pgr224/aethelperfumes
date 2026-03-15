'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Editor from '@/components/Admin/Editor';

export default function EditProduct({ params }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        Promise.all([
            fetch(`/api/products/${resolvedParams.id}`).then(res => res.json()),
            fetch('/api/categories').then(res => res.json())
        ]).then(([productData, catData]) => {
            setProduct(productData.product);
            setFormData(productData.product);
            setCategories(catData.categories || []);
            setLoading(false);
        });
    }, [resolvedParams.id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/products/${resolvedParams.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                // Success
                const toast = document.createElement('div');
                toast.className = 'toast show toast-success';
                toast.innerHTML = `<span>✨ Changes saved successfully</span>`;
                document.body.appendChild(toast);
                setTimeout(() => {
                    toast.remove();
                    router.push('/admin/products');
                }, 1500);
            }
        } catch (err) {
            console.error(err);
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
        setFormData({ ...formData, images: newImages });
    };

    if (loading) return <div className="spinner" style={{ margin: '5rem auto' }}></div>;

    return (
        <div>
            <div style={{ marginBottom: '3rem' }}>
                <Link href="/admin/products" style={{ color: 'var(--color-gold)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    ← Back to Catalog
                </Link>
                <h1 className="section-title" style={{ textAlign: 'left', marginTop: '1rem' }}>Edit Fragrance</h1>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Main Info */}
                    <section className="admin-section" style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>General Information</h3>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--color-gray)' }}>PRODUCT NAME</label>
                            <input
                                type="text"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="newsletter-form input"
                                style={{ width: '100%', padding: '12px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', color: 'var(--color-gray)' }}>DESCRIPTION (WYSIWYG)</label>
                            <Editor
                                value={formData.description || ''}
                                onChange={(content) => setFormData({ ...formData, description: content })}
                            />
                        </div>
                    </section>

                    {/* Media Management */}
                    <section className="admin-section" style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Gallery Management</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)', marginBottom: '1.5rem' }}>Manage the product photography URLs. First image is used as the cover.</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {formData.images?.map((url, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '60px', height: '60px', background: '#222', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                    </div>
                                    <input
                                        type="text"
                                        value={url}
                                        onChange={(e) => handleImageChange(idx, e.target.value)}
                                        className="newsletter-form input"
                                        style={{ flex: 1, padding: '10px' }}
                                        placeholder="https://images.unsplash.com/..."
                                    />
                                    <button type="button" onClick={() => removeImageField(idx)} style={{ color: 'var(--color-error)', background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
                                </div>
                            ))}
                        </div>
                        <button type="button" onClick={addImageField} className="btn btn-sm btn-outline" style={{ marginTop: '1.5rem' }}>+ Add Image URL</button>
                    </section>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Inventory & Pricing */}
                    <section className="admin-section" style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Pricing & Stock</h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem', color: 'var(--color-gray)' }}>PRICE ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price || 0}
                                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                    className="newsletter-form input"
                                    style={{ width: '100%', padding: '10px' }}
                                />
                            </div>
                            <div>
                                <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem', color: 'var(--color-gray)' }}>SALE PRICE ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.salePrice || ''}
                                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value ? parseFloat(e.target.value) : null })}
                                    className="newsletter-form input"
                                    style={{ width: '100%', padding: '10px' }}
                                />
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem', color: 'var(--color-gray)' }}>INVENTORY LEVEL</label>
                            <input
                                type="number"
                                value={formData.stock || 0}
                                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                                className="newsletter-form input"
                                style={{ width: '100%', padding: '10px' }}
                            />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                            <input
                                type="checkbox"
                                checked={formData.inStock}
                                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                            />
                            <label>Visible on Website</label>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '2rem' }}
                            disabled={saving}
                        >
                            {saving ? 'Publishing...' : 'Save Changes'}
                        </button>
                    </section>

                    <section className="admin-section" style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Organization</h3>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem', color: 'var(--color-gray)' }}>CATEGORY</label>
                            <select
                                value={formData.categoryId || ''}
                                onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                                className="newsletter-form input"
                                style={{ width: '100%', padding: '10px' }}
                                required
                            >
                                <option value="" disabled>Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem', color: 'var(--color-gray)' }}>VOLUME / SIZE</label>
                            <input
                                type="text"
                                value={formData.volume || ''}
                                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                                className="newsletter-form input"
                                style={{ width: '100%', padding: '10px' }}
                                placeholder="100ml"
                            />
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem', color: 'var(--color-gray)' }}>FRAGRANCE BADGE</label>
                            <select
                                value={formData.badge || ''}
                                onChange={(e) => setFormData({ ...formData, badge: e.target.value || null })}
                                className="newsletter-form input"
                                style={{ width: '100%', padding: '10px' }}
                            >
                                <option value="">None</option>
                                <option value="new">New</option>
                                <option value="sale">Sale</option>
                                <option value="bestseller">Bestseller</option>
                            </select>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.65rem', color: 'var(--color-gold)' }}>EXCLUSIVE TIER</label>
                            <select
                                value={formData.exclusiveForTier || ''}
                                onChange={(e) => setFormData({ ...formData, exclusiveForTier: e.target.value || null })}
                                className="newsletter-form input"
                                style={{ width: '100%', padding: '10px', borderColor: 'var(--color-gold)' }}
                            >
                                <option value="">Public Catalog</option>
                                <option value="GOLD">Gold Ambassadors Only (Unlocked with Credit)</option>
                                <option value="SILVER">Silver/Gold Ambassadors Only</option>
                            </select>
                        </div>
                    </section>
                </div>
            </form>
        </div>
    );
}
