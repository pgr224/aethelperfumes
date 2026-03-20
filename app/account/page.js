'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function AccountForms() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLogin, setIsLogin] = useState(true);
    const [authCheckComplete, setAuthCheckComplete] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Forgot password state
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotStep, setForgotStep] = useState('email'); // 'email' | 'otp' | 'newPassword'
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotOtp, setForgotOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const refCode = searchParams.get('ref') || '';

    useEffect(() => {
        if (refCode) {
            setIsLogin(false);
        }
    }, [refCode]);

    useEffect(() => {
        let active = true;

        const redirectAuthenticatedAdmins = async () => {
            try {
                const res = await fetch('/api/admin/auth', { cache: 'no-store' });
                if (!active) {
                    return;
                }

                if (res.ok) {
                    router.replace('/admin');
                    return;
                }
            } catch (err) {
                // Ignore auth probe errors and allow the normal account flow to render.
            }

            if (active) {
                setAuthCheckComplete(true);
            }
        };

        redirectAuthenticatedAdmins();

        return () => {
            active = false;
        };
    }, [router]);

    if (!authCheckComplete) {
        return <div className="account-container skeleton" style={{ height: '500px' }}></div>;
    }

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

    const handleForgotPassword = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail }),
            });
            const result = await res.json();

            if (res.ok) {
                setForgotStep('otp');
                setSuccess('A verification code has been sent to your email.');
            } else {
                setError(result.error || 'Failed to send reset code');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail, otp: forgotOtp, newPassword }),
            });
            const result = await res.json();

            if (res.ok) {
                setSuccess('Password reset successfully! You can now login.');
                setShowForgotPassword(false);
                setForgotStep('email');
                setForgotEmail('');
                setForgotOtp('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setError(result.error || 'Failed to reset password');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleClick = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('Google Sign-In is coming soon! Please use email and password for now.');
    };

    const closeForgotModal = () => {
        setShowForgotPassword(false);
        setForgotStep('email');
        setError('');
        setSuccess('');
        setForgotEmail('');
        setForgotOtp('');
        setNewPassword('');
        setConfirmPassword('');
    };

    // Google Icon SVG
    const GoogleIcon = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
    );

    return (
        <div className="account-container">
            <div className="account-card card-glass">
                <div className="account-tabs">
                    <button
                        className={`account-tab ${isLogin ? 'active' : ''}`}
                        onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}
                    >
                        Login
                    </button>
                    <button
                        className={`account-tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}
                    >
                        Register
                    </button>
                </div>

                <div className="account-form-wrapper">
                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    {isLogin ? (
                        <form className="account-form" onSubmit={handleLogin}>
                            <h2 className="form-title">Welcome Back</h2>
                            <p className="form-subtitle">Enter your credentials to access your luxury collection.</p>

                            {/* Google SSO Button */}
                            <button type="button" className="sso-btn" onClick={handleGoogleClick} disabled={loading}>
                                <GoogleIcon />
                                <span>Continue with Google</span>
                            </button>

                            <div className="divider-container">
                                <div className="divider-line"></div>
                                <span className="divider-text">or sign in with email</span>
                                <div className="divider-line"></div>
                            </div>

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
                                <button
                                    type="button"
                                    className="forgot-link"
                                    onClick={() => { setShowForgotPassword(true); setError(''); setSuccess(''); }}
                                >
                                    Forgot Password?
                                </button>
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

                            {/* Google SSO Button */}
                            <button type="button" className="sso-btn" onClick={handleGoogleClick} disabled={loading}>
                                <GoogleIcon />
                                <span>Continue with Google</span>
                            </button>

                            <div className="divider-container">
                                <div className="divider-line"></div>
                                <span className="divider-text">or register with email</span>
                                <div className="divider-line"></div>
                            </div>

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

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="modal-overlay" onClick={closeForgotModal}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeForgotModal}>✕</button>

                        <div className="modal-icon">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                <circle cx="12" cy="16" r="1"></circle>
                            </svg>
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        {success && <div className="success-message">{success}</div>}

                        {forgotStep === 'email' && (
                            <>
                                <h2 className="form-title" style={{ textAlign: 'center' }}>Reset Password</h2>
                                <p className="form-subtitle" style={{ textAlign: 'center' }}>
                                    Enter your email address and we&apos;ll send you a verification code.
                                </p>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        placeholder="email@example.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-full"
                                    onClick={handleForgotPassword}
                                    disabled={loading || !forgotEmail}
                                >
                                    {loading ? 'Sending...' : 'Send Verification Code'}
                                </button>
                            </>
                        )}

                        {forgotStep === 'otp' && (
                            <>
                                <h2 className="form-title" style={{ textAlign: 'center' }}>Enter Code</h2>
                                <p className="form-subtitle" style={{ textAlign: 'center' }}>
                                    We sent a 6-digit code to <strong style={{ color: '#c9a96e' }}>{forgotEmail}</strong>
                                </p>
                                <div className="form-group">
                                    <label>Verification Code</label>
                                    <input
                                        type="text"
                                        value={forgotOtp}
                                        onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="000000"
                                        maxLength={6}
                                        className="otp-input"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Min. 8 characters"
                                        disabled={loading}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat password"
                                        disabled={loading}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary btn-full"
                                    onClick={handleResetPassword}
                                    disabled={loading || forgotOtp.length !== 6 || !newPassword || !confirmPassword}
                                >
                                    {loading ? 'Resetting...' : 'Reset Password'}
                                </button>
                                <button
                                    type="button"
                                    className="resend-link"
                                    onClick={() => { setError(''); setSuccess(''); handleForgotPassword(); }}
                                    disabled={loading}
                                >
                                    Didn&apos;t receive the code? Resend
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                .account-container { width: 100%; max-width: 500px; }
                .account-card { padding: 40px; border-radius: 12px; background: rgba(20, 20, 20, 0.9); border: 1px solid rgba(201, 169, 110, 0.2); box-shadow: 0 20px 60px rgba(0,0,0,0.6); backdrop-filter: blur(20px); }
                .account-tabs { display: flex; gap: 30px; margin-bottom: 30px; border-bottom: 1px solid rgba(255,255,255,0.1); }
                .account-tab { background: none; border: none; color: #888; font-size: 1rem; font-weight: 600; padding-bottom: 12px; cursor: pointer; position: relative; transition: color 0.3s ease; }
                .account-tab.active { color: #c9a96e; }
                .account-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, #c9a96e, #e8d5a3); }
                .form-title { font-family: 'Playfair Display', serif; font-size: 2rem; color: #fff; margin-bottom: 10px; }
                .form-subtitle { color: #888; font-size: 0.9rem; margin-bottom: 25px; line-height: 1.5; }

                /* SSO Button */
                .sso-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 14px 20px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 6px;
                    color: #ddd;
                    font-size: 0.95rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .sso-btn:hover { background: rgba(255, 255, 255, 0.07); border-color: rgba(255, 255, 255, 0.25); transform: translateY(-1px); }
                .sso-btn:active { transform: translateY(0); }

                /* Divider */
                .divider-container { display: flex; align-items: center; gap: 15px; margin: 25px 0; }
                .divider-line { flex: 1; height: 1px; background: rgba(255, 255, 255, 0.1); }
                .divider-text { color: #666; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.1em; white-space: nowrap; }

                .form-group { margin-bottom: 20px; }
                .form-group label { display: block; color: #ddd; font-size: 0.8rem; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
                .form-group input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); padding: 13px 16px; color: #fff; border-radius: 6px; outline: none; transition: all 0.3s ease; font-size: 0.95rem; }
                .form-group input:focus { border-color: #c9a96e; box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.1); }
                .form-group input::placeholder { color: #555; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .form-options { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; font-size: 0.85rem; color: #888; }
                .forgot-link { background: none; border: none; color: #c9a96e; cursor: pointer; font-size: 0.85rem; padding: 0; transition: color 0.3s ease; }
                .forgot-link:hover { color: #e8d5a3; text-decoration: underline; }
                .checkbox-container { display: flex; align-items: center; cursor: pointer; user-select: none; gap: 8px; }
                .btn-full { width: 100%; margin-top: 10px; }
                .error-message { background: rgba(255, 75, 75, 0.08); color: #ff4b4b; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; font-size: 0.88rem; border: 1px solid rgba(255, 75, 75, 0.15); }
                .success-message { background: rgba(110, 201, 141, 0.08); color: #6ec98d; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px; font-size: 0.88rem; border: 1px solid rgba(110, 201, 141, 0.15); }

                /* Forgot Password Modal */
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 20px;
                    animation: fadeIn 0.3s ease;
                }
                .modal-card {
                    width: 100%;
                    max-width: 440px;
                    background: rgba(20, 20, 20, 0.95);
                    border: 1px solid rgba(201, 169, 110, 0.2);
                    border-radius: 12px;
                    padding: 40px;
                    position: relative;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.7);
                    animation: slideUp 0.35s ease;
                }
                .modal-close {
                    position: absolute;
                    top: 16px; right: 18px;
                    background: none; border: none;
                    color: #666; font-size: 1.2rem;
                    cursor: pointer;
                    transition: color 0.3s;
                    padding: 4px 8px;
                }
                .modal-close:hover { color: #fff; }
                .modal-icon { text-align: center; margin-bottom: 24px; }

                /* OTP Input */
                .otp-input {
                    text-align: center !important;
                    font-size: 1.8rem !important;
                    letter-spacing: 12px !important;
                    font-family: 'Courier New', monospace !important;
                    color: #c9a96e !important;
                }

                .resend-link {
                    display: block;
                    width: 100%;
                    text-align: center;
                    margin-top: 16px;
                    background: none;
                    border: none;
                    color: #888;
                    font-size: 0.82rem;
                    cursor: pointer;
                    transition: color 0.3s;
                }
                .resend-link:hover { color: #c9a96e; }

                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
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
