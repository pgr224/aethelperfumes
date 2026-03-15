'use client';
import { useState, useEffect } from 'react';

const STATUS_PIPELINE = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
const ALL_STATUSES = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'cancel_requested', 'return_requested'];

const STATUS_LABELS = {
    pending: 'Pending',
    processing: 'Processing',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    cancel_requested: 'Cancel Requested',
    return_requested: 'Return Requested'
};

const VALID_TRANSITIONS = {
    pending: ['processing', 'cancelled', 'cancel_requested'],
    processing: ['shipped', 'cancelled', 'cancel_requested'],
    cancel_requested: ['cancelled', 'processing'],
    shipped: ['out_for_delivery', 'delivered'],
    out_for_delivery: ['delivered'],
    delivered: ['return_requested'],
    return_requested: ['delivered'],
    cancelled: []
};

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [filters, setFilters] = useState({
        search: '',
        status: 'all',
        city: '',
        minTotal: '',
        maxTotal: '',
        startDate: '',
        endDate: ''
    });
    const [editData, setEditData] = useState({
        status: '',
        trackingNumber: '',
        carrier: '',
        estimatedDelivery: ''
    });

    const [settings, setSettings] = useState({ currencySymbol: '₹' });

    useEffect(() => {
        const timeoutId = setTimeout(fetchOrders, 300);
        return () => clearTimeout(timeoutId);
    }, [filters]);

    useEffect(() => {
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                if (data.settings) setSettings(data.settings);
            });
    }, []);

    const fetchOrders = () => {
        setLoading(true);
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });

        fetch(`/api/admin/orders?${params.toString()}`)
            .then(res => res.json())
            .then(data => {
                setOrders(data.orders || []);
                setLoading(false);
            });
    };

    const handleSelect = (order) => {
        setSelectedOrder(order);
        setShowHistory(false);
        setShowCancelModal(false);
        setCancelReason('');
        setEditData({
            status: order.status,
            trackingNumber: order.trackingNumber || '',
            carrier: order.carrier || '',
            estimatedDelivery: order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split('T')[0] : ''
        });
    };

    const handleUpdate = async () => {
        if (editData.status === 'cancelled' || editData.status === 'cancel_requested') {
            setShowCancelModal(true);
            return;
        }
        await executeUpdate(editData);
    };

    const handleCancelConfirm = async () => {
        await executeUpdate({ ...editData, cancelReason });
        setShowCancelModal(false);
        setCancelReason('');
    };

    const executeUpdate = async (data) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                // Refresh the order in the list
                fetchOrders();
                setSelectedOrder({ ...selectedOrder, ...data, statusHistory: result.order?.statusHistory });
                setEditData({ ...editData, ...data });
            } else {
                alert(result.error || 'Failed to update order');
            }
        } catch (err) {
            console.error(err);
            alert('Network error');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'processing': return '#f39c12';
            case 'shipped': return '#3498db';
            case 'out_for_delivery': return '#e67e22';
            case 'delivered': return '#2ecc71';
            case 'cancelled': return '#e74c3c';
            case 'cancel_requested': return '#e74c3c';
            case 'return_requested': return '#9b59b6';
            default: return 'var(--color-gold)';
        }
    };

    const getPaymentIcon = (method) => {
        switch(method) {
            case 'CREDIT_CARD': return '💳 Stripe';
            case 'PAYPAL': return '🅿️ PayPal';
            case 'COD': return '💵 COD';
            default: return '📱 UPI';
        }
    };

    const getValidNextStatuses = (currentStatus) => {
        return VALID_TRANSITIONS[currentStatus] || [];
    };

    const parseHistory = (json) => {
        if (!json) return [];
        try { return JSON.parse(json); } catch { return []; }
    };

    const getPipelineIndex = (status) => STATUS_PIPELINE.indexOf(status);

    return (
        <div className="admin-container">
            <div style={{ marginBottom: '3rem' }}>
                <span className="section-subtitle">Fulfillment</span>
                <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Logistics Command Center</h1>
            </div>

            {/* Advanced Filters */}
            <div className="card-glass" style={{ 
                padding: '2rem', 
                marginBottom: '2rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.5rem'
            }}>
                <div style={{ gridColumn: 'span 2' }}>
                    <label className="admin-label">Search Identity (ID, Email, Name)</label>
                    <input 
                        className="newsletter-form input" 
                        style={{ width: '100%', padding: '10px' }}
                        placeholder="Search..."
                        value={filters.search}
                        onChange={e => setFilters({...filters, search: e.target.value})}
                    />
                </div>
                <div>
                    <label className="admin-label">Status Protocol</label>
                    <select 
                        className="newsletter-form input" 
                        style={{ width: '100%', padding: '10px' }}
                        value={filters.status}
                        onChange={e => setFilters({...filters, status: e.target.value})}
                    >
                        <option value="all">All Statuses</option>
                        {ALL_STATUSES.map(s => (
                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="admin-label">Target City</label>
                    <input 
                        className="newsletter-form input" 
                        style={{ width: '100%', padding: '10px' }}
                        placeholder="City name"
                        value={filters.city}
                        onChange={e => setFilters({...filters, city: e.target.value})}
                    />
                </div>
                <div>
                    <label className="admin-label">Financial Floor</label>
                    <input 
                        type="number"
                        className="newsletter-form input" 
                        style={{ width: '100%', padding: '10px' }}
                        placeholder="0"
                        value={filters.minTotal}
                        onChange={e => setFilters({...filters, minTotal: e.target.value})}
                    />
                </div>
                <div>
                    <label className="admin-label">Financial Ceiling</label>
                    <input 
                        type="number"
                        className="newsletter-form input" 
                        style={{ width: '100%', padding: '10px' }}
                        placeholder="100000"
                        value={filters.maxTotal}
                        onChange={e => setFilters({...filters, maxTotal: e.target.value})}
                    />
                </div>
                <div>
                    <label className="admin-label">Date Origin</label>
                    <input 
                        type="date"
                        className="newsletter-form input" 
                        style={{ width: '100%', padding: '10px' }}
                        value={filters.startDate}
                        onChange={e => setFilters({...filters, startDate: e.target.value})}
                    />
                </div>
                <div>
                    <label className="admin-label">Date Horizon</label>
                    <input 
                        type="date"
                        className="newsletter-form input" 
                        style={{ width: '100%', padding: '10px' }}
                        value={filters.endDate}
                        onChange={e => setFilters({...filters, endDate: e.target.value})}
                    />
                </div>
                <div style={{ gridColumn: 'span 4', textAlign: 'right' }}>
                    <button 
                        onClick={() => setFilters({
                            search: '', status: 'all', city: '', minTotal: '', maxTotal: '', startDate: '', endDate: ''
                        })}
                        style={{ background: 'none', border: 'none', color: 'var(--color-rose)', fontSize: '0.75rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    >
                        Reset All Vectors
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 480px' : '1fr', gap: '2rem', alignItems: 'start' }}>
                <div style={{ 
                    background: 'var(--color-black-light)', 
                    borderRadius: 'var(--border-radius-lg)', 
                    border: '1px solid rgba(255,255,255,0.05)', 
                    overflow: 'hidden' 
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                                <th style={{ padding: '1.5rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-gray)', letterSpacing: '0.1em' }}>Order ID</th>
                                <th style={{ padding: '1.5rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-gray)', letterSpacing: '0.1em' }}>Recipient</th>
                                <th style={{ padding: '1.5rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-gray)', letterSpacing: '0.1em' }}>Intelligence</th>
                                <th style={{ padding: '1.5rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-gray)', letterSpacing: '0.1em' }}>Financial</th>
                                <th style={{ padding: '1.5rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-gray)', letterSpacing: '0.1em' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray)' }}>No orders found.</td></tr>
                            ) : orders.map((order) => (
                                <tr 
                                    key={order.id} 
                                    onClick={() => handleSelect(order)}
                                    style={{ 
                                        borderBottom: '1px solid rgba(255,255,255,0.03)', 
                                        cursor: 'pointer',
                                        background: selectedOrder?.id === order.id ? 'rgba(201, 169, 110, 0.05)' : 'transparent',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <td style={{ padding: '1.25rem 2rem', fontSize: '0.85rem' }}>
                                        <div style={{ fontWeight: '700', color: 'var(--color-gold)' }}>{order.orderNumber}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--color-gray)', marginTop: '4px' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem', fontSize: '0.85rem' }}>
                                        {order.firstName} {order.lastName}
                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-gray)' }}>{order.email}</div>
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem', fontSize: '0.8rem' }}>
                                        {order.items.length} items
                                        {order.trackingNumber && <div style={{ fontSize: '0.65rem', color: '#3498db' }}>Tracking Assigned</div>}
                                        {order.status === 'cancel_requested' && <div style={{ fontSize: '0.65rem', color: '#e74c3c', fontWeight: '700' }}>⚠ CANCEL REQUEST</div>}
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                        {settings.currencySymbol}{order.total.toLocaleString()}
                                        <div style={{ fontSize: '0.65rem', color: 'var(--color-gray)', marginTop: '4px', fontWeight: 'normal' }}>
                                            {getPaymentIcon(order.paymentMethod)}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.25rem 2rem' }}>
                                        <span style={{
                                            fontSize: '0.6rem',
                                            padding: '4px 10px',
                                            borderRadius: '4px',
                                            background: `${getStatusColor(order.status)}1a`,
                                            color: getStatusColor(order.status),
                                            textTransform: 'uppercase',
                                            fontWeight: '700',
                                            border: `1px solid ${getStatusColor(order.status)}33`
                                        }}>
                                            {STATUS_LABELS[order.status] || order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {selectedOrder && (
                    <div style={{ position: 'sticky', top: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* STATUS PIPELINE STEPPER */}
                        <div style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <h4 style={{ fontSize: '0.7rem', color: 'var(--color-gray)', textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '0.1em' }}>Logistics Pipeline</h4>
                            
                            {(selectedOrder.status === 'cancelled' || selectedOrder.status === 'cancel_requested') ? (
                                <div style={{ textAlign: 'center', padding: '1rem' }}>
                                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{selectedOrder.status === 'cancelled' ? '❌' : '⏳'}</div>
                                    <div style={{ color: getStatusColor(selectedOrder.status), fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                        {STATUS_LABELS[selectedOrder.status]}
                                    </div>
                                    {selectedOrder.cancelReason && (
                                        <div style={{ color: 'var(--color-gray)', fontSize: '0.75rem', marginTop: '0.5rem' }}>Reason: {selectedOrder.cancelReason}</div>
                                    )}
                                    {selectedOrder.cancelledBy && (
                                        <div style={{ color: 'var(--color-gray)', fontSize: '0.7rem', marginTop: '0.25rem' }}>By: {selectedOrder.cancelledBy}</div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                                    {STATUS_PIPELINE.map((step, i) => {
                                        const currentIdx = getPipelineIndex(selectedOrder.status);
                                        const isCompleted = i <= currentIdx;
                                        const isCurrent = i === currentIdx;
                                        const color = isCompleted ? '#2ecc71' : 'rgba(255,255,255,0.15)';
                                        return (
                                            <div key={step} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                                                {i > 0 && (
                                                    <div style={{
                                                        position: 'absolute', top: '12px', left: '-50%', right: '50%', height: '2px',
                                                        background: isCompleted ? '#2ecc71' : 'rgba(255,255,255,0.1)'
                                                    }} />
                                                )}
                                                <div style={{
                                                    width: '24px', height: '24px', borderRadius: '50%', margin: '0 auto',
                                                    background: isCurrent ? '#2ecc71' : isCompleted ? 'rgba(46,204,113,0.3)' : 'rgba(255,255,255,0.05)',
                                                    border: `2px solid ${color}`,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.6rem', color: '#fff', position: 'relative', zIndex: 1,
                                                    boxShadow: isCurrent ? '0 0 12px rgba(46,204,113,0.4)' : 'none'
                                                }}>
                                                    {isCompleted ? '✓' : i + 1}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.55rem', color: isCompleted ? '#2ecc71' : 'var(--color-gray)',
                                                    marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.05em',
                                                    fontWeight: isCurrent ? '700' : '400'
                                                }}>{STATUS_LABELS[step]}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Fulfillment Control */}
                        <div style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Fulfillment Control</h3>
                                <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: 'var(--color-gray)', cursor: 'pointer' }}>✕</button>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label className="admin-label">Advance Status</label>
                                    <select 
                                        className="newsletter-form input" 
                                        style={{ width: '100%', padding: '10px' }}
                                        value={editData.status}
                                        onChange={e => setEditData({...editData, status: e.target.value})}
                                    >
                                        <option value={selectedOrder.status}>{STATUS_LABELS[selectedOrder.status]} (Current)</option>
                                        {getValidNextStatuses(selectedOrder.status).map(s => (
                                            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                                        ))}
                                    </select>
                                    {getValidNextStatuses(selectedOrder.status).length === 0 && (
                                        <p style={{ color: 'var(--color-gray)', fontSize: '0.7rem', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                            This order is in a terminal state. No further transitions allowed.
                                        </p>
                                    )}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="admin-label">Carrier</label>
                                        <input 
                                            className="newsletter-form input" 
                                            style={{ width: '100%', padding: '10px' }}
                                            placeholder="Blue Dart, DTDC..."
                                            value={editData.carrier}
                                            onChange={e => setEditData({...editData, carrier: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="admin-label">Tracking #</label>
                                        <input 
                                            className="newsletter-form input" 
                                            style={{ width: '100%', padding: '10px' }}
                                            placeholder="Tracking ID"
                                            value={editData.trackingNumber}
                                            onChange={e => setEditData({...editData, trackingNumber: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="admin-label">Estimated Delivery</label>
                                    <input 
                                        type="date"
                                        className="newsletter-form input" 
                                        style={{ width: '100%', padding: '10px' }}
                                        value={editData.estimatedDelivery}
                                        onChange={e => setEditData({...editData, estimatedDelivery: e.target.value})}
                                    />
                                </div>

                                <button 
                                    onClick={handleUpdate} 
                                    className="btn btn-primary btn-full" 
                                    disabled={updating || editData.status === selectedOrder.status}
                                    style={{ opacity: editData.status === selectedOrder.status ? 0.5 : 1 }}
                                >
                                    {updating ? 'Synchronizing...' : 'Advance Pipeline'}
                                </button>
                            </div>
                        </div>

                        {/* STATUS HISTORY TIMELINE */}
                        <div style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <button 
                                onClick={() => setShowHistory(!showHistory)}
                                style={{ 
                                    background: 'none', border: 'none', color: 'var(--color-gold)', cursor: 'pointer',
                                    fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%'
                                }}
                            >
                                {showHistory ? '▾' : '▸'} Status Audit Trail ({parseHistory(selectedOrder.statusHistory).length} entries)
                            </button>
                            
                            {showHistory && (
                                <div style={{ marginTop: '1.5rem', paddingLeft: '1rem', borderLeft: '2px solid rgba(201,169,110,0.2)' }}>
                                    {parseHistory(selectedOrder.statusHistory).length === 0 ? (
                                        <p style={{ color: 'var(--color-gray)', fontSize: '0.8rem', fontStyle: 'italic' }}>No history recorded yet.</p>
                                    ) : (
                                        parseHistory(selectedOrder.statusHistory).reverse().map((entry, i) => (
                                            <div key={i} style={{ marginBottom: '1.25rem', position: 'relative' }}>
                                                <div style={{
                                                    position: 'absolute', left: '-1.35rem', top: '3px',
                                                    width: '10px', height: '10px', borderRadius: '50%',
                                                    background: getStatusColor(entry.status),
                                                    border: '2px solid var(--color-black-light)'
                                                }} />
                                                <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: '600' }}>
                                                    {STATUS_LABELS[entry.status] || entry.status}
                                                </div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--color-gray)', marginTop: '2px' }}>
                                                    {new Date(entry.timestamp).toLocaleString()} • {entry.actor}
                                                </div>
                                                {entry.note && (
                                                    <div style={{ fontSize: '0.7rem', color: '#aaa', marginTop: '4px', fontStyle: 'italic' }}>
                                                        {entry.note}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Customer Info */}
                        <div style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h4 style={{ fontSize: '0.75rem', color: 'var(--color-gray)', textTransform: 'uppercase', marginBottom: '1.25rem', letterSpacing: '0.1em' }}>Member Credentials</h4>
                            <div style={{ fontSize: '0.9rem', color: '#fff' }}>
                                <div style={{ marginBottom: '0.5rem', fontWeight: '600' }}>{selectedOrder.firstName} {selectedOrder.lastName}</div>
                                <div style={{ color: 'var(--color-gray)', marginBottom: '1rem' }}>{selectedOrder.email}</div>
                                {selectedOrder.phone && <div style={{ color: 'var(--color-gray)', marginBottom: '1rem' }}>📞 {selectedOrder.phone}</div>}
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', fontStyle: 'italic', fontSize: '0.8rem', color: '#aaa' }}>
                                    {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.zipCode}, {selectedOrder.country}
                                </div>
                            </div>
                        </div>

                        {/* Financial Ledger */}
                        <div style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-gold-muted)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '0.75rem', color: 'var(--color-gold)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Financial Statement</h4>
                                <span style={{ fontSize: '0.7rem', color: '#fff', background: 'rgba(255,255,255,0.1)', padding: '3px 8px', borderRadius: '4px' }}>
                                    {getPaymentIcon(selectedOrder.paymentMethod)}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                {selectedOrder.items.map(item => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                                        <span style={{ color: '#aaa' }}>{item.quantity} × {item.product.name}</span>
                                        <span style={{ color: '#fff' }}>{settings.currencySymbol}{item.price.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-gray)' }}>
                                    <span>Subtotal</span>
                                    <span>{settings.currencySymbol}{selectedOrder.subtotal.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-gray)' }}>
                                    <span>Logistics</span>
                                    <span>{settings.currencySymbol}{selectedOrder.shipping.toLocaleString()}</span>
                                </div>
                                {selectedOrder.discount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#2ecc71' }}>
                                        <span>Promotion {selectedOrder.couponCode && `(${selectedOrder.couponCode})`}</span>
                                        <span>-{settings.currencySymbol}{selectedOrder.discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-gold)', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span>Total</span>
                                    <span>{settings.currencySymbol}{selectedOrder.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* CANCEL CONFIRMATION MODAL */}
            {showCancelModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div style={{
                        background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)',
                        border: '1px solid rgba(231,76,60,0.3)', maxWidth: '450px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
                    }}>
                        <h3 style={{ color: '#e74c3c', marginBottom: '1rem', fontSize: '1.1rem' }}>
                            {editData.status === 'cancelled' ? '⚠️ Confirm Cancellation' : '📋 Mark as Cancel Requested'}
                        </h3>
                        <p style={{ color: 'var(--color-gray)', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            {editData.status === 'cancelled'
                                ? 'This will permanently cancel the order. The customer will be notified. This action cannot be undone.'
                                : 'This will flag the order for cancellation review.'}
                        </p>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label">Reason for Cancellation</label>
                            <textarea
                                className="newsletter-form input"
                                style={{ width: '100%', padding: '10px', minHeight: '80px', resize: 'vertical' }}
                                placeholder="Enter reason..."
                                value={cancelReason}
                                onChange={e => setCancelReason(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => { setShowCancelModal(false); setCancelReason(''); setEditData({...editData, status: selectedOrder.status}); }}
                                className="btn btn-outline" style={{ flex: 1 }}>
                                Go Back
                            </button>
                            <button onClick={handleCancelConfirm} className="btn" disabled={!cancelReason.trim() || updating}
                                style={{ flex: 1, background: '#e74c3c', color: '#fff', border: 'none', padding: '0.8rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
                                {updating ? 'Processing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
