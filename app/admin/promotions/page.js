'use client';
import { useState, useEffect } from 'react';
import { Calendar, Clock, Tag, Zap, Plus, Trash2, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';

export default function PromotionsScheduler() {
    const [promotions, setPromotions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newPromo, setNewPromo] = useState({
        name: '',
        discountPercentage: '10',
        categoryId: '',
        startDate: '',
        endDate: '',
        bannerTitle: '',
        bannerSubtitle: '',
        bannerImage: ''
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [promosRes, catsRes] = await Promise.all([
                    fetch('/api/admin/promotions'),
                    fetch('/api/admin/categories')
                ]);
                const promosData = await promosRes.json();
                const catsData = await catsRes.json();
                setPromotions(promosData.promotions || []);
                setCategories(catsData.categories || []);
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
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/promotions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPromo)
            });
            if (res.ok) {
                setIsAdding(false);
                setNewPromo({ name: '', discountPercentage: '10', categoryId: '', startDate: '', endDate: '', bannerTitle: '', bannerSubtitle: '', bannerImage: '' });
                const updated = await fetch('/api/admin/promotions').then(r => r.json());
                setPromotions(updated.promotions || []);
                showMsg('Promotion Scheduled Successfully');
            }
        } catch (err) {
            showMsg('Failed to schedule promotion', 'error');
        }
    };

    if (loading) return <div className="admin-container">Decrypting Marketing Schedules...</div>;

    return (
        <div className="admin-container">
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <span className="section-subtitle">Commercial Calendar</span>
                    <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Promotion Scheduler</h1>
                </div>
                <button onClick={() => setIsAdding(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Plus size={18} /> Schedule Event
                </button>
            </div>

            {isAdding && (
                <div style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-gold)', marginBottom: '3rem' }}>
                    <h3 style={{ marginBottom: '2rem', color: 'var(--color-gold)' }}>Architect New Event</h3>
                    <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className="admin-label">EVENT NAME</label>
                            <input className="newsletter-form input" style={{ width: '100%', padding: '12px' }} value={newPromo.name} onChange={e => setNewPromo({...newPromo, name: e.target.value})} placeholder="e.g. Eid-ul-Fitr Grand Sale" required />
                        </div>
                        <div>
                            <label className="admin-label">DISCOUNT (%)</label>
                            <input type="number" className="newsletter-form input" style={{ width: '100%', padding: '12px' }} value={newPromo.discountPercentage} onChange={e => setNewPromo({...newPromo, discountPercentage: e.target.value})} required />
                        </div>
                        <div>
                            <label className="admin-label">TARGET COLLECTION</label>
                            <select className="newsletter-form input" style={{ width: '100%', padding: '12px' }} value={newPromo.categoryId} onChange={e => setNewPromo({...newPromo, categoryId: e.target.value})}>
                                <option value="">Global (All Products)</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="admin-label">START DATE</label>
                            <input type="datetime-local" className="newsletter-form input" style={{ width: '100%', padding: '12px' }} value={newPromo.startDate} onChange={e => setNewPromo({...newPromo, startDate: e.target.value})} required />
                        </div>
                        <div>
                            <label className="admin-label">END DATE</label>
                            <input type="datetime-local" className="newsletter-form input" style={{ width: '100%', padding: '12px' }} value={newPromo.endDate} onChange={e => setNewPromo({...newPromo, endDate: e.target.value})} required />
                        </div>

                        <div style={{ gridColumn: 'span 3', borderTop: '1px solid #222', paddingTop: '1.5rem', marginTop: '1rem' }}>
                            <h4 style={{ fontSize: '0.9rem', marginBottom: '1.5rem', color: 'var(--color-gray)' }}>DYNAMIC HERO SYNC (OPTIONAL)</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label className="admin-label">BANNER TITLE</label>
                                    <input className="newsletter-form input" style={{ width: '100%', padding: '12px' }} value={newPromo.bannerTitle} onChange={e => setNewPromo({...newPromo, bannerTitle: e.target.value})} />
                                </div>
                                <div>
                                    <label className="admin-label">BANNER SUBTITLE</label>
                                    <input className="newsletter-form input" style={{ width: '100%', padding: '12px' }} value={newPromo.bannerSubtitle} onChange={e => setNewPromo({...newPromo, bannerSubtitle: e.target.value})} />
                                </div>
                                <div>
                                    <label className="admin-label">BANNER IMAGE URL</label>
                                    <input className="newsletter-form input" style={{ width: '100%', padding: '12px' }} value={newPromo.bannerImage} onChange={e => setNewPromo({...newPromo, bannerImage: e.target.value})} />
                                </div>
                            </div>
                        </div>

                        <div style={{ gridColumn: 'span 3', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Deploy Schedule</button>
                            <button type="button" onClick={() => setIsAdding(false)} className="btn btn-dark" style={{ flex: 1 }}>Abort</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {promotions.map(promo => (
                    <div key={promo.id} style={{ 
                        background: 'var(--color-black-light)', 
                        padding: '1.5rem 2rem', 
                        borderRadius: 'var(--border-radius-lg)', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                            <div style={{ 
                                width: '50px', 
                                height: '50px', 
                                background: promo.status === 'active' ? 'var(--color-gold)' : 'rgba(255,255,255,0.05)', 
                                borderRadius: '50%', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: promo.status === 'active' ? '#000' : 'var(--color-gray)'
                            }}>
                                {promo.status === 'active' ? <Zap size={24} /> : <Clock size={24} />}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{promo.name} <span style={{ color: 'var(--color-gold)', fontSize: '0.8rem', marginLeft: '10px' }}>-{promo.discountPercentage}%</span></h3>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-gray)', marginTop: '5px', display: 'flex', gap: '15px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={12} /> {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}</span>
                                    <span style={{ textTransform: 'uppercase', color: promo.status === 'active' ? '#2ecc71' : 'var(--color-gray-light)' }}>● {promo.status}</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {promo.bannerTitle && (
                                <div style={{ fontSize: '0.6rem', padding: '4px 8px', background: 'rgba(201, 169, 110, 0.1)', color: 'var(--color-gold)', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <RefreshCw size={10} /> AUTO BANNER ENABLED
                                </div>
                            )}
                            <button style={{ background: 'none', border: 'none', color: 'var(--color-rose)', cursor: 'pointer' }}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
