'use client';
import { useState, useEffect } from 'react';

export default function NewsletterAdmin() {
    const [subscribers, setSubscribers] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [composing, setComposing] = useState(false);
    const [message, setMessage] = useState('');
    const [form, setForm] = useState({
        subject: '',
        content: '',
        couponCode: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [subRes, coupRes] = await Promise.all([
                fetch('/api/admin/newsletter'),
                fetch('/api/admin/coupons')
            ]);
            const subData = await subRes.json();
            const coupData = await coupRes.json();
            setSubscribers(subData.subscribers || []);
            setCoupons(coupData.coupons || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        setComposing(true);
        setMessage('');
        try {
            const res = await fetch('/api/admin/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (res.ok) {
                setMessage(data.message);
                setForm({ subject: '', content: '', couponCode: '' });
            } else {
                setMessage(data.error);
            }
        } catch (err) {
            setMessage('Error sending newsletter');
        } finally {
            setComposing(false);
        }
    };

    if (loading) return <div className="admin-container">Loading Newsletter Engine...</div>;

    return (
        <div className="admin-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <span className="section-subtitle">Communications</span>
                    <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Newsletter Engine</h1>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                {/* Composer */}
                <div style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-gold-muted)' }}>
                    <h3 style={{ marginBottom: '2rem', color: 'var(--color-gold)' }}>Compose Broadcast</h3>
                    <form onSubmit={handleSend}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label">EMAIL SUBJECT</label>
                            <input 
                                className="newsletter-form input" 
                                style={{ width: '100%', padding: '12px' }}
                                placeholder="e.g. Exclusive Aethel Access: New Seasonal Arrivals"
                                value={form.subject}
                                onChange={e => setForm({...form, subject: e.target.value})}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label">ATTACH COUPON (OPTIONAL)</label>
                            <select 
                                className="newsletter-form input" 
                                style={{ width: '100%', padding: '12px' }}
                                value={form.couponCode}
                                onChange={e => setForm({...form, couponCode: e.target.value})}
                            >
                                <option value="">No Coupon</option>
                                {coupons.filter(c => c.isActive).map(coupon => (
                                    <option key={coupon.id} value={coupon.code}>
                                        {coupon.code} ({coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `$${coupon.discountValue}`} off)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label">MESSAGE CONTENT</label>
                            <textarea 
                                className="newsletter-form input" 
                                style={{ width: '100%', padding: '12px', minHeight: '250px', lineHeight: '1.6' }}
                                placeholder="Write your luxury announcement here..."
                                value={form.content}
                                onChange={e => setForm({...form, content: e.target.value})}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary btn-lg" 
                            style={{ width: '100%' }}
                            disabled={composing}
                        >
                            {composing ? 'Broadcasting...' : `Send to ${subscribers.length} Subscribers`}
                        </button>
                    </form>
                    {message && (
                        <div style={{ 
                            marginTop: '1.5rem', 
                            padding: '1rem', 
                            background: message.includes('Error') ? 'rgba(231, 76, 60, 0.1)' : 'rgba(46, 204, 113, 0.1)',
                            color: message.includes('Error') ? '#e74c3c' : '#2ecc71',
                            borderRadius: '4px',
                            textAlign: 'center',
                            border: `1px solid ${message.includes('Error') ? '#e74c3c' : '#2ecc71'}`
                        }}>
                            {message}
                        </div>
                    )}
                </div>

                {/* Subscriber List */}
                <div style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Audience ({subscribers.length})</h3>
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {subscribers.map(sub => (
                            <div key={sub.id} style={{ padding: '0.85rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--color-gray-light)' }}>{sub.email}</span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--color-gray)' }}>
                                    {new Date(sub.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                        {subscribers.length === 0 && (
                            <p style={{ color: 'var(--color-gray)', textAlign: 'center', marginTop: '2rem' }}>No subscribers yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
