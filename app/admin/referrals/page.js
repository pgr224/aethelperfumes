'use client';
import { useState, useEffect } from 'react';
import { Users, Map, Award, TrendingUp, Search, ChevronRight, Zap } from 'lucide-react';

export default function AdminReferralSystem() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const res = await fetch('/api/admin/referrals');
        const json = await res.json();
        setData(json);
        setLoading(false);
    };

    const updateTier = async (userId, newTier) => {
        setUpdating(userId);
        try {
            await fetch('/api/admin/referrals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, tier: newTier })
            });
            await fetchData();
        } finally {
            setUpdating(null);
        }
    };

    if (loading) return <div className="spinner" style={{ margin: '10rem auto' }}></div>;

    const filteredUsers = data.users.filter(u => 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ color: 'white' }}>
            <div style={{ marginBottom: '3rem' }}>
                <span className="section-subtitle">Ambassador Network</span>
                <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Referral Intelligence</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '3rem' }}>
                {/* Heatmap Card */}
                <div style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                        <Map size={20} className="text-gold" />
                        <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Geographic Hotspots</h3>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {data.heatmap.map((item, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{item.city}</div>
                                    <div style={{ height: '6px', background: 'rgba(201,169,110,0.1)', borderRadius: '3px', marginTop: '6px' }}>
                                        <div style={{ 
                                            height: '100%', 
                                            background: 'var(--color-gold)', 
                                            borderRadius: '3px',
                                            width: `${(item.count / data.heatmap[0].count) * 100}%` 
                                        }}></div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--color-gold)', fontWeight: 'bold' }}>{item.count}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    <StatBox icon={<Users />} label="Active Ambassadors" value={data.users.length} />
                    <StatBox icon={<TrendingUp />} label="Conversion Rate" value="12.4%" />
                    <StatBox icon={<Award />} label="Gold Tier Members" value={data.users.filter(u => u.referralTier === 'GOLD').length} color="var(--color-gold)" />
                    <StatBox icon={<Zap />} label="Shared Links" value="1,842" />
                </div>
            </div>

            {/* Ambassador Management */}
            <div style={{ background: 'var(--color-black-light)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                <div style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Tier Management Module</h3>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-gray)' }} />
                        <input 
                            type="text" 
                            placeholder="Search Ambassadors..." 
                            className="newsletter-form input"
                            style={{ padding: '8px 12px 8px 36px', fontSize: '0.8rem', minWidth: '250px' }}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left' }}>
                                <th style={{ padding: '1.25rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-gray)', fontWeight: '600' }}>Ambassador</th>
                                <th style={{ padding: '1.25rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-gray)', fontWeight: '600' }}>Current Tier</th>
                                <th style={{ padding: '1.25rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-gray)', fontWeight: '600' }}>Performance</th>
                                <th style={{ padding: '1.25rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-gray)', fontWeight: '600' }}>Balance</th>
                                <th style={{ padding: '1.25rem 2rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-gray)', fontWeight: '600', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.3s' }}>
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.firstName} {user.lastName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-gray)' }}>{user.email}</div>
                                    </td>
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        <div style={{ 
                                            display: 'inline-block', 
                                            padding: '4px 10px', 
                                            borderRadius: '6px', 
                                            fontSize: '0.7rem', 
                                            fontWeight: 'bold',
                                            background: user.referralTier === 'GOLD' ? 'rgba(201,169,110,0.1)' : 'rgba(255,255,255,0.05)',
                                            color: user.referralTier === 'GOLD' ? 'var(--color-gold)' : 'white',
                                            border: user.referralTier === 'GOLD' ? '1px solid var(--color-gold)' : '1px solid transparent'
                                        }}>
                                            {user.referralTier}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        <div style={{ fontSize: '0.85rem' }}>{user.referralCount} Conversions</div>
                                    </td>
                                    <td style={{ padding: '1.5rem 2rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: '600' }}>₹{user.referralBalance.toLocaleString()}</div>
                                    </td>
                                    <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                                        <select 
                                            className="newsletter-form input"
                                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                                            value={user.referralTier}
                                            disabled={updating === user.id}
                                            onChange={(e) => updateTier(user.id, e.target.value)}
                                        >
                                            <option value="BRONZE">Bronze</option>
                                            <option value="SILVER">Silver</option>
                                            <option value="GOLD">Gold</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatBox({ icon, label, value, color = 'white' }) {
    return (
        <div style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ color: 'var(--color-gold)', marginBottom: '1rem' }}>{icon}</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: color }}>{value}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-gray)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>{label}</div>
        </div>
    );
}
