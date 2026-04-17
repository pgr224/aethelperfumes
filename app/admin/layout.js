'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Heartbeat from '@/components/Heartbeat';

const ROUTE_LABELS = {
    admin: 'Dashboard',
    orders: 'Order History',
    abandoned: 'Abandoned Intel',
    categories: 'Category Navigator',
    products: 'Product Management',
    inventory: 'Inventory & Stock',
    promos: 'Bulk Pricing',
    promotions: 'Event Scheduler',
    coupons: 'Promo Coupons',
    referrals: 'Ambassadors',
    layout: 'Layout & Branding',
    blog: 'Blog Editor',
    hero: 'Marketing Promos',
    testimonials: 'User Reviews',
    settings: 'Financial & System',
    newsletter: 'Mail Broadcast',
    pages: 'Pages',
    login: 'Login',
};

function Breadcrumb({ pathname }) {
    const parts = pathname.split('/').filter(Boolean);
    let path = '';
    const crumbs = parts.map((segment, i) => {
        path += '/' + segment;
        return { label: ROUTE_LABELS[segment] || segment, href: path, isLast: i === parts.length - 1 };
    });

    if (crumbs.length <= 1) return null;

    return (
        <nav aria-label="Breadcrumb" style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            fontSize: '0.78rem', color: 'var(--color-gray)',
            marginBottom: '1.75rem', flexWrap: 'wrap'
        }}>
            {crumbs.map((crumb, i) => (
                <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {i > 0 && <span style={{ opacity: 0.35, userSelect: 'none' }}>/</span>}
                    {crumb.isLast
                        ? <span style={{ color: 'var(--color-gold)', fontWeight: '600' }}>{crumb.label}</span>
                        : <Link href={crumb.href} style={{ color: 'var(--color-gray-light)', textDecoration: 'none' }}>{crumb.label}</Link>
                    }
                </span>
            ))}
        </nav>
    );
}

