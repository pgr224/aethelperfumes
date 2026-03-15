'use client';
import { useState, useEffect } from 'react';
import { Tag, Zap, Trash2, Calendar, Percent, CheckCircle, Package } from 'lucide-react';

export default function BulkDiscountArchitect() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [discount, setDiscount] = useState('10');
    const [season, setSeason] = useState('Festival of Fragrance');
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetch('/api/admin/categories')
            .then(res => res.json())
            .then(data => {
                setCategories(data.categories || []);
                setLoading(false);
            });
    }, []);

    const showMsg = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const handleApply = async (action = 'apply') => {
        if (!selectedCategory && action !== 'clear_all') {
            showMsg('Please select a target category', 'error');
            return;
        }

        const confirmText = action === 'clear' 
            ? 'Reverting all products in this category to full price?' 
            : `Apply ${discount}% discount to all assets in this category for the "${season}" event?`;

        if (!confirm(confirmText)) return;

        setProcessing(true);
        try {
            const res = await fetch('/api/admin/inventory/bulk-discount', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    categoryId: selectedCategory,
                    discountPercentage: discount,
                    action
                })
            });
            const data = await res.json();
            if (res.ok) {
                showMsg(data.message);
            } else {
                showMsg(data.error, 'error');
            }
        } catch (err) {
            showMsg('Network error in discount protocol', 'error');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div className="admin-container">Loading Pricing Protocols...</div>;

    const selectedCatData = categories.find(c => String(c.id) === selectedCategory);

    return (
        <div className="admin-container">
            <div style={{ marginBottom: '3rem' }}>
                <span className="section-subtitle">Commercial Strategy</span>
                <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Bulk Discount Architect</h1>
                <p style={{ color: 'var(--color-gray)', marginTop: '0.5rem' }}>Precision price engineering across entire product collections.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
                {/* Configuration Panel */}
                <div style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-gold-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <Zap style={{ color: 'var(--color-gold)' }} />
                        <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Discount Engine</h2>
                    </div>

                    <div style={{ display: 'grid', gap: '2rem' }}>
                        <div>
                            <label className="admin-label">TARGET COLLECTION (CATEGORY)</label>
                            <select 
                                className="newsletter-form input"
                                style={{ width: '100%', padding: '12px' }}
                                value={selectedCategory}
                                onChange={e => setSelectedCategory(e.target.value)}
                            >
                                <option value="">Select a Category...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name} ({cat.productCount} Items)</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label className="admin-label">DISCOUNT PERCENTAGE (%)</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type="number"
                                        className="newsletter-form input"
                                        style={{ width: '100%', padding: '12px 40px 12px 12px' }}
                                        value={discount}
                                        onChange={e => setDiscount(e.target.value)}
                                        min="1"
                                        max="99"
                                    />
                                    <Percent size={16} style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gold)' }} />
                                </div>
                            </div>
                            <div>
                                <label className="admin-label">CAMPAIGN LABEL</label>
                                <input 
                                    className="newsletter-form input"
                                    style={{ width: '100%', padding: '12px' }}
                                    value={season}
                                    onChange={e => setSeason(e.target.value)}
                                    placeholder="e.g. Ramadan Sale"
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem' }}>
                            <button 
                                onClick={() => handleApply('apply')}
                                disabled={processing}
                                className="btn btn-primary" 
                                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                            >
                                {processing ? 'Calculating...' : 'Execute Bulk Discount'}
                            </button>
                            <button 
                                onClick={() => handleApply('clear')}
                                disabled={processing}
                                className="btn btn-dark" 
                                style={{ flex: 1, color: 'var(--color-rose)', borderColor: 'rgba(196, 114, 127, 0.3)' }}
                            >
                                Clear Category
                            </button>
                        </div>
                    </div>
                </div>

                {/* Intelligence & Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ background: 'rgba(201, 169, 110, 0.05)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(201, 169, 110, 0.2)' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Calendar size={18} /> Impact Forecaster
                        </h3>
                        {selectedCatData ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-gray)', fontSize: '0.8rem' }}>Assets Affected:</span>
                                    <span style={{ fontWeight: 'bold' }}>{selectedCatData.productCount} Products</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-gray)', fontSize: '0.8rem' }}>Discount Power:</span>
                                    <span style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>-{discount}%</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: 'var(--color-gray)', fontSize: '0.8rem' }}>Global Sync:</span>
                                    <span style={{ color: '#2ecc71', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <CheckCircle size={12} /> Instant Propagation
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--color-gray)', fontSize: '0.8rem' }}>
                                Select a category to visualize strategy impact.
                            </div>
                        )}
                    </div>

                    <div style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Package size={18} /> Strategy Overview
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-gray)', lineHeight: '1.6' }}>
                            This architect modifies the <b>Sale Price</b> for all assets within the chosen sector. 
                            If a product already has a sale price, it will be overwritten by this new calculation.
                            Clearing a category restores the original luxury price point.
                        </p>
                    </div>
                </div>
            </div>

            {message.text && (
                <div style={{ 
                    position: 'fixed', bottom: '2rem', right: '2rem', padding: '1.25rem 2.5rem', 
                    background: message.type === 'success' ? 'var(--color-gold)' : 'var(--color-rose)',
                    color: '#000', borderRadius: '8px', zIndex: 2000, fontWeight: 'bold', boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(0,0,0,0.1)'
                }}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <Zap size={20} />}
                    {message.text}
                </div>
            )}
        </div>
    );
}
