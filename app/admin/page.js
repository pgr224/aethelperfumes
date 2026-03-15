'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [promotions, setPromotions] = useState([]);
    const [selectedPromo, setSelectedPromo] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetch('/api/admin/promotions')
            .then(res => res.json())
            .then(data => setPromotions(data.promotions || []));
    }, []);

    useEffect(() => {
        fetchStats();
    }, [dateRange]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);
            
            const res = await fetch(`/api/admin/stats?${params.toString()}`);
            const json = await res.json();
            setData(json);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePromoSelect = (promoId) => {
        setSelectedPromo(promoId);
        if (!promoId) {
            setDateRange({ startDate: '', endDate: '' });
            return;
        }
        const promo = promotions.find(p => String(p.id) === promoId);
        if (promo) {
            // Format dates for the <input type="date">
            const start = new Date(promo.startDate).toISOString().split('T')[0];
            const end = new Date(promo.endDate).toISOString().split('T')[0];
            setDateRange({ startDate: start, endDate: end });
        }
    };

    if (loading && !data) return <div className="spinner" style={{ margin: '5rem auto' }}></div>;

    const stats = data?.stats || {
        orderCount: 0,
        productCount: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        lowStockCount: 0
    };

    return (
        <div>
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <span className="section-subtitle">Analytics Overview</span>
                    <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Business Intelligence</h1>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    {/* Event Quick-Link */}
                    <div style={{ marginRight: '1rem', borderRight: '1px solid #333', paddingRight: '1.5rem' }}>
                        <span style={{ fontSize: '0.6rem', color: 'var(--color-gold)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Load Event Timeline</span>
                        <select 
                            className="newsletter-form input" 
                            style={{ padding: '6px 10px', fontSize: '0.8rem', minWidth: '180px' }}
                            value={selectedPromo}
                            onChange={(e) => handlePromoSelect(e.target.value)}
                        >
                            <option value="">Custom Range...</option>
                            {promotions.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.status})</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.6rem', color: 'var(--color-gray)', textTransform: 'uppercase' }}>From</span>
                        <input 
                            type="date" 
                            value={dateRange.startDate}
                            className="newsletter-form input" 
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }} 
                            onChange={e => setDateRange({...dateRange, startDate: e.target.value})}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.6rem', color: 'var(--color-gray)', textTransform: 'uppercase' }}>To</span>
                        <input 
                            type="date" 
                            value={dateRange.endDate}
                            className="newsletter-form input" 
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }} 
                            onChange={e => setDateRange({...dateRange, endDate: e.target.value})}
                        />
                    </div>
                    <button 
                        onClick={() => {
                            setDateRange({startDate: '', endDate: ''});
                            setSelectedPromo('');
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--color-gray)', fontSize: '0.7rem', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        Reset
                    </button>
                    <div style={{ color: 'var(--color-gray)', fontSize: '0.7rem', borderLeft: '1px solid #333', paddingLeft: '1.5rem' }}>
                        LIVE: {new Date().toLocaleTimeString()}
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <MetricCard 
                    label="Total Revenue" 
                    value={`₹${stats.totalRevenue.toLocaleString()}`} 
                    color="var(--color-gold)"
                />
                <MetricCard 
                    label="Total Orders" 
                    value={stats.orderCount} 
                />
                <MetricCard 
                    label="Pending Orders" 
                    value={stats.pendingOrders} 
                    color={stats.pendingOrders > 0 ? 'var(--color-gold)' : 'inherit'}
                />
                <MetricCard 
                    label="Low Stock Alerts" 
                    value={stats.lowStockCount} 
                    color={stats.lowStockCount > 0 ? 'var(--color-rose)' : 'inherit'}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Product Performance Heatmap */}
                <div style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem' }}>Product Performance Heatmap</h3>
                        <div style={{ color: 'var(--color-gold)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Top by Revenue</div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {data?.topProducts?.length > 0 ? (
                            data.topProducts.map(product => (
                                <div key={product.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <img src={product.image} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} alt="" />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{product.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-gray)' }}>{product.units} units sold</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: 'var(--color-gold)', fontWeight: '600' }}>₹{product.revenue.toLocaleString()}</div>
                                        <div style={{ height: '4px', background: 'rgba(201, 169, 110, 0.2)', width: '60px', marginTop: '4px', borderRadius: '2px' }}>
                                            <div style={{ 
                                                height: '100%', 
                                                background: 'var(--color-gold)', 
                                                borderRadius: '2px',
                                                width: `${(product.revenue / data.topProducts[0].revenue) * 100}%` 
                                            }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-gray)' }}>No product data for this period.</div>
                        )}
                    </div>
                    
                    <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'center' }}>
                        <button 
                            onClick={() => {
                                const params = new URLSearchParams();
                                if (dateRange.startDate) params.append('startDate', dateRange.startDate);
                                if (dateRange.endDate) params.append('endDate', dateRange.endDate);
                                window.location.href = `/api/admin/reports/csv?${params.toString()}`;
                            }}
                            className="btn btn-outline"
                            style={{ width: '100%', borderColor: 'var(--color-gold)', color: 'var(--color-gold)', fontSize: '0.8rem' }}
                        >
                            Architect CSV Intelligence Report
                        </button>
                    </div>
                </div>

                {/* Recent Orders Section */}
                <div style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.2rem' }}>Recent Activity</h3>
                        <Link href="/admin/orders" style={{ fontSize: '0.75rem', color: 'var(--color-gold)', textTransform: 'uppercase' }}>View All</Link>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {data?.recentOrders?.length > 0 ? (
                            data.recentOrders.map(order => (
                                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                    <div>
                                        <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{order.firstName} {order.lastName}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-gray)' }}>{order.orderNumber} • {new Date(order.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: 'var(--color-gold)', fontWeight: '600' }}>₹{order.total.toLocaleString()}</div>
                                        <div style={{ fontSize: '0.6rem', background: 'rgba(201, 169, 110, 0.1)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>{order.status}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-gray)' }}>No recent orders found.</div>
                        )}
                    </div>
                </div>

                {/* Quick Shortcuts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Management</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <ShortcutLink href="/admin/inventory" label="Inventory & Stock" />
                            <ShortcutLink href="/admin/hero" label="Marketing Banners" />
                            <ShortcutLink href="/admin/blog" label="Content Pipeline" />
                            <ShortcutLink href="/admin/settings" label="Global Settings" />
                        </div>
                    </div>

                    <div style={{ background: 'rgba(201, 169, 110, 0.05)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(201, 169, 110, 0.2)' }}>
                        <h4 style={{ color: 'var(--color-gold)', marginBottom: '1rem' }}>Storefront Status</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '10px', height: '10px', background: '#2ecc71', borderRadius: '50%', boxShadow: '0 0 10px #2ecc71' }}></div>
                            <span style={{ fontSize: '0.9rem' }}>Live & Accepting Orders</span>
                        </div>
                        <a href="/" target="_blank" className="btn btn-sm btn-dark" style={{ marginTop: '1.5rem', width: '100%' }}>Launch Storefront</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, color = 'var(--color-white)' }) {
    return (
        <div style={{ 
            background: 'var(--color-black-light)', 
            padding: '2rem', 
            borderRadius: 'var(--border-radius-lg)', 
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: 'var(--shadow-sm)'
        }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-gray)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</span>
            <div style={{ fontSize: '2rem', color: color, fontWeight: '600', marginTop: '0.5rem' }}>{value}</div>
        </div>
    );
}

function ShortcutLink({ href, label }) {
    return (
        <Link href={href} style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '1rem', 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: '8px',
            color: 'var(--color-white)',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'all 0.3s'
        }} className="shortcut-link">
            {label}
            <span style={{ color: 'var(--color-gold)' }}>→</span>
        </Link>
    );
}
