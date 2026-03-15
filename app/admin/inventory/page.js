'use client';
import { useState, useEffect } from 'react';
import { Package, AlertTriangle, ArrowUpRight, ArrowDownRight, Search, RefreshCw } from 'lucide-react';

export default function InventoryPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, low, out
    const [updatingId, setUpdatingId] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/inventory');
            const data = await res.json();
            if (data.products) setProducts(data.products);
        } catch (err) {
            console.error('Error fetching inventory:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStock = async (id, currentStock, delta) => {
        setUpdatingId(id);
        const newStock = Math.max(0, currentStock + delta);
        try {
            const res = await fetch('/api/admin/inventory', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, stock: newStock })
            });
            if (res.ok) {
                setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
                setMessage({ text: 'Stock updated successfully', type: 'success' });
                setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            }
        } catch (err) {
            setMessage({ text: 'Update failed', type: 'error' });
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = 
            filter === 'all' ? true :
            filter === 'low' ? (p.stock > 0 && p.stock < 10) :
            filter === 'out' ? (p.stock === 0) : true;
        return matchesSearch && matchesFilter;
    });

    const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 10).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;

    if (loading) return <div className="admin-container">Loading Inventory...</div>;

    return (
        <div className="admin-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <span className="section-subtitle">Stock Control</span>
                    <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Inventory Management</h1>
                </div>
                <button onClick={fetchInventory} className="btn btn-dark btn-sm" style={{ gap: '10px' }}>
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* Stats Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                <div style={{ background: 'var(--color-black-light)', padding: '1.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-gray)' }}>
                        <Package size={20} />
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Total Skus</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', marginTop: '0.5rem' }}>{products.length}</div>
                </div>
                <div style={{ background: 'var(--color-black-light)', padding: '1.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(231, 76, 60, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#e74c3c' }}>
                        <AlertTriangle size={20} />
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Low Stock</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', marginTop: '0.5rem', color: '#e74c3c' }}>{lowStockCount}</div>
                </div>
                <div style={{ background: 'var(--color-black-light)', padding: '1.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255, 255, 255, 0.1)', opacity: outOfStockCount > 0 ? 1 : 0.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-gray-light)' }}>
                        <AlertTriangle size={20} />
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Out of Stock</span>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: '700', marginTop: '0.5rem' }}>{outOfStockCount}</div>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray)' }} size={18} />
                    <input 
                        type="text" 
                        placeholder="Search products by name..." 
                        className="newsletter-form input"
                        style={{ width: '100%', paddingLeft: '45px' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', background: 'var(--color-black-light)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <button 
                        onClick={() => setFilter('all')}
                        style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', background: filter === 'all' ? 'var(--color-gold)' : 'transparent', color: filter === 'all' ? '#000' : '#888' }}
                    >All</button>
                    <button 
                        onClick={() => setFilter('low')}
                        style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', background: filter === 'low' ? '#e74c3c' : 'transparent', color: filter === 'low' ? '#fff' : '#888' }}
                    >Low Stock</button>
                    <button 
                        onClick={() => setFilter('out')}
                        style={{ padding: '8px 16px', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', background: filter === 'out' ? '#000' : 'transparent', color: filter === 'out' ? '#fff' : '#888' }}
                    >Out of Stock</button>
                </div>
            </div>

            {/* Table */}
            <div style={{ background: 'var(--color-black-light)', borderRadius: 'var(--border-radius-lg)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.7rem', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Product</th>
                            <th style={{ padding: '1.5rem', textAlign: 'left', fontSize: '0.7rem', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Category</th>
                            <th style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.7rem', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Stock Level</th>
                            <th style={{ padding: '1.5rem', textAlign: 'right', fontSize: '0.7rem', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Quick Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                                <td style={{ padding: '1.2rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '45px', height: '45px', borderRadius: '4px', overflow: 'hidden', background: '#000' }}>
                                            <img src={(product.images && product.images[0]) || 'https://placehold.co/100x100?text=No+Image'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{product.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray)' }}>ID: {product.id}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.5rem', color: 'var(--color-gray-light)', fontSize: '0.85rem' }}>{product.category?.name}</td>
                                <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                                    {product.stock === 0 ? (
                                        <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.65rem', border: '1px solid #444' }}>OUT OF STOCK</span>
                                    ) : product.stock < 10 ? (
                                        <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', fontSize: '0.65rem', border: '1px solid rgba(231, 76, 60, 0.2)' }}>LOW STOCK</span>
                                    ) : (
                                        <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'rgba(46, 204, 113, 0.1)', color: '#2ecc71', fontSize: '0.65rem', border: '1px solid rgba(46, 204, 113, 0.2)' }}>IN STOCK</span>
                                    )}
                                </td>
                                <td style={{ padding: '1.5rem', textAlign: 'center' }}>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: product.stock < 10 ? '#e74c3c' : 'inherit' }}>{product.stock}</span>
                                </td>
                                <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                        <button 
                                            onClick={() => handleUpdateStock(product.id, product.stock, -1)}
                                            disabled={updatingId === product.id || product.stock === 0}
                                            style={{ padding: '6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--color-gray)', cursor: 'pointer' }}
                                        >
                                            <ArrowDownRight size={16} />
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateStock(product.id, product.stock, 5)}
                                            disabled={updatingId === product.id}
                                            style={{ padding: '6px', borderRadius: '4px', background: 'var(--color-gold-muted)', color: 'var(--color-gold)', cursor: 'pointer' }}
                                        >
                                            <ArrowUpRight size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredProducts.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-gray)' }}>
                        No products match your criteria.
                    </div>
                )}
            </div>

            {message.text && (
                <div style={{ 
                    position: 'fixed', 
                    bottom: '2rem', 
                    right: '2rem', 
                    padding: '1rem 2rem', 
                    background: message.type === 'success' ? '#2ecc71' : '#e74c3c',
                    color: '#fff',
                    borderRadius: 'var(--border-radius)',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    zIndex: 2000
                }}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
