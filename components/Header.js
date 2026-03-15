'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Header({ previewSettings = null, isPreview = false }) {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [cartCount, setCartCount] = useState(0);
    const router = useRouter();

    useEffect(() => {
        if (isPreview) return; // Skip scroll listener in preview
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        const fetchCart = async () => {
            try {
                const res = await fetch('/api/cart');
                const data = await res.json();
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

    const [logo, setLogo] = useState(null);

    useEffect(() => {
        if (previewSettings?.logoUrl) {
            setLogo(previewSettings.logoUrl);
            return;
        }
        const fetchSettings = async () => {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (data.settings?.logoUrl) setLogo(data.settings.logoUrl);
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
        <header className={`header ${isScrolled ? 'header-solid' : 'header-transparent'}`}>
            <div className="header-inner">
                <Link href="/" className="logo">
                    {logo ? (
                        <img src={logo} alt="AETHEL" style={{ height: '35px', objectFit: 'contain' }} />
                    ) : (
                        <>AETHEL<span>Paris</span></>
                    )}
                </Link>

                <nav className="nav-links">
                    <Link href="/">Home</Link>
                    <Link href="/products">Shop</Link>
                    <Link href="/collections">Collections</Link>

                    <Link href="/blog">Our Story</Link>
                    <Link href="/contact">Contact</Link>
                    <Link href="/referrals" style={{ color: 'var(--color-gold)' }}>Referrals</Link>
                </nav>

                <div className="nav-icons">
                    <button className="nav-icon" aria-label="Search" onClick={() => setIsSearchOpen(true)}>
                        <i>🔍</i>
                    </button>
                    <Link href="/cart" className="nav-icon" aria-label="Cart">
                        <i>🛒</i>
                        {cartCount > 0 && <span className="badge">{cartCount}</span>}
                    </Link>
                    <Link href="/account" className="nav-icon" aria-label="Account">
                        <i>👤</i>
                    </Link>
                    <button
                        className={`menu-toggle ${isMobileMenuOpen ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span></span>
                        <span></span>
                        <span></span>
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
