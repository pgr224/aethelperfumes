'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Gift, Share2, Users, Wallet, Copy, CheckCircle, Zap, Bell, Mail, MessageSquare, Award, Star, Trophy } from 'lucide-react';

export default function ReferralDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        emailNotifications: true,
        whatsappNotifications: true
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        fetch('/api/user/referrals')
            .then(res => res.json())
            .then(json => {
                setData(json);
                setSettings({
                    emailNotifications: json.emailNotifications ?? true,
                    whatsappNotifications: json.whatsappNotifications ?? true
                });
                setLoading(false);
            })
            .catch(e => {
                console.error("Failed to load referrals", e);
                setLoading(false);
            });
    };

    const updateSettings = async (newSettings) => {
        setSaving(true);
        try {
            await fetch('/api/user/referrals/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            });
            setSettings(newSettings);
        } finally {
            setSaving(false);
        }
    };

    const copyCode = () => {
        if (!data || !data.referralCode) return;
        const referralLink = `${window.location.origin}/register?ref=${data.referralCode}`;
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return (
        <div className="referrals-page">
            <Header />
            <div className="spinner" style={{ margin: '10rem auto' }}></div>
        </div>
    );

    if (!data) return (
        <div className="referrals-page">
            <Header />
            <div className="container">
                <p style={{ textAlign: 'center', marginTop: '10rem' }}>Failed to load ambassador data. Please log in.</p>
            </div>
        </div>
    );

    const referralLink = `${window.location.origin}/register?ref=${data.referralCode}`;
    const tier = data.tier || 'BRONZE';

    const getTierIcon = () => {
        if (tier === 'GOLD') return <Trophy color="var(--color-gold)" size={32} />;
        if (tier === 'SILVER') return <Award color="var(--color-gray-light)" size={32} />;
        return <Star color="#b87333" size={32} />;
    };

    const multiplier = tier === 'GOLD' ? '1.5x' : (tier === 'SILVER' ? '1.25x' : '1.0x');

    const creditsPending = data.referrals ? data.referrals.filter(r => r.status === 'PENDING').reduce((acc, r) => acc + r.rewardAmount, 0) : 0;
    const balance = data.balance || 0;
    const totalReferrals = data.referrals ? data.referrals.length : 0;

    return (
        <main className="referrals-page">
            <Header />
            
            <section className="section referral-dashboard-section">
                <div className="container">
                    
                    {/* Header Row */}
                    <div className="ref-header">
                        <div className="ref-header-text">
                            <span className="section-subtitle">Ambassador Intelligence</span>
                            <h1 className="section-title">Share the Essence, <br /><span className="text-gold">Earn Rewards.</span></h1>
                        </div>
                        
                        <div className="ref-status-card">
                            <div className="ref-status-icon">
                                {getTierIcon()}
                            </div>
                            <div className="ref-status-info">
                                <div className="status-label">Current Status</div>
                                <div className="status-tier">{tier}</div>
                                <div className="status-multiplier">{multiplier} Reward Multiplier</div>
                            </div>
                        </div>
                    </div>

                    <div className="ref-main-grid">
                        {/* Metrics Panel */}
                        <div className="ref-metrics">
                            <StatCard icon={<Wallet size={20}/>} label="Available Credit" value={`$${balance.toLocaleString()}`} />
                            <StatCard icon={<Users size={20}/>} label="Total Referrals" value={totalReferrals} />
                            <StatCard icon={<Zap size={20}/>} label="Credits Pending" value={`$${creditsPending.toLocaleString()}`} />
                        </div>

                        {/* Notifications Panel */}
                        <div className="ref-notifications bg-panel">
                            <h3 className="panel-title">
                                <Bell size={16} color="var(--color-gold)" />
                                Alert Protocol
                            </h3>
                            <div className="toggle-list">
                                <NotificationToggle 
                                    icon={<Mail size={16}/>} 
                                    label="Email Alerts" 
                                    checked={settings.emailNotifications} 
                                    onChange={(v) => updateSettings({...settings, emailNotifications: v})} 
                                />
                                <NotificationToggle 
                                    icon={<MessageSquare size={16}/>} 
                                    label="SMS/WhatsApp Alerts" 
                                    checked={settings.whatsappNotifications} 
                                    onChange={(v) => updateSettings({...settings, whatsappNotifications: v})} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Share Zone */}
                    <div className="ref-share-zone bg-panel">
                        <div className="share-glow"></div>
                        <div className="share-icon-wrapper">
                            <Gift color="var(--color-gold)" size={40} />
                        </div>
                        <h2>Personal Invitation Link</h2>
                        <p className="share-desc">Share this unique sequence. When your circle purchases, the credit is automatically added to your vault.</p>
                        
                        <div className="share-input-group">
                            <input 
                                readOnly 
                                value={referralLink}
                                className="share-input"
                            />
                            <button onClick={copyCode} className="btn-copy">
                                {copied ? <CheckCircle size={18} /> : <Share2 size={18} />}
                                {copied ? 'READY' : 'COPY'}
                            </button>
                        </div>
                    </div>

                    {/* Activity Table */}
                    <div className="ref-activity bg-panel">
                        <h3 className="panel-title lg">
                            <Zap size={22} color="var(--color-gold)" />
                            Ambassador History
                        </h3>
                        
                        {data.referrals && data.referrals.length > 0 ? (
                            <div className="activity-list">
                                {data.referrals.map((ref, i) => (
                                    <div key={i} className="activity-item">
                                        <div className="activity-left">
                                            <div className="activity-avatar">
                                                {ref.referee?.firstName ? ref.referee.firstName[0] : '?'}
                                            </div>
                                            <div className="activity-person">
                                                <div className="person-name">{ref.referee?.firstName} {ref.referee?.lastName}</div>
                                                <div className="person-date">{new Date(ref.createdAt).toLocaleDateString(undefined, {month:'short', day:'numeric', year:'numeric'})}</div>
                                            </div>
                                        </div>
                                        <div className="activity-right">
                                            <div className={`activity-amount ${ref.status === 'COMPLETED' ? 'text-gold' : 'text-muted'}`}>
                                                {ref.status === 'COMPLETED' ? `+$${ref.rewardAmount.toLocaleString()}` : '--'}
                                            </div>
                                            <div className="activity-status">
                                                <div className={`status-dot ${ref.status === 'COMPLETED' ? 'dot-gold' : 'dot-gray'}`}></div>
                                                <span>{ref.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="activity-empty">
                                <Users size={64} className="empty-icon" />
                                <p>Your ambassador legacy begins here.<br/>Share your first link to unlock the vault.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <style jsx>{`
                .referrals-page {
                    background: var(--color-black);
                    min-height: 100vh;
                    padding-bottom: 80px;
                }
                .referral-dashboard-section {
                    padding-top: 140px;
                }
                .text-gold { color: var(--color-gold); }
                .text-muted { color: var(--color-gray); }

                /* Header */
                .ref-header {
                    display: flex;
                    flex-direction: column;
                    gap: 30px;
                    margin-bottom: 50px;
                }
                @media(min-width: 768px) {
                    .ref-header {
                        flex-direction: row;
                        justify-content: space-between;
                        align-items: center;
                    }
                }
                .ref-header-text .section-title {
                    margin-top: 10px;
                    line-height: 1.2;
                    color: var(--color-white);
                }
                
                .ref-status-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 16px;
                    padding: 20px 24px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    backdrop-filter: blur(10px);
                }
                .ref-status-icon {
                    background: rgba(201,169,110,0.1);
                    padding: 12px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .status-label {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--color-gray);
                    margin-bottom: 4px;
                }
                .status-tier {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--color-gold);
                    letter-spacing: 0.15em;
                }
                .status-multiplier {
                    font-size: 0.7rem;
                    font-family: monospace;
                    color: var(--color-gray);
                    margin-top: 2px;
                }

                /* Layout */
                .ref-main-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 30px;
                    margin-bottom: 50px;
                }
                @media(min-width: 992px) {
                    .ref-main-grid {
                        grid-template-columns: 2fr 1fr;
                    }
                }

                /* Panels */
                .bg-panel {
                    background: rgba(20,20,20,0.6);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 20px;
                    padding: 30px;
                }
                .panel-title {
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--color-gray-light);
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .panel-title.lg {
                    font-size: 1.25rem;
                    color: var(--color-white);
                    text-transform: none;
                    letter-spacing: normal;
                }

                /* Metrics */
                .ref-metrics {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
                @media(min-width: 600px) {
                    .ref-metrics {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                /* Toggle List */
                .toggle-list {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }

                /* Share Zone */
                .ref-share-zone {
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    position: relative;
                    overflow: hidden;
                    border-radius: 30px;
                    padding: 50px 30px;
                    margin-bottom: 50px;
                }
                .share-glow {
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 2px;
                    background: linear-gradient(to right, transparent, rgba(201,169,110,0.5), transparent);
                }
                .share-icon-wrapper {
                    width: 80px;
                    height: 80px;
                    background: rgba(201,169,110,0.1);
                    border: 1px solid rgba(201,169,110,0.2);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 24px;
                }
                .ref-share-zone h2 {
                    font-size: 1.75rem;
                    font-weight: 500;
                    margin-bottom: 16px;
                }
                .share-desc {
                    color: var(--color-gray);
                    font-size: 0.95rem;
                    max-width: 500px;
                    margin-bottom: 32px;
                    line-height: 1.6;
                }
                .share-input-group {
                    display: flex;
                    width: 100%;
                    max-width: 600px;
                    background: var(--color-black);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 16px;
                    padding: 6px;
                    transition: border-color var(--transition-fast);
                }
                .share-input-group:focus-within {
                    border-color: rgba(201,169,110,0.5);
                }
                .share-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: var(--color-gray-light);
                    padding: 0 20px;
                    font-family: monospace;
                    font-size: 0.9rem;
                    outline: none;
                }
                .btn-copy {
                    background: var(--color-gold);
                    color: var(--color-black);
                    border: none;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 0.85rem;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 0 15px rgba(201,169,110,0.2);
                }
                .btn-copy:active {
                    transform: scale(0.96);
                }

                /* Activity */
                .activity-list {
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                }
                .activity-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.05);
                    padding: 20px;
                    border-radius: 16px;
                    transition: background 0.3s;
                }
                .activity-item:hover {
                    background: rgba(255,255,255,0.04);
                }
                .activity-left {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }
                .activity-avatar {
                    width: 44px;
                    height: 44px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    color: var(--color-gold);
                }
                .person-name {
                    font-size: 0.95rem;
                    font-weight: 500;
                    color: var(--color-white);
                    margin-bottom: 4px;
                }
                .person-date {
                    font-size: 0.7rem;
                    color: var(--color-gray);
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                }
                .activity-right {
                    text-align: right;
                }
                .activity-amount {
                    font-size: 1rem;
                    font-weight: 700;
                    font-family: monospace;
                    margin-bottom: 6px;
                }
                .activity-status {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    gap: 6px;
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--color-gray);
                }
                .status-dot {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                }
                .dot-gold { background: var(--color-gold); }
                .dot-gray { background: var(--color-gray-dark); }
                
                .activity-empty {
                    padding: 60px 20px;
                    text-align: center;
                    border: 2px dashed rgba(255,255,255,0.05);
                    border-radius: 20px;
                }
                .empty-icon {
                    color: rgba(255,255,255,0.1);
                    margin-bottom: 24px;
                }
                .activity-empty p {
                    color: var(--color-gray);
                    font-size: 0.95rem;
                    font-style: italic;
                    line-height: 1.6;
                }
            `}</style>
        </main>
    );
}

function StatCard({ icon, label, value }) {
    return (
        <div className="stat-card">
            <div className="stat-icon">{icon}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
            <style jsx>{`
                .stat-card {
                    background: rgba(20,20,20,0.6);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 20px;
                    padding: 30px 24px;
                    transition: border-color 0.3s;
                }
                .stat-card:hover {
                    border-color: rgba(201,169,110,0.3);
                }
                .stat-card:hover .stat-icon {
                    transform: scale(1.1);
                }
                .stat-icon {
                    width: 44px;
                    height: 44px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-gold);
                    margin-bottom: 20px;
                    transition: transform 0.3s;
                }
                .stat-value {
                    font-size: 1.75rem;
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    margin-bottom: 8px;
                    color: var(--color-white);
                }
                .stat-label {
                    font-size: 0.65rem;
                    text-transform: uppercase;
                    letter-spacing: 0.15em;
                    color: var(--color-gray);
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
}

function NotificationToggle({ icon, label, checked, onChange }) {
    return (
        <div className="notif-toggle">
            <div className="notif-label">
                <span className="notif-icon">{icon}</span>
                {label}
            </div>
            <button 
                onClick={() => onChange(!checked)}
                className={`toggle-btn ${checked ? 'checked' : ''}`}
            >
                <div className="toggle-knob"></div>
            </button>
            <style jsx>{`
                .notif-toggle {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255,255,255,0.03);
                    padding: 16px 20px;
                    border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .notif-label {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 0.9rem;
                    color: var(--color-gray-light);
                }
                .notif-icon {
                    color: var(--color-gold);
                    display: flex;
                }
                .toggle-btn {
                    width: 44px;
                    height: 24px;
                    border-radius: 12px;
                    padding: 2px;
                    background: var(--color-charcoal);
                    transition: background 0.3s;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                }
                .toggle-btn.checked {
                    background: var(--color-gold);
                }
                .toggle-knob {
                    width: 20px;
                    height: 20px;
                    background: #fff;
                    border-radius: 50%;
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    transform: translateX(0);
                }
                .toggle-btn.checked .toggle-knob {
                    transform: translateX(20px);
                }
            `}</style>
        </div>
    );
}
