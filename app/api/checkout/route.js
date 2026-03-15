import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
    try {
        const body = await request.json();
        const { 
            firstName, lastName, email, address, city, zipCode, country, 
            items, couponCode, referralBalanceUsed, referralCode, paymentMethod
        } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        const user = await getUser();
        let userId = user ? user.id : null;

        // --- Server-Side Validation & Calculation ---
        const order = await prisma.$transaction(async (tx) => {
            // 1. Fetch Products and Calculate Subtotal
            const productIds = items.map(item => item.productId);
            const dbProducts = await tx.product.findMany({
                where: { id: { in: productIds } }
            });

            let serverSubtotal = 0;
            const itemData = items.map(item => {
                const product = dbProducts.find(p => p.id === item.productId);
                if (!product) throw new Error(`Product ${item.productId} not found`);
                const price = product.salePrice || product.price;
                serverSubtotal += price * item.quantity;
                return {
                    productId: product.id,
                    quantity: item.quantity,
                    price: price
                };
            });

            // 2. Fetch Settings and Calculate Shipping
            const settingsList = await tx.siteSetting.findMany({
                where: { key: { in: ['freeShippingThreshold', 'shippingDomestic', 'shippingInternational', 'sampleShippingRate'] } }
            });
            const settings = settingsList.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});

            let serverShipping = 0;
            const freeThreshold = parseFloat(settings.freeShippingThreshold || '5000');
            
            if (serverSubtotal < freeThreshold) {
                const isSampleOnly = items.every(item => {
                    const p = dbProducts.find(prod => prod.id === item.productId);
                    return p?.slug.includes('sample');
                });

                if (isSampleOnly) {
                    serverShipping = parseFloat(settings.sampleShippingRate || '99');
                } else {
                    serverShipping = country === 'IN' 
                        ? parseFloat(settings.shippingDomestic || '0') 
                        : parseFloat(settings.shippingInternational || '50');
                }
            }

            // 3. Verify Coupon
            let serverCouponDiscount = 0;
            if (couponCode) {
                const coupon = await tx.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
                if (coupon && coupon.isActive && (!coupon.expiryDate || new Date(coupon.expiryDate) > new Date()) && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {
                    if (!coupon.minOrderAmount || serverSubtotal >= coupon.minOrderAmount) {
                        if (coupon.discountType === 'PERCENTAGE') {
                            serverCouponDiscount = serverSubtotal * (coupon.discountValue / 100);
                            if (coupon.maxDiscount && serverCouponDiscount > coupon.maxDiscount) {
                                serverCouponDiscount = coupon.maxDiscount;
                            }
                        } else {
                            serverCouponDiscount = coupon.discountValue;
                        }
                        
                        // Update usage
                        await tx.coupon.update({
                            where: { id: coupon.id },
                            data: { usedCount: { increment: 1 } }
                        });
                    }
                }
            }

            // 4. Verify Referral Balance
            let serverReferralDiscount = 0;
            if (userId && referralBalanceUsed > 0) {
                const dbUser = await tx.user.findUnique({ where: { id: userId } });
                if (dbUser) {
                    serverReferralDiscount = Math.min(dbUser.referralBalance, referralBalanceUsed);
                    // Deduct from user
                    await tx.user.update({
                        where: { id: userId },
                        data: { referralBalance: { decrement: serverReferralDiscount } }
                    });
                }
            }

            // 5. Final Total
            const serverTotal = Math.max(0, serverSubtotal + serverShipping - serverCouponDiscount - serverReferralDiscount);

            // 6. Create the order
            const initialHistory = JSON.stringify([{
                status: 'pending',
                timestamp: new Date().toISOString(),
                actor: email,
                note: 'Order placed successfully'
            }]);

            const newOrder = await tx.order.create({
                data: {
                    orderNumber: `LUM-${uuidv4().substring(0, 8).toUpperCase()}`,
                    userId,
                    email,
                    firstName,
                    lastName,
                    address,
                    city,
                    zipCode,
                    country,
                    subtotal: serverSubtotal,
                    shipping: serverShipping,
                    discount: serverCouponDiscount + serverReferralDiscount,
                    couponCode: serverCouponDiscount > 0 ? couponCode : null,
                    paymentMethod: paymentMethod || 'UPI',
                    total: serverTotal,
                    status: 'pending',
                    statusHistory: initialHistory,
                    items: {
                        create: itemData
                    }
                }
            });

            // 7. Reward Referrer logic (Scenario A & B)
            if (userId || referralCode) {
                let pendingReferral = null;
                let referrer = null;
                let rewardAmount = 20.00;

                if (userId) {
                    pendingReferral = await tx.referral.findFirst({
                        where: { refereeId: userId, status: 'PENDING' },
                        include: { referrer: true }
                    });
                }

                if (!pendingReferral && referralCode) {
                    referrer = await tx.user.findUnique({ where: { referralCode } });
                    const alreadyReferred = await tx.referral.findFirst({
                        where: { referrerId: referrer?.id, status: 'COMPLETED', referee: { email: email } }
                    });
                    if (referrer && !alreadyReferred) {
                        const rewardSetting = await tx.siteSetting.findUnique({ where: { key: 'referralReward' } });
                        rewardAmount = rewardSetting ? parseFloat(rewardSetting.value) : 20.00;
                    } else {
                        referrer = null;
                    }
                } else if (pendingReferral) {
                    referrer = pendingReferral.referrer;
                    rewardAmount = pendingReferral.rewardAmount;
                }

                if (referrer) {
                    let FINAL_REWARD = rewardAmount;
                    if (referrer.referralTier === 'SILVER') FINAL_REWARD *= 1.25;
                    if (referrer.referralTier === 'GOLD') FINAL_REWARD *= 1.5;

                    if (pendingReferral) {
                        await tx.referral.update({
                            where: { id: pendingReferral.id },
                            data: { status: 'COMPLETED', rewardAmount: FINAL_REWARD }
                        });
                    } else {
                        await tx.referral.create({
                            data: {
                                referrerId: referrer.id,
                                refereeId: userId || 0,
                                status: 'COMPLETED',
                                rewardAmount: FINAL_REWARD
                            }
                        });
                    }
                    
                    const updatedReferrer = await tx.user.update({
                        where: { id: referrer.id },
                        data: { referralBalance: { increment: FINAL_REWARD } }
                    });

                    // Tier Upgrade
                    const completedCount = await tx.referral.count({
                        where: { referrerId: referrer.id, status: 'COMPLETED' }
                    });
                    let newTier = 'BRONZE';
                    if (completedCount >= 10) newTier = 'GOLD';
                    else if (completedCount >= 4) newTier = 'SILVER';

                    if (newTier !== referrer.referralTier) {
                        await tx.user.update({ where: { id: referrer.id }, data: { referralTier: newTier } });
                    }

                    // Alerts
                    try {
                        const { sendRewardNotification } = await import('@/lib/mail');
                        if (referrer.refEmailNotifications || referrer.refWhatsAppNotifications) {
                            await sendRewardNotification({
                                name: referrer.firstName,
                                email: referrer.email,
                                phone: referrer.refWhatsAppNotifications ? referrer.phone : null,
                                amount: FINAL_REWARD,
                                newBalance: updatedReferrer.referralBalance
                            });
                        }
                    } catch (mailErr) {
                        console.error('Mail notification failed:', mailErr);
                    }
                }
            }

            return newOrder;
        });

        return NextResponse.json({ success: true, orderNumber: order.orderNumber }, { status: 201 });

    } catch (error) {
        console.error('Checkout Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
