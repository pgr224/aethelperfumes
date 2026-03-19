'use client';
import { useEffect } from 'react';

export default function Heartbeat() {
    useEffect(() => {
        // Runs every hour to clean up stale stock
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

        // Run maintenance immediately on load
        fetch('/api/admin/inventory/cleanup', { method: 'POST' });

        return () => {
            clearInterval(maintenanceInterval);
        };
    }, []);

    return null;
}
