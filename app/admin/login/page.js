'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/admin');
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-black)'
        }}>
            <div className="login-card" style={{
                width: '100%',
                maxWidth: '400px',
                padding: '3rem',
                background: 'var(--color-black-light)',
                border: '1px solid rgba(201, 169, 110, 0.2)',
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: 'var(--shadow-lg)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 className="logo" style={{ fontSize: '2rem' }}>AETHEL<span>ADMIN</span></h1>
                </div>

                <form onSubmit={handleLogin}>
                    {error && (
                        <div style={{
                            background: 'rgba(231, 76, 60, 0.1)',
                            color: 'var(--color-error)',
                            padding: '1rem',
                            borderRadius: 'var(--border-radius)',
                            marginBottom: '1.5rem',
                            fontSize: '0.85rem',
                            textAlign: 'center',
                            border: '1px solid var(--color-error)'
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'var(--color-gold)',
                            marginBottom: '0.5rem'
                        }}>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="newsletter-form input"
                            style={{ width: '100%', padding: '12px 16px' }}
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: 'var(--color-gold)',
                            marginBottom: '0.5rem'
                        }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="newsletter-form input"
                            style={{ width: '100%', padding: '12px 16px' }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link href="/" style={{ fontSize: '0.8rem', color: 'var(--color-gray)' }}>
                        ← Back to Store
                    </Link>
                </div>
            </div>
        </div>
    );
}
