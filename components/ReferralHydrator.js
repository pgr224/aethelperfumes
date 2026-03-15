'use client';
import { useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function ReferralHydrator() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // --- 1. PERSIST REFERRAL CODE FROM URL ---
        const refParam = searchParams.get('ref');
        if (refParam) {
            localStorage.setItem('aethel_ref_code', refParam);
            console.log(`[REFERRAL TRACKING] Code ${refParam} persisted to session memory.`);
        }

        // --- 2. AUTO-APPEND REF CODE FOR LOGGED-IN USERS ---
        const fetchUserData = async () => {
            try {
                // Check if we are already authenticated
                const res = await fetch('/api/user/referrals');
                if (res.ok) {
                    const data = await res.json();
                    if (data.referralCode && !searchParams.get('ref')) {
                        // Append code to URL silently so user can copy/share it easily
                        const newParams = new URLSearchParams(window.location.search);
                        newParams.set('ref', data.referralCode);
                        const newUrl = `${window.location.pathname}?${newParams.toString()}${window.location.hash}`;
                        window.history.replaceState({ ...window.history.state }, '', newUrl);
                    }
                }
            } catch (e) {
                // Not logged in or error
            }
        };

        fetchUserData();
    }, [pathname, searchParams]);

    return null;
}
