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
                <header className="cart-header">
                    <h1 className="page-title">Your Collection</h1>
                    <p className="page-subtitle">Free boutique shipping on orders over {settings.currencySymbol}{settings.freeShippingThreshold}</p>
                </header>

                {cart.items.length === 0 ? (
                    <div className="cart-empty">
                        <div className="cart-empty-icon text-gold">👜</div>
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
                                        <div className="cart-item-meta">
                                            <span className="cart-item-cat">{item.product.category.name}</span>
                                            <h3 className="cart-item-name">{item.product.name}</h3>
                                            <span className="cart-item-vol">{item.product.volume}</span>
                                        </div>

                                        {(!item.product.inStock || item.product.stock === 0) ? (
                                            <div className="stock-alert">Out of Stock</div>
                                        ) : (
                                            <div className="cart-item-actions">
                                                <div className="quantity-selector">
                                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                                                    <div className="qty">{item.quantity}</div>
                                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                                </div>
                                                <button className="cart-item-remove" onClick={() => removeItem(item.id)}>Remove</button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="cart-item-price">
                                        {settings.currencySymbol}{((item.product.salePrice || item.product.price) * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                            
                            <Link href="/products" className="continue-shopping">
                                ← Continue Shopping
                            </Link>
                        </div>

                        <div className="cart-summary-card">
                            <h3 className="summary-title">Summary</h3>
                            
                            <div className="summary-rows">
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>{settings.currencySymbol}{cart.total.toFixed(2)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Shipping</span>
                                    <span style={{ color: shipping === 0 ? 'var(--color-accent-green)' : 'inherit' }}>
                                        {shipping === 0 ? 'Complimentary' : `${settings.currencySymbol}${shipping.toFixed(2)}`}
                                    </span>
                                </div>

                                {appliedCoupon && (
                                    <div className="summary-row discount">
                                        <span>Discount ({appliedCoupon.code})</span>
                                        <span>-{settings.currencySymbol}{discount.toFixed(2)}</span>
                                    </div>
                                )}

                                {useReferralBalance && user && user.referralBalance > 0 && (
                                    <div className="summary-row discount">
                                        <span>Referral Balance</span>
                                        <span>-{settings.currencySymbol}{user.referralBalance.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="coupon-box">
                                <div className="input-group">
                                    <input 
                                        type="text" 
                                        placeholder="Promo Code" 
                                        value={couponCode}
                                        onChange={e => setCouponCode(e.target.value)}
                                    />
                                    <button onClick={() => verifyCoupon(couponCode, cart.total)}>Apply</button>
                                </div>
                                {couponError && <p className="error-text">{couponError}</p>}
                            </div>

                            {user && user.referralBalance > 0 && (
                                <div className="referral-toggle">
                                    <label className="checkbox-container">
                                        <input 
                                            type="checkbox" 
                                            checked={useReferralBalance}
                                            onChange={e => setUseReferralBalance(e.target.checked)}
                                        />
                                        <span className="checkmark"></span>
                                        Use Credits ({settings.currencySymbol}{user.referralBalance.toFixed(2)})
                                    </label>
                                </div>
                            )}

                            <div className="summary-total">
                                <span>Total</span>
                                <span className="final-price">{settings.currencySymbol}{finalTotal.toFixed(2)}</span>
                            </div>

                            <button 
                                onClick={handleProceedToCheckout} 
                                className="atc-btn-main" 
                                disabled={cart.items.some(item => !item.product.inStock || item.product.stock === 0)}
                            >
                                {cart.items.some(item => !item.product.inStock || item.product.stock === 0) 
                                    ? 'Check Stock' 
                                    : 'Proceed to Checkout'}
                            </button>

                            <div className="secure-checkout-hint">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                Secure Checkout
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .cart-page { padding: 140px 0 100px; min-height: 80vh; background: var(--color-white-off); }
                .cart-header { text-align: center; margin-bottom: 4rem; }
                .page-title { font-family: var(--font-heading); font-size: 2.5rem; margin-bottom: 1rem; }
                .page-subtitle { font-size: 0.9rem; color: var(--color-gray); letter-spacing: 0.05em; }
                
                .cart-grid { display: grid; grid-template-columns: 1fr 380px; gap: 60px; align-items: start; }
                
                .cart-item { display: grid; grid-template-columns: 140px 1fr auto; gap: 30px; padding-bottom: 30px; margin-bottom: 30px; border-bottom: 1px solid var(--color-gray-light); }
                .cart-item-image { background: #fff; border-radius: 8px; overflow: hidden; height: 160px; border: 1px solid var(--color-gray-light); }
                .cart-item-image img { width: 100%; height: 100%; object-fit: contain; }
                
                .cart-item-cat { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-gray); }
                .cart-item-name { font-size: 1.25rem; font-family: var(--font-heading); margin: 4px 0; }
                .cart-item-vol { font-size: 0.8rem; color: var(--color-gray); display: block; margin-bottom: 15px; }
                
                .cart-item-actions { display: flex; align-items: center; gap: 20px; margin-top: 15px; }
                .cart-item-remove { background: none; border: none; font-size: 0.75rem; text-transform: uppercase; color: var(--color-gray); cursor: pointer; text-decoration: underline; }
                .cart-item-remove:hover { color: var(--color-black); }
                
                .cart-item-price { font-weight: 600; font-size: 1.25rem; }
                
                .continue-shopping { display: inline-block; font-size: 0.9rem; color: var(--color-black); font-weight: 500; margin-top: 20px; }
                
                .cart-summary-card { background: #fff; padding: 30px; border-radius: 12px; border: 1px solid var(--color-gray-light); position: sticky; top: 120px; }
                .summary-title { font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 20px; }
                .summary-rows { display: flex; flex-direction: column; gap: 12px; margin-bottom: 25px; }
                .summary-row { display: flex; justify-content: space-between; font-size: 0.95rem; }
                .summary-row.discount { color: var(--color-accent-green); font-weight: 500; }
                
                .coupon-box { margin-bottom: 25px; padding: 20px 0; border-top: 1px solid var(--color-gray-light); }
                .input-group { display: flex; border: 1px solid var(--color-gray-light); border-radius: 6px; overflow: hidden; }
                .input-group input { flex: 1; border: none; padding: 10px 15px; outline: none; font-size: 0.9rem; background: var(--color-white-off); }
                .input-group button { background: var(--color-black); color: #fff; border: none; padding: 0 20px; font-weight: 600; font-size: 0.8rem; cursor: pointer; }
                .error-text { font-size: 0.75rem; color: var(--color-error); mt: 10px; }

                .referral-toggle { margin-bottom: 25px; }
                
                .summary-total { border-top: 1px solid var(--color-gray-light); padding-top: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
                .summary-total span { font-weight: 600; font-size: 1.1rem; }
                .final-price { font-size: 1.75rem !important; color: var(--color-black); }
                
                .atc-btn-main { background: var(--color-black); color: #fff; width: 100%; padding: 18px; border: none; border-radius: 8px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: transform 0.2s, background 0.2s; }
                .atc-btn-main:hover { background: #000; transform: translateY(-2px); }
                .atc-btn-main:disabled { background: #ccc; cursor: not-allowed; transform: none; }
                
                .secure-checkout-hint { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.75rem; color: var(--color-gray); margin-top: 20px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
                
                .cart-empty { text-align: center; padding: 80px 0; }
                .cart-empty-icon { font-size: 4rem; margin-bottom: 2rem; }
                .cart-empty h2 { font-family: var(--font-heading); font-size: 2rem; margin-bottom: 1rem; }
                .cart-empty p { color: var(--color-gray); margin-bottom: 3rem; max-width: 400px; margin-inline: auto; }

                @media (max-width: 991px) {
                    .cart-grid { grid-template-columns: 1fr; gap: 40px; }
                    .cart-summary-card { position: static; }
                }
                @media (max-width: 500px) {
                    .cart-item { grid-template-columns: 100px 1fr; }
                    .cart-item-price { grid-column: 1 / -1; text-align: right; margin-top: -30px; }
                }
            `}</style>
        </div>
    );
}
