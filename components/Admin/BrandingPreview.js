'use client';
import { useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrustBar from '@/components/TrustBar';
import CategoryGrid from '@/components/CategoryGrid';
import TestimonialSlider from '@/components/TestimonialSlider';

export default function BrandingPreview({ settings = {} }) {
    const containerRef = useRef(null);

    const primaryColor = settings.primaryColor || '#c9a96e';
    const bgTexture = {
        'grain': 'url("https://www.transparenttextures.com/patterns/black-linen-2.png")',
        'marble': 'url("https://www.transparenttextures.com/patterns/black-paper.png")',
        'silk': 'url("https://www.transparenttextures.com/patterns/dark-matter.png")'
    }[settings.siteBackground] || 'none';

    return (
        <div className="preview-window">
            <div className="preview-toolbar">
                <div className="preview-dots">
                    <span></span><span></span><span></span>
                </div>
                <div className="preview-url">aethel.shop/preview</div>
                <div className="preview-actions">
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-gold)' }}>LIVE PREVIEW MODE</span>
                </div>
            </div>
            
            <div className="preview-viewport" ref={containerRef} style={{
                '--color-gold': primaryColor,
                '--color-gold-light': primaryColor + 'cc',
                backgroundImage: bgTexture,
                backgroundAttachment: 'local'
            }}>
                <div className="preview-content-scale">
                    {/* Header hidden per request to focus on section design */}
                    
                    <main>
                        {/* Mock Hero Area with Dynamic Color */}
                        <section style={{ 
                            height: '500px', 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            background: 'rgba(255,255,255,0.02)', 
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            position: 'relative'
                        }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)` }}></div>
                            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                                <span style={{ color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.4em', fontSize: '0.8rem', fontWeight: 'bold' }}>ESTABLISHED 2026</span>
                                <h1 style={{ fontSize: '4rem', fontFamily: 'var(--font-heading)', marginTop: '1.5rem', marginBottom: '1.5rem', color: '#fff' }}>
                                    The Essence of {settings.catTitle?.split(' ')[0] || 'Artistry'}
                                </h1>
                                <button className="btn btn-primary" style={{ background: primaryColor, color: '#000', border: 'none' }}>Discover Collection</button>
                            </div>
                        </section>

                        <TrustBar settings={settings} />
                        
                        <div style={{ padding: '6rem 0' }}>
                            <CategoryGrid settings={settings} />
                        </div>

                        <TestimonialSlider settings={settings} />
                    </main>

                    <Footer isPreview={true} previewSettings={settings} />
                </div>
            </div>

            <style jsx>{`
                .preview-window {
                    background: #111;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 40px 100px rgba(0,0,0,0.8);
                    overflow: hidden;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .preview-toolbar {
                    background: #222;
                    padding: 10px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-bottom: 1px solid #333;
                }
                .preview-dots {
                    display: flex;
                    gap: 6px;
                }
                .preview-dots span {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #444;
                }
                .preview-url {
                    background: #111;
                    border-radius: 4px;
                    padding: 4px 40px;
                    font-size: 0.7rem;
                    color: #666;
                    border: 1px solid #333;
                }
                .preview-viewport {
                    flex: 1;
                    overflow-y: auto;
                    background: var(--color-black);
                    position: relative;
                }
                .preview-content-scale {
                    width: 100%;
                    min-height: 100%;
                }
                .preview-viewport::-webkit-scrollbar {
                    width: 6px;
                }
                .preview-viewport::-webkit-scrollbar-track {
                    background: #111;
                }
                .preview-viewport::-webkit-scrollbar-thumb {
                    background: var(--color-gold);
                    border-radius: 10px;
                }
                
                /* Override children within preview to use local gold variable */
                .preview-viewport :global(h1), 
                .preview-viewport :global(h2), 
                .preview-viewport :global(h3),
                .preview-viewport :global(h4),
                .preview-viewport :global(.section-title),
                .preview-viewport :global(.section-subtitle),
                .preview-viewport :global(.category-card-name),
                .preview-viewport :global(.testimonial-stars),
                .preview-viewport :global(.btn-link),
                .preview-viewport :global(.logo span),
                .preview-viewport :global(.badge) {
                    color: var(--color-gold) !important;
                }

                .preview-viewport :global(.btn-primary),
                .preview-viewport :global(.category-card-link::after),
                .preview-viewport :global(.badge) {
                    background: var(--color-gold) !important;
                    color: #000 !important;
                }

                .preview-viewport :global(.logo-img) {
                    filter: drop-shadow(0 0 5px var(--color-gold-light));
                }

                .preview-viewport :global(a:hover) {
                    color: var(--color-gold) !important;
                }
            `}</style>
        </div>
    );
}

