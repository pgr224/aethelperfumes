'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { readJsonResponse } from '@/lib/read-json-response';

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

            const data = await readJsonResponse(res).catch(async (error) => {
                if (!res.ok) {
                    return { error: error.message || 'Login failed' };
                }

                throw error;
            });

            if (res.ok) {
                router.push('/admin');
            } else {
                setError(data?.error || 'Login failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-page">
            <div className="login-card">
                <header className="login-header">
                    <h1 className="admin-logo">AETHEL<span>ADMIN</span></h1>
                    <p className="login-subtitle">Secure management portal</p>
                </header>

                <form className="login-form" onSubmit={handleLogin}>
                    {error && <div className="login-error">{error}</div>}

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@aethel.com"
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? 'Verifying...' : 'Sign In to Dashboard'}
                    </button>
                </form>

                <div className="login-footer">
                    <Link href="/">
                        ← Return to boutique
                    </Link>
                </div>
            </div>

            <style jsx>{`
                .admin-login-page {
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--color-white-off);
                    padding: 20px;
                }
                .login-card {
                    width: 100%;
                    max-width: 440px;
                    padding: 60px;
                    background: #fff;
                    border: 1px solid var(--color-gray-light);
                    border-radius: 12px;
                    box-shadow: var(--shadow-md);
                }
                .login-header { text-align: center; margin-bottom: 40px; }
                .admin-logo { font-size: 1.5rem; font-weight: 800; letter-spacing: 0.1em; color: var(--color-black); }
                .admin-logo span { color: var(--color-gray); font-weight: 300; margin-left: 2px; }
                .login-subtitle { font-size: 0.75rem; text-transform: uppercase; color: var(--color-gray); letter-spacing: 0.05em; margin-top: 5px; }
                
                .login-form { display: flex; flex-direction: column; gap: 20px; }
                .form-group label { display: block; font-size: 0.7rem; text-transform: uppercase; color: var(--color-gray); font-weight: 700; margin-bottom: 8px; letter-spacing: 0.05em; }
                .form-group input { width: 100%; padding: 14px 16px; border: 1px solid var(--color-gray-light); border-radius: 8px; background: var(--color-white-off); outline: none; transition: border-color 0.2s; font-size: 1rem; }
                .form-group input:focus { border-color: var(--color-black); }
                
                .login-btn { background: var(--color-black); color: #fff; border: none; padding: 16px; border-radius: 8px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: background 0.2s; margin-top: 10px; }
                .login-btn:hover { background: #000; }
                .login-btn:disabled { background: #ccc; cursor: not-allowed; }
                
                .login-error { background: #fee2e2; color: #dc2626; padding: 12px; border-radius: 8px; font-size: 0.85rem; text-align: center; border: 1px solid #fecaca; }
                .login-footer { text-align: center; margin-top: 30px; }
                .login-footer a { font-size: 0.85rem; color: var(--color-gray); text-decoration: underline; }
                .login-footer a:hover { color: var(--color-black); }
            `}</style>
        </div>
    );
}
