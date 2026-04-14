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
                <header className="checkout-header">
                    <h1 className="page-title">Checkout</h1>
                    <div className="breadcrumb">
                        <Link href="/cart">Cart</Link>
                        <span className="separator">/</span>
                        <span className="current">Checkout</span>
                    </div>
                </header>

                <div className="checkout-grid">
                    <div className="checkout-main">
                        {!user && (
                            <div className="guest-login-notice">
                                <p>Already have an account? <Link href="/account">Log in</Link> for a faster experience.</p>
                            </div>
                        )}

                        <form className="checkout-form" onSubmit={handleCheckout}>
                            {error && <div className="error-banner">{error}</div>}

                            <section className="checkout-section">
                                <h2 className="section-heading">Contact Information</h2>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" name="email" defaultValue={user?.email || ''} required placeholder="email@example.com" />
                                </div>
                            </section>

                            <section className="checkout-section">
                                <h2 className="section-heading">Shipping Address</h2>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input type="text" name="firstName" defaultValue={user?.firstName || ''} required placeholder="First Name" />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input type="text" name="lastName" defaultValue={user?.lastName || ''} required placeholder="Last Name" />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Street Address</label>
                                    <input type="text" name="address" required placeholder="House number and street name" />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>City</label>
                                        <input type="text" name="city" required placeholder="City" />
                                    </div>
                                    <div className="form-group">
                                        <label>Postal Code</label>
                                        <input type="text" name="zipCode" required placeholder="ZIP / Postcode" />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Country / Region</label>
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
                            </section>

                            <section className="checkout-section">
                                <h2 className="section-heading">Payment Information</h2>
                                <div className="payment-selector">
                                    {selectedCountry === 'IN' ? (
                                        <>
                                            <label className={`payment-card ${paymentMethod === 'UPI' ? 'active' : ''}`}>
                                                <input type="radio" name="paymentMethod" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} />
                                                <div className="payment-card-content">
                                                    <span className="payment-card-title">UPI / QR Code</span>
                                                    <span className="payment-card-desc">GPay, PhonePe, Paytm</span>
                                                </div>
                                            </label>
                                            <label className={`payment-card ${paymentMethod === 'COD' ? 'active' : ''}`}>
                                                <input type="radio" name="paymentMethod" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                                                <div className="payment-card-content">
                                                    <span className="payment-card-title">Cash on Delivery</span>
                                                    <span className="payment-card-desc">Pay when items arrive</span>
                                                </div>
                                            </label>
                                        </>
                                    ) : (
                                        <>
                                            <label className={`payment-card ${paymentMethod === 'CREDIT_CARD' ? 'active' : ''}`}>
                                                <input type="radio" name="paymentMethod" value="CREDIT_CARD" checked={paymentMethod === 'CREDIT_CARD'} onChange={() => setPaymentMethod('CREDIT_CARD')} />
                                                <div className="payment-card-content">
                                                    <span className="payment-card-title">Credit / Debit Card</span>
                                                    <span className="payment-card-desc">Visa, Mastercard, Amex</span>
                                                </div>
                                            </label>
                                            <label className={`payment-card ${paymentMethod === 'PAYPAL' ? 'active' : ''}`}>
                                                <input type="radio" name="paymentMethod" value="PAYPAL" checked={paymentMethod === 'PAYPAL'} onChange={() => setPaymentMethod('PAYPAL')} />
                                                <div className="payment-card-content">
                                                    <span className="payment-card-title">PayPal</span>
                                                    <span className="payment-card-desc">Fast and secure</span>
                                                </div>
                                            </label>
                                        </>
                                    )}
                                </div>

                                <div className="payment-details-info">
                                    {paymentMethod === 'UPI' && selectedCountry === 'IN' && settings.upiId && (
                                        <div className="qr-box">
                                            <div className="qr-header">
                                                <span className="qr-badge">Instant Pay</span>
                                                <p>Scan to pay precisely {settings.currencySymbol}{Math.max(0, cart.total + calculateShipping() - discount - (useReferralBalance && user ? user.referralBalance : 0)).toFixed(2)}</p>
                                            </div>
                                            <div className="qr-image-wrap">
                                                <img 
                                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${settings.upiId}&pn=Aethel%20Perfumes&am=${Math.max(0, cart.total + calculateShipping() - discount - (useReferralBalance && user ? user.referralBalance : 0)).toFixed(2)}&cu=INR`} 
                                                    alt="UPI QR Code" 
                                                />
                                            </div>
                                            <div className="qr-footer">
                                                <code>VPA: {settings.upiId}</code>
                                            </div>
                                        </div>
                                    )}
                                    {paymentMethod === 'COD' && (
                                        <div className="method-notice">
                                            <span>💵</span> Pay precisely the order total in cash to our delivery partner.
                                        </div>
                                    )}
                                    {paymentMethod === 'CREDIT_CARD' && (
                                        <div className="method-notice">
                                            <span>💳</span> You will be redirected to our secure payment gateway (Stripe).
                                        </div>
                                    )}
                                    {paymentMethod === 'PAYPAL' && (
                                        <div className="method-notice">
                                            <span>🅿️</span> You will be logged into PayPal to authorize the transaction.
                                        </div>
                                    )}
                                </div>
                            </section>

                            <button 
                                type="submit" 
                                className="atc-btn-main btn-lg mt-4" 
                                disabled={processing || cart.items.some(item => !item.product.inStock || item.product.stock === 0)}
                            >
                                {processing ? 'Processing Order...' : 
                                 cart.items.some(item => !item.product.inStock || item.product.stock === 0) ? 'Correct Order to Proceed' :
                                 `Complete Purchase • ${settings.currencySymbol}${Math.max(0, cart.total + calculateShipping() - discount - (useReferralBalance && user ? user.referralBalance : 0)).toFixed(2)}`}
                            </button>
                        </form>
                    </div>

                    <aside className="checkout-sidebar">
                        <div className="order-summary-box">
                            <h3 className="summary-title">Order Summary</h3>
                            <div className="summary-items">
                                {cart.items.map(item => (
                                    <div key={item.id} className="summary-item">
                                        <div className="summary-item-img">
                                            <img src={item.product.images[0]} alt={item.product.name} />
                                            <span className="summary-item-qty">{item.quantity}</span>
                                        </div>
                                        <div className="summary-item-info">
                                            <h4>{item.product.name}</h4>
                                            <p>{item.product.volume}</p>
                                        </div>
                                        <div className="summary-item-price">
                                            {settings.currencySymbol}{((item.product.salePrice || item.product.price) * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-calculations">
                                <div className="sum-row">
                                    <span>Subtotal</span>
                                    <span>{settings.currencySymbol}{cart.total.toFixed(2)}</span>
                                </div>
                                <div className="sum-row">
                                    <span>Shipping</span>
                                    <span>{calculateShipping() === 0 ? 'Free' : `${settings.currencySymbol}${calculateShipping().toFixed(2)}`}</span>
                                </div>
                                {(discount > 0 || (useReferralBalance && user?.referralBalance > 0)) && (
                                    <div className="sum-row discount">
                                        <span>Total Savings</span>
                                        <span>-{settings.currencySymbol}{(discount + (useReferralBalance ? user.referralBalance : 0)).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="sum-total">
                                    <span>Total</span>
                                    <span>{settings.currencySymbol}{Math.max(0, cart.total + calculateShipping() - (discount + (useReferralBalance ? user.referralBalance : 0))).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <style jsx>{`
                .checkout-page { padding: 140px 0 100px; background: var(--color-white-off); min-height: 100vh; }
                .checkout-header { text-align: center; margin-bottom: 4rem; }
                .page-title { font-family: var(--font-heading); font-size: 2.5rem; margin-bottom: 0.5rem; }
                .breadcrumb { font-size: 0.8rem; color: var(--color-gray); letter-spacing: 0.05em; text-transform: uppercase; display: flex; justify-content: center; gap: 10px; }
                .separator { opacity: 0.3; }
                .current { color: var(--color-black); font-weight: 600; }
                
                .checkout-grid { display: grid; grid-template-columns: 1fr 400px; gap: 60px; align-items: start; }
                
                .guest-login-notice { background: #fff; padding: 20px; border-radius: 8px; border: 1px solid var(--color-gray-light); margin-bottom: 30px; font-size: 0.9rem; }
                .guest-login-notice a { color: var(--color-black); font-weight: 600; text-decoration: underline; }
                
                .checkout-form { display: flex; flex-direction: column; gap: 40px; }
                .checkout-section { background: #fff; padding: 30px; border-radius: 12px; border: 1px solid var(--color-gray-light); }
                .section-heading { font-family: var(--font-heading); font-size: 1.5rem; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid var(--color-gray-light); }
                
                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-gray); margin-bottom: 8px; font-weight: 600; }
                .form-group input, .form-group select { width: 100%; border: 1px solid var(--color-gray-light); padding: 12px 16px; border-radius: 6px; background: var(--color-white-off); outline: none; transition: border-color 0.2s; font-size: 0.95rem; }
                .form-group input:focus { border-color: var(--color-black); }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

                .payment-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
                .payment-card { border: 1px solid var(--color-gray-light); padding: 20px; border-radius: 8px; cursor: pointer; transition: all 0.2s; background: var(--color-white-off); }
                .payment-card:hover { border-color: var(--color-black); }
                .payment-card.active { border-color: var(--color-black); background: #fff; box-shadow: var(--shadow-sm); }
                .payment-card input { display: none; }
                .payment-card-title { display: block; font-weight: 600; font-size: 0.95rem; margin-bottom: 4px; }
                .payment-card-desc { display: block; font-size: 0.75rem; color: var(--color-gray); }

                .qr-box { background: var(--color-white-off); padding: 40px; border-radius: 12px; text-align: center; border: 2px dashed var(--color-gray-light); }
                .qr-header { margin-bottom: 25px; }
                .qr-badge { background: var(--color-black); color: #fff; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 10px; border-radius: 20px; margin-bottom: 10px; display: inline-block; }
                .qr-header p { font-size: 0.85rem; color: var(--color-gray); }
                .qr-image-wrap { background: #fff; display: inline-block; padding: 15px; border-radius: 8px; box-shadow: var(--shadow-sm); margin-bottom: 20px; }
                .qr-footer code { font-size: 0.85rem; background: #eee; padding: 4px 10px; border-radius: 4px; }
                
                .method-notice { padding: 20px; background: #f9f9f9; border-radius: 8px; border: 1px solid #eee; font-size: 0.9rem; color: var(--color-gray); }
                .method-notice span { font-size: 1.2rem; margin-right: 10px; }

                .order-summary-box { background: #fff; padding: 30px; border-radius: 12px; border: 1px solid var(--color-gray-light); position: sticky; top: 120px; }
                .summary-items { max-height: 380px; overflow-y: auto; margin-bottom: 25px; }
                .summary-item { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
                .summary-item-img { position: relative; width: 64px; height: 64px; border-radius: 6px; overflow: hidden; border: 1px solid #eee; flex-shrink: 0; }
                .summary-item-img img { width: 100%; height: 100%; object-fit: contain; }
                .summary-item-qty { position: absolute; top: -5px; right: -5px; background: var(--color-black); color: #fff; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold; }
                .summary-item-info h4 { font-size: 0.9rem; margin-bottom: 2px; }
                .summary-item-info p { font-size: 0.75rem; color: var(--color-gray); }
                .summary-item-price { margin-left: auto; font-weight: 600; font-size: 0.9rem; }
                
                .summary-calculations { border-top: 1px solid var(--color-gray-light); padding-top: 20px; display: flex; flex-direction: column; gap: 12px; }
                .sum-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--color-gray); }
                .sum-row.discount { color: var(--color-accent-green); }
                .sum-total { border-top: 1px solid var(--color-gray-light); padding-top: 15px; margin-top: 5px; display: flex; justify-content: space-between; font-weight: 700; font-size: 1.25rem; color: var(--color-black); }

                .atc-btn-main { background: var(--color-black); color: #fff; width: 100%; padding: 18px; border: none; border-radius: 8px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: transform 0.2s, background 0.2s; }
                .atc-btn-main:hover { background: #000; transform: translateY(-2px); }
                .atc-btn-main:disabled { background: #ccc; cursor: not-allowed; transform: none; }
                .error-banner { padding: 15px; background: var(--color-error); color: #fff; border-radius: 6px; margin-bottom: 20px; font-size: 0.9rem; }

                @media (max-width: 991px) {
                    .checkout-grid { grid-template-columns: 1fr; }
                    .checkout-sidebar { display: none; }
                }
            `}</style>
        </div>
    );
}
