'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get('order');

    return (
        <div className="success-page">
            <div className="container text-center">
                <div className="success-icon">✨</div>
                <h1 className="section-title">Thank You For Your Order</h1>
                <p className="order-number">Order #{orderNumber}</p>

                <p className="success-message">
                    Your luxury collection is being prepared. We have sent an email confirmation with your order details and tracking information.
                </p>

                <div className="success-actions">
                    <Link href="/account/dashboard" className="btn btn-primary btn-lg">View Dashboard</Link>
                    <Link href="/products" className="btn btn-outline btn-lg" style={{ marginLeft: '15px' }}>Continue Exploring</Link>
                </div>
            </div>

            <style jsx>{`
                .success-page {
                    min-height: calc(100vh - 80px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #0a0a0a;
                    padding: 80px 20px;
                }
                .container {
                    max-width: 600px;
                }
                .success-icon {
                    font-size: 4rem;
                    margin-bottom: 20px;
                }
                .order-number {
                    font-family: monospace;
                    font-size: 1.2rem;
                    color: #c9a96e;
                    margin-bottom: 30px;
                    letter-spacing: 0.1em;
                }
                .success-message {
                    color: #888;
                    font-size: 1.1rem;
                    line-height: 1.6;
                    margin-bottom: 40px;
                }
            `}</style>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}><div className="spinner"></div></div>}>
            <SuccessContent />
        </Suspense>
    );
}

