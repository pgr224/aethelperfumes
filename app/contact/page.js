'use client';
import { useState, useEffect } from 'react';

export default function ContactPage() {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/settings')
            .then(res => res.json())
            .then(data => {
                if (data.settings) setSettings(data.settings);
                setLoading(false);
            });
    }, []);

    const renderAddress = (addr) => {
        if (!addr) return null;
        return addr.split('\n').map((line, i) => (
            <span key={i}>{line}<br /></span>
        ));
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="spinner"></div>
        </div>
    );

    return (
        <div className="contact-page">
            <section className="contact-hero">
                <div className="container">
                    <h1>Get in Touch</h1>
                    <p>Whether you have a question about our scents, orders, or just want to say hello, we're here for you.</p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="contact-grid">
                        <div className="contact-info">
                            <div className="info-block">
                                <span className="info-label">Visit Our Boutique</span>
                                <h3>{settings.contactStoreTitle || 'Grasse Boutique'}</h3>
                                <p>{renderAddress(settings.contactAddress) || '12 Rue Jean Ossola, 06130 Grasse, France'}</p>
                            </div>

                            <div className="info-block">
                                <span className="info-label">Contact Us</span>
                                <h3>Direct Channels</h3>
                                <p><strong>Email:</strong> {settings.contactEmail || 'atelier@aethel.com'}</p>
                                <p><strong>Concierge:</strong> {settings.contactPhone || '+33 4 93 36 01 23'}</p>
                            </div>

                            <div className="info-block">
                                <span className="info-label">Hours</span>
                                <h3>Atelier Hours</h3>
                                <div style={{ whiteSpace: 'pre-line', color: '#888', fontSize: '1rem', lineHeight: '1.6' }}>
                                    {settings.contactHours || 'Monday — Friday: 10:00 - 18:00\nSaturday: 11:00 - 17:00'}
                                </div>
                            </div>
                        </div>

                        <div className="contact-form-container card-glass">
                            <form className="contact-form">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" placeholder="Your name" required />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" placeholder="your@email.com" required />
                                </div>
                                <div className="form-group">
                                    <label>Subject</label>
                                    <select defaultValue="">
                                        <option value="" disabled>Select a topic</option>
                                        <option value="general">General Inquiry</option>
                                        <option value="order">Order Support</option>
                                        <option value="wholesale">Wholesale</option>
                                        <option value="press">Press & Media</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Message</label>
                                    <textarea rows="5" placeholder="How can we help you?" required></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary btn-full">Send Message</button>
                            </form>
                        </div>
                    </div>

                    {settings.contactMapUrl && (
                        <div className="contact-map-wrap">
                            <iframe 
                                src={settings.contactMapUrl}
                                width="100%" 
                                height="450" 
                                style={{ border: 0, borderRadius: '8px', filter: 'grayscale(1) invert(0.9) contrast(1.2)' }} 
                                allowFullScreen="" 
                                loading="lazy" 
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    )}
                </div>
            </section>

            <style jsx>{`
                .contact-page {
                    background-color: #0a0a0a;
                    padding-top: 80px;
                }
                .contact-hero {
                    padding: 80px 0;
                    text-align: center;
                    background: linear-gradient(to bottom, #111 0%, #0a0a0a 100%);
                }
                .contact-hero h1 {
                    font-size: 3.5rem;
                    color: #fff;
                    margin-bottom: 15px;
                }
                .contact-hero p {
                    color: #888;
                    font-size: 1.1rem;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .contact-grid {
                    display: grid;
                    grid-template-columns: 1fr 1.5fr;
                    gap: 80px;
                    align-items: start;
                    margin-bottom: 60px;
                }
                .info-block {
                    margin-bottom: 50px;
                }
                .info-label {
                    color: #c9a96e;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.2em;
                    display: block;
                    margin-bottom: 15px;
                }
                .info-block h3 {
                    font-size: 1.75rem;
                    color: #fff;
                    margin-bottom: 10px;
                }
                .info-block p {
                    color: #888;
                    font-size: 1rem;
                    line-height: 1.6;
                }
                .contact-form-container {
                    padding: 50px;
                    border-radius: 8px;
                    background: rgba(20, 20, 20, 0.8);
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .form-group {
                    margin-bottom: 25px;
                }
                .form-group label {
                    display: block;
                    color: #ddd;
                    font-size: 0.8rem;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .form-group input, 
                .form-group select, 
                .form-group textarea {
                    width: 100%;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 12px 15px;
                    color: #fff;
                    border-radius: 4px;
                    outline: none;
                }
                .form-group input:focus, 
                .form-group select:focus, 
                .form-group textarea:focus {
                    border-color: #c9a96e;
                }
                .btn-full {
                    width: 100%;
                }
                .contact-map-wrap {
                    margin-top: 40px;
                    padding-bottom: 80px;
                }
                @media (max-width: 991px) {
                    .contact-grid {
                        grid-template-columns: 1fr;
                        gap: 60px;
                    }
                }
            `}</style>
        </div>
    );
}
