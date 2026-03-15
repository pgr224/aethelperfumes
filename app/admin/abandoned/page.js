'use client';
import { useState, useEffect } from 'react';
import { Ghost, AlertCircle, Mail, DollarSign, Clock, ShoppingCart, ArrowRight, ExternalLink } from 'lucide-react';

export default function AbandonedAnalytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(null); // ID of order/cart being sent recovery

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/abandoned');
            const result = await res.json();
            setData(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRecovery = async (orderId, email) => {
        setSending(orderId);
        // Simulate sending email
        setTimeout(() => {
            console.log(`--- RECOVERY EMAIL SENT ---`);
            console.log(`To: ${email}`);
            console.log(`Context: Abandoned Order ${orderId}`);
            console.log(`Offer: 10% discount code RECOVER10 included.`);
            console.log(`----------------------------`);
            setSending(null);
            alert(`Recovery sequence initiated for ${email}. Luxury incentive (10% OFF) dispatched.`);
        }, 1500);
    };

    if (loading) return <div className="admin-container">Decrypting Abandoned Signals...</div>;

    return (
        <div className="admin-container">
            <div style={{ marginBottom: '3rem' }}>
                <span className="section-subtitle">Revenue Recovery</span>
                <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Abandoned Intelligence</h1>
                <p style={{ color: 'var(--color-gray)', marginTop: '0.5rem' }}>Identifying unfulfilled desires and dormant luxury carts.</p>
            </div>

            {/* Statistics Dashboard */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem' }}>
                <div style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--color-gray)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Abandoned Orders</span>
                        <AlertCircle size={18} color="var(--color-gold)" />
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.stats.abandonedCount}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-gray)', marginTop: '0.5rem' }}>Orders stuck in 'Pending' &gt; 2h</div>
                </div>
                <div style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--color-gray)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Lost Revenue Potential</span>
                        <DollarSign size={18} color="#2ecc71" />
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-gold)' }}>₹{data.stats.lostRevenueRevenue.toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-gray)', marginTop: '0.5rem' }}>Total value of unfulfilled orders</div>
                </div>
                <div style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--color-gray)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Silent Carts</span>
                        <Ghost size={18} color="var(--color-gray-light)" />
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.stats.staleCartCount}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-gray)', marginTop: '0.5rem' }}>Anonymous sessions with items &gt; 4h</div>
                </div>
            </div>

            {/* Automation Tools */}
            <div style={{ background: 'rgba(201, 169, 110, 0.05)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-gold-muted)', marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '1.1rem', margin: 0, color: 'var(--color-gold)' }}>Predictive Stock Guard</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)', marginTop: '0.4rem' }}>
                        Automatically release inventory reserved for abandoned 'Pending' orders. Current threshold: <b>{data?.settings?.stockExpiryHours || 24} Hours</b>.
                    </p>
                </div>
                <button 
                    onClick={async () => {
                        if(!confirm('Release all expired stock locks? This will cancel expired pending orders.')) return;
                        const res = await fetch('/api/admin/inventory/cleanup', { method: 'POST' });
                        const result = await res.json();
                        alert(result.message || result.error);
                        fetchData();
                    }}
                    className="btn btn-outline" 
                    style={{ borderColor: 'var(--color-gold)', color: 'var(--color-gold)' }}
                >
                    Run Stock Release Sequence
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
                {/* Abandoned Orders Table */}
                <div>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Mail size={20} /> Unfulfilled Intention Log
                    </h3>
                    <div style={{ background: 'var(--color-black-light)', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                                    <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.7rem', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Target</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.7rem', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Intel</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.7rem', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Value</th>
                                    <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.7rem', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.abandonedOrders.length === 0 ? (
                                    <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray)' }}>No abandoned orders detected. Optimization successful.</td></tr>
                                ) : data.abandonedOrders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{order.firstName} {order.lastName}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-gray)' }}>{order.email}</div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <div style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                <Clock size={12} /> {Math.round((Date.now() - new Date(order.createdAt)) / (1000 * 60 * 60))}h ago
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--color-gray)' }}>{order.items.length} assets</div>
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem', color: 'var(--color-gold)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                            ₹{order.total.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                            <button 
                                                onClick={() => handleRecovery(order.id, order.email)}
                                                className="btn btn-sm"
                                                disabled={sending === order.id}
                                                style={{ 
                                                    background: 'var(--color-gold)', 
                                                    color: '#000', 
                                                    fontSize: '0.65rem',
                                                    padding: '6px 12px',
                                                    borderRadius: '4px',
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}
                                            >
                                                {sending === order.id ? 'Engaging...' : 'Trigger Recovery'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Silent Carts List */}
                <div>
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShoppingCart size={20} /> Dormant Cart Radar
                    </h3>
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {data.staleCarts.length === 0 ? (
                            <div style={{ padding: '2rem', background: 'var(--color-black-light)', borderRadius: 'var(--border-radius-lg)', color: 'var(--color-gray)', textAlign: 'center', fontSize: '0.8rem' }}>
                                No stale sessions detected.
                            </div>
                        ) : data.staleCarts.map(cart => (
                            <div key={cart.sessionId} style={{ background: 'var(--color-black-light)', padding: '1.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--color-gray)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px' }}>
                                        SESSION ID: ...{cart.sessionId.slice(-8)}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 'bold' }}>
                                        ₹{cart.total.toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    {cart.items.map(item => (
                                        <div key={item.id} style={{ fontSize: '0.75rem', color: 'var(--color-gray-light)', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span>{item.quantity}x {item.product.name}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--color-gray)' }}>
                                        Last active: {new Date(cart.lastActivity).toLocaleTimeString()}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--color-gold)', opacity: 0.6 }}>
                                        Awaiting conversion
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
