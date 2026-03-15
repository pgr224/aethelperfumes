'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function AccountForms() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const refCode = searchParams.get('ref') || '';

    useEffect(() => {
        if (refCode) {
            setIsLogin(false); // Default to register if they have a referral code
        }
    }, [refCode]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await res.json();

            if (res.ok) {
                if (result.user.role === 'admin' || result.user.role === 'manager') {
                    router.push('/admin');
                } else {
                    router.push('/account/dashboard');
                }
            } else {
                setError(result.error || 'Failed to login');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        if (refCode) {
            data.referralCode = refCode;
        }

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await res.json();

            if (res.ok) {
                router.push('/account/dashboard');
            } else {
                setError(result.error || 'Failed to register');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="account-container">
            <div className="account-card card-glass">
                <div className="account-tabs">
                    <button
                        className={`account-tab ${isLogin ? 'active' : ''}`}
                        onClick={() => { setIsLogin(true); setError(''); }}
                    >
                        Login
                    </button>
                    <button
                        className={`account-tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => { setIsLogin(false); setError(''); }}
                    >
                        Register
                    </button>
                </div>

                <div className="account-form-wrapper">
                    {error && <div className="error-message">{error}</div>}

                    {isLogin ? (
                        <form className="account-form" onSubmit={handleLogin}>
                            <h2 className="form-title">Welcome Back</h2>
                            <p className="form-subtitle">Enter your credentials to access your luxury collection.</p>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" name="email" placeholder="email@example.com" required disabled={loading} />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" name="password" placeholder="••••••••" required disabled={loading} />
                            </div>

                            <div className="form-options">
                                <label className="checkbox-container">
                                    <input type="checkbox" disabled={loading} />
                                    <span className="checkmark"></span>
                                    Remember Me
                                </label>
                                <Link href="#">Forgot Password?</Link>
                            </div>

                            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                {loading ? 'Processing...' : 'Login to Account'}
                            </button>
                        </form>
                    ) : (
                        <form className="account-form" onSubmit={handleRegister}>
                            <h2 className="form-title">Join Aethel</h2>
                            <p className="form-subtitle">
                                {refCode ? 'You were invited! Create an account to claim your gift.' : 'Create an account to track orders and receive exclusive offers.'}
                            </p>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input type="text" name="firstName" placeholder="Jane" required disabled={loading} />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input type="text" name="lastName" placeholder="Doe" required disabled={loading} />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" name="email" placeholder="email@example.com" required disabled={loading} />
                            </div>

                            <div className="form-group">
                                <label>Password</label>
                                <input type="password" name="password" placeholder="••••••••" required disabled={loading} />
                            </div>

                            <div className="form-group">
                                <label className="checkbox-container">
                                    <input type="checkbox" required disabled={loading} />
                                    <span className="checkmark"></span>
                                    I agree to the Terms of Service and Privacy Policy
                                </label>
                            </div>

                            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                {loading ? 'Processing...' : 'Create Account'}
                            </button>
                        </form>
                    )}
                </div>
            </div>

            <style jsx>{`
                .account-container { width: 100%; max-width: 500px; }
                .account-card { padding: 40px; border-radius: 8px; background: rgba(20, 20, 20, 0.8); border: 1px solid rgba(201, 169, 110, 0.2); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .account-tabs { display: flex; gap: 30px; margin-bottom: 30px; border-bottom: 1px solid rgba(255,255,255,0.1); }
                .account-tab { background: none; border: none; color: #888; font-size: 1rem; font-weight: 600; padding-bottom: 10px; cursor: pointer; position: relative; transition: color 0.3s ease; }
                .account-tab.active { color: #c9a96e; }
                .account-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: #c9a96e; }
                .form-title { font-family: 'Playfair Display', serif; font-size: 2rem; color: #fff; margin-bottom: 10px; }
                .form-subtitle { color: #888; font-size: 0.9rem; margin-bottom: 30px; line-height: 1.5; }
                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; color: #ddd; font-size: 0.8rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
                .form-group input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 12px 15px; color: #fff; border-radius: 4px; outline: none; transition: border-color 0.3s ease; }
                .form-group input:focus { border-color: #c9a96e; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .form-options { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; font-size: 0.85rem; color: #888; }
                .form-options a { color: #c9a96e; }
                .checkbox-container { display: flex; align-items: center; cursor: pointer; user-select: none; gap: 8px; }
                .btn-full { width: 100%; margin-top: 10px; }
                .error-message { background: rgba(255, 75, 75, 0.1); color: #ff4b4b; padding: 12px; border-radius: 4px; margin-bottom: 20px; font-size: 0.9rem; border: 1px solid rgba(255, 75, 75, 0.2); }
            `}</style>
        </div>
    );
}

export default function AccountPage() {
    return (
        <div className="account-page">
            <Suspense fallback={<div className="container skeleton" style={{ height: '500px', maxWidth: '500px' }}></div>}>
                <AccountForms />
            </Suspense>
            <style jsx>{`
                .account-page { min-height: calc(100vh - 80px); display: flex; align-items: center; justify-content: center; padding: 80px 20px; background: radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%); }
            `}</style>
        </div>
    );
}
