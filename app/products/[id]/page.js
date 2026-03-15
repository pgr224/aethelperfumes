'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import ProductGrid from '@/components/ProductGrid';

export default function ProductDetail({ params }) {
    const resolvedParams = use(params);
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);
    const [exclusiveError, setExclusiveError] = useState(null);

    useEffect(() => {
        fetch(`/api/products/${resolvedParams.id}`)
            .then(res => res.json().then(data => ({ status: res.status, data })))
            .then(({ status, data }) => {
                if (status === 403 && data.exclusive) {
                    setExclusiveError(data);
                } else {
                    setProduct(data.product);
                    setRelated(data.related || []);
                }
                setLoading(false);
            });
    }, [resolvedParams.id]);

    const addToCart = async () => {
        setAdding(true);
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id, quantity }),
            });
                if (res.ok) {
                    // Show success toast
                    const toast = document.createElement('div');
                    toast.className = 'toast show toast-success';
                    toast.innerHTML = `<span>✨ Added ${quantity} item(s) to cart</span>`;
                    document.body.appendChild(toast);
                    setTimeout(() => toast.remove(), 3000);
                    window.dispatchEvent(new Event('cart-updated'));
                }
        } catch (err) {
            console.error(err);
        } finally {
            setAdding(false);
        }
    };

    if (loading) return <div className="section container skeleton" style={{ height: '80vh', marginTop: '100px' }}></div>;
    
    if (exclusiveError) {
        return (
            <div className="section container text-center" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--color-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                    <span style={{ fontSize: '2rem', color: '#000' }}>🔒</span>
                </div>
                <h1 className="section-title" style={{ color: 'var(--color-gold)' }}>Vault Locked</h1>
                <p className="section-desc" style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
                    This fragrance is an exclusive reserve crafted solely for our most dedicated ambassadors. 
                    You must achieve {exclusiveError.requiredTier} status to unlock access.
                </p>
                <a href="/referrals" className="btn btn-outline-gold">
                    View Ambassador Dashboard
                </a>
            </div>
        );
    }

    if (!product) return <div className="section container"><h1>Product not found</h1></div>;

    const mainImage = product.images?.[0] || 'https://via.placeholder.com/800x1066?text=Product';

    return (
        <div className="product-detail">
            <div className="container">
                <div className="product-detail-grid">
                    <div className="product-gallery">
                        <div className="product-gallery-main">
                            <img src={mainImage} alt={product.name} />
                        </div>
                    </div>

                    <div className="product-info">
                        <div className="product-info-category">{product.category?.name}</div>
                        <h1 className="product-info-name">{product.name}</h1>

                        <div className="product-info-rating">
                            <div className="stars">
                                {[...Array(5)].map((_, i) => (
                                    <span key={i} style={{ color: i < Math.floor(product.rating) ? 'var(--color-gold)' : 'var(--color-charcoal)' }}>★</span>
                                ))}
                            </div>
                            <span className="count">({product.reviewCount} Verified Reviews)</span>
                        </div>

                        <div className="product-info-price">
                            {product.salePrice ? (
                                <>
                                    <span className="current">${product.salePrice.toFixed(2)}</span>
                                    <span className="original">${product.price.toFixed(2)}</span>
                                    <span className="discount">-{Math.round((1 - product.salePrice / product.price) * 100)}%</span>
                                </>
                            ) : (
                                <span className="current">${product.price.toFixed(2)}</span>
                            )}
                        </div>

                        <p className="product-info-desc">{product.description}</p>

                        <div className="product-info-notes">
                            <h4>Olfactory Profile</h4>
                            <p>{product.notes}</p>
                            <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--color-gold)' }}>
                                Concentration: {product.volume}
                            </div>
                        </div>

                        <div className="product-info-quantity">
                            <span>Quantity:</span>
                            <div className="quantity-selector">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                                <div className="qty">{quantity}</div>
                                <button onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                        </div>

                        <div className="product-info-actions">
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={addToCart}
                                disabled={adding || !product.inStock || product.stock === 0}
                            >
                                {adding ? 'Adding...' : (!product.inStock || product.stock === 0) ? 'Out of Stock' : 'Add to Collection'}
                            </button>
                            <button className="btn btn-outline btn-lg">❤️ Wishlist</button>
                        </div>

                        <div style={{ marginTop: '30px', fontSize: '0.85rem', color: 'var(--color-gray)' }}>
                            ✨ Complimentary gift wrapping on all orders • 🚚 3-5 day premium delivery
                        </div>
                    </div>
                </div>

                {related.length > 0 && (
                    <section className="section" style={{ marginTop: '4rem' }}>
                        <div className="section-header">
                            <span className="section-subtitle">Discovery</span>
                            <h2 className="section-title">You May Also Seek</h2>
                        </div>
                        <ProductGrid products={related} />
                    </section>
                )}
            </div>
        </div>
    );
}
