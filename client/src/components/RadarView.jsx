import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Radar from './Radar';
import useSessionManager from '../hooks/useSessionManager';

const RadarView = () => {
    useSessionManager();
    const [technologies, setTechnologies] = useState([]);
    const [hoveredItem, setHoveredItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const [settings, setSettings] = useState({});

    useEffect(() => {
        fetch('/api/radar')
            .then(res => res.json())
            .then(data => {
                setTechnologies(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching radar data:', err);
                setLoading(false);
            });

        fetch('/api/settings')
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(err => console.error('Error fetching settings:', err));
    }, []);

    const updateTechnology = async (id, updates) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`/api/radar/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates)
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('token');
                alert("Oturum süreniz doldu. Lütfen tekrar giriş yapın.");
                navigate('/login');
                throw new Error("Unauthorized");
            }
            throw new Error("Update failed");
        }
    };

    const handleUpdate = async (id, updates) => {
        try {
            await updateTechnology(id, updates);
            // Optimistically update local state
            setTechnologies(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
        } catch (error) {
            console.error("Failed to update position:", error);
            // Revert optimistic update if needed (complex, skipping for now as we reload on error usually)
        }
    };

    if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' }}>Yükleniyor...</div>;

    const isLoggedIn = !!localStorage.getItem('token');

    // Default colors if settings not yet loaded
    const ringColors = [
        settings.ringColorBenimse || '#22c55e',
        settings.ringColorTestEt || '#0ea5e9',
        settings.ringColorDegerlendir || '#f59e0b',
        settings.ringColorCik || '#ef4444'
    ];

    const rings = [
        settings.ring1 || 'Benimse',
        settings.ring2 || 'Test Et',
        settings.ring3 || 'Değerlendir',
        settings.ring4 || 'Çık'
    ];
    const quadrants = [
        settings.quadrant1 || 'Araçlar',
        settings.quadrant2 || 'Diller ve Çerçeveler',
        settings.quadrant3 || 'Platformlar',
        settings.quadrant4 || 'Teknikler'
    ];

    const quadrantMap = {
        'Araçlar': settings.quadrant1 || 'Araçlar',
        'Diller ve Çerçeveler': settings.quadrant2 || 'Diller ve Çerçeveler',
        'Platformlar': settings.quadrant3 || 'Platformlar',
        'Teknikler': settings.quadrant4 || 'Teknikler'
    };

    const ringMap = {
        'Benimse': settings.ring1 || 'Benimse',
        'Test Et': settings.ring2 || 'Test Et',
        'Değerlendir': settings.ring3 || 'Değerlendir',
        'Çık': settings.ring4 || 'Çık'
    };

    const statusMap = {
        'Yeni': settings.status1 || 'Yeni',
        'Halka Atladı': settings.status2 || 'Halka Atladı',
        'Halka Düştü': settings.status3 || 'Halka Düştü',
        'Değişiklik Yok': settings.status4 || 'Değişiklik Yok'
    };

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            background: settings.backgroundColor || 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
            color: 'white',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Branding - Top Left */}
            <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '215px' }}>
                <img src="/mkk_logo.png" alt="MKK Logo" style={{ width: '100%', height: 'auto', maxHeight: '120px', objectFit: 'contain' }} />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', textShadow: '0 0 10px rgba(56, 189, 248, 0.5)', whiteSpace: 'nowrap', marginTop: '0.5rem' }}>
                    <span style={{ color: settings.titleColor || 'var(--accent-primary)' }}>Teknoloji</span> Radarı
                </h1>
            </div>

            {/* Admin Controls */}
            <div style={{ position: 'absolute', top: '2rem', right: '2rem', zIndex: 10, display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {isLoggedIn ? (
                    <>
                        <div style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(34, 197, 94, 0.2)',
                            border: '1px solid var(--ring-adopt)',
                            borderRadius: '0.5rem',
                            color: 'var(--ring-adopt)',
                            fontSize: '0.875rem',
                            fontWeight: 'bold'
                        }}>
                            Admin Modu Aktif
                        </div>
                        <button onClick={() => navigate('/admin')} className="btn glass" style={{ color: 'var(--text-primary)' }}>
                            Yönetim Paneli
                        </button>
                    </>
                ) : (
                    <button onClick={() => navigate('/login')} className="btn glass" style={{ color: 'var(--text-primary)' }}>
                        Yönetici Girişi
                    </button>
                )}
            </div>

            {/* Radar */}
            <div style={{ height: '100vh', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Radar
                    data={technologies}
                    width={Math.min(window.innerWidth, window.innerHeight) * 0.95}
                    height={Math.min(window.innerWidth, window.innerHeight) * 0.95}
                    onHover={setHoveredItem}
                    onUpdate={handleUpdate}
                    isDraggable={isLoggedIn}
                    colors={ringColors}
                    settings={settings}
                />
            </div>

            {/* Helper for rendering lists */}
            {(() => {
                const renderList = (standardQuadrantName, alignRight = false) => {
                    const displayQuadrantName = quadrantMap[standardQuadrantName];

                    // Filter and Sort by Ring
                    const items = technologies
                        .filter(t => t.quadrant === standardQuadrantName)
                        .sort((a, b) => {
                            const r1 = ['Benimse', 'Test Et', 'Değerlendir', 'Çık'].indexOf(a.ring);
                            const r2 = ['Benimse', 'Test Et', 'Değerlendir', 'Çık'].indexOf(b.ring);
                            return r1 - r2;
                        });

                    return (
                        <div className="glass" style={{
                            position: 'absolute',
                            top: standardQuadrantName === 'Araçlar' || standardQuadrantName === 'Diller ve Çerçeveler' ? '12%' : 'auto',
                            bottom: standardQuadrantName === 'Teknikler' || standardQuadrantName === 'Platformlar' ? '12%' : 'auto',
                            left: standardQuadrantName === 'Araçlar' || standardQuadrantName === 'Teknikler' ? '16%' : 'auto',
                            right: standardQuadrantName === 'Diller ve Çerçeveler' || standardQuadrantName === 'Platformlar' ? '16%' : 'auto',
                            width: '220px', // Reduced width
                            maxHeight: '35vh',
                            overflowY: 'auto',
                            padding: '0.75rem', // Reduced padding
                            borderRadius: '0.5rem',
                            zIndex: 5
                        }}>
                            <h3 style={{ color: settings.listTitleColor || 'var(--accent-primary)', marginBottom: '0.5rem', fontSize: '1rem', textAlign: alignRight ? 'right' : 'left', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.25rem' }}>{displayQuadrantName}</h3>

                            <ul style={{ listStyle: 'none', fontSize: '0.75rem' }}> {/* Reduced font size */}
                                {items.map(tech => (
                                    <li key={tech.id} style={{ marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between', flexDirection: alignRight ? 'row-reverse' : 'row', alignItems: 'center' }}>
                                        <span style={{ fontWeight: '500', color: settings.listTextColor || 'white' }}>{tech.name}</span>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            color: ringColors[['Benimse', 'Test Et', 'Değerlendir', 'Çık'].indexOf(tech.ring)], // Use ring color
                                            opacity: 0.9,
                                            marginLeft: alignRight ? 0 : '0.5rem',
                                            marginRight: alignRight ? '0.5rem' : 0
                                        }}>{ringMap[tech.ring]}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                };

                return (
                    <>
                        {/* Top Left: Araçlar */}
                        {renderList('Araçlar', true)}

                        {/* Top Right: Diller ve Çerçeveler */}
                        {renderList('Diller ve Çerçeveler', false)}

                        {/* Bottom Left: Teknikler */}
                        {renderList('Teknikler', true)}

                        {/* Color Legend - Below Teknikler (Bottom Left) */}
                        <div className="glass" style={{
                            position: 'absolute',
                            bottom: '3%',
                            left: '10%',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            zIndex: 5,
                            display: 'flex',
                            flexWrap: 'nowrap',
                            gap: '1.5rem',
                            alignItems: 'center'
                        }}>
                            {rings.map((ring, i) => (
                                <div key={ring} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: ringColors[i], display: 'inline-block' }}></span>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{ring}</span>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Right: Platformlar */}
                        {renderList('Platformlar', false)}

                        {/* Shape Legend - Below Platformlar (Bottom Right) */}
                        <div className="glass" style={{
                            position: 'absolute',
                            bottom: '3%',
                            right: '10%',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            zIndex: 5,
                            display: 'flex',
                            flexWrap: 'nowrap',
                            gap: '1.5rem',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="16" height="16" viewBox="0 0 20 20" style={{ overflow: 'visible' }}>
                                    <circle cx="10" cy="10" r="6" fill="gray" />
                                    <circle cx="10" cy="10" r="9" fill="none" stroke="white" strokeWidth="2" />
                                </svg>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{statusMap['Yeni']}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="16" height="16" viewBox="0 0 20 20" style={{ overflow: 'visible' }}>
                                    <circle cx="10" cy="10" r="6" fill="gray" />
                                    <path d="M 1 10 A 9 9 0 0 1 19 10" fill="none" stroke="white" strokeWidth="2" />
                                </svg>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{statusMap['Halka Atladı']}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="16" height="16" viewBox="0 0 20 20" style={{ overflow: 'visible' }}>
                                    <circle cx="10" cy="10" r="6" fill="gray" />
                                    <path d="M 1 10 A 9 9 0 0 0 19 10" fill="none" stroke="white" strokeWidth="2" />
                                </svg>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{statusMap['Halka Düştü']}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="16" height="16" viewBox="0 0 20 20" style={{ overflow: 'visible' }}>
                                    <circle cx="10" cy="10" r="6" fill="gray" />
                                </svg>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{statusMap['Değişiklik Yok']}</span>
                            </div>
                        </div>
                    </>
                );
            })()}

            {hoveredItem && (
                <div className="glass" style={{
                    position: 'absolute',
                    left: hoveredItem.x + 20,
                    top: hoveredItem.y > window.innerHeight - 200 ? 'auto' : hoveredItem.y + 20,
                    bottom: hoveredItem.y > window.innerHeight - 200 ? (window.innerHeight - hoveredItem.y + 20) : 'auto',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    maxWidth: '300px',
                    pointerEvents: 'none',
                    zIndex: 20,
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                }}>
                    <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>{hoveredItem.name}</h3>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        {(quadrantMap && quadrantMap[hoveredItem.quadrant]) || hoveredItem.quadrant} / {(ringMap && ringMap[hoveredItem.ring]) || hoveredItem.ring}
                    </div>
                    <p style={{ fontSize: '0.9rem' }}>{hoveredItem.description}</p>
                    {hoveredItem.attribute && (
                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-secondary)' }}>
                            {(statusMap && statusMap[hoveredItem.attribute]) || hoveredItem.attribute}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default RadarView;
