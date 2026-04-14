'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { readJsonResponse } from '@/lib/read-json-response';

export default function Header({ previewSettings = null, isPreview = false }) {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const [sessionUser, setSessionUser] = useState(null); // null=loading, false=guest, obj=user
    const router = useRouter();

    useEffect(() => {
        if (isPreview) return; // Skip scroll listener in preview
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        const fetchCart = async () => {
            try {
                const res = await fetch('/api/cart');
                if (!res.ok) {
                    throw new Error(await res.text());
                }

                const data = await readJsonResponse(res);
                setCartCount(data.count || 0);
            } catch (e) {
                console.error('Cart fetch failed', e);
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('cart-updated', fetchCart);
        fetchCart();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('cart-updated', fetchCart);
        };
    }, [isPreview]);

    // Session-aware: detect logged-in user and their role for smart nav link.
    useEffect(() => {
        if (isPreview) { setSessionUser(false); return; }
        fetch('/api/user/profile', { cache: 'no-store' })
            .then(res => {
                if (!res.ok) { setSessionUser(false); return null; }
                return res.json();
            })
            .then(data => {
                setSessionUser(data?.profile ?? false);
            })
            .catch(() => setSessionUser(false));
    }, [isPreview, pathname]);

    const [logo, setLogo] = useState(null);

    useEffect(() => {
        if (previewSettings?.logoUrl) {
            setLogo(previewSettings.logoUrl);
            return;
        }
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                if (!res.ok) {
                    throw new Error(await res.text());
                }

                const data = await readJsonResponse(res);
                if (data?.settings?.logoUrl) setLogo(data.settings.logoUrl);
            } catch (error) {
                console.error('Header settings fetch failed', error);
            }
        };
        fetchSettings();
    }, [previewSettings]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    if (!isPreview && pathname?.startsWith('/admin')) return null;

    return (
        <header className={`header ${isScrolled ? 'header-solid' : 'header-transparent'}`} style={{ 
            backgroundColor: isScrolled ? '#fff' : 'transparent',
            borderBottom: isScrolled ? '1px solid #eee' : 'none'
        }}>
            <div className="header-inner">
                <Link href="/" className="logo" style={{ color: '#000' }}>
                    {logo ? (
                        <img src={logo} alt="AETHEL" style={{ height: '32px', objectFit: 'contain' }} />
                    ) : (
                        <span style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '0.05em' }}>AETHEL</span>
                    )}
                </Link>

                <nav className="nav-links">
                    <Link href="/" style={{ color: '#000' }}>Home</Link>
                    <Link href="/products" style={{ color: '#000' }}>Shop</Link>
                    <Link href="/collections" style={{ color: '#000' }}>Collections</Link>
                    <Link href="/blog" style={{ color: '#000' }}>Skincare</Link>
                    <Link href="/contact" style={{ color: '#000' }}>Contact</Link>
                </nav>

                <div className="nav-icons" style={{ color: '#000' }}>
                    <button className="nav-icon" onClick={() => setIsSearchOpen(true)} style={{ color: '#000' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </button>
                    <Link href="/cart" className="nav-icon" style={{ color: '#000' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                        {cartCount > 0 && <span className="badge" style={{ background: '#000', color: '#fff' }}>{cartCount}</span>}
                    </Link>
                    <Link href="/account" className="nav-icon" style={{ color: '#000' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </Link>
                    <button
                        className={`menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        style={{ color: '#000' }}
                    >
                        <span style={{ backgroundColor: '#000' }}></span>
                        <span style={{ backgroundColor: '#000' }}></span>
                        <span style={{ backgroundColor: '#000' }}></span>
                    </button>
                </div>
            </div>

            {/* SEARCH OVERLAY */}
            <div className={`search-overlay ${isSearchOpen ? 'active' : ''}`}>
                <div className="search-overlay-inner">
                    <button className="search-close" onClick={() => setIsSearchOpen(false)}>✕</button>
                    <form className="search-form" onSubmit={handleSearchSubmit}>
                        <input
                            type="text"
                            placeholder="WHAT ARE YOU LOOKING FOR?"
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus={isSearchOpen}
                        />
                        <p className="search-hint">Press Enter to search fragrances, collections or blog</p>
                    </form>
                </div>
            </div>

            <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
                <Link href="/products" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
                <Link href="/collections" onClick={() => setIsMobileMenuOpen(false)}>Collections</Link>
                <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)}>Our Story</Link>
                <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link>
                <Link href="/referrals" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--color-gold)' }}>Referrals</Link>
                {sessionUser && (sessionUser.role === 'admin' || sessionUser.role === 'manager')
                    ? <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--color-gold)', fontWeight: '600' }}>Admin Panel</Link>
                    : sessionUser
                        ? <Link href="/account/dashboard" onClick={() => setIsMobileMenuOpen(false)}>My Account</Link>
                        : <Link href="/account" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                }
            </div>

            <style jsx>{`
                .search-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.95);
                    z-index: 2000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
                    backdrop-filter: blur(10px);
                }
                .search-overlay.active {
                    opacity: 1;
                    visibility: visible;
                }
                .search-overlay-inner {
                    width: 100%;
                    max-width: 800px;
                    padding: 0 40px;
                    position: relative;
                }
                .search-close {
                    position: absolute;
                    top: -100px;
                    right: 40px;
                    background: none;
                    border: none;
                    color: #fff;
                    font-size: 2rem;
                    cursor: pointer;
                    opacity: 0.5;
                    transition: opacity 0.3s;
                }
                .search-close:hover { opacity: 1; }
                .search-form { text-align: center; }
                .search-input {
                    width: 100%;
                    background: none;
                    border: none;
                    border-bottom: 2px solid var(--color-gold);
                    color: #fff;
                    font-size: 2.5rem;
                    padding: 10px 0;
                    text-align: center;
                    font-family: inherit;
                    letter-spacing: 0.1em;
                    outline: none;
                    text-transform: uppercase;
                }
                .search-hint {
                    color: var(--color-gray);
                    margin-top: 20px;
                    font-size: 0.8rem;
                    letter-spacing: 0.2em;
                    text-transform: uppercase;
                }
                @media (max-width: 768px) {
                    .search-input { font-size: 1.5rem; }
                }
            `}</style>
        </header>
    );
}
