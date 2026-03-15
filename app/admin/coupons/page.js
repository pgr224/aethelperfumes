'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CouponsAdmin() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minOrderAmount: '',
        maxDiscount: '',
        usageLimit: '',
        isActive: true
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const res = await fetch('/api/admin/coupons');
            const data = await res.json();
            setCoupons(data.coupons || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const res = await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCoupon)
            });
            const data = await res.json();
            if (res.ok) {
                setMessage('Coupon created successfully');
                setShowForm(false);
                setNewCoupon({
                    code: '',
                    discountType: 'PERCENTAGE',
                    discountValue: '',
                    minOrderAmount: '',
                    maxDiscount: '',
                    usageLimit: '',
                    isActive: true
                });
                fetchCoupons();
            } else {
                setMessage(data.error || 'Failed to create coupon');
            }
        } catch (err) {
            setMessage('An error occurred');
        }
    };

    const toggleCouponStatus = async (id, currentStatus) => {
        try {
            const res = await fetch(`/api/admin/coupons/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) fetchCoupons();
        } catch (err) {
            console.error('Failed to update status', err);
        }
    };

    const deleteCoupon = async (id) => {
        if (!confirm('Are you sure you want to permanently delete this coupon?')) return;
        try {
            const res = await fetch(`/api/admin/coupons/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) fetchCoupons();
            else alert('Failed to delete coupon');
        } catch (err) {
            console.error('Failed to delete', err);
        }
    };

    if (loading) return <div className="admin-container">Loading...</div>;

    return (
        <div className="admin-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <span className="section-subtitle">Promotions</span>
                    <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Coupon Management</h1>
                </div>
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Create New Coupon'}
                </button>
            </div>

            {showForm && (
                <div style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', marginBottom: '3rem', border: '1px solid var(--color-gold-muted)' }}>
                    <h3 style={{ marginBottom: '2rem', color: 'var(--color-gold)' }}>Create New Coupon</h3>
                    <form onSubmit={handleCreate}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
                            <div>
                                <label className="admin-label">COUPON CODE</label>
                                <input 
                                    className="newsletter-form input" 
                                    style={{ width: '100%', padding: '12px' }}
                                    placeholder="e.g. EXTRA10"
                                    value={newCoupon.code}
                                    onChange={e => setNewCoupon({...newCoupon, code: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="admin-label">DISCOUNT TYPE</label>
                                <select 
                                    className="newsletter-form input" 
                                    style={{ width: '100%', padding: '12px' }}
                                    value={newCoupon.discountType}
                                    onChange={e => setNewCoupon({...newCoupon, discountType: e.target.value})}
                                >
                                    <option value="PERCENTAGE">Percentage (%)</option>
                                    <option value="FIXED">Fixed Amount</option>
                                </select>
                            </div>
                            <div>
                                <label className="admin-label">DISCOUNT VALUE</label>
                                <input 
                                    type="number"
                                    className="newsletter-form input" 
                                    style={{ width: '100%', padding: '12px' }}
                                    placeholder="Value"
                                    value={newCoupon.discountValue}
                                    onChange={e => setNewCoupon({...newCoupon, discountValue: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <label className="admin-label">MINIMUM ORDER AMOUNT</label>
                                <input 
                                    type="number"
                                    className="newsletter-form input" 
                                    style={{ width: '100%', padding: '12px' }}
                                    placeholder="Min Amount (Optional)"
                                    value={newCoupon.minOrderAmount}
                                    onChange={e => setNewCoupon({...newCoupon, minOrderAmount: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="admin-label">USAGE LIMIT</label>
                                <input 
                                    type="number"
                                    className="newsletter-form input" 
                                    style={{ width: '100%', padding: '12px' }}
                                    placeholder="Max Uses (Optional)"
                                    value={newCoupon.usageLimit}
                                    onChange={e => setNewCoupon({...newCoupon, usageLimit: e.target.value})}
                                />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <input 
                                    type="checkbox" 
                                    checked={newCoupon.isActive}
                                    onChange={e => setNewCoupon({...newCoupon, isActive: e.target.checked})}
                                />
                                <label>Is Active</label>
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '2rem' }}>Create Coupon</button>
                    </form>
                    {message && <p style={{ marginTop: '1rem', color: message.includes('success') ? '#2ecc71' : '#e74c3c' }}>{message}</p>}
                </div>
            )}

            <div style={{ background: 'var(--color-black-light)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gray)' }}>Code</th>
                            <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gray)' }}>Discount</th>
                            <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gray)' }}>Min Order</th>
                            <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gray)' }}>Used</th>
                            <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gray)' }}>Status</th>
                            <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gray)' }}>Date Created</th>
                            <th style={{ padding: '1.5rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gray)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.map(coupon => (
                            <tr key={coupon.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '1.5rem', fontWeight: 'bold', color: 'var(--color-gold)' }}>{coupon.code}</td>
                                <td style={{ padding: '1.5rem' }}>
                                    {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                </td>
                                <td style={{ padding: '1.5rem' }}>{coupon.minOrderAmount ? `₹${coupon.minOrderAmount}` : 'None'}</td>
                                <td style={{ padding: '1.5rem' }}>{coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : ''}</td>
                                <td style={{ padding: '1.5rem' }}>
                                    <span style={{ 
                                        padding: '4px 8px', 
                                        borderRadius: '4px', 
                                        fontSize: '0.7rem', 
                                        background: coupon.isActive ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                                        color: coupon.isActive ? '#2ecc71' : '#e74c3c'
                                    }}>
                                        {coupon.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td style={{ padding: '1.5rem', color: 'var(--color-gray)', fontSize: '0.85rem' }}>
                                    {new Date(coupon.createdAt).toLocaleDateString()}
                                </td>
                                <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                    <button 
                                        onClick={() => toggleCouponStatus(coupon.id, coupon.isActive)}
                                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 10px', color: 'var(--color-gray)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', marginRight: '5px' }}
                                    >
                                        Toggle
                                    </button>
                                    <button 
                                        onClick={() => deleteCoupon(coupon.id)}
                                        style={{ background: 'transparent', border: '1px solid rgba(231, 76, 60, 0.2)', padding: '5px 10px', color: '#e74c3c', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {coupons.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-gray)' }}>
                        No coupons found. Create your first promotion above.
                    </div>
                )}
            </div>
        </div>
    );
}
