'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Award, Zap, ChevronRight, Star } from 'lucide-react';

export default function AmbassadorBanner() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/user/referrals')
            .then(res => res.ok ? res.json() : null)
            .then(json => {
                if (json) setData(json);
                setLoading(false);
            });
    }, []);

    if (loading || !data || data.tier === 'GOLD') return null;

    const referrals = data.referrals.filter(r => r.status === 'COMPLETED').length;
    const nextTier = data.tier === 'BRONZE' ? 'SILVER' : 'GOLD';
    const target = data.tier === 'BRONZE' ? 4 : 10;
    const progress = Math.min((referrals / target) * 100, 100);
    const remaining = target - referrals;

    return (
        <div className="bg-black/80 backdrop-blur-md border border-gold/10 rounded-2xl p-6 mb-12 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-gold"></div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center text-gold">
                        {data.tier === 'BRONZE' ? <Star size={24} /> : <Award size={24} />}
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-gold font-bold mb-1">Ambassador Progress</div>
                        <h4 className="text-white font-medium text-lg">
                            {remaining} more successful referrals to reach <span className="text-gold">{nextTier}</span> Status
                        </h4>
                    </div>
                </div>

                <div className="flex-1 max-w-md w-full">
                    <div className="flex justify-between text-[10px] uppercase tracking-tighter text-gray-500 mb-2 font-mono">
                        <span>{data.tier}</span>
                        <span>{nextTier} ({target})</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gold shadow-[0_0_10px_rgba(201,169,110,0.5)] transition-all duration-1000"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                <Link href="/referrals" className="text-white hover:text-gold flex items-center gap-2 text-sm font-medium transition-colors">
                    Dashboard
                    <ChevronRight size={16} />
                </Link>
            </div>
            
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Trophy size={100} />
            </div>
        </div>
    );
}
