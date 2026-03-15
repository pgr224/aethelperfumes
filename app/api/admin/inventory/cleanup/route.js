import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { sendRecoveryEmail } from '@/lib/mail';

export async function POST() {
    try {
        const now = new Date();
        const results = {
            activated: 0,
            deactivated: 0,
            stockCleaned: 0,
            emailsSent: 0,
            cartsCleared: 0
        };

        // --- 1. PROMOTION PHASES: Recovery & Activation ---
        const promotions = await prisma.promotion.findMany({
            where: { status: { in: ['scheduled', 'active'] } }
        });

        for (const promo of promotions) {
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);
            const timeUntilEnd = endDate.getTime() - now.getTime();

            // A. ACTIVATION: If scheduled and time has come
            if (promo.status === 'scheduled' && now >= startDate && now < endDate) {
                await prisma.$transaction(async (tx) => {
                    const products = await tx.product.findMany({
                        where: promo.categoryId ? { categoryId: promo.categoryId } : {}
                    });
                    for (const p of products) {
                        const salePrice = p.price * (1 - (promo.discountPercentage / 100));
                        await tx.product.update({
                            where: { id: p.id },
                            data: { salePrice: Math.round(salePrice * 100) / 100, badge: 'SALE' }
                        });
                    }
                    if (promo.bannerTitle && promo.bannerImage) {
                        await tx.heroSlide.create({
                            data: {
                                title: promo.bannerTitle,
                                subtitle: promo.bannerSubtitle || promo.name,
                                description: promo.description || 'Exclusive Limited Time Offer',
                                image: promo.bannerImage,
                                ctaText: 'Shop Sale',
                                ctaLink: promo.categoryId ? `/category/${promo.categoryId}` : '/products',
                                sortOrder: -1
                            }
                        });
                    }
                    await tx.promotion.update({ where: { id: promo.id }, data: { status: 'active' } });
                });
                results.activated++;
            }

            // B. FINAL CHANCE RECOVERY: If active and < 4 hours remaining
            if (promo.status === 'active' && timeUntilEnd > 0 && timeUntilEnd <= 4 * 60 * 60 * 1000) {
                const pendingOrders = await prisma.order.findMany({
                    where: { 
                        status: 'pending', 
                        recoveryEmailSent: false,
                        createdAt: { gte: startDate } // Only orders started during this promo
                    },
                    include: { items: { include: { product: true } } }
                });

                for (const order of pendingOrders) {
                    const hoursLeft = Math.ceil(timeUntilEnd / (1000 * 60 * 60));
                    await sendRecoveryEmail({
                        name: order.firstName,
                        email: order.email,
                        orderNumber: order.orderNumber,
                        discount: promo.discountPercentage,
                        timeLeft: `${hoursLeft} hours`,
                        items: order.items
                    });
                    await prisma.order.update({
                        where: { id: order.id },
                        data: { recoveryEmailSent: true }
                    });
                    results.emailsSent++;
                }
            }

            // C. DEACTIVATION & ASSET CLEANUP: If active and time is up
            if (promo.status === 'active' && now >= endDate) {
                await prisma.$transaction(async (tx) => {
                    const products = await tx.product.findMany({
                        where: promo.categoryId ? { categoryId: promo.categoryId } : {}
                    });
                    for (const p of products) {
                        await tx.product.update({
                            where: { id: p.id },
                            data: { salePrice: null, badge: null }
                        });
                    }
                    if (promo.bannerTitle) {
                        await tx.heroSlide.deleteMany({ where: { title: promo.bannerTitle } });
                    }
                    // CLEAR STALE CARTS: Remove orphan items linking to expired promo categories
                    if (promo.categoryId) {
                        const productsInPromo = await tx.product.findMany({
                            where: { categoryId: promo.categoryId },
                            select: { id: true }
                        });
                        const productIds = productsInPromo.map(p => p.id);
                        
                        if (productIds.length > 0) {
                            const cartsToDelete = await tx.cartItem.deleteMany({
                                where: { productId: { in: productIds } }
                            });
                            results.cartsCleared += cartsToDelete.count;
                        }
                    }
                    await tx.promotion.update({ where: { id: promo.id }, data: { status: 'completed' } });
                });
                results.deactivated++;
            }
        }

        // --- 2. STOCK SAFEGUARD: Predictive Stock Release ---
        const settings = await prisma.siteSetting.findMany();
        const settingsMap = settings.reduce((acc, curr) => { acc[curr.key] = curr.value; return acc; }, {});
        const stockExpiryHours = parseInt(settingsMap.stockExpiryHours || '24');
        const expiryDate = new Date(Date.now() - stockExpiryHours * 60 * 60 * 1000);

        const expiredOrders = await prisma.order.findMany({
            where: { status: 'pending', createdAt: { lte: expiryDate } },
            include: { items: true }
        });

        if (expiredOrders.length > 0) {
            await prisma.$transaction(async (tx) => {
                for (const order of expiredOrders) {
                    for (const item of order.items) {
                        await tx.product.update({
                            where: { id: item.productId },
                            data: { stock: { increment: item.quantity }, inStock: true }
                        });
                    }
                    await tx.order.update({ where: { id: order.id }, data: { status: 'cancelled' } });
                }
            });
            results.stockCleaned = expiredOrders.length;
        }

        return NextResponse.json({ 
            success: true, 
            message: `Pulse complete. Emails: ${results.emailsSent}, Stock Cleaned: ${results.stockCleaned}, Carts Cleared: ${results.cartsCleared}`,
            results 
        });

    } catch (error) {
        console.error('Heartbeat Logic Failure:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
