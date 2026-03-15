import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { canCancelOrder, buildStatusEntry, appendStatusHistory } from '@/lib/cancellation';

export async function POST(request) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Please log in to cancel an order.' }, { status: 401 });
        }

        const { orderId, reason } = await request.json();

        if (!orderId || !reason) {
            return NextResponse.json({ error: 'Order ID and cancellation reason are required.' }, { status: 400 });
        }

        // Fetch the order and verify ownership
        const order = await prisma.order.findUnique({
            where: { id: parseInt(orderId) }
        });

        if (!order) {
            return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
        }

        if (order.userId !== user.id) {
            return NextResponse.json({ error: 'You are not authorised to cancel this order.' }, { status: 403 });
        }

        // Run cancellation rules
        const eligibility = canCancelOrder(order);

        if (!eligibility.allowed) {
            return NextResponse.json({ error: eligibility.reason }, { status: 400 });
        }

        // Determine the new status based on cancellation type
        const newStatus = eligibility.type === 'instant' ? 'cancelled' : 'cancel_requested';
        const historyNote = eligibility.type === 'instant'
            ? `Instant cancellation: ${reason}`
            : `Customer requested cancellation: ${reason}`;

        const statusEntry = buildStatusEntry(newStatus, user.email, historyNote);
        const updatedHistory = appendStatusHistory(order.statusHistory, statusEntry);

        const updateData = {
            status: newStatus,
            cancelReason: reason,
            statusHistory: updatedHistory,
            cancelledBy: 'customer'
        };

        // If instant cancel, set cancelledAt timestamp
        if (eligibility.type === 'instant') {
            updateData.cancelledAt = new Date();
        }

        const updatedOrder = await prisma.order.update({
            where: { id: order.id },
            data: updateData
        });

        const message = eligibility.type === 'instant'
            ? 'Your order has been cancelled successfully. A refund will be processed shortly.'
            : 'Your cancellation request has been submitted and is under review. We will notify you once it is processed.';

        return NextResponse.json({
            success: true,
            message,
            type: eligibility.type,
            order: {
                id: updatedOrder.id,
                orderNumber: updatedOrder.orderNumber,
                status: updatedOrder.status
            }
        });

    } catch (error) {
        console.error('Cancel Error:', error);
        return NextResponse.json({ error: 'Failed to process cancellation request.' }, { status: 500 });
    }
}
