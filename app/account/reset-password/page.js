'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const tokenFromUrl = searchParams.get('token') || '';
    const emailFromUrl = searchParams.get('email') || '';

    const [email, setEmail] = useState(emailFromUrl);
    const [token] = useState(tokenFromUrl);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Validate that we have the required params
    const hasValidParams = token && email;

    useEffect(() => {
        if (!tokenFromUrl || !emailFromUrl) {
            setError('Invalid or missing reset link. Please request a new password reset.');
        }
    }, [tokenFromUrl, emailFromUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();

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
                body: JSON.stringify({ email, token, newPassword }),
            });
            const result = await res.json();

            if (res.ok) {
                setSuccess('Password reset successfully! Redirecting to login...');
                setTimeout(() => router.push('/account'), 2500);
            } else {
                setError(result.error || 'Failed to reset password');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-page">
            <div className="reset-card">
                {/* Lock Icon */}
                <div className="reset-icon">
                    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        <circle cx="12" cy="16" r="1"></circle>
                    </svg>
                </div>

                <h1 className="reset-title">Reset Password</h1>
                <p className="reset-subtitle">
                    {hasValidParams
                        ? `Enter your new password for ${email}`
                        : 'This reset link is invalid or has expired.'}
                </p>

                {error && <div className="reset-error">{error}</div>}
                {success && <div className="reset-success">{success}</div>}

                {hasValidParams && !success && (
                    <form className="reset-form" onSubmit={handleSubmit}>
                        <div className="reset-form-group">
                            <label>New Password</label>
                            <div className="password-input-wrapper">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Min. 8 characters"
                                    required
                                    disabled={loading}
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="reset-form-group">
                            <label>Confirm Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat password"
                                required
                                disabled={loading}
                                minLength={8}
                            />
                        </div>

                        {/* Password strength indicator */}
                        {newPassword && (
                            <div className="password-strength">
                                <div className="strength-bars">
                                    <div className={`bar ${newPassword.length >= 8 ? 'active' : ''}`}></div>
                                    <div className={`bar ${newPassword.length >= 10 && /[A-Z]/.test(newPassword) ? 'active' : ''}`}></div>
                                    <div className={`bar ${newPassword.length >= 10 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 'active' : ''}`}></div>
                                    <div className={`bar ${newPassword.length >= 12 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) ? 'active' : ''}`}></div>
                                </div>
                                <span className="strength-text">
                                    {newPassword.length < 8 ? 'Too short' :
                                     newPassword.length < 10 ? 'Fair' :
                                     /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) ? 'Strong' :
                                     'Good'}
                                </span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="reset-btn"
                            disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
                        >
                            {loading ? (
                                <span className="btn-loading">
                                    <span className="spinner"></span>
                                    Resetting...
                                </span>
                            ) : 'Set New Password'}
                        </button>
                    </form>
                )}

                {!hasValidParams && (
                    <Link href="/account" className="reset-btn reset-link-btn">
                        Request New Reset Link
                    </Link>
                )}

                <div className="reset-footer">
                    <Link href="/account">← Back to Login</Link>
                </div>
            </div>

            <style jsx>{`
                .reset-page {
                    min-height: calc(100vh - 80px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 80px 20px;
                    background: radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%);
                }
                .reset-card {
                    width: 100%;
                    max-width: 460px;
                    background: rgba(20, 20, 20, 0.9);
                    border: 1px solid rgba(201, 169, 110, 0.2);
                    border-radius: 16px;
                    padding: 48px 40px;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(20px);
                    animation: fadeUp 0.5s ease;
                }
                .reset-icon {
                    text-align: center;
                    margin-bottom: 24px;
                }
                .reset-title {
                    font-family: 'Playfair Display', Georgia, serif;
                    font-size: 2rem;
                    color: #fff;
                    text-align: center;
                    margin: 0 0 10px;
                    font-weight: 500;
                }
                .reset-subtitle {
                    color: #888;
                    font-size: 0.9rem;
                    text-align: center;
                    margin: 0 0 30px;
                    line-height: 1.5;
                }
                .reset-error {
                    background: rgba(255, 75, 75, 0.08);
                    color: #ff4b4b;
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    font-size: 0.88rem;
                    border: 1px solid rgba(255, 75, 75, 0.15);
                    text-align: center;
                }
                .reset-success {
                    background: rgba(110, 201, 141, 0.08);
                    color: #6ec98d;
                    padding: 12px 16px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    font-size: 0.88rem;
                    border: 1px solid rgba(110, 201, 141, 0.15);
                    text-align: center;
                }
                .reset-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .reset-form-group label {
                    display: block;
                    color: #ddd;
                    font-size: 0.78rem;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-weight: 500;
                }
                .reset-form-group input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.04);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    padding: 14px 16px;
                    color: #fff;
                    border-radius: 8px;
                    outline: none;
                    transition: all 0.3s ease;
                    font-size: 0.95rem;
                }
                .reset-form-group input:focus {
                    border-color: #c9a96e;
                    box-shadow: 0 0 0 3px rgba(201, 169, 110, 0.1);
                }
                .reset-form-group input::placeholder { color: #555; }
                .password-input-wrapper {
                    position: relative;
                }
                .password-input-wrapper input {
                    padding-right: 48px;
                }
                .toggle-password {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #666;
                    cursor: pointer;
                    padding: 4px;
                    transition: color 0.2s;
                    display: flex;
                    align-items: center;
                }
                .toggle-password:hover { color: #c9a96e; }

                /* Password Strength */
                .password-strength {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-top: -8px;
                }
                .strength-bars {
                    display: flex;
                    gap: 4px;
                    flex: 1;
                }
                .bar {
                    height: 3px;
                    flex: 1;
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 2px;
                    transition: background 0.3s;
                }
                .bar.active:nth-child(1) { background: #ff6b6b; }
                .bar.active:nth-child(2) { background: #ffd93d; }
                .bar.active:nth-child(3) { background: #6ec98d; }
                .bar.active:nth-child(4) { background: #4ade80; }
                .strength-text {
                    font-size: 0.72rem;
                    color: #888;
                    text-transform: uppercase;
                    letter-spacing: 0.03em;
                    min-width: 60px;
                    text-align: right;
                }

                .reset-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    padding: 16px;
                    background: linear-gradient(135deg, #c9a96e 0%, #e8d5a3 50%, #c9a96e 100%);
                    background-size: 200% auto;
                    color: #0a0a0a;
                    border: none;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-top: 8px;
                    text-decoration: none;
                    text-align: center;
                }
                .reset-btn:hover:not(:disabled) {
                    background-position: right center;
                    transform: translateY(-1px);
                    box-shadow: 0 8px 25px rgba(201, 169, 110, 0.3);
                }
                .reset-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }
                .btn-loading {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .spinner {
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(10, 10, 10, 0.2);
                    border-top-color: #0a0a0a;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                }
                .reset-link-btn {
                    margin-top: 20px;
                }
                .reset-footer {
                    text-align: center;
                    margin-top: 28px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                }
                .reset-footer a {
                    font-size: 0.85rem;
                    color: #888;
                    text-decoration: none;
                    transition: color 0.3s;
                }
                .reset-footer a:hover { color: #c9a96e; }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                @media (max-width: 480px) {
                    .reset-card { padding: 36px 24px; }
                    .reset-title { font-size: 1.6rem; }
                }
            `}</style>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div style={{
                minHeight: 'calc(100vh - 80px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at center, #1a1a1a 0%, #0a0a0a 100%)'
            }}>
                <div style={{ color: '#888', fontSize: '0.9rem' }}>Loading...</div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
