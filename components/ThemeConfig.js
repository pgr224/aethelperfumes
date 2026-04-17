'use client';
import { useEffect } from 'react';
import { readJsonResponse } from '@/lib/read-json-response';

export default function ThemeConfig() {
    useEffect(() => {
        const applyStoredTheme = () => {
            try {
                const html = document.documentElement;
                const savedTheme = localStorage.getItem('site-theme');
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
                html.setAttribute('data-theme', initialTheme);
            } catch (error) {
                console.error('Theme init failed', error);
            }
        };

        const applyTheme = async () => {
             try {
                const res = await fetch('/api/admin/settings');
                if (!res.ok) {
                    throw new Error(await res.text());
                }

                const data = await readJsonResponse(res);
                const settings = data.settings || {};

                if (settings.primaryColor) {
                    document.documentElement.style.setProperty('--color-gold', settings.primaryColor);
                    document.documentElement.style.setProperty('--color-gold-light', settings.primaryColor + 'cc');
                    document.documentElement.style.setProperty('--color-gold-muted', settings.primaryColor + '26');
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

        applyStoredTheme();
        applyTheme();
    }, []);

    return null;
}
