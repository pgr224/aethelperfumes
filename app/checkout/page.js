'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [settings, setSettings] = useState({
        currencySymbol: '$',
        shippingDomestic: 0,
        shippingInternational: 50,
        freeShippingThreshold: 5000,
        upiId: ''
    });
    const [selectedCountry, setSelectedCountry] = useState('IN');
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [useReferralBalance, setUseReferralBalance] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [discount, setDiscount] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState('UPI');
    const [error, setError] = useState('');

    useEffect(() => {
        if (selectedCountry === 'IN') {
            setPaymentMethod('UPI');
        } else {
            setPaymentMethod('CREDIT_CARD');
        }
    }, [selectedCountry]);

    const verifyAndApplyCoupon = useCallback(async (code, amount) => {
        if (!code) return;
        setCouponError('');
        try {
            const res = await fetch(`/api/coupons/verify?code=${code}&amount=${amount}`);
            const data = await res.json();
            if (res.ok && data.valid) {
                setAppliedCoupon(data.coupon);
                setDiscount(data.discount);
            } else {
                setCouponError(data.error || 'Invalid coupon');
                localStorage.removeItem('applied_coupon');
            }
        } catch (err) {
            setCouponError('Failed to verify coupon');
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;

        const fetchCheckoutData = async () => {
            try {
                // Fetch Settings
                const setRes = await fetch('/api/admin/settings', { signal });
                if (!setRes.ok) throw new Error(`Settings fetch failed: ${setRes.status}`);
                const setData = await setRes.json();
                if (setData.settings) {
                    setSettings(prev => ({ ...prev, ...setData.settings }));
                }

                // Fetch Cart
                const cartRes = await fetch('/api/cart', { signal });
                if (!cartRes.ok) throw new Error(`Cart fetch failed: ${cartRes.status}`);
                const cartData = await cartRes.json();

                if (!cartData.items || cartData.items.length === 0) {
                    router.push('/cart');
                    return;
                }
                setCart(cartData);

                // Try to fetch User
                try {
                    const userRes = await fetch('/api/user/profile', { signal });
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        const profile = userData.profile;
                        setUser(profile);

                        // Sync Referral Balance preference from Cart
                        const savedRefUsage = localStorage.getItem('use_referral_balance');
                        if (savedRefUsage === 'true' && profile.referralBalance > 0) {
                            setUseReferralBalance(true);
                        }
                    }
                } catch (userErr) {
                    if (userErr.name !== 'AbortError') {
                        console.warn('User profile fetch failed (optional):', userErr);
                    }
                }

                // Sync Coupon from Cart
                const savedCoupon = localStorage.getItem('applied_coupon');
                if (savedCoupon) {
                    try {
                        const coupon = JSON.parse(savedCoupon);
                        setCouponCode(coupon.code);
                        await verifyAndApplyCoupon(coupon.code, cartData.total);
                    } catch (e) {
                        if (e.name !== 'AbortError') {
                            console.warn('Failed to parse or apply saved coupon', e);
                        }
                    }
                }
            } catch (err) {
                if (err.name === 'AbortError') return;
                console.error('Checkout Data Error:', err.message || err);
                setError(`Initialization error: ${err.message || 'Check connection'}`);
            } finally {
                if (!signal.aborted) setLoading(false);
            }
        };

        fetchCheckoutData();
        return () => controller.abort();
    }, [router, verifyAndApplyCoupon]);

    const calculateShipping = () => {
        if (!cart) return 0;
        if (cart.total >= parseFloat(settings.freeShippingThreshold)) return 0;
        
        const isSampleOnly = cart.items.every(item => item.product.slug.includes('sample'));
        if (isSampleOnly) return parseFloat(settings.sampleShippingRate || 99);

        return selectedCountry === 'IN' 
            ? parseFloat(settings.shippingDomestic || 0) 
            : parseFloat(settings.shippingInternational || 50);
    };

    const applyCoupon = () => verifyAndApplyCoupon(couponCode, cart.total);

    const handleCheckout = async (e) => {
        e.preventDefault();
        setProcessing(true);
        setError('');

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        const shipping = calculateShipping();
        const referralUsed = useReferralBalance ? user.referralBalance : 0;
        const totalDiscount = discount + referralUsed;
        const total = Math.max(0, cart.total + shipping - totalDiscount);

        const savedRef = localStorage.getItem('aethel_ref_code');

        const payload = {
            ...data,
            paymentMethod,
            items: cart.items,
            subtotal: cart.total,
            shipping,
            discount: totalDiscount,
            couponCode: appliedCoupon?.code,
            referralBalanceUsed: referralUsed,
            referralCode: savedRef,
            total
        };

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (res.ok) {
                router.push(`/checkout/success?order=${result.orderNumber}`);
            } else {
                setError(result.error || 'Checkout failed');
                setProcessing(false);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
            setProcessing(false);
        }
    };

    if (loading) return <div className="section container skeleton" style={{ height: '80vh', marginTop: '100px' }}></div>;
    if (!cart) return null;

    const shipping = cart.total > 150 ? 0 : 15;

    return (
        <div className="checkout-page">
            <div className="container">
                <h1 className="section-title text-center" style={{ marginBottom: '3rem' }}>Secure Checkout</h1>

                <div className="checkout-grid">
                    <div className="checkout-form-container">
                        {!user && (
                            <div className="checkout-guest-notice card-glass mb-4">
                                <p>Already have an account?</p>
                                <Link href="/account" className="btn btn-outline btn-sm">Log in for faster checkout</Link>
                            </div>
                        )}

                        <form className="checkout-form card-glass" onSubmit={handleCheckout}>
                            {error && <div className="error-message">{error}</div>}

                            <h3 className="form-section-title">Contact Information</h3>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" name="email" defaultValue={user?.email || ''} required />
                            </div>

                            <h3 className="form-section-title mt-4">Shipping Address</h3>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input type="text" name="firstName" defaultValue={user?.firstName || ''} required />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input type="text" name="lastName" defaultValue={user?.lastName || ''} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <input type="text" name="address" required />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>City</label>
                                    <input type="text" name="city" required />
                                </div>
                                <div className="form-group">
                                    <label>Postal Code</label>
                                    <input type="text" name="zipCode" required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Country</label>
                                <select 
                                    name="country" 
                                    value={selectedCountry}
                                    onChange={e => setSelectedCountry(e.target.value)}
                                    required
                                >
                                    <option value="IN">India</option>
                                    <option value="FR">France</option>
                                    <option value="UK">United Kingdom</option>
                                    <option value="US">United States</option>
                                    <option value="AE">UAE</option>
                                    <option value="INT">International (Other)</option>
                                </select>
                            </div>

                            <h3 className="form-section-title mt-4">Payment Method</h3>
                            
                            {selectedCountry === 'IN' ? (
                                <div className="payment-options">
                                    <label className={`payment-option ${paymentMethod === 'UPI' ? 'active' : ''}`}>
                                        <input type="radio" name="paymentMethod" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
                                        <span>UPI App / QR Scan</span>
                                    </label>
                                    <label className={`payment-option ${paymentMethod === 'COD' ? 'active' : ''}`}>
                                        <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                                        <span>Cash on Delivery</span>
                                    </label>
                                </div>
                            ) : (
                                <div className="payment-options">
                                    <label className={`payment-option ${paymentMethod === 'CREDIT_CARD' ? 'active' : ''}`}>
                                        <input type="radio" name="paymentMethod" value="CREDIT_CARD" checked={paymentMethod === 'CREDIT_CARD'} onChange={() => setPaymentMethod('CREDIT_CARD')} />
                                        <span>Credit / Debit Card</span>
                                    </label>
                                    <label className={`payment-option ${paymentMethod === 'PAYPAL' ? 'active' : ''}`}>
                                        <input type="radio" name="paymentMethod" value="PAYPAL" checked={paymentMethod === 'PAYPAL'} onChange={() => setPaymentMethod('PAYPAL')} />
                                        <span>PayPal</span>
                                    </label>
                                </div>
                            )}

                            <div className="payment-simulation mt-3">
                                {paymentMethod === 'UPI' && selectedCountry === 'IN' && settings.upiId && (
                                    <div className="upi-payment card-glass mb-4" style={{ padding: '20px', textAlign: 'center', border: '1px solid var(--color-gold)' }}>
                                        <p style={{ color: 'var(--color-gold)', fontWeight: 'bold', marginBottom: '1rem' }}>Pay via UPI (Scan QR)</p>
                                        <div style={{ background: '#fff', padding: '10px', display: 'inline-block', borderRadius: '8px', margin: '0 auto 1rem' }}>
                                            <img 
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${settings.upiId}&pn=Aethel%20Perfumes&am=${Math.max(0, cart.total + calculateShipping() - discount - (useReferralBalance && user ? user.referralBalance : 0)).toFixed(2)}&cu=INR`} 
                                                alt="UPI QR Code" 
                                            />
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: '#888' }}>VPA: {settings.upiId}</p>
                                    </div>
                                )}
                                {paymentMethod === 'COD' && (
                                    <div className="payment-notice">
                                        <span className="icon">💵</span>
                                        <p>Pay with cash upon delivery. An additional processing fee may apply on premium orders.</p>
                                    </div>
                                )}
                                {paymentMethod === 'CREDIT_CARD' && (
                                    <div className="payment-notice">
                                        <span className="icon">💳</span>
                                        <p>You will be redirected to our secure Stripe gateway to complete your transaction protecting your details.</p>
                                    </div>
                                )}
                                {paymentMethod === 'PAYPAL' && (
                                    <div className="payment-notice">
                                        <span className="icon">🅿️</span>
                                        <p>You will be securely redirected to PayPal to complete your purchase.</p>
                                    </div>
                                )}
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-primary btn-full btn-lg mt-4" 
                                disabled={processing || cart.items.some(item => !item.product.inStock || item.product.stock === 0)}
                            >
                                {processing ? 'Processing Order...' : 
                                 cart.items.some(item => !item.product.inStock || item.product.stock === 0) ? 'Items Out of Stock' :
                                 `Complete Order • ${settings.currencySymbol}${Math.max(0, cart.total + calculateShipping() - discount - (useReferralBalance && user ? user.referralBalance : 0)).toFixed(2)}`}
                            </button>
                        </form>
                    </div>

                    <div className="checkout-summary card-glass">
                        <h3>Order Summary</h3>

                        <div className="summary-items">
                            {cart.items.map(item => (
                                <div key={item.id} className="summary-item">
                                    <div className="summary-item-image">
                                        <img src={item.product.images[0]} alt={item.product.name} />
                                        <span className="summary-item-qty">{item.quantity}</span>
                                    </div>
                                    <div className="summary-item-details">
                                        <h4>{item.product.name}</h4>
                                        <p>{item.product.volume}</p>
                                        {(!item.product.inStock || item.product.stock === 0) && (
                                            <span style={{ color: '#ff4b4b', fontSize: '0.7rem', fontWeight: 'bold' }}>OUT OF STOCK - Please remove from cart</span>
                                        )}
                                    </div>
                                    <div className="summary-item-price">
                                        {settings.currencySymbol}{((item.product.salePrice || item.product.price) * item.quantity).toFixed(2)}
                                     </div>
                                 </div>
                            ))}
                        </div>

                        <div className="promo-section" style={{ marginBottom: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="form-group mb-2">
                                <label style={{ fontSize: '0.65rem' }}>HAVE A COUPON?</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input 
                                        type="text" 
                                        placeholder="Enter code" 
                                        style={{ flex: 1, padding: '8px' }}
                                        value={couponCode}
                                        onChange={e => setCouponCode(e.target.value)}
                                    />
                                    <button 
                                        type="button" 
                                        className="btn btn-dark btn-sm"
                                        style={{ padding: '8px 15px' }}
                                        onClick={applyCoupon}
                                    >
                                        Apply
                                    </button>
                                </div>
                                {couponError && <p style={{ color: '#e74c3c', fontSize: '0.75rem', marginTop: '5px' }}>{couponError}</p>}
                                {appliedCoupon && <p style={{ color: '#2ecc71', fontSize: '0.75rem', marginTop: '5px' }}>Coupon {appliedCoupon.code} applied!</p>}
                            </div>

                            {user && user.referralBalance > 0 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1rem', padding: '10px', background: 'rgba(201,169,110,0.05)', borderRadius: '4px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={useReferralBalance}
                                        onChange={e => setUseReferralBalance(e.target.checked)}
                                    />
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-gold)' }}>
                                        Use Referral Balance: {settings.currencySymbol}{user.referralBalance.toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="summary-totals">
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>{settings.currencySymbol}{cart.total.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>{calculateShipping() === 0 ? 'Complimentary' : `${settings.currencySymbol}${calculateShipping().toFixed(2)}`}</span>
                            </div>

                            {(discount > 0 || (useReferralBalance && user?.referralBalance > 0)) && (
                                <div className="summary-row" style={{ color: '#2ecc71' }}>
                                    <span>Discount</span>
                                    <span>-{settings.currencySymbol}{(discount + (useReferralBalance ? user.referralBalance : 0)).toFixed(2)}</span>
                                </div>
                            )}

                            <div className="summary-row total mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <span>Total</span>
                                <span className="text-gold" style={{ fontSize: '1.5rem', fontFamily: "'Playfair Display', serif" }}>
                                    {settings.currencySymbol}{Math.max(0, cart.total + calculateShipping() - (discount + (useReferralBalance ? user.referralBalance : 0))).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .checkout-page { padding: 120px 0 80px; background-color: #0a0a0a; min-height: 100vh; }
                .checkout-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 40px; align-items: start; }
                .checkout-guest-notice { padding: 20px; display: flex; justify-content: space-between; align-items: center; }
                .checkout-form { padding: 40px; }
                .form-section-title { font-size: 1.2rem; margin-bottom: 20px; color: #fff; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); }
                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; color: #ddd; font-size: 0.8rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
                .form-group input, .form-group select { width: 100%; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); padding: 12px 15px; color: #fff; border-radius: 4px; outline: none; transition: border-color 0.3s; }
                .form-group input:focus, .form-group select:focus { border-color: #c9a96e; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                
                .payment-notice { display: flex; gap: 15px; padding: 20px; background: rgba(201,169,110,0.1); border: 1px solid rgba(201,169,110,0.3); border-radius: 8px; }
                .payment-notice p { margin: 0; color: #c9a96e; font-size: 0.9rem; line-height: 1.5; }
                
                .payment-options { display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; }
                .payment-option { flex: 1; display: flex; align-items: center; gap: 10px; padding: 15px; background: rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; cursor: pointer; transition: all 0.3s; margin: 0; min-width: 150px; }
                .payment-option:hover { border-color: rgba(201,169,110,0.5); }
                .payment-option.active { border-color: var(--color-gold); background: rgba(201,169,110,0.05); }
                .payment-option span { color: #fff; font-weight: 500; font-size: 0.9rem; }
                
                .checkout-summary { padding: 30px; position: sticky; top: 100px; }
                .checkout-summary h3 { font-size: 1.2rem; margin-bottom: 20px; color: #fff; padding-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); }
                .summary-items { max-height: 40vh; overflow-y: auto; padding-right: 10px; margin-bottom: 20px; }
                .summary-item { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
                .summary-item-image { position: relative; width: 60px; height: 60px; border-radius: 8px; overflow: hidden; background: #000; }
                .summary-item-image img { width: 100%; height: 100%; object-fit: cover; }
                .summary-item-qty { position: absolute; top: -5px; right: -5px; background: #c9a96e; color: #000; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold; }
                .summary-item-details { flex: 1; }
                .summary-item-details h4 { font-size: 0.9rem; color: #fff; margin-bottom: 5px; }
                .summary-item-details p { font-size: 0.8rem; color: #888; margin: 0; }
                .summary-item-price { font-weight: 600; color: #c9a96e; }
                
                .summary-row { display: flex; justify-content: space-between; margin-bottom: 10px; color: #ccc; font-size: 0.9rem; }
                .text-gold { color: #c9a96e; }
                .error-message { background: rgba(255, 75, 75, 0.1); color: #ff4b4b; padding: 12px; border-radius: 4px; margin-bottom: 20px; font-size: 0.9rem; border: 1px solid rgba(255, 75, 75, 0.2); }

                @media (max-width: 991px) {
                    .checkout-grid { grid-template-columns: 1fr; }
                    .checkout-summary { position: static; order: -1; }
                }
            `}</style>
        </div>
    );
}
