'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function Footer({ previewSettings = null, isPreview = false }) {
    const pathname = usePathname();
    const [settings, setSettings] = useState({});

    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (previewSettings) {
            setSettings(previewSettings);
            return;
        }
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                if (data.settings) setSettings(data.settings);
            });
    }, [previewSettings]);

    if (!isPreview && pathname?.startsWith('/admin')) return null;


    const handleSubscribe = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus('');
        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                setStatus('Thank you for joining the Aethel Sphere.');
                setEmail('');
            } else {
                setStatus(data.error);
            }
        } catch (err) {
            setStatus('An error occurred. Try again later.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <footer className="footer" style={{ background: 'var(--color-black)' }}>
            <div className="footer-newsletter">
                <div className="container">
                    <span className="section-subtitle">Stay Inspired</span>
                    <h3>Join The Aethel Sphere</h3>
                    <p>Subscribe to receive early access to new collections and exclusive event invitations.</p>
                    <form className="newsletter-form" onSubmit={handleSubscribe}>
                        <input 
                            type="email" 
                            placeholder="Enter your email address" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={submitting}
                        />
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Joining...' : 'Subscribe'}
                        </button>
                    </form>
                    {status && (
                        <p style={{ 
                            marginTop: '1rem', 
                            color: status.includes('Thank') ? 'var(--color-gold)' : 'var(--color-error)',
                            fontSize: '0.85rem'
                        }}>
                            {status}
                        </p>
                    )}
                </div>
            </div>

            <div className="container">
                <div className="footer-main">
                    <div className="footer-about">
                        <Link href="/" className="logo">
                            {settings.logoUrl ? <img src={settings.logoUrl} alt="AETHEL" style={{ width: '120px' }} /> : 'AETHEL'}
                            {!settings.logoUrl && <span>Paris</span>}
                        </Link>
                        <p>
                            {settings.footerAbout || "Crafting extraordinary fragrances that capture the essence of fleeting moments. Our scents are composed in Grasse, using the world's most precious ingredients."}
                        </p>
                        <div className="footer-social">
                            {settings.instagramHandle && <a href={`https://instagram.com/${settings.instagramHandle}`} target="_blank">IG</a>}
                            {settings.twitterHandle && <a href={`https://twitter.com/${settings.twitterHandle}`} target="_blank">TW</a>}
                            {settings.whatsappNumber && <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank">WA</a>}
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4>Boutique</h4>
                        <ul>
                            <li><Link href="/products">All Fragrances</Link></li>
                            <li><Link href="/products?category=eau-de-parfum">Eau de Parfum</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Client Care</h4>
                        <ul>
                            <li><Link href="/contact">Contact Us</Link></li>
                            <li><Link href="/p/shipping-returns">Shipping & Returns</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Heritage</h4>
                        <ul>
                            <li><Link href="/blog">Our Story</Link></li>
                            <li><Link href="/p/terms-conditions">Terms & Conditions</Link></li>
                            <li><Link href="/p/privacy-policy">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <p>&copy; {new Date().getFullYear()} AETHEL PARFUMS. {settings.copyrightText || 'ALL RIGHTS RESERVED.'}</p>
                </div>
            </div>
        </footer>
    );
}
