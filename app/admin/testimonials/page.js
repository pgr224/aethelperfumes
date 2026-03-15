'use client';
import { useState, useEffect } from 'react';
import { Quote, Star, Plus, Trash2, CheckCircle, XCircle, User } from 'lucide-react';

export default function TestimonialAdmin() {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [newTestimonial, setNewTestimonial] = useState({
        name: '',
        role: '',
        content: '',
        rating: 5,
        avatar: ''
    });

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            const res = await fetch('/api/admin/testimonials');
            const data = await res.json();
            if (data.testimonials) setTestimonials(data.testimonials);
        } catch (err) {
            console.error('Error fetching testimonials:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/admin/testimonials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTestimonial)
            });
            if (res.ok) {
                const data = await res.json();
                setTestimonials([data.testimonial, ...testimonials]);
                setNewTestimonial({ name: '', role: '', content: '', rating: 5, avatar: '' });
                setIsAdding(false);
                showMessage('Testimonial added successfully', 'success');
            }
        } catch (err) {
            showMessage('Failed to add testimonial', 'error');
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            const res = await fetch(`/api/admin/testimonials/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) {
                setTestimonials(testimonials.map(t => t.id === id ? { ...t, isActive: !currentStatus } : t));
                showMessage('Status updated', 'success');
            }
        } catch (err) {
            showMessage('Update failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;
        try {
            const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTestimonials(testimonials.filter(t => t.id !== id));
                showMessage('Deleted successfully', 'success');
            }
        } catch (err) {
            showMessage('Delete failed', 'error');
        }
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    };

    if (loading) return <div className="admin-container">Loading Testimonials...</div>;

    return (
        <div className="admin-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <div>
                    <span className="section-subtitle">Social Proof</span>
                    <h1 className="section-title" style={{ textAlign: 'left', margin: 0 }}>Public Testimonials</h1>
                </div>
                <button onClick={() => setIsAdding(!isAdding)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isAdding ? <XCircle size={18} /> : <Plus size={18} />}
                    {isAdding ? 'Cancel' : 'Add Testimonial'}
                </button>
            </div>

            {isAdding && (
                <div style={{ background: 'var(--color-black-light)', padding: '2.5rem', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--color-gold-muted)', marginBottom: '3rem' }}>
                    <h3 style={{ marginBottom: '2rem', color: 'var(--color-gold)' }}>New Testimonial</h3>
                    <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div style={{ gridColumn: 'span 1' }}>
                            <label className="admin-label">AUTHOR NAME</label>
                            <input 
                                className="newsletter-form input" 
                                style={{ width: '100%', padding: '12px' }}
                                placeholder="e.g. Elena Petrova"
                                value={newTestimonial.name}
                                onChange={e => setNewTestimonial({...newTestimonial, name: e.target.value})}
                                required
                            />
                        </div>
                        <div style={{ gridColumn: 'span 1' }}>
                            <label className="admin-label">ROLE / CONTEXT (OPTIONAL)</label>
                            <input 
                                className="newsletter-form input" 
                                style={{ width: '100%', padding: '12px' }}
                                placeholder="e.g. Fashion Designer"
                                value={newTestimonial.role}
                                onChange={e => setNewTestimonial({...newTestimonial, role: e.target.value})}
                            />
                        </div>
                        <div style={{ gridColumn: 'span 1' }}>
                            <label className="admin-label">RATING (1-5)</label>
                            <select 
                                className="newsletter-form input" 
                                style={{ width: '100%', padding: '12px' }}
                                value={newTestimonial.rating}
                                onChange={e => setNewTestimonial({...newTestimonial, rating: e.target.value})}
                            >
                                <option value="5">5 Stars</option>
                                <option value="4">4 Stars</option>
                                <option value="3">3 Stars</option>
                                <option value="2">2 Stars</option>
                                <option value="1">1 Star</option>
                            </select>
                        </div>
                        <div style={{ gridColumn: 'span 1' }}>
                            <label className="admin-label">AVATAR INITIALS (OPTIONAL)</label>
                            <input 
                                className="newsletter-form input" 
                                style={{ width: '100%', padding: '12px' }}
                                placeholder="e.g. EP"
                                value={newTestimonial.avatar}
                                onChange={e => setNewTestimonial({...newTestimonial, avatar: e.target.value})}
                                maxLength={2}
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label className="admin-label">TESTIMONIAL CONTENT</label>
                            <textarea 
                                className="newsletter-form input" 
                                style={{ width: '100%', padding: '12px', minHeight: '120px' }}
                                placeholder="Enter the customer's luxury experience..."
                                value={newTestimonial.content}
                                onChange={e => setNewTestimonial({...newTestimonial, content: e.target.value})}
                                required
                            />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Publish Testimonial</button>
                        </div>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {testimonials.map(t => (
                    <div key={t.id} style={{ 
                        background: 'var(--color-black-light)', 
                        padding: '2.5rem', 
                        borderRadius: 'var(--border-radius-lg)', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        position: 'relative',
                        opacity: t.isActive ? 1 : 0.6,
                        transition: 'opacity 0.3s'
                    }}>
                        <Quote size={40} style={{ color: 'var(--color-gold)', opacity: 0.1, position: 'absolute', top: '20px', left: '20px' }} />
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <div style={{ 
                                    width: '40px', 
                                    height: '40px', 
                                    borderRadius: '50%', 
                                    background: 'var(--color-gold-muted)', 
                                    color: 'var(--color-gold)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem'
                                }}>
                                    {t.avatar || <User size={18} />}
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '1rem' }}>{t.name}</h4>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-gray)' }}>{t.role || 'Verified Customer'}</span>
                                </div>
                            </div>
                            <div style={{ color: 'var(--color-gold)', display: 'flex', gap: '2px' }}>
                                {[...Array(t.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                            </div>
                        </div>

                        <p style={{ color: 'var(--color-gray-light)', fontSize: '0.95rem', lineHeight: '1.7', marginBottom: '2rem', fontStyle: 'italic' }}>
                            "{t.content}"
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <button 
                                onClick={() => toggleStatus(t.id, t.isActive)}
                                style={{ 
                                    background: 'none', 
                                    border: 'none', 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    color: t.isActive ? '#2ecc71' : 'var(--color-gray)',
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                {t.isActive ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                {t.isActive ? 'Active' : 'Hidden'}
                            </button>
                            <button 
                                onClick={() => handleDelete(t.id)}
                                style={{ background: 'none', border: 'none', color: 'var(--color-rose)', cursor: 'pointer' }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {message.text && (
                <div style={{ 
                    position: 'fixed', 
                    bottom: '2rem', 
                    right: '2rem', 
                    padding: '1rem 2rem', 
                    background: message.type === 'success' ? '#2ecc71' : '#e74c3c',
                    color: '#fff',
                    borderRadius: 'var(--border-radius)',
                    zIndex: 2000
                }}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
