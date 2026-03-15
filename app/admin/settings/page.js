'use client';
import { useState, useEffect } from 'react';

export default function AdminSettings() {
    const [settings, setSettings] = useState({
        currency: 'USD',
        currencySymbol: '$',
        paymentMethod: 'stripe',
        gatewayMode: 'test',
        taxRate: '0',
        shippingFlatRate: '15',
        storeStatus: 'active',
        contactEmail: 'concierge@aethel.com'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                if (data.settings) setSettings(data.settings);
                setLoading(false);
            });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                setMessage('Configuration updated successfully');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            console.error(err);
            setMessage('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="spinner" style={{ margin: '5rem auto' }}></div>;

    return (
        <div>
            <div style={{ marginBottom: '3rem' }}>
                <span className="section-subtitle">Infrastructure</span>
                <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Financial & System Control</h1>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    {/* Financial Infrastructure */}
                    <section className="admin-section" style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ marginBottom: '2rem', fontSize: '1.2rem', color: 'var(--color-gold)' }}>Financial Infrastructure</h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <label className="admin-label">BASE CURRENCY</label>
                                <select 
                                    className="newsletter-form input" 
                                    style={{ width: '100%', padding: '12px' }}
                                    value={settings.currency}
                                    onChange={e => setSettings({...settings, currency: e.target.value})}
                                >
                                    <option value="INR">INR - Indian Rupee</option>
                                    <option value="USD">USD - US Dollar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="GBP">GBP - British Pound</option>
                                    <option value="AED">AED - UAE Dirham</option>
                                </select>
                            </div>
                            <div>
                                <label className="admin-label">CURRENCY SYMBOL</label>
                                <input 
                                    className="newsletter-form input" 
                                    style={{ width: '100%', padding: '12px' }}
                                    value={settings.currencySymbol}
                                    onChange={e => setSettings({...settings, currencySymbol: e.target.value})}
                                />
                            </div>
                        </div>

                        <div style={{ marginTop: '2.5rem' }}>
                            <h4 style={{ fontSize: '0.8rem', color: 'var(--color-gray)', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Shipping Logistics</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div>
                                    <label className="admin-label">DOMESTIC RATE (INDIA)</label>
                                    <input 
                                        type="number"
                                        className="newsletter-form input" 
                                        style={{ width: '100%', padding: '12px' }}
                                        value={settings.shippingDomestic || '0'}
                                        onChange={e => setSettings({...settings, shippingDomestic: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="admin-label">INTERNATIONAL RATE</label>
                                    <input 
                                        type="number"
                                        className="newsletter-form input" 
                                        style={{ width: '100%', padding: '12px' }}
                                        value={settings.shippingInternational || '50'}
                                        onChange={e => setSettings({...settings, shippingInternational: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="admin-label">MIN ORDER FOR FREE SHIPPING</label>
                                    <input 
                                        type="number"
                                        className="newsletter-form input" 
                                        style={{ width: '100%', padding: '12px' }}
                                        value={settings.freeShippingThreshold || '5000'}
                                        onChange={e => setSettings({...settings, freeShippingThreshold: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="admin-label">SAMPLE SHIPPING RATE</label>
                                    <input 
                                        type="number"
                                        className="newsletter-form input" 
                                        style={{ width: '100%', padding: '12px' }}
                                        value={settings.sampleShippingRate || '99'}
                                        onChange={e => setSettings({...settings, sampleShippingRate: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Payment Gateways */}
                    <section className="admin-section" style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ marginBottom: '2rem', fontSize: '1.2rem', color: 'var(--color-gold)' }}>Payment Configurations</h3>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <label className="admin-label">UPI ID (FOR INDIA)</label>
                                <input 
                                    className="newsletter-form input" 
                                    style={{ width: '100%', padding: '12px' }}
                                    value={settings.upiId || ''}
                                    onChange={e => setSettings({...settings, upiId: e.target.value})}
                                    placeholder="yourname@bank"
                                />
                            </div>
                            <div>
                                <label className="admin-label">PAYPAL EMAIL (INTL)</label>
                                <input 
                                    className="newsletter-form input" 
                                    style={{ width: '100%', padding: '12px' }}
                                    value={settings.paypalEmail || ''}
                                    onChange={e => setSettings({...settings, paypalEmail: e.target.value})}
                                />
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label className="admin-label">CRYPTO WALLET (USDT/BTC)</label>
                                <input 
                                    className="newsletter-form input" 
                                    style={{ width: '100%', padding: '12px' }}
                                    value={settings.cryptoWallet || ''}
                                    onChange={e => setSettings({...settings, cryptoWallet: e.target.value})}
                                />
                            </div>
                        </div>
                    </section>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                    <section className="admin-section" style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Operations</h3>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label">STORE VISIBILITY</label>
                            <select 
                                className="newsletter-form input" 
                                style={{ width: '100%', padding: '12px' }}
                                value={settings.storeStatus}
                                onChange={e => setSettings({...settings, storeStatus: e.target.value})}
                            >
                                <option value="active">Online (Live)</option>
                                <option value="maintenance">Maintenance Mode</option>
                                <option value="private">Private / Invite Only</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <label className="admin-label">SUPPORT EMAIL</label>
                            <input 
                                className="newsletter-form input" 
                                style={{ width: '100%', padding: '12px' }}
                                value={settings.contactEmail}
                                onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                            />
                        </div>

                        {message && (
                            <div style={{ 
                                padding: '1rem', 
                                background: 'rgba(46, 204, 113, 0.1)', 
                                color: '#2ecc71', 
                                borderRadius: '4px', 
                                fontSize: '0.8rem', 
                                marginBottom: '1.5rem',
                                border: '1px solid #2ecc71'
                            }}>
                                {message}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            style={{ width: '100%' }}
                            disabled={saving}
                        >
                            {saving ? 'Synchronizing...' : 'Save Configuration'}
                        </button>
                    </section>

                    <section className="admin-section" style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--color-gold)' }}>Referral Rewards</h3>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label">REWARD AMOUNT ({settings.currencySymbol})</label>
                            <input 
                                type="number"
                                className="newsletter-form input" 
                                style={{ width: '100%', padding: '12px' }}
                                value={settings.referralReward || '20'}
                                onChange={e => setSettings({...settings, referralReward: e.target.value})}
                            />
                        </div>
                    </section>

                    <section className="admin-section" style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', color: 'var(--color-gold)' }}>Intelligence & Automation</h3>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label">ORDER ABANDONMENT (HRS)</label>
                            <input 
                                type="number"
                                className="newsletter-form input" 
                                style={{ width: '100%', padding: '12px' }}
                                value={settings.orderAbandonedHours || '2'}
                                onChange={e => setSettings({...settings, orderAbandonedHours: e.target.value})}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label className="admin-label">CART STALE (HRS)</label>
                            <input 
                                type="number"
                                className="newsletter-form input" 
                                style={{ width: '100%', padding: '12px' }}
                                value={settings.cartAbandonedHours || '4'}
                                onChange={e => setSettings({...settings, cartAbandonedHours: e.target.value})}
                            />
                        </div>
                    </section>
                </div>
            </form>
        </div>
    );
}
