'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data.products || []);
                setLoading(false);
            });
    }, []);

    const toggleStock = async (id, currentVal) => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inStock: !currentVal }),
            });
            if (res.ok) {
                setProducts(prev => prev.map(p => p.id === id ? { ...p, inStock: !currentVal } : p));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const availableProducts = products.filter(p => p.inStock && p.stock > 0);
    const unavailableProducts = products.filter(p => !p.inStock || p.stock === 0);

    const ProductTable = ({ items, title, subtitle }) => (
        <div style={{ marginBottom: '4rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', color: title === 'Available Inventory' ? 'var(--color-gold)' : 'var(--color-rose)', marginBottom: '0.25rem' }}>{title}</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-gray)' }}>{subtitle} ({items.length})</p>
            </div>
            <div style={{ background: 'var(--color-black-light)', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                            <th style={{ padding: '1.25rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gray)' }}>Ref</th>
                            <th style={{ padding: '1.25rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gray)' }}>Fragrance</th>
                            <th style={{ padding: '1.25rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gray)' }}>Price</th>
                            <th style={{ padding: '1.25rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gray)' }}>Quantity</th>
                            <th style={{ padding: '1.25rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gray)' }}>Status</th>
                            <th style={{ padding: '1.25rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-gray)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-gray)', fontSize: '0.9rem' }}>No products in this category.</td></tr>
                        ) : items.map((product) => (
                            <tr key={product.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', opacity: title === 'Available Inventory' ? 1 : 0.7 }}>
                                <td style={{ padding: '1rem 2rem', fontSize: '0.8rem' }}>#{product.id}</td>
                                <td style={{ padding: '1rem 2rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '35px', height: '45px', background: '#222', borderRadius: '4px', overflow: 'hidden' }}>
                                            <img src={product.images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{product.name}</div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-gray)' }}>{product.category?.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem 2rem', fontSize: '0.85rem', color: 'var(--color-gold)' }}>
                                    ${product.salePrice || product.price}
                                </td>
                                <td style={{ padding: '1rem 2rem', fontSize: '0.85rem' }}>
                                    <span style={{
                                        color: product.stock < 10 && product.stock > 0 ? 'var(--color-gold)' : product.stock === 0 ? 'var(--color-rose)' : 'inherit',
                                        fontWeight: product.stock < 10 ? '600' : '400'
                                    }}>
                                        {product.stock} units
                                    </span>
                                </td>
                                <td style={{ padding: '1rem 2rem' }}>
                                    <button
                                        onClick={() => toggleStock(product.id, product.inStock)}
                                        style={{
                                            fontSize: '0.65rem',
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            background: product.inStock ? 'rgba(76, 175, 80, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                                            color: product.inStock ? 'var(--color-success)' : 'var(--color-error)',
                                            border: `1px solid ${product.inStock ? 'var(--color-success)' : 'var(--color-error)'}`,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}
                                    >
                                        {product.inStock ? 'Active' : 'Disabled'}
                                    </button>
                                </td>
                                <td style={{ padding: '1rem 2rem' }}>
                                    <Link href={`/admin/products/${product.id}`} className="btn btn-dark btn-sm" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Edit Details</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <span className="section-subtitle">Management</span>
                    <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Product Catalog</h1>
                </div>
                <Link href="/admin/products/new" className="btn btn-primary">+ Add Fragrance</Link>
            </div>

            {loading ? (
                <div style={{ padding: '5rem', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
            ) : (
                <>
                    <ProductTable 
                        items={availableProducts} 
                        title="Available Inventory" 
                        subtitle="Active products with remaining stock"
                    />
                    <ProductTable 
                        items={unavailableProducts} 
                        title="Not Available" 
                        subtitle="Out of stock or manually disabled items"
                    />
                </>
            )}
        </div>
    );
}
