import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { isValidTransition, buildStatusEntry, appendStatusHistory } from '@/lib/cancellation';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

async function getAdminUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token');
    if (!token) return null;
    try {
        const decoded = jwt.verify(token.value, JWT_SECRET);
        if (decoded.role !== 'admin' && decoded.role !== 'manager') return null;
        return decoded;
    } catch {
        return null;
    }
}

export async function PATCH(request, { params }) {
    try {
        const adminUser = await getAdminUser();
        if (!adminUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;
        const body = await request.json();
        const { status, trackingNumber, carrier, estimatedDelivery, cancelReason } = body;

        const oldOrder = await prisma.order.findUnique({
            where: { id: parseInt(id) }
        });

        if (!oldOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Validate status transition if status is changing
        if (status && status !== oldOrder.status) {
            if (!isValidTransition(oldOrder.status, status)) {
                return NextResponse.json({
                    error: `Invalid status transition: ${oldOrder.status} → ${status}. Check allowed transitions.`
                }, { status: 400 });
            }
        }

        // Build update data
        const updateData = {};
        if (status) updateData.status = status;
        if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
        if (carrier !== undefined) updateData.carrier = carrier;
        if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);

        // Handle cancellation from admin/manager
        if (status === 'cancelled') {
            updateData.cancelledAt = new Date();
            updateData.cancelledBy = adminUser.role;
            updateData.cancelReason = cancelReason || `Cancelled by ${adminUser.role}`;
        }

        // Record status change in history
        if (status && status !== oldOrder.status) {
            const note = status === 'cancelled'
                ? `Cancelled by ${adminUser.role}: ${cancelReason || 'No reason provided'}`
                : `Status changed to ${status}`;
            const entry = buildStatusEntry(status, adminUser.email, note);
            updateData.statusHistory = appendStatusHistory(oldOrder.statusHistory, entry);
        }

        const updatedOrder = await prisma.order.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: { user: true }
        });

        // SIMULATED EMAIL LOGIC
        if (status === 'shipped' && oldOrder.status !== 'shipped' && trackingNumber) {
            console.log(`--- SIMULATED SHIPPING EMAIL ---`);
            console.log(`To: ${updatedOrder.email}`);
            console.log(`Subject: Your Aethel Order ${updatedOrder.orderNumber} has shipped!`);
            console.log(`Carrier: ${carrier || 'Premium Courier'}`);
            console.log(`Tracking Number: ${trackingNumber}`);
            console.log(`Track here: https://track.aethel.com/${trackingNumber}`);
            console.log(`--------------------------------`);
        } else if (status === 'delivered' && oldOrder.status !== 'delivered') {
            console.log(`--- SIMULATED DELIVERED EMAIL ---`);
            console.log(`To: ${updatedOrder.email}`);
            console.log(`Subject: Your Aethel luxury has arrived.`);
            console.log(`----------------------------------`);
        } else if (status === 'cancelled' && oldOrder.status !== 'cancelled') {
            console.log(`--- SIMULATED CANCELLATION EMAIL ---`);
            console.log(`To: ${updatedOrder.email}`);
            console.log(`Subject: Your Aethel Order ${updatedOrder.orderNumber} has been cancelled.`);
            console.log(`Reason: ${cancelReason || 'N/A'}`);
            console.log(`------------------------------------`);
        }

        return NextResponse.json({ success: true, order: updatedOrder });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
