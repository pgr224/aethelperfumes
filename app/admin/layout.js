'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Heartbeat from '@/components/Heartbeat';

export default function AdminLayout({ children }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState('admin');
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

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

    return (
        <div className="admin-dashboard" style={{ display: 'flex', minHeight: '100vh', background: 'var(--color-black)' }}>
            <Heartbeat />
            {/* Sidebar */}
            <aside style={{
                width: '260px',
                background: 'var(--color-black-light)',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                padding: '2rem 0',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ padding: '0 2rem', marginBottom: '3rem' }}>
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

                <nav style={{ flex: 1, overflowY: 'auto' }}>
                    <ul style={{ listStyle: 'none' }}>
                        {/* HELPER FOR NAV LINKS */}
                        {(() => {
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

                            return (
                                <>
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
                                </>
                            );
                        })()}
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
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '3rem', overflowY: 'auto' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}


