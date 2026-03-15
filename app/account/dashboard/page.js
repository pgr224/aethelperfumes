'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Share2, Copy, Gift, Package, User as UserIcon, LogOut } from 'lucide-react';
import AmbassadorBanner from '@/components/AmbassadorBanner';


export default function DashboardPage() {
    const router = useRouter();
    const [profile, setProfile] = useState(null);
    const [settings, setSettings] = useState({ currencySymbol: '$', referralReward: '20' });
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Settings
                const setRes = await fetch('/api/admin/settings');
                const setData = await setRes.json();
                if (setData.settings) setSettings(setData.settings);

                const res = await fetch('/api/user/profile');
                if (!res.ok) {
                    router.push('/account');
                    return;
                }
                const data = await res.json();
                setProfile(data.profile);
            } catch (err) {
                console.error(err);
                router.push('/account');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/account');
    };

    const copyToClipboard = () => {
        const link = `${window.location.origin}/account?ref=${profile?.referralCode}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="section container skeleton" style={{ height: '80vh', marginTop: '100px' }}></div>;
    if (!profile) return null;

    const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/account?ref=${profile.referralCode}` : '';

    return (
        <div className="dashboard-page">
            <div className="container">
                <div className="dashboard-header text-center">
                    <h1 className="section-title">Welcome, {profile.firstName}</h1>
                    <p className="text-gray">Aethel Society Member</p>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-sidebar">
                        <div className="card-glass sidebar-nav">
                            <button className="nav-item active"><UserIcon size={18} /> Overview</button>
                            <button className="nav-item"><Package size={18} /> Orders</button>
                            <button className="nav-item"><Gift size={18} /> Referrals</button>
                            <button className="nav-item text-red" onClick={handleLogout}><LogOut size={18} /> Logout</button>
                        </div>

                        <div className="card-glass promo-card mt-4">
                            <h3>Discover Your Signature</h3>
                            <p>As a registered member, claim your complimentary 5ml discovery sample.</p>
                            <Link href="/products/5ml-signature-sample" className="btn btn-outline btn-full mt-3">
                                Claim Sample
                            </Link>
                        </div>
                    </div>

                    <div className="dashboard-content">
                        <AmbassadorBanner />

                        {/* Referral Program Section */}
                        <div className="card-glass content-section">
                            <div className="section-header-inline">
                                <h2><Share2 size={24} className="icon-gold" /> The Aethel Circle</h2>
                                <span className="balance-badge">Balance: {settings.currencySymbol}{profile.referralBalance.toFixed(2)}</span>
                            </div>

                            <p className="text-gray mt-2 mb-4">
                                Share the luxury. Invite friends using your unique link. When they make their first purchase, they receive exclusive benefits, and you earn {settings.currencySymbol}{settings.referralReward} in boutique credit.
                            </p>

                            {profile.orders.length > 0 ? (
                                <>
                                    <div className="referral-link-box">
                                        <input type="text" readOnly value={referralLink} className="link-input" />
                                        <button className="btn btn-primary" onClick={copyToClipboard}>
                                            {copied ? 'Copied!' : <><Copy size={16} /> Copy</>}
                                        </button>
                                    </div>

                                    <div className="social-share mt-4">
                                        <span>Share via:</span>
                                        <a href={`https://wa.me/?text=Discover luxury fragrances at Aethel. Use my link to get a complimentary gift: ${referralLink}`} target="_blank" rel="noreferrer" className="share-btn whatsapp">WhatsApp</a>
                                        <a href={`https://twitter.com/intent/tweet?text=Discover luxury fragrances at Aethel. Use my link to get a complimentary gift: ${referralLink}`} target="_blank" rel="noreferrer" className="share-btn twitter">X / Twitter</a>
                                        <a href={`mailto:?subject=Discover Aethel Fragrances&body=Discover luxury fragrances at Aethel. Use my link to get a complimentary gift: ${referralLink}`} className="share-btn email">Email</a>
                                    </div>
                                </>
                            ) : (
                                <div className="locked-feature-box mt-4">
                                    <Gift size={32} className="icon-gold mb-2" />
                                    <h3>Unlock Your Ambassador Link</h3>
                                    <p>Place your first order to activate your referral link and start earning {settings.currencySymbol}{settings.referralReward} rewards for sharing Aethel.</p>
                                </div>
                            )}

                            {profile.referralsGiven.length > 0 && (
                                <div className="referrals-list mt-5">
                                    <h3>Your Invites</h3>
                                    <div className="table-responsive">
                                        <table className="dashboard-table">
                                            <thead>
                                                <tr>
                                                    <th>Friend</th>
                                                    <th>Joined</th>
                                                    <th>Status</th>
                                                    <th>Reward</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {profile.referralsGiven.map(ref => (
                                                    <tr key={ref.id}>
                                                        <td>{ref.referee?.firstName || 'Friend'}</td>
                                                        <td>{new Date(ref.createdAt).toLocaleDateString()}</td>
                                                        <td>
                                                            <span className={`status-badge ${ref.status.toLowerCase()}`}>
                                                                {ref.status}
                                                            </span>
                                                        </td>
                                                        <td>{settings.currencySymbol}{ref.rewardAmount.toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Recent Orders Section */}
                        <div className="card-glass content-section mt-4">
                            <h2><Package size={24} className="icon-gold" /> Recent Orders</h2>
                            {profile.orders.length > 0 ? (
                                <div className="table-responsive mt-4">
                                    <table className="dashboard-table">
                                        <thead>
                                            <tr>
                                                <th>Order #</th>
                                                <th>Date</th>
                                                <th>Status</th>
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {profile.orders.map(order => (
                                                <tr key={order.id} onClick={() => router.push(`/account/orders/${order.id}`)} style={{ cursor: 'pointer', transition: 'background 0.2s' }}>
                                                    <td style={{ color: '#c9a96e', fontWeight: '600' }}>{order.orderNumber}</td>
                                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                    <td><span className={`status-badge ${order.status.toLowerCase().replace(/_/g, '-')}`}>{order.status.replace(/_/g, ' ')}</span></td>
                                                    <td>{settings.currencySymbol}{order.total.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state mt-4">
                                    <p>You haven't placed any orders yet.</p>
                                    <Link href="/products" className="btn btn-outline mt-3">Explore Collection</Link>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            <style jsx>{`
                .dashboard-page {
                    padding: 120px 0 80px;
                    background-color: #0a0a0a;
                    min-height: 100vh;
                }
                .dashboard-header {
                    margin-bottom: 50px;
                }
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    gap: 30px;
                }
                .sidebar-nav {
                    display: flex;
                    flex-direction: column;
                    padding: 20px;
                }
                .nav-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: none;
                    border: none;
                    color: #888;
                    padding: 15px;
                    text-align: left;
                    font-size: 1rem;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.3s ease;
                }
                .nav-item:hover {
                    background: rgba(255,255,255,0.05);
                    color: #fff;
                }
                .nav-item.active {
                    color: #c9a96e;
                    background: rgba(201, 169, 110, 0.1);
                }
                .text-red { color: #ff4b4b; }
                .text-red:hover { background: rgba(255, 75, 75, 0.1); color: #ff4b4b; }
                
                .promo-card {
                    padding: 25px;
                    text-align: center;
                }
                .promo-card h3 {
                    font-size: 1.2rem;
                    color: #c9a96e;
                    margin-bottom: 10px;
                }
                .promo-card p {
                    font-size: 0.9rem;
                    color: #aaa;
                    line-height: 1.5;
                }

                .content-section {
                    padding: 40px;
                }
                .section-header-inline {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    padding-bottom: 20px;
                }
                .section-header-inline h2 {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin: 0;
                    font-size: 1.8rem;
                }
                .icon-gold { color: #c9a96e; }
                .balance-badge {
                    background: linear-gradient(135deg, #c9a96e 0%, #a68444 100%);
                    color: #000;
                    padding: 8px 16px;
                    border-radius: 20px;
                    font-weight: 700;
                    font-size: 1.1rem;
                }
                
                .referral-link-box {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }
                .link-input {
                    flex: 1;
                    background: rgba(0,0,0,0.5);
                    border: 1px solid rgba(201,169,110,0.3);
                    padding: 12px 20px;
                    color: #c9a96e;
                    font-family: monospace;
                    font-size: 1.1rem;
                    border-radius: 4px;
                    outline: none;
                }
                .btn-primary {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    white-space: nowrap;
                }

                .social-share {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .share-btn {
                    padding: 6px 14px;
                    border-radius: 4px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-decoration: none;
                    transition: opacity 0.3s;
                }
                .share-btn:hover { opacity: 0.8; }
                .share-btn.whatsapp { background: #25D366; color: #fff; }
                .share-btn.twitter { background: #1DA1F2; color: #fff; }
                .share-btn.email { background: #444; color: #fff; }

                .locked-feature-box {
                    padding: 30px;
                    border: 1px dashed rgba(201,169,110,0.5);
                    border-radius: 8px;
                    text-align: center;
                    background: rgba(201,169,110,0.05);
                }
                .locked-feature-box h3 { color: #fff; margin-bottom: 10px; }
                .locked-feature-box p { color: #aaa; font-size: 0.95rem; }

                .dashboard-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .dashboard-table th {
                    text-align: left;
                    padding: 15px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    color: #888;
                    font-weight: 600;
                    text-transform: uppercase;
                    font-size: 0.8rem;
                    letter-spacing: 0.05em;
                }
                .dashboard-table td {
                    padding: 15px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    color: #ccc;
                }
                .status-badge {
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .status-badge.pending { background: rgba(255, 193, 7, 0.2); color: #ffc107; }
                .status-badge.completed { background: rgba(40, 167, 69, 0.2); color: #28a745; }
                .status-badge.processing { background: rgba(243, 156, 18, 0.2); color: #f39c12; }
                .status-badge.shipped { background: rgba(52, 152, 219, 0.2); color: #3498db; }
                .status-badge.out-for-delivery { background: rgba(230, 126, 34, 0.2); color: #e67e22; }
                .status-badge.delivered { background: rgba(46, 204, 113, 0.2); color: #2ecc71; }
                .status-badge.cancelled { background: rgba(231, 76, 60, 0.2); color: #e74c3c; }
                .status-badge.cancel-requested { background: rgba(231, 76, 60, 0.15); color: #e74c3c; }
                .status-badge.return-requested { background: rgba(155, 89, 182, 0.2); color: #9b59b6; }
                .dashboard-table tr:hover { background: rgba(201,169,110,0.05); }
                
                .empty-state {
                    text-align: center;
                    padding: 40px 0;
                    color: #888;
                }

                @media (max-width: 991px) {
                    .dashboard-grid {
                        grid-template-columns: 1fr;
                    }
                    .referral-link-box {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
}
