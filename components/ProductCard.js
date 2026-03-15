'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Share2 } from 'lucide-react';

export default function ProductCard({ product }) {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [referralCode, setReferralCode] = useState(null);

    useEffect(() => {
        // Try to fetch the signed-in user's referral code once
        fetch('/api/user/profile')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data?.profile?.referralCode) {
                    setReferralCode(data.profile.referralCode);
                }
            })
            .catch(() => {}); // silently fail if not logged in
    }, []);

    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast show toast-${type}`;
        toast.innerHTML = `<span>${type === 'success' ? '✨' : 'ℹ️'} ${message}</span>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    const addToCart = async (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (!product.inStock || product.stock === 0) return;
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: product.id, quantity: 1 }),
            });
            if (res.ok) {
                showToast('Added to cart');
                window.dispatchEvent(new Event('cart-updated'));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsWishlisted(!isWishlisted);
        showToast(!isWishlisted ? 'Added to favourites' : 'Removed from favourites');
    };

    const handleShare = (e) => {
        e.preventDefault();
        e.stopPropagation();

        let link = `${window.location.origin}/products/${product.slug}`;
        if (referralCode) {
            link += `?ref=${referralCode}`;
        }

        const shareText = `Check out ${product.name} from Aethel!`;

        if (navigator.share) {
            navigator.share({ title: product.name, text: shareText, url: link }).catch(() => {});
        } else {
            navigator.clipboard.writeText(link);
            showToast(referralCode ? 'Referral link copied!' : 'Link copied to clipboard');
        }
    };

    const mainImage = product.images?.[0] || 'https://via.placeholder.com/400x500?text=Aethel';
    const isOutOfStock = !product.inStock || product.stock === 0;

    return (
        <div className="pc">
            {/* Image Section */}
            <Link href={`/products/${product.slug}`} className="pc-image-wrap">
                <img src={mainImage} alt={product.name} loading="lazy" className="pc-image" />
                
                {/* Badge */}
                {(product.badge || isOutOfStock) && (
                    <span className={`pc-badge ${isOutOfStock ? 'pc-badge--oos' : ''}`}>
                        {isOutOfStock ? 'Sold Out' : product.badge}
                    </span>
                )}

                {/* Wishlist Heart — pinned top-right */}
                <button
                    className={`pc-wishlist ${isWishlisted ? 'pc-wishlist--active' : ''}`}
                    onClick={handleWishlist}
                    aria-label="Add to Wishlist"
                >
                    <Heart size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>
            </Link>

            {/* Body */}
            <div className="pc-body">
                {product.category?.name && (
                    <div className="pc-category">{product.category.name}</div>
                )}
                <Link href={`/products/${product.slug}`} className="pc-name-link">
                    <h3 className="pc-name">{product.name}</h3>
                </Link>
                {product.shortDesc && (
                    <p className="pc-desc">{product.shortDesc}</p>
                )}
                <div className="pc-price">
                    {product.salePrice ? (
                        <>
                            <span className="pc-price-current">${product.salePrice.toFixed(2)}</span>
                            <span className="pc-price-original">${product.price.toFixed(2)}</span>
                        </>
                    ) : (
                        <span className="pc-price-current">${product.price.toFixed(2)}</span>
                    )}
                </div>
            </div>

            {/* Action Bar */}
            <div className="pc-actions">
                <button
                    className={`pc-cart-btn ${isOutOfStock ? 'pc-cart-btn--disabled' : ''}`}
                    onClick={addToCart}
                    disabled={isOutOfStock}
                >
                    <ShoppingBag size={16} />
                    <span>{isOutOfStock ? 'Sold Out' : 'Add to Bag'}</span>
                </button>
                <button className="pc-share-btn" onClick={handleShare} aria-label="Share product">
                    <Share2 size={16} />
                </button>
            </div>
        </div>
    );
}
