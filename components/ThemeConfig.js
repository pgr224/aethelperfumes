'use client';
import { useEffect } from 'react';

export default function ThemeConfig() {
    useEffect(() => {
        const applyTheme = async () => {
             try {
                const res = await fetch('/api/admin/settings');
                const data = await res.json();
                const settings = data.settings || {};

                if (settings.primaryColor) {
                    document.documentElement.style.setProperty('--color-gold', settings.primaryColor);
                    document.documentElement.style.setProperty('--color-gold-light', settings.primaryColor + 'cc');
                }

                if (settings.siteBackground && settings.siteBackground !== 'none') {
                    // Map background names to actual textures
                    const textures = {
                        'grain': 'url("https://www.transparenttextures.com/patterns/black-linen-2.png")',
                        'marble': 'url("https://www.transparenttextures.com/patterns/black-paper.png")',
                        'silk': 'url("https://www.transparenttextures.com/patterns/dark-matter.png")'
                    };
                    if (textures[settings.siteBackground]) {
                        document.body.style.backgroundImage = textures[settings.siteBackground];
                        document.body.style.backgroundAttachment = 'fixed';
                    }
                }
             } catch (e) {
                console.error('Theme apply failed', e);
             }
        };
        applyTheme();
    }, []);

    return null;
}
