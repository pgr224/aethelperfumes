'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const router = useRouter();
    const [cart, setCart] = useState({ items: [], total: 0 });
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discount, setDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [useReferralBalance, setUseReferralBalance] = useState(false);
    const [settings, setSettings] = useState({
        currencySymbol: '$',
        freeShippingThreshold: 150
    });

    const fetchCart = async () => {
        try {
            const res = await fetch('/api/cart');
            const data = await res.json();
            setCart(data);
            
            // Re-verify coupon if exists
            if (appliedCoupon) {
                verifyCoupon(appliedCoupon.code, data.total);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const fetchUserAndSettings = async () => {
        try {
            // Fetch Settings
            const setRes = await fetch('/api/admin/settings');
            const setData = await setRes.json();
            if (setData.settings) setSettings(setData.settings);

            // Fetch User
            const userRes = await fetch('/api/user/profile');
            if (userRes.ok) {
                const userData = await userRes.json();
                setUser(userData.profile);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
        fetchUserAndSettings();
        
        // Load saved coupon if any
        const savedCoupon = localStorage.getItem('applied_coupon');
        if (savedCoupon) {
            const coupon = JSON.parse(savedCoupon);
            setCouponCode(coupon.code);
            // We'll verify it once cart is loaded
        }
    }, []);

    useEffect(() => {
        if (cart.total > 0 && couponCode && !appliedCoupon) {
            const savedCoupon = localStorage.getItem('applied_coupon');
            if (savedCoupon) {
                const coupon = JSON.parse(savedCoupon);
                verifyCoupon(coupon.code, cart.total);
            }
        }
    }, [cart.total]);

    const verifyCoupon = async (code, amount) => {
        if (!code) return;
        setCouponError('');
        try {
            const res = await fetch(`/api/coupons/verify?code=${code}&amount=${amount}`);
            const data = await res.json();
            if (res.ok && data.valid) {
                setAppliedCoupon(data.coupon);
                setDiscount(data.discount);
                localStorage.setItem('applied_coupon', JSON.stringify(data.coupon));
            } else {
                setCouponError(data.error || 'Invalid coupon');
                setAppliedCoupon(null);
                setDiscount(0);
                localStorage.removeItem('applied_coupon');
            }
        } catch (err) {
            setCouponError('Failed to verify coupon');
        }
    };

    const updateQuantity = async (itemId, newQty) => {
        try {
            await fetch('/api/cart', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, quantity: newQty }),
            });
            fetchCart();
            window.dispatchEvent(new Event('cart-updated'));
        } catch (e) {
            console.error(e);
        }
    };

    const removeItem = async (itemId) => {
        try {
            await fetch(`/api/cart?itemId=${itemId}`, { method: 'DELETE' });
            fetchCart();
            window.dispatchEvent(new Event('cart-updated'));
        } catch (e) {
            console.error(e);
        }
    };

    const handleProceedToCheckout = () => {
        // Save referral preference
        localStorage.setItem('use_referral_balance', useReferralBalance ? 'true' : 'false');
        router.push('/checkout');
    };

    if (loading) return <div className="section container skeleton" style={{ height: '60vh', marginTop: '100px' }}></div>;

    const shipping = cart.total >= parseFloat(settings.freeShippingThreshold) ? 0 : 15;
    const referralDiscount = (useReferralBalance && user) ? user.referralBalance : 0;
    const finalTotal = Math.max(0, cart.total + shipping - discount - referralDiscount);

    return (
        <div className="cart-page">
            <div className="container">
                <h1 className="section-title" style={{ marginBottom: '3rem' }}>Your Collection</h1>

                {cart.items.length === 0 ? (
                    <div className="cart-empty">
                        <div className="cart-empty-icon">👜</div>
                        <h2>Your bag is currently empty</h2>
                        <p>Discovery awaits. Explore our collection to find your next signature scent.</p>
                        <Link href="/products" className="btn btn-primary btn-lg">Back To Boutique</Link>
                    </div>
                ) : (
                    <div className="cart-grid">
                        <div className="cart-list">
                            {cart.items.map((item) => (
                                <div key={item.id} className="cart-item">
                                    <div className="cart-item-image">
                                        <img src={item.product.images[0]} alt={item.product.name} />
                                    </div>
                                    <div className="cart-item-body">
                                        <h3 className="cart-item-name">{item.product.name}</h3>
                                        <div className="cart-item-variant">{item.product.category.name} | {item.product.volume}</div>

                                        {(!item.product.inStock || item.product.stock === 0) ? (
                                            <div style={{ color: '#e74c3c', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', marginBottom: '1rem', background: 'rgba(231, 76, 60, 0.1)', padding: '4px 8px', borderRadius: '4px', width: 'fit-content' }}>
                                                Out of Stock
                                            </div>
                                        ) : (
                                            <div className="quantity-selector" style={{ width: 'fit-content', transform: 'scale(0.8)', transformOrigin: 'left' }}>
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                                                <div className="qty">{item.quantity}</div>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                            </div>
                                        )}

                                        <button className="cart-item-remove" onClick={() => removeItem(item.id)}>Remove</button>
                                    </div>
                                    <div className="cart-item-price">
                                        {settings.currencySymbol}{((item.product.salePrice || item.product.price) * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-summary card-glass">
                            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>Order Summary</h3>
                            
                            <div className="cart-summary-row">
                                <span>Subtotal</span>
                                <span>{settings.currencySymbol}{cart.total.toFixed(2)}</span>
                            </div>
                            
                            <div className="cart-summary-row">
                                <span>Shipping</span>
                                <span>{shipping === 0 ? 'Complimentary' : `${settings.currencySymbol}${shipping.toFixed(2)}`}</span>
                            </div>

                            {/* Coupon Section */}
                            <div className="promo-section" style={{ margin: '1.5rem 0', padding: '1.5rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-gray)', marginBottom: '0.5rem', display: 'block' }}>Promo Code</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        type="text" 
                                        className="cart-promo-input"
                                        placeholder="Enter code" 
                                        value={couponCode}
                                        onChange={e => setCouponCode(e.target.value)}
                                        style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px', borderRadius: '4px' }}
                                    />
                                    <button 
                                        className="btn btn-sm btn-outline"
                                        onClick={() => verifyCoupon(couponCode, cart.total)}
                                    >
                                        Apply
                                    </button>
                                </div>
                                {couponError && <p style={{ color: '#e74c3c', fontSize: '0.75rem', marginTop: '5px' }}>{couponError}</p>}
                                {appliedCoupon && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#2ecc71', fontSize: '0.85rem' }}>
                                        <span>Coupon {appliedCoupon.code} Applied</span>
                                        <span>-{settings.currencySymbol}{discount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Referral Section */}
                            {user && user.referralBalance > 0 && (
                                <div className="referral-cart-section" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(201, 169, 110, 0.05)', borderRadius: '8px', border: '1px solid rgba(201, 169, 110, 0.1)' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={useReferralBalance}
                                            onChange={e => setUseReferralBalance(e.target.checked)}
                                        />
                                        <span style={{ fontSize: '0.85rem', color: 'var(--color-gold)' }}>
                                            Use Referral Balance: {settings.currencySymbol}{user.referralBalance.toFixed(2)}
                                        </span>
                                    </label>
                                </div>
                            )}

                            <div className="cart-summary-row total">
                                <span>Estimated Total</span>
                                <span className="text-gold" style={{ fontSize: '1.5rem' }}>{settings.currencySymbol}{finalTotal.toFixed(2)}</span>
                            </div>

                            <button 
                                onClick={handleProceedToCheckout} 
                                className="btn btn-primary btn-lg btn-full" 
                                style={{ marginTop: '1.5rem' }}
                                disabled={cart.items.some(item => !item.product.inStock || item.product.stock === 0)}
                            >
                                {cart.items.some(item => !item.product.inStock || item.product.stock === 0) 
                                    ? 'Remove Out of Stock Items to Proceed' 
                                    : 'Proceed To Checkout'}
                            </button>

                            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-gray)' }}>
                                🛡️ Secure, encrypted payment
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .cart-page { padding: 120px 0 80px; min-height: 80vh; background: #0a0a0a; }
                .cart-grid { display: grid; grid-template-columns: 1fr 400px; gap: 40px; }
                .cart-item { display: grid; grid-template-columns: 120px 1fr 100px; gap: 20px; padding: 20px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
                .cart-item-image { height: 120px; border-radius: 8px; overflow: hidden; background: #111; }
                .cart-item-image img { width: 100%; height: 100%; object-fit: cover; }
                .cart-item-name { font-size: 1.1rem; color: #fff; margin-bottom: 5px; }
                .cart-item-variant { font-size: 0.8rem; color: var(--color-gray); margin-bottom: 15px; }
                .cart-item-remove { background: none; border: none; color: #e74c3c; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; padding: 0; }
                .cart-item-price { text-align: right; color: var(--color-gold); font-weight: 600; font-size: 1.1rem; }
                
                .cart-summary { padding: 30px; height: fit-content; position: sticky; top: 100px; }
                .cart-summary-row { display: flex; justify-content: space-between; margin-bottom: 15px; color: #ccc; }
                .cart-summary-row.total { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; margin-top: 15px; font-weight: bold; color: #fff; }
                
                .cart-empty { text-align: center; padding: 60px 0; }
                .cart-empty-icon { font-size: 4rem; margin-bottom: 2rem; }
                .cart-empty h2 { color: #fff; margin-bottom: 1rem; }
                .cart-empty p { color: var(--color-gray); margin-bottom: 2rem; }

                @media (max-width: 991px) {
                    .cart-grid { grid-template-columns: 1fr; }
                    .cart-summary { position: static; }
                }
            `}</style>
        </div>
    );
}
