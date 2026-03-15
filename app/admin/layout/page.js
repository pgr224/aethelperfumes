'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Editor from '@/components/Admin/Editor';
import BrandingPreview from '@/components/Admin/BrandingPreview';

export function LayoutBrandingContent() {
    const searchParams = useSearchParams();
    const [settings, setSettings] = useState({});
    const [staticPages, setStaticPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState(null);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'branding');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        Promise.all([
            fetch('/api/admin/settings').then(res => res.json()),
            fetch('/api/admin/pages').then(res => res.json())
        ]).then(([settingsData, pagesData]) => {
            if (settingsData.settings) setSettings(settingsData.settings);
            if (pagesData.pages) {
                setStaticPages(pagesData.pages);
                if (pagesData.pages.length > 0) setSelectedPage(pagesData.pages[0]);
            }
            setLoading(false);
        });
    }, []);

    const handleSaveSettings = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });

            if (res.ok) {
                setMessage('Branding updated successfully');
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            console.error(err);
            setMessage('Error saving branding');
        } finally {
            setSaving(false);
        }
    };

    const handlePublishAll = async () => {
        setSaving(true);
        setMessage('Publishing global updates...');
        try {
            // Save settings
            await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            
            // Save current page if editing one
            if (selectedPage) {
                await fetch('/api/admin/pages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(selectedPage)
                });
            }

            setMessage('All changes published to live site!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error during publication');
        } finally {
            setSaving(false);
        }
    };

    const handleSavePage = async () => {
        if (!selectedPage) return;
        setSaving(true);
        setMessage('');

        try {
            const res = await fetch('/api/admin/pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(selectedPage)
            });

            if (res.ok) {
                setMessage(`Page "${selectedPage.title}" updated successfully`);
                setStaticPages(staticPages.map(p => p.id === selectedPage.id ? selectedPage : p));
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            console.error(err);
            setMessage('Error saving page');
        } finally {
            setSaving(false);
        }
    };

    const handleFileUpload = async (e, targetKey) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(targetKey);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setSettings({ ...settings, [targetKey]: data.url });
                setMessage(`${targetKey.replace(/Url$/, '')} uploaded successfully`);
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="spinner" style={{ margin: '5rem auto' }}></div>;

    const tabs = [
        { id: 'branding', label: 'Visual Identity' },
        { id: 'sections', label: 'Site Sections' },
        { id: 'footer', label: 'Footer & Social' },
        { id: 'contact', label: 'Contact & Location' },
        { id: 'pages', label: 'Policy Pages' },
        { id: 'preview', label: 'Live Preview & Publish' }
    ];

    return (
        <div>
            <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <span className="section-subtitle">Experience Design</span>
                    <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Layout & Branding Hub</h1>
                </div>
                {activeTab !== 'preview' && (
                    <button onClick={() => setActiveTab('preview')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
                        Go to Preview
                    </button>
                )}
            </div>

            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '3rem', overflowX: 'auto' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '1rem 0',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            color: activeTab === tab.id ? 'var(--color-gold)' : 'var(--color-gray)',
                            borderBottom: `2px solid ${activeTab === tab.id ? 'var(--color-gold)' : 'transparent'}`,
                            transition: 'all 0.3s ease',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <main>
                {/* BRANDING TAB */}
                {activeTab === 'branding' && (
                    <section className="admin-section fade-in">
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                <div style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 className="admin-title" style={{ color: 'var(--color-gold)', marginBottom: '2rem' }}>Logo & Favicon</h3>
                                    
                                    <div style={{ marginBottom: '2rem' }}>
                                        <label className="admin-label">PRIMARY LOGO</label>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <input className="newsletter-form input" style={{ flex: 1 }} value={settings.logoUrl || ''} readOnly />
                                            <input type="file" id="logo-up" hidden onChange={e => handleFileUpload(e, 'logoUrl')} />
                                            <label htmlFor="logo-up" className="btn btn-sm btn-dark">{uploading === 'logoUrl' ? '...' : 'Upload'}</label>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '2rem' }}>
                                        <label className="admin-label">FAVICON</label>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <input className="newsletter-form input" style={{ flex: 1 }} value={settings.faviconUrl || ''} readOnly />
                                            <input type="file" id="fav-up" hidden onChange={e => handleFileUpload(e, 'faviconUrl')} />
                                            <label htmlFor="fav-up" className="btn btn-sm btn-dark">{uploading === 'faviconUrl' ? '...' : 'Upload'}</label>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 className="admin-title" style={{ color: 'var(--color-gold)', marginBottom: '2rem' }}>Theme Atoms</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                        <div>
                                            <label className="admin-label">ACCENT COLOR (GOLD)</label>
                                            <input type="color" style={{ width: '100%', height: '45px', background: '#333', border: 'none' }} value={settings.primaryColor || '#c9a96e'} onChange={e => setSettings({...settings, primaryColor: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="admin-label">BACKGROUND TEXTURE</label>
                                            <select className="newsletter-form input" value={settings.siteBackground || 'none'} onChange={e => setSettings({...settings, siteBackground: e.target.value})}>
                                                <option value="none">Solid Noir</option>
                                                <option value="grain">Atmospheric Grain</option>
                                                <option value="marble">Midnight Marble</option>
                                                <option value="silk">Obsidian Silk</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <aside>
                                <div style={{ 
                                    background: 'rgba(201,169,110,0.05)', 
                                    padding: '2rem', 
                                    borderRadius: 'var(--border-radius-lg)', 
                                    border: `1px dashed ${settings.primaryColor || 'var(--color-gold)'}`,
                                    position: 'sticky',
                                    top: '2rem'
                                }}>
                                    <h4 style={{ color: settings.primaryColor || 'var(--color-gold)', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quick Preview</h4>
                                    <div style={{ 
                                        padding: '3rem 2rem', 
                                        background: settings.siteBackground === 'none' ? '#0a0a0a' : '#141414', 
                                        borderRadius: '8px', 
                                        textAlign: 'center',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        marginBottom: '1.5rem'
                                    }}>
                                        {settings.logoUrl ? (
                                            <img src={settings.logoUrl} style={{ maxWidth: '120px', margin: '0 auto' }} alt="Logo Preview" />
                                        ) : (
                                            <span style={{ 
                                                fontSize: '1.5rem', 
                                                fontWeight: 'bold', 
                                                letterSpacing: '0.2em',
                                                color: settings.primaryColor || 'var(--color-gold)' 
                                            }}>AETHEL</span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-gray)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                                        This provides a glimpse of your core identity. Visit the <strong>Live Preview</strong> tab for a full-page staging experience.
                                    </p>
                                    <button onClick={handleSaveSettings} className="btn btn-primary" style={{ width: '100%', background: settings.primaryColor || 'var(--color-gold)', color: '#000', border: 'none' }} disabled={saving}>
                                        {saving ? 'Syncing...' : 'Save Staged Changes'}
                                    </button>
                                </div>
                            </aside>
                        </div>
                    </section>
                )}

                {/* SECTIONS TAB */}
                {activeTab === 'sections' && (
                    <section className="admin-section fade-in">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem' }}>
                            <div style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 style={{ fontSize: '1rem', color: 'var(--color-gold)', marginBottom: '1.5rem' }}>Category Discovery</h3>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label className="admin-label">SECTION TITLE</label>
                                    <input className="newsletter-form input" value={settings.catTitle || 'The Olfactory Wardrobe'} onChange={e => setSettings({...settings, catTitle: e.target.value})} />
                                </div>
                                <div>
                                    <label className="admin-label">SECTION SUBTITLE</label>
                                    <input className="newsletter-form input" value={settings.catSubtitle || 'Explore Collections'} onChange={e => setSettings({...settings, catSubtitle: e.target.value})} />
                                </div>
                            </div>

                            <div style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 style={{ fontSize: '1rem', color: 'var(--color-gold)', marginBottom: '1.5rem' }}>Featured Creations</h3>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label className="admin-label">SECTION TITLE</label>
                                    <input className="newsletter-form input" value={settings.featuredTitle || 'Masterpieces in Glass'} onChange={e => setSettings({...settings, featuredTitle: e.target.value})} />
                                </div>
                                <div>
                                    <label className="admin-label">SECTION SUBTITLE</label>
                                    <input className="newsletter-form input" value={settings.featuredSubtitle || 'Curated Selection'} onChange={e => setSettings({...settings, featuredSubtitle: e.target.value})} />
                                </div>
                            </div>

                            <div style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 style={{ fontSize: '1rem', color: 'var(--color-gold)', marginBottom: '1.5rem' }}>Social Validation (Testimonials)</h3>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label className="admin-label">SECTION TITLE</label>
                                    <input className="newsletter-form input" value={settings.testimonialsTitle || 'Visions of Excellence'} onChange={e => setSettings({...settings, testimonialsTitle: e.target.value})} />
                                </div>
                                <div>
                                    <label className="admin-label">SECTION SUBTITLE</label>
                                    <input className="newsletter-form input" value={settings.testimonialsSubtitle || 'Customer Voices'} onChange={e => setSettings({...settings, testimonialsSubtitle: e.target.value})} />
                                </div>
                            </div>

                            <div style={{ background: 'var(--color-black-light)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 style={{ fontSize: '1rem', color: 'var(--color-gold)', marginBottom: '1.5rem' }}>Trust Infrastructure</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="admin-label">BADGE 1 TEXT</label>
                                        <input className="newsletter-form input" value={settings.trust1 || 'Artisanal Batch'} onChange={e => setSettings({...settings, trust1: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="admin-label">BADGE 2 TEXT</label>
                                        <input className="newsletter-form input" value={settings.trust2 || 'Global Courier'} onChange={e => setSettings({...settings, trust2: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleSaveSettings} className="btn btn-primary" style={{ marginTop: '2.5rem' }} disabled={saving}>Save Section Configs</button>
                    </section>
                )}

                {/* FOOTER TAB */}
                {activeTab === 'footer' && (
                    <section className="admin-section fade-in">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            <div style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 style={{ color: 'var(--color-gold)', marginBottom: '2rem' }}>Global Footer Presence</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                                    <div>
                                        <label className="admin-label">BRAND NARRATIVE</label>
                                        <textarea className="newsletter-form input" style={{ minHeight: '120px' }} value={settings.footerAbout || ''} onChange={e => setSettings({...settings, footerAbout: e.target.value})} placeholder="Short description of your brand for the footer." />
                                    </div>
                                    <div>
                                        <label className="admin-label">LEGAL COPYRIGHT</label>
                                        <input className="newsletter-form input" value={settings.copyrightText || ''} onChange={e => setSettings({...settings, copyrightText: e.target.value})} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h3 style={{ color: 'var(--color-gold)', marginBottom: '2rem' }}>Social Handles</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2rem' }}>
                                    <div>
                                        <label className="admin-label">INSTAGRAM USERNAME</label>
                                        <input className="newsletter-form input" value={settings.instagramHandle || ''} onChange={e => setSettings({...settings, instagramHandle: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="admin-label">X / TWITTER HANDLE</label>
                                        <input className="newsletter-form input" value={settings.twitterHandle || ''} onChange={e => setSettings({...settings, twitterHandle: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="admin-label">WHATSAPP CONCIERGE</label>
                                        <input className="newsletter-form input" value={settings.whatsappNumber || ''} onChange={e => setSettings({...settings, whatsappNumber: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleSaveSettings} className="btn btn-primary" style={{ marginTop: '2.5rem' }} disabled={saving}>Save Footer & Social</button>
                    </section>
                )}

                {/* PAGES TAB */}
                {activeTab === 'pages' && (
                    <section className="admin-section fade-in">
                        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                            <div style={{ background: 'var(--color-black-light)', padding: '1.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <label className="admin-label">MANIFESTO SELECTION</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {staticPages.map(page => (
                                        <button
                                            key={page.id}
                                            onClick={() => setSelectedPage(page)}
                                            style={{
                                                padding: '1rem',
                                                textAlign: 'left',
                                                background: selectedPage?.id === page.id ? 'rgba(201, 169, 110, 0.1)' : 'transparent',
                                                border: '1px solid ' + (selectedPage?.id === page.id ? 'var(--color-gold)' : 'transparent'),
                                                color: selectedPage?.id === page.id ? 'var(--color-gold)' : '#fff',
                                                borderRadius: '8px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {page.title}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedPage && (
                                <div style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                        <h3 style={{ color: 'var(--color-gold)' }}>Editing: {selectedPage.title}</h3>
                                        <button onClick={handleSavePage} className="btn btn-sm btn-outline-gold" disabled={saving}>
                                            {saving ? 'Saving...' : 'Publish Update'}
                                        </button>
                                    </div>
                                    <div style={{ marginBottom: '2rem' }}>
                                        <label className="admin-label">INTERNAL TITLE</label>
                                        <input className="newsletter-form input" value={selectedPage.title} onChange={e => setSelectedPage({...selectedPage, title: e.target.value})} />
                                    </div>
                                    <div>
                                        <label className="admin-label">NARRATIVE CONTENT (WYSIWYG)</label>
                                        <Editor value={selectedPage.content} onChange={content => setSelectedPage({...selectedPage, content})} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* CONTACT TAB */}
                {activeTab === 'contact' && (
                    <section className="admin-section fade-in">
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 style={{ color: 'var(--color-gold)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Physical Boutique Presence</h3>
                                    
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label className="admin-label">BOUTIQUE TITLE / LOCATION NAME</label>
                                        <input className="newsletter-form input" value={settings.contactStoreTitle || ''} onChange={e => setSettings({...settings, contactStoreTitle: e.target.value})} placeholder="e.g. Grasse, France" />
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label className="admin-label">FULL ADDRESS</label>
                                        <textarea className="newsletter-form input" style={{ minHeight: '100px', resize: 'vertical' }} value={settings.contactAddress || ''} onChange={e => setSettings({...settings, contactAddress: e.target.value})} placeholder="12 Rue Jean Ossola, 06130 Grasse, France" />
                                    </div>

                                    <div className="admin-grid-2">
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label className="admin-label">CONCIERGE EMAIL</label>
                                            <input className="newsletter-form input" value={settings.contactEmail || ''} onChange={e => setSettings({...settings, contactEmail: e.target.value})} placeholder="atelier@aethel.com" />
                                        </div>
                                        <div style={{ marginBottom: '1.5rem' }}>
                                            <label className="admin-label">HELPLINE / CONCIERGE PHONE</label>
                                            <input className="newsletter-form input" value={settings.contactPhone || ''} onChange={e => setSettings({...settings, contactPhone: e.target.value})} placeholder="+33 4 93 36 01 23" />
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label className="admin-label">GOOGLE MAPS EMBED URL (IFRAME SRC)</label>
                                        <input className="newsletter-form input" value={settings.contactMapUrl || ''} onChange={e => setSettings({...settings, contactMapUrl: e.target.value})} placeholder="https://www.google.com/maps/embed?..." />
                                        <p style={{ color: 'var(--color-gray)', fontSize: '0.75rem', marginTop: '0.5rem' }}>Paste only the 'src' attribute from the Google Maps embed code.</p>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <h3 style={{ color: 'var(--color-gold)', marginBottom: '1.5rem', fontSize: '1.1rem' }}>Business Operations</h3>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label className="admin-label">ATELIER HOURS (TEXT)</label>
                                        <textarea className="newsletter-form input" style={{ minHeight: '100px', resize: 'vertical' }} value={settings.contactHours || ''} onChange={e => setSettings({...settings, contactHours: e.target.value})} placeholder="Monday — Friday: 10:00 - 18:00\nSaturday: 11:00 - 17:00" />
                                    </div>
                                </div>
                            </div>

                            <aside>
                                <div style={{ 
                                    background: 'rgba(201,169,110,0.05)', 
                                    padding: '2rem', 
                                    borderRadius: 'var(--border-radius-lg)', 
                                    border: `1px dashed var(--color-gold)`,
                                    position: 'sticky',
                                    top: '2rem'
                                }}>
                                    <h4 style={{ color: 'var(--color-gold)', fontSize: '0.9rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Publish Changes</h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-gray)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                                        Updates here will be reflected on the dedicated <strong>Contact Us</strong> page across your storefront.
                                    </p>
                                    <button onClick={handleSaveSettings} className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Staged Info'}
                                    </button>
                                </div>
                            </aside>
                        </div>
                    </section>
                )}
                {activeTab === 'preview' && (
                    <section className="admin-section fade-in">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                            <div>
                                <h3 style={{ color: 'var(--color-gold)', marginBottom: '0.5rem' }}>Site Staging Preview</h3>
                                <p style={{ color: 'var(--color-gray)', fontSize: '0.9rem' }}>Review all layout, section, and branding adjustments before pushing them to your live customers.</p>
                            </div>
                            <button onClick={handlePublishAll} className="btn btn-primary" style={{ padding: '1rem 3rem', boxShadow: '0 0 30px rgba(201,169,110,0.3)' }} disabled={saving}>
                                {saving ? 'Publishing...' : 'Publish All Changes Live'}
                            </button>
                        </div>
                        
                        <div style={{ position: 'relative', height: '900px', overflow: 'hidden' }}>
                            <BrandingPreview settings={settings} />
                        </div>
                    </section>
                )}
            </main>

            {message && (
                <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', padding: '1rem 2rem', background: 'var(--color-success)', color: '#fff', borderRadius: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', zIndex: 1000, animation: 'slideInRight 0.3s ease' }}>
                    {message}
                </div>
            )}
        </div>
    );
}

export default function LayoutBranding() {
    return (
        <Suspense fallback={<div className="spinner" style={{ margin: '5rem auto' }}></div>}>
            <LayoutBrandingContent />
        </Suspense>
    );
}
