'use client';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PromoBar() {
    const pathname = usePathname();
    const [promo, setPromo] = useState({ active: false, text: '', link: '' });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPromo = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                const data = await res.json();
                if (data.settings) {
                    setPromo({
                        active: data.settings.promoActive === 'true' || data.settings.promoActive === true,
                        text: data.settings.promoText || '',
                        link: data.settings.promoLink || ''
                    });
                }
            } catch (e) {
                console.error('Promo fetch failed', e);
            } finally {
                setLoading(false);
            }
        };
        fetchPromo();
    }, []);

    if (loading || !promo.active || !promo.text || pathname.startsWith('/admin')) return null;


    return (
        <div className="promo-bar">
            {promo.link ? (
                <a href={promo.link}>{promo.text}</a>
            ) : (
                <span>{promo.text}</span>
            )}
            <style jsx>{`
                .promo-bar {
                    background: var(--color-gold);
                    color: var(--color-black);
                    text-align: center;
                    padding: 8px 0;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    position: relative;
                    z-index: 1001;
                }
                .promo-bar a {
                    color: inherit;
                    text-decoration: none;
                    display: block;
                    width: 100%;
                }
                .promo-bar a:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
}