export default function AdminLayout({ children }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState('admin');
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Close sidebar on navigation on mobile
    useEffect(() => {
        if (isMobile) setSidebarOpen(false);
    }, [pathname, isMobile]);

    useEffect(() => {
        // Skip auth check for login page
        if (pathname === '/admin/login') {
            setLoading(false);
            return;
        }

        const checkAuth = async () => {
            try {
                const res = await fetch('/api/admin/auth');
                if (res.ok) {
                    const data = await res.json();
                    setAuthenticated(true);
                    setUserRole(data.user?.role || 'admin');
                } else {
                    router.push('/admin/login');
                }
            } catch (err) {
                router.push('/admin/login');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, [pathname, router]);

    const handleLogout = async () => {
        await fetch('/api/admin/auth', { method: 'DELETE' });
        router.push('/admin/login');
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--color-black)' }}>
                <div className="spinner"></div>
            </div>
        );
    }

    // If path is login, just show children
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    const isAdmin = userRole === 'admin';

    const NavItem = ({ href, label, activeMatch = href }) => {
        const isActive = activeMatch === '/admin' ? pathname === '/admin' : pathname.startsWith(activeMatch);
        return (
            <li style={{ marginBottom: '0.25rem' }}>
                <Link href={href} style={{
                    display: 'block',
                    padding: '0.8rem 2rem',
                    fontSize: '0.85rem',
                    color: isActive ? 'var(--color-gold)' : 'var(--color-gray-light)',
                    background: isActive ? 'rgba(201, 169, 110, 0.05)' : 'transparent',
                    borderLeft: `3px solid ${isActive ? 'var(--color-gold)' : 'transparent'}`,
                    transition: 'all 0.2s ease'
                }}>
                    {label}
                </Link>
            </li>
        );
    };

    const SectionLabel = ({ label }) => (
        <li style={{
            marginTop: '1.5rem',
            marginBottom: '0.75rem',
            padding: '0 2rem',
            fontSize: '0.65rem',
            color: 'var(--color-gray)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            fontWeight: '700'
        }}>{label}</li>
    );

    const sidebarContent = (
        <>
            {/* Sidebar header */}
            <div style={{ padding: '0 2rem', marginBottom: '3rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <h2 className="logo" style={{ fontSize: '1.4rem' }}>AETHEL<span>ADMIN</span></h2>
                    <span style={{
                        display: 'inline-block',
                        marginTop: '0.5rem',
                        padding: '3px 10px',
                        borderRadius: '4px',
                        fontSize: '0.6rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontWeight: '700',
                        background: isAdmin ? 'rgba(201,169,110,0.15)' : 'rgba(52,152,219,0.15)',
                        color: isAdmin ? 'var(--color-gold)' : '#3498db',
                        border: `1px solid ${isAdmin ? 'rgba(201,169,110,0.3)' : 'rgba(52,152,219,0.3)'}`
                    }}>{userRole}</span>
                </div>
                {/* Close button — mobile only */}
                {isMobile && (
                    <button
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close menu"
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--color-gray-light)', padding: '4px', lineHeight: 1,
                            fontSize: '1.4rem', marginTop: '2px'
                        }}
                    >✕</button>
                )}
            </div>

            <nav style={{ flex: 1, overflowY: 'auto' }}>
                <ul style={{ listStyle: 'none' }}>
                    <SectionLabel label="Operations" />
                    <NavItem href="/admin" label="Dashboard Overview" />
                    <NavItem href="/admin/orders" label="Order History" />
                    {isAdmin && <NavItem href="/admin/abandoned" label="Abandoned Intel" />}

                    {isAdmin && (
                        <>
                            <SectionLabel label="Catalog" />
                            <NavItem href="/admin/categories" label="Category Navigator" />
                            <NavItem href="/admin/products" label="Product Management" />
                            <NavItem href="/admin/inventory" label="Inventory & Stock" />
                        </>
                    )}

                    {isAdmin && (
                        <>
                            <SectionLabel label="Revenue & Growth" />
                            <NavItem href="/admin/promos" label="Bulk Pricing" />
                            <NavItem href="/admin/promotions" label="Event Scheduler" />
                            <NavItem href="/admin/coupons" label="Promo Coupons" />
                            <NavItem href="/admin/referrals" label="Ambassadors" />
                        </>
                    )}

                    {isAdmin && (
                        <>
                            <SectionLabel label="Design & Story" />
                            <NavItem href="/admin/layout" label="Layout & Branding" />
                            <NavItem href="/admin/layout?tab=contact" label="Contact Details" activeMatch="/admin/layout?tab=contact" />
                            <NavItem href="/admin/blog" label="Blog Editor" />
                            <NavItem href="/admin/hero" label="Marketing Promos" />
                            <NavItem href="/admin/testimonials" label="User Reviews" />
                        </>
                    )}

                    {isAdmin && (
                        <>
                            <SectionLabel label="Infrastructure" />
                            <NavItem href="/admin/settings" label="Financial & System" />
                            <NavItem href="/admin/newsletter" label="Mail Broadcast" />
                        </>
                    )}
                </ul>
            </nav>

            <div style={{ padding: '2rem' }}>
                <button
                    onClick={handleLogout}
                    style={{
                        color: 'var(--color-error)',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span>Logout Account</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="admin-dashboard" style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-black)' }}>
            <Heartbeat />

            {/* Mobile overlay */}
            {isMobile && sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 40,
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(2px)'
                    }}
                />
            )}

            {/* Sidebar */}
            <aside style={{
                width: '260px',
                background: 'var(--color-black-light)',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                padding: '2rem 0',
                display: 'flex',
                flexDirection: 'column',
                // Mobile: fixed overlay; Desktop: static in flow
                ...(isMobile ? {
                    position: 'fixed',
                    top: 0, left: 0, bottom: 0,
                    zIndex: 50,
                    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                    transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
                    boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,0.5)' : 'none',
                } : {
                    position: 'sticky',
                    top: 0,
                    height: '100vh',
                    flexShrink: 0,
                })
            }}>
                {sidebarContent}
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                padding: isMobile ? '1.25rem' : '3rem',
                overflowY: 'auto',
                minWidth: 0,
            }}>
                {/* Mobile top bar with hamburger */}
                {isMobile && (
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        marginBottom: '1.25rem',
                        paddingBottom: '0.75rem',
                        borderBottom: '1px solid rgba(255,255,255,0.06)'
                    }}>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open menu"
                            style={{
                                background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '6px', cursor: 'pointer',
                                color: 'var(--color-gray-light)', padding: '6px 9px',
                                display: 'flex', flexDirection: 'column', gap: '4px',
                                flexShrink: 0,
                            }}
                        >
                            <span style={{ display: 'block', width: '18px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
                            <span style={{ display: 'block', width: '18px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
                            <span style={{ display: 'block', width: '18px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
                        </button>
                        <Breadcrumb pathname={pathname} />
                    </div>
                )}

                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {/* Desktop breadcrumb */}
                    {!isMobile && <Breadcrumb pathname={pathname} />}
                    {children}
                </div>
            </main>
        </div>
    );
}

