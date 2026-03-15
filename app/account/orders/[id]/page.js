'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const STATUS_PIPELINE = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
const STATUS_LABELS = {
    pending: 'Order Placed',
    processing: 'Being Prepared',
    shipped: 'Shipped',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    cancel_requested: 'Cancellation Requested',
    return_requested: 'Return Requested'
};

const CANCEL_REASONS = [
    'Changed my mind',
    'Found a better price elsewhere',
    'Ordered by mistake',
    'Delivery time is too long',
    'Duplicate order',
    'Other'
];

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({ currencySymbol: '₹' });
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [cancelEligibility, setCancelEligibility] = useState(null);

    useEffect(() => {
        fetchOrder();
        fetch('/api/admin/settings')
            .then(r => r.json())
            .then(d => { if (d.settings) setSettings(d.settings); });
    }, []);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/user/orders/${params.id}`);
            if (!res.ok) { router.push('/account/dashboard'); return; }
            const data = await res.json();
            setOrder(data.order);
            setCancelEligibility(data.cancelEligibility);
        } catch {
            router.push('/account/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!cancelReason) return;
        setCancelling(true);
        try {
            const res = await fetch('/api/user/orders/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: order.id, reason: cancelReason })
            });
            const data = await res.json();
            if (res.ok) {
                setShowCancelModal(false);
                fetchOrder(); // refresh
            } else {
                alert(data.error || 'Failed to cancel');
            }
        } catch {
            alert('Network error');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'processing': return '#f39c12';
            case 'shipped': return '#3498db';
            case 'out_for_delivery': return '#e67e22';
            case 'delivered': return '#2ecc71';
            case 'cancelled': case 'cancel_requested': return '#e74c3c';
            default: return '#c9a96e';
        }
    };

    const parseHistory = (json) => {
        if (!json) return [];
        try { return JSON.parse(json); } catch { return []; }
    };

    if (loading) return <div className="section container skeleton" style={{ height: '80vh', marginTop: '100px' }}></div>;
    if (!order) return null;

    const pipelineIdx = STATUS_PIPELINE.indexOf(order.status);
    const isCancelledFlow = order.status === 'cancelled' || order.status === 'cancel_requested';
    const history = parseHistory(order.statusHistory);

    return (
        <div style={{ padding: '120px 0 80px', backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                {/* Back link */}
                <Link href="/account/dashboard" style={{ color: '#c9a96e', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                    ← Back to Dashboard
                </Link>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <div>
                        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#fff', margin: 0 }}>
                            Order {order.orderNumber}
                        </h1>
                        <p style={{ color: '#888', marginTop: '0.5rem' }}>
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <span style={{
                        padding: '6px 16px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                        background: `${getStatusColor(order.status)}20`,
                        color: getStatusColor(order.status),
                        border: `1px solid ${getStatusColor(order.status)}40`
                    }}>
                        {STATUS_LABELS[order.status]}
                    </span>
                </div>

                {/* STATUS PIPELINE */}
                <div style={{ background: 'rgba(20,20,20,0.8)', padding: '2.5rem', borderRadius: '12px', border: '1px solid rgba(201,169,110,0.15)', marginBottom: '2rem' }}>
                    {isCancelledFlow ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>{order.status === 'cancelled' ? '❌' : '⏳'}</div>
                            <h3 style={{ color: getStatusColor(order.status), marginBottom: '0.5rem' }}>{STATUS_LABELS[order.status]}</h3>
                            {order.cancelReason && <p style={{ color: '#888', fontSize: '0.9rem' }}>Reason: {order.cancelReason}</p>}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {STATUS_PIPELINE.map((step, i) => {
                                const isCompleted = i <= pipelineIdx;
                                const isCurrent = i === pipelineIdx;
                                return (
                                    <div key={step} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                                        {i > 0 && (
                                            <div style={{
                                                position: 'absolute', top: '16px', left: '-50%', right: '50%',
                                                height: '3px', borderRadius: '2px',
                                                background: isCompleted
                                                    ? 'linear-gradient(90deg, #c9a96e, #2ecc71)'
                                                    : 'rgba(255,255,255,0.08)'
                                            }} />
                                        )}
                                        <div style={{
                                            width: '32px', height: '32px', borderRadius: '50%', margin: '0 auto',
                                            background: isCurrent ? 'linear-gradient(135deg, #c9a96e, #a68444)' : isCompleted ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.05)',
                                            border: `2px solid ${isCompleted ? '#2ecc71' : 'rgba(255,255,255,0.1)'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.7rem', color: isCurrent ? '#000' : isCompleted ? '#2ecc71' : '#555',
                                            fontWeight: '700', position: 'relative', zIndex: 1,
                                            boxShadow: isCurrent ? '0 0 20px rgba(201,169,110,0.4)' : 'none'
                                        }}>
                                            {isCompleted ? '✓' : i + 1}
                                        </div>
                                        <div style={{
                                            fontSize: '0.65rem', marginTop: '10px',
                                            color: isCurrent ? '#c9a96e' : isCompleted ? '#2ecc71' : '#555',
                                            fontWeight: isCurrent ? '700' : '400',
                                            textTransform: 'uppercase', letterSpacing: '0.05em'
                                        }}>{STATUS_LABELS[step]}</div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {order.estimatedDelivery && !isCancelledFlow && order.status !== 'delivered' && (
                        <div style={{ textAlign: 'center', marginTop: '1.5rem', padding: '0.75rem', background: 'rgba(201,169,110,0.08)', borderRadius: '8px' }}>
                            <span style={{ color: '#c9a96e', fontSize: '0.8rem' }}>
                                📦 Estimated Delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                    {/* Shipping Info */}
                    <div style={{ background: 'rgba(20,20,20,0.8)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ color: '#c9a96e', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>Shipping Address</h3>
                        <p style={{ color: '#ccc', lineHeight: '1.6' }}>
                            {order.firstName} {order.lastName}<br/>
                            {order.address}<br/>
                            {order.city}, {order.zipCode}<br/>
                            {order.country}
                        </p>
                        {order.phone && <p style={{ color: '#888', marginTop: '0.5rem' }}>📞 {order.phone}</p>}
                    </div>

                    {/* Tracking Info */}
                    <div style={{ background: 'rgba(20,20,20,0.8)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ color: '#c9a96e', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>Tracking Information</h3>
                        {order.trackingNumber ? (
                            <>
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <span style={{ color: '#888', fontSize: '0.8rem' }}>Carrier: </span>
                                    <span style={{ color: '#fff' }}>{order.carrier || 'Premium Courier'}</span>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <span style={{ color: '#888', fontSize: '0.8rem' }}>Tracking #: </span>
                                    <span style={{ color: '#3498db', fontFamily: 'monospace' }}>{order.trackingNumber}</span>
                                </div>
                                <a href={`https://track.aethel.com/${order.trackingNumber}`} target="_blank" rel="noreferrer"
                                    style={{ color: '#c9a96e', fontSize: '0.85rem', textDecoration: 'underline' }}>
                                    Track Shipment →
                                </a>
                            </>
                        ) : (
                            <p style={{ color: '#555', fontStyle: 'italic' }}>Tracking information will appear here once your order ships.</p>
                        )}
                    </div>
                </div>

                {/* Order Items */}
                <div style={{ background: 'rgba(20,20,20,0.8)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
                    <h3 style={{ color: '#c9a96e', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Items Ordered</h3>
                    {order.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            {item.product.images && (
                                <img
                                    src={JSON.parse(item.product.images)[0]}
                                    alt={item.product.name}
                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}
                                />
                            )}
                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#fff', fontWeight: '600' }}>{item.product.name}</div>
                                <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '4px' }}>Qty: {item.quantity}</div>
                            </div>
                            <div style={{ color: '#c9a96e', fontWeight: '700' }}>{settings.currencySymbol}{(item.price * item.quantity).toLocaleString()}</div>
                        </div>
                    ))}

                    <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: '0.5rem' }}>
                            <span>Subtotal</span><span>{settings.currencySymbol}{order.subtotal.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', marginBottom: '0.5rem' }}>
                            <span>Shipping</span><span>{settings.currencySymbol}{order.shipping.toLocaleString()}</span>
                        </div>
                        {order.discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2ecc71', marginBottom: '0.5rem' }}>
                                <span>Discount {order.couponCode && `(${order.couponCode})`}</span><span>-{settings.currencySymbol}{order.discount.toLocaleString()}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c9a96e', fontWeight: '700', fontSize: '1.2rem', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <span>Total</span><span>{settings.currencySymbol}{order.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Status History Timeline */}
                {history.length > 0 && (
                    <div style={{ background: 'rgba(20,20,20,0.8)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }}>
                        <h3 style={{ color: '#c9a96e', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>Order Timeline</h3>
                        <div style={{ paddingLeft: '1.5rem', borderLeft: '2px solid rgba(201,169,110,0.2)' }}>
                            {[...history].reverse().map((entry, i) => (
                                <div key={i} style={{ marginBottom: '1.5rem', position: 'relative' }}>
                                    <div style={{
                                        position: 'absolute', left: '-1.85rem', top: '4px',
                                        width: '12px', height: '12px', borderRadius: '50%',
                                        background: getStatusColor(entry.status),
                                        border: '2px solid #0a0a0a'
                                    }} />
                                    <div style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>{STATUS_LABELS[entry.status] || entry.status}</div>
                                    <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '4px' }}>
                                        {new Date(entry.timestamp).toLocaleString()}
                                    </div>
                                    {entry.note && <div style={{ color: '#888', fontSize: '0.8rem', marginTop: '4px', fontStyle: 'italic' }}>{entry.note}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cancel Button */}
                {cancelEligibility?.allowed && (
                    <div style={{ background: 'rgba(231,76,60,0.05)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(231,76,60,0.2)', textAlign: 'center' }}>
                        <p style={{ color: '#888', marginBottom: '1rem', fontSize: '0.85rem' }}>{cancelEligibility.reason}</p>
                        <button onClick={() => setShowCancelModal(true)} style={{
                            background: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c',
                            padding: '0.75rem 2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '600',
                            fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>
                            {cancelEligibility.type === 'instant' ? 'Cancel Order Instantly' : 'Request Cancellation'}
                        </button>
                    </div>
                )}
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div style={{ background: '#141414', padding: '2.5rem', borderRadius: '12px', border: '1px solid rgba(231,76,60,0.3)', maxWidth: '450px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}>
                        <h3 style={{ color: '#e74c3c', marginBottom: '0.5rem' }}>
                            {cancelEligibility.type === 'instant' ? 'Cancel Order' : 'Request Cancellation'}
                        </h3>
                        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            {cancelEligibility.type === 'instant'
                                ? 'This will cancel your order immediately. A refund will be processed shortly.'
                                : 'Your cancellation request will be reviewed by our team. We\'ll notify you once processed.'}
                        </p>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: '#aaa', fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>Reason</label>
                            <select
                                value={cancelReason}
                                onChange={e => setCancelReason(e.target.value)}
                                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px' }}
                            >
                                <option value="">Select a reason...</option>
                                {CANCEL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => setShowCancelModal(false)} style={{
                                flex: 1, padding: '0.8rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
                                color: '#aaa', borderRadius: '6px', cursor: 'pointer'
                            }}>
                                Keep Order
                            </button>
                            <button onClick={handleCancel} disabled={!cancelReason || cancelling} style={{
                                flex: 1, padding: '0.8rem', background: '#e74c3c', border: 'none',
                                color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: '600',
                                opacity: (!cancelReason || cancelling) ? 0.5 : 1
                            }}>
                                {cancelling ? 'Processing...' : 'Confirm Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
