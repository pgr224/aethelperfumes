'use client';
import { useState, useEffect } from 'react';
import { Layout, Megaphone, Plus, Trash2, Edit2, Save, XCircle, CheckCircle } from 'lucide-react';

export default function MarketingPromos() {
    const [slides, setSlides] = useState([]);
    const [promoSettings, setPromoSettings] = useState({
        promoText: '',
        promoActive: 'false',
        promoLink: ''
    });
    const [loading, setLoading] = useState(true);
    const [isEditingSlide, setIsEditingSlide] = useState(null);
    const [currentSlide, setCurrentSlide] = useState({
        title: '',
        subtitle: '',
        description: '',
        ctaText: 'Shop Now',
        ctaLink: '/products',
        image: '',
        sortOrder: 0
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [slidesRes, settingsRes] = await Promise.all([
                    fetch('/api/hero'),
                    fetch('/api/admin/settings')
                ]);
                const slidesData = await slidesRes.json();
                const settingsData = await settingsRes.json();

                setSlides(slidesData.slides || []);
                if (settingsData.settings) {
                    setPromoSettings({
                        promoText: settingsData.settings.promoText || '',
                        promoActive: String(settingsData.settings.promoActive || 'false'),
                        promoLink: settingsData.settings.promoLink || ''
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const showMsg = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    const handlePromoSave = async () => {
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(promoSettings)
            });
            if (res.ok) showMsg('Promo Bar updated');
        } catch (err) {
            showMsg('Failed to update Promo Bar', 'error');
        }
    };

    const handleSlideSubmit = async (e) => {
        e.preventDefault();
        const method = currentSlide.id ? 'PUT' : 'POST';
        const url = currentSlide.id ? `/api/hero/${currentSlide.id}` : '/api/hero';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentSlide)
            });
            if (res.ok) {
                setIsEditingSlide(null);
                setCurrentSlide({ title: '', subtitle: '', description: '', ctaText: 'Shop Now', ctaLink: '/products', image: '', sortOrder: 0 });
                const updatedSlides = await fetch('/api/hero').then(r => r.json());
                setSlides(updatedSlides.slides || []);
                showMsg('Slide saved');
            }
        } catch (err) {
            showMsg('Failed to save slide', 'error');
        }
    };

    const handleDeleteSlide = async (id) => {
        if (!confirm('Remove this banner?')) return;
        try {
            const res = await fetch(`/api/hero/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSlides(slides.filter(s => s.id !== id));
                showMsg('Slide removed');
            }
        } catch (err) {
            showMsg('Delete failed', 'error');
        }
    };

    if (loading) return <div className="admin-container">Loading Marketing Assets...</div>;

    return (
        <div className="admin-container">
            <div style={{ marginBottom: '3rem' }}>
                <span className="section-subtitle">Storefront Intelligence</span>
                <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Marketing & Promos</h1>
            </div>

            {/* Promo Bar Section */}
            <section style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <Megaphone style={{ color: 'var(--color-gold)' }} />
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Global Announcement Bar</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr auto', gap: '1.5rem', alignItems: 'flex-end' }}>
                    <div>
                        <label className="admin-label">STATUS</label>
                        <select 
                            className="newsletter-form input"
                            style={{ width: '100%', padding: '10px' }}
                            value={promoSettings.promoActive}
                            onChange={e => setPromoSettings({...promoSettings, promoActive: e.target.value})}
                        >
                            <option value="true">Active (Visible)</option>
                            <option value="false">Hidden</option>
                        </select>
                    </div>
                    <div>
                        <label className="admin-label">ANNOUNCEMENT TEXT</label>
                        <input 
                            className="newsletter-form input"
                            style={{ width: '100%', padding: '10px' }}
                            value={promoSettings.promoText}
                            onChange={e => setPromoSettings({...promoSettings, promoText: e.target.value})}
                            placeholder="e.g. EXTRA 15% OFF WITH CODE LUXE15"
                        />
                    </div>
                    <div>
                        <label className="admin-label">TARGET URL (OPTIONAL)</label>
                        <input 
                            className="newsletter-form input"
                            style={{ width: '100%', padding: '10px' }}
                            value={promoSettings.promoLink}
                            onChange={e => setPromoSettings({...promoSettings, promoLink: e.target.value})}
                            placeholder="/products/new-arrivals"
                        />
                    </div>
                    <button onClick={handlePromoSave} className="btn btn-primary" style={{ padding: '12px 25px' }}>
                        Update Bar
                    </button>
                </div>
            </section>

            {/* Hero Slider Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Layout style={{ color: 'var(--color-gold)' }} />
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Hero Banners</h2>
                </div>
                {!isEditingSlide && (
                    <button onClick={() => setIsEditingSlide('new')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Plus size={18} /> New Slide
                    </button>
                )}
            </div>

            {isEditingSlide && (
                <div style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-gold-muted)', marginBottom: '3rem' }}>
                    <h3 style={{ marginBottom: '2rem', color: 'var(--color-gold)' }}>{isEditingSlide === 'new' ? 'Architect New Banner' : 'Edit Banner Asset'}</h3>
                    <form onSubmit={handleSlideSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label className="admin-label">GOLD SUBTITLE</label>
                            <input
                                className="newsletter-form input"
                                style={{ width: '100%', padding: '12px' }}
                                value={currentSlide.subtitle}
                                onChange={e => setCurrentSlide({ ...currentSlide, subtitle: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="admin-label">MAIN TITLE</label>
                            <input
                                className="newsletter-form input"
                                style={{ width: '100%', padding: '12px' }}
                                value={currentSlide.title}
                                onChange={e => setCurrentSlide({ ...currentSlide, title: e.target.value })}
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className="admin-label">PHILOSOPHY (DESCRIPTION)</label>
                            <textarea
                                className="newsletter-form input"
                                style={{ width: '100%', padding: '12px', minHeight: '80px' }}
                                value={currentSlide.description}
                                onChange={e => setCurrentSlide({ ...currentSlide, description: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="admin-label">IMAGE ASSET URL</label>
                            <input
                                className="newsletter-form input"
                                style={{ width: '100%', padding: '12px' }}
                                value={currentSlide.image}
                                onChange={e => setCurrentSlide({ ...currentSlide, image: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="admin-label">CTA LINK</label>
                            <input
                                className="newsletter-form input"
                                style={{ width: '100%', padding: '12px' }}
                                value={currentSlide.ctaLink}
                                onChange={e => setCurrentSlide({ ...currentSlide, ctaLink: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', gridColumn: 'span 2', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Banner</button>
                            <button type="button" onClick={() => setIsEditingSlide(null)} className="btn btn-dark" style={{ flex: 1 }}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2rem' }}>
                {slides.map(slide => (
                    <div key={slide.id} style={{ display: 'flex', background: 'var(--color-black-light)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ width: '150px', position: 'relative' }}>
                            <img src={slide.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                            <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: 'var(--color-gold)', fontSize: '0.6rem', padding: '2px 6px', borderRadius: '4px' }}>
                                #{slide.sortOrder}
                            </div>
                        </div>
                        <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div style={{ color: 'var(--color-gold)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>{slide.subtitle}</div>
                            <h4 style={{ fontSize: '1.1rem', margin: 0, marginBottom: '0.5rem' }}>{slide.title}</h4>
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                                <button onClick={() => { setCurrentSlide(slide); setIsEditingSlide(slide.id); }} style={{ background: 'none', border: 'none', color: 'var(--color-gray-light)', cursor: 'pointer' }}>
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDeleteSlide(slide.id)} style={{ background: 'none', border: 'none', color: 'var(--color-rose)', cursor: 'pointer' }}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {message.text && (
                <div style={{ 
                    position: 'fixed', bottom: '2rem', right: '2rem', padding: '1rem 2rem', 
                    background: message.type === 'success' ? '#2ecc71' : '#e74c3c',
                    color: '#fff', borderRadius: '8px', zIndex: 2000, boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
