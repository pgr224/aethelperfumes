'use client';
import { useEffect } from 'react';

export default function Heartbeat() {
    useEffect(() => {
        const isProduction = process.env.NODE_ENV === 'production';
        const keepAliveUrl =
            process.env.NEXT_PUBLIC_KEEPALIVE_URL || 'https://athelperfumes.onrender.com';

        const reloadWebsite = async () => {
            try {
                const response = await fetch(keepAliveUrl, { cache: 'no-store' });
                console.log(
                    `Reloaded at ${new Date().toISOString()}: Status Code ${response.status}`
                );
            } catch (error) {
                console.error(
                    `Error reloading at ${new Date().toISOString()}:`,
                    error instanceof Error ? error.message : String(error)
                );
            }
        };

        const keepAliveInterval = isProduction ? setInterval(reloadWebsite, 30000) : null;

        // Runs every hour to clean up stale stock and potentially send newsletters/coupons.
        const maintenanceInterval = setInterval(async () => {
            console.log('--- HEARTBEAT SIGNAL: SYSTEM MAINTENANCE ---');
            try {
                const cleanupRes = await fetch('/api/admin/inventory/cleanup', { method: 'POST' });
                const cleanupData = await cleanupRes.json();
                console.log('Stock Maintenance:', cleanupData.message);
            } catch (err) {
                console.error('Heartbeat Error:', err);
            }
        }, 3600000); // 1 hour

        // Run keepalive only in production and maintenance in all environments.
        if (isProduction) {
            reloadWebsite();
        }
        fetch('/api/admin/inventory/cleanup', { method: 'POST' });

        return () => {
            if (keepAliveInterval) {
                clearInterval(keepAliveInterval);
            }
            clearInterval(maintenanceInterval);
        };
    }, []);

    return null;
}
