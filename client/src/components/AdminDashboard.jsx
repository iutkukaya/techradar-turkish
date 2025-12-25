import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSessionManager from '../hooks/useSessionManager';

const AdminDashboard = () => {
    useSessionManager();
    const [activeTab, setActiveTab] = useState('technologies');
    const [technologies, setTechnologies] = useState([]);
    const [users, setUsers] = useState([]);
    const [settings, setSettings] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        quadrant: 'Araçlar',
        ring: 'Benimse',
        attribute: 'Yeni'
    });
    const [userFormData, setUserFormData] = useState({
        username: '',
        password: '',
        permissions: []
    });
    const [currentUser, setCurrentUser] = useState({ permissions: '' });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });

    // Edit States
    const [editingTech, setEditingTech] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [passwordChange, setPasswordChange] = useState({ current: '', new: '' });

    // LDAP State
    const [ldapConfig, setLdapConfig] = useState({
        configName: '',
        isActive: false,
        url: '',
        port: '389',
        baseDn: '',
        bindDn: '',
        bindPassword: '',
        searchFilter: '(sAMAccountName={{username}})',
        notes: ''
    });
    const [showLdapImportModal, setShowLdapImportModal] = useState(false);
    const [ldapSearchQuery, setLdapSearchQuery] = useState('');
    const [ldapSearchResults, setLdapSearchResults] = useState([]);
    const [ldapImportLoading, setLdapImportLoading] = useState(false);

    const navigate = useNavigate();

    const quadrants = [
        settings.quadrant1 || 'Araçlar',
        settings.quadrant2 || 'Diller ve Çerçeveler',
        settings.quadrant3 || 'Platformlar',
        settings.quadrant4 || 'Teknikler'
    ];
    const rings = [
        settings.ring1 || 'Benimse',
        settings.ring2 || 'Test Et',
        settings.ring3 || 'Değerlendir',
        settings.ring4 || 'Çık'
    ];
    const attributes = [
        settings.status1 || 'Yeni',
        settings.status2 || 'Halka Atladı',
        settings.status3 || 'Halka Düştü',
        settings.status4 || 'Değişiklik Yok'
    ];

    useEffect(() => {
        fetchTechnologies();
        fetchSettings();
    }, []);

    useEffect(() => {
        if (settings.ldap_config) {
            try {
                const parsed = JSON.parse(settings.ldap_config);
                setLdapConfig(parsed);
            } catch (e) {
                console.error("Failed to parse LDAP config", e);
            }
        }
    }, [settings]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUser({ permissions: payload.permissions });

                if (payload.permissions === 'ADMIN') {
                    fetchUsers();
                }
            } catch (e) {
                console.error("Invalid token");
            }
        }
    }, []);

    const fetchTechnologies = async () => {
        try {
            const response = await fetch('/api/radar');
            const data = await response.json();
            setTechnologies(data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchSettings = () => {
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => setSettings(data))
            .catch(err => console.error('Error fetching settings:', err));
    };

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (err) {
                console.error("Logout log failed", err);
            }
        }
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        // Prepare data
        // Prepare data
        const formData = new FormData(e.target);
        const dataToSubmit = {
            ...Object.fromEntries(formData),
            active: formData.get('active') ? 1 : 0
        };

        const url = editingTech ? `/api/radar/${editingTech.id}` : '/api/radar';
        const method = editingTech ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSubmit)
            });

            if (response.ok) {
                fetchTechnologies();
                setShowModal(false);
                setEditingTech(null);
                setFormData({
                    name: '',
                    description: '',
                    quadrant: 'Araçlar',
                    ring: 'Benimse',
                    attribute: 'Yeni'
                });
            } else {
                const err = await response.json();
                alert(`İşlem başarısız: ${err.message || 'Bilinmeyen hata'}`);
            }
        } catch (error) {
            console.error('Error saving technology:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/radar/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                fetchTechnologies();
            } else {
                const err = await response.json();
                alert(`Silme işlemi başarısız: ${err.message || 'Bilinmeyen hata'}`);
            }
        } catch (error) {
            console.error('Error deleting technology:', error);
        }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const data = Object.fromEntries(new FormData(e.target));
        // Handle permissions if using checkboxes in modal, or select
        // For simplicity in modal we used select, so it's just a string 'ADMIN' or 'Araçlar' etc.
        // If we want multiple, we need to handle that. Let's stick to the select for now as per previous code.

        const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
        const method = editingUser ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                fetchUsers();
                setShowUserModal(false);
                setEditingUser(null);
            } else {
                alert('Kullanıcı işlemi başarısız.');
            }
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const handleUserDelete = async (id) => {
        if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchUsers();
            } else {
                const err = await response.json();
                alert(`Kullanıcı silinemedi: ${err.message}`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/auth/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordChange.current,
                    newPassword: passwordChange.new
                })
            });

            const data = await response.json();
            alert(data.message);
            if (response.ok) {
                setPasswordChange({ current: '', new: '' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const defaultSettings = {
        backgroundColor: 'radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)',
        titleColor: '#38bdf8',
        listTitleColor: '#38bdf8',
        listTextColor: '#ffffff',
        ringColorBenimse: '#22c55e',
        ringColorTestEt: '#0ea5e9',
        ringColorDegerlendir: '#f59e0b',
        ringColorCik: '#ef4444'
    };

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const saveSettings = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });
            if (response.ok) {
                alert('Ayarlar kaydedildi!');
            } else {
                alert('Ayarlar kaydedilemedi.');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        const formData = new FormData();
        formData.append('logo', selectedFile);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/upload/logo', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (response.ok) {
                alert('Logo başarıyla yüklendi! Değişiklikleri görmek için sayfayı yenileyin.');
                setSelectedFile(null);
            } else {
                alert('Yükleme başarısız oldu.');
            }
        } catch (error) {
            console.error('Error uploading logo:', error);
        }
    };

    // LDAP Handlers
    const handleLdapConfigChange = (key, value) => {
        setLdapConfig(prev => ({ ...prev, [key]: value }));
    };

    const saveLdapSettings = async () => {
        const token = localStorage.getItem('token');
        // Merge with existing settings but update ldap_config key
        const newSettings = { ...settings, ldap_config: JSON.stringify(ldapConfig) };
        try {
            const response = await fetch('/api/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newSettings)
            });
            if (response.ok) {
                alert('LDAP Ayarları kaydedildi!');
                handleSettingChange('ldap_config', JSON.stringify(ldapConfig)); // Update local settings state
            } else {
                alert('Ayarlar kaydedilemedi.');
            }
        } catch (error) {
            console.error('Error saving LDAP settings:', error);
        }
    };

    const testLdapConnection = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/settings/ldap/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(ldapConfig)
            });
            const data = await response.json();
            alert(data.message);
        } catch (error) {
            alert('Bağlantı testi başarısız.');
        }
    };

    const searchLdapUsers = async () => {
        if (!ldapSearchQuery) return;
        setLdapImportLoading(true);
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/api/ldap/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ query: ldapSearchQuery })
            }); //
            if (response.ok) {
                const data = await response.json();
                setLdapSearchResults(data);
            } else {
                alert('Arama başarısız.');
            }
        } catch (error) {
            console.error("LDAP Search Error", error);
        } finally {
            setLdapImportLoading(false);
        }
    };

    const importLdapUser = async (ldapUser) => {
        const token = localStorage.getItem('token');
        // Map LDAP attributes to our user structure
        // Prefer sAMAccountName (AD), fallback to uid (OpenLDAP/Linux)
        const username = ldapUser.sAMAccountName || ldapUser.uid;

        if (!username) {
            alert('Kullanıcı adı (sAMAccountName veya uid) bulunamadı!');
            return;
        }

        const userData = {
            username: username,
            password: 'dummy_password', // Not used
            permissions: 'READ_ONLY', // Default permission
            source: 'LDAP'
        };

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });
            if (response.ok) {
                alert(`${userData.username} başarıyla içe aktarıldı!`);
                fetchUsers();
            } else {
                const err = await response.json();
                alert(`Hata: ${err.message || 'İçe aktarma başarısız'}`);
            }
        } catch (error) {
            console.error('Error importing user:', error);
        }
    };

    const isAdmin = currentUser.permissions === 'ADMIN';

    return (
        <div style={{ padding: '2rem', color: 'white', minHeight: '100vh', background: '#0f172a' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Yönetim Paneli</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => navigate('/')} className="btn glass">Radara Git</button>
                    <button onClick={handleLogout} className="btn glass" style={{ borderColor: 'var(--ring-exit)', color: 'var(--ring-exit)' }}>Çıkış Yap</button>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                <button
                    onClick={() => setActiveTab('technologies')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: activeTab === 'technologies' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        borderRadius: '0.5rem',
                        color: activeTab === 'technologies' ? 'white' : 'rgba(255,255,255,0.6)',
                        fontWeight: activeTab === 'technologies' ? 'bold' : 'normal'
                    }}
                >
                    Teknolojiler
                </button>
                {isAdmin && (
                    <>
                        <button
                            onClick={() => setActiveTab('users')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: activeTab === 'users' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                borderRadius: '0.5rem',
                                color: activeTab === 'users' ? 'white' : 'rgba(255,255,255,0.6)',
                                fontWeight: activeTab === 'users' ? 'bold' : 'normal'
                            }}
                        >
                            Kullanıcılar
                        </button>
                        <button
                            onClick={() => setActiveTab('logo')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: activeTab === 'logo' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                borderRadius: '0.5rem',
                                color: activeTab === 'logo' ? 'white' : 'rgba(255,255,255,0.6)',
                                fontWeight: activeTab === 'logo' ? 'bold' : 'normal'
                            }}
                        >
                            Logo Yükle
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            style={{
                                padding: '0.5rem 1rem',
                                background: activeTab === 'settings' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                borderRadius: '0.5rem',
                                color: activeTab === 'settings' ? 'white' : 'rgba(255,255,255,0.6)',
                                fontWeight: activeTab === 'settings' ? 'bold' : 'normal'
                            }}
                        >
                            Ayarlar
                        </button>
                    </>
                )}
            </div>

            {/* Content */}
            {activeTab === 'technologies' && (
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Teknoloji Listesi</h2>
                        <button onClick={() => { setEditingTech(null); setShowModal(true); }} className="btn glass" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}>
                            + Yeni Ekle
                        </button>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>İsim</th>
                                <th style={{ padding: '1rem' }}>Çeyrek</th>
                                <th style={{ padding: '1rem' }}>Halka</th>
                                <th style={{ padding: '1rem' }}>Durum</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {technologies.map(tech => (
                                <tr key={tech.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>{tech.name}</td>
                                    <td style={{ padding: '1rem' }}>{tech.quadrant}</td>
                                    <td style={{ padding: '1rem' }}>{tech.ring}</td>
                                    <td style={{ padding: '1rem' }}>{tech.active ? 'Aktif' : 'Pasif'}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => { setEditingTech(tech); setShowModal(true); }} className="btn glass" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>Düzenle</button>
                                        <button onClick={() => handleDelete(tech.id)} className="btn glass" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', borderColor: 'var(--ring-exit)', color: 'var(--ring-exit)' }}>Sil</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'users' && isAdmin && (
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Kullanıcı Yönetimi</h2>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button onClick={() => { setShowLdapImportModal(true); setLdapSearchResults([]); setLdapSearchQuery(''); }} className="btn glass" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
                                ☁ LDAP'tan Ekle
                            </button>
                            <button onClick={() => { setEditingUser(null); setShowUserModal(true); }} className="btn glass" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}>
                                + Yeni Kullanıcı
                            </button>
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Kullanıcı Adı</th>
                                <th style={{ padding: '1rem' }}>Yetkiler</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem' }}>{user.username}</td>
                                    <td style={{ padding: '1rem' }}>{user.permissions}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button onClick={() => { setEditingUser(user); setShowUserModal(true); }} className="btn glass" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem' }}>Düzenle</button>
                                        {user.username !== 'admin' && (
                                            <button onClick={() => handleUserDelete(user.id)} className="btn glass" style={{ padding: '0.25rem 0.75rem', fontSize: '0.875rem', borderColor: 'var(--ring-exit)', color: 'var(--ring-exit)' }}>Sil</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Change Own Password Section */}
                    <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Şifremi Değiştir</h3>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label>Mevcut Şifre</label>
                                <input type="password" value={passwordChange.current} onChange={e => setPasswordChange({ ...passwordChange, current: e.target.value })} className="input glass" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label>Yeni Şifre</label>
                                <input type="password" value={passwordChange.new} onChange={e => setPasswordChange({ ...passwordChange, new: e.target.value })} className="input glass" />
                            </div>
                            <button onClick={handlePasswordChange} className="btn glass">Güncelle</button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'logo' && isAdmin && (
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', maxWidth: '500px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Logo Yükle</h2>
                    <p style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.7)' }}>
                        Radar sayfasında sol üstte görünen logoyu buradan değiştirebilirsiniz.
                        Yüklenen dosya "mkk_logo.png" olarak kaydedilecek ve mevcut logonun üzerine yazılacaktır.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="file"
                            accept="image/png"
                            onChange={handleFileChange}
                            className="input glass"
                            style={{ padding: '0.5rem' }}
                        />
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile}
                            className="btn glass"
                            style={{
                                background: selectedFile ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                                color: selectedFile ? '#4ade80' : 'inherit',
                                cursor: selectedFile ? 'pointer' : 'not-allowed'
                            }}
                        >
                            Yükle
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && isAdmin && (
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', maxWidth: '600px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Görünüm Ayarları</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        {/* General Colors */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Genel Renkler</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Arka Plan (CSS Gradient)</label>
                                    <input
                                        type="text"
                                        value={settings.backgroundColor || defaultSettings.backgroundColor}
                                        onChange={e => handleSettingChange('backgroundColor', e.target.value)}
                                        className="input glass"
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Başlık Rengi</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="color"
                                            value={settings.titleColor || defaultSettings.titleColor}
                                            onChange={e => handleSettingChange('titleColor', e.target.value)}
                                            style={{ width: '40px', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        />
                                        <input
                                            type="text"
                                            value={settings.titleColor || defaultSettings.titleColor}
                                            onChange={e => handleSettingChange('titleColor', e.target.value)}
                                            className="input glass"
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* List Colors */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Liste Renkleri</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Liste Başlık Rengi</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="color"
                                            value={settings.listTitleColor || defaultSettings.listTitleColor}
                                            onChange={e => handleSettingChange('listTitleColor', e.target.value)}
                                            style={{ width: '40px', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        />
                                        <input
                                            type="text"
                                            value={settings.listTitleColor || defaultSettings.listTitleColor}
                                            onChange={e => handleSettingChange('listTitleColor', e.target.value)}
                                            className="input glass"
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Liste Metin Rengi</label>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            type="color"
                                            value={settings.listTextColor || defaultSettings.listTextColor}
                                            onChange={e => handleSettingChange('listTextColor', e.target.value)}
                                            style={{ width: '40px', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        />
                                        <input
                                            type="text"
                                            value={settings.listTextColor || defaultSettings.listTextColor}
                                            onChange={e => handleSettingChange('listTextColor', e.target.value)}
                                            className="input glass"
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ring Colors */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Halka Renkleri</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {['Benimse', 'Test Et', 'Değerlendir', 'Çık'].map(ring => {
                                    const key = `ringColor${ring.replace(/\s/g, '')}`; // ringColorBenimse, ringColorTestEt...
                                    return (
                                        <div key={key}>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>{ring}</label>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <input
                                                    type="color"
                                                    value={settings[key] || defaultSettings[key]}
                                                    onChange={e => handleSettingChange(key, e.target.value)}
                                                    style={{ width: '40px', height: '40px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                                />
                                                <input
                                                    type="text"
                                                    value={settings[key] || defaultSettings[key]}
                                                    onChange={e => handleSettingChange(key, e.target.value)}
                                                    className="input glass"
                                                    style={{ flex: 1 }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>


                        {/* Custom Names */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>İsimlendirmeler</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Çeyrek İsimleri</label>
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={`quadrant${i}`} style={{ marginBottom: '0.5rem' }}>
                                            <input
                                                type="text"
                                                placeholder={`Çeyrek ${i}`}
                                                value={settings[`quadrant${i}`] || ''}
                                                onChange={e => handleSettingChange(`quadrant${i}`, e.target.value)}
                                                className="input glass"
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Halka İsimleri</label>
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={`ring${i}`} style={{ marginBottom: '0.5rem' }}>
                                            <input
                                                type="text"
                                                placeholder={`Halka ${i}`}
                                                value={settings[`ring${i}`] || ''}
                                                onChange={e => handleSettingChange(`ring${i}`, e.target.value)}
                                                className="input glass"
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Durum İsimleri</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={`status${i}`}>
                                                <input
                                                    type="text"
                                                    placeholder={`Durum ${i} (${i === 4 ? 'Değişiklik Yok' : ''})`}
                                                    value={settings[`status${i}`] || ''}
                                                    onChange={e => handleSettingChange(`status${i}`, e.target.value)}
                                                    className="input glass"
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LDAP Settings */}
                    <div style={{ gridColumn: '1 / -1', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            LDAP Entegrasyonu (Active Directory)
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={ldapConfig.isActive}
                                    onChange={e => handleLdapConfigChange('isActive', e.target.checked)}
                                />
                                Aktif
                            </label>
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Bağlantı Adı</label>
                                <input className="input glass" style={{ width: '100%' }} value={ldapConfig.configName} onChange={e => handleLdapConfigChange('configName', e.target.value)} placeholder="Örn: Kurumsal AD" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Port</label>
                                <input className="input glass" style={{ width: '100%' }} value={ldapConfig.port} onChange={e => handleLdapConfigChange('port', e.target.value)} placeholder="389 veya 636" />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Sunucu URL</label>
                                <input className="input glass" style={{ width: '100%' }} value={ldapConfig.url} onChange={e => handleLdapConfigChange('url', e.target.value)} placeholder="ldap://dc.sirket.local veya ldaps://..." />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Base DN</label>
                                <input className="input glass" style={{ width: '100%' }} value={ldapConfig.baseDn} onChange={e => handleLdapConfigChange('baseDn', e.target.value)} placeholder="dc=sirket,dc=local" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Bind DN (Kullanıcı Adı)</label>
                                <input className="input glass" style={{ width: '100%' }} value={ldapConfig.bindDn} onChange={e => handleLdapConfigChange('bindDn', e.target.value)} placeholder="cn=service,ou=users..." />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Bind Password</label>
                                <input type="password" className="input glass" style={{ width: '100%' }} value={ldapConfig.bindPassword} onChange={e => handleLdapConfigChange('bindPassword', e.target.value)} />
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Arama Filtresi</label>
                                <input className="input glass" style={{ width: '100%' }} value={ldapConfig.searchFilter} onChange={e => handleLdapConfigChange('searchFilter', e.target.value)} placeholder="(sAMAccountName={{username}})" />
                                <small style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>{'{{username}}'} aranacak ismin yerine geçer.</small>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Notlar</label>
                                <textarea className="input glass" style={{ width: '100%', minHeight: '60px' }} value={ldapConfig.notes} onChange={e => handleLdapConfigChange('notes', e.target.value)} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button onClick={testLdapConnection} className="btn glass" style={{ flex: 1 }}>Bağlantıyı Test Et</button>
                            <button onClick={saveLdapSettings} className="btn glass" style={{ flex: 1, background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>LDAP Ayarlarını Kaydet</button>
                        </div>
                    </div>

                    {/* Syslog Settings */}
                    <div style={{ gridColumn: '1 / -1', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
                        <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            Loglama Ayarları (Syslog)
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={settings.syslog_enabled === 'true'}
                                    onChange={e => handleSettingChange('syslog_enabled', e.target.checked ? 'true' : 'false')}
                                />
                                Aktif
                            </label>
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Sunucu Host / IP</label>
                                <input
                                    className="input glass"
                                    style={{ width: '100%' }}
                                    value={settings.syslog_host || ''}
                                    onChange={(e) => handleSettingChange('syslog_host', e.target.value)}
                                    placeholder="örn: 192.168.1.50"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Port</label>
                                <input
                                    type="number"
                                    className="input glass"
                                    style={{ width: '100%' }}
                                    value={settings.syslog_port || '514'}
                                    onChange={(e) => handleSettingChange('syslog_port', e.target.value)}
                                    placeholder="514"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Protokol</label>
                                <select
                                    className="input glass"
                                    style={{ width: '100%' }}
                                    value={settings.syslog_protocol || 'udp4'}
                                    onChange={(e) => handleSettingChange('syslog_protocol', e.target.value)}
                                >
                                    <option value="udp4">UDP</option>
                                    <option value="tcp4">TCP</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={saveSettings}
                        className="btn glass"
                        style={{ marginTop: '2rem', width: '100%', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', fontWeight: 'bold' }}
                    >
                        Ayarları Kaydet
                    </button>
                </div>
            )
            }

            {/* Modals */}
            {
                showModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                        <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', width: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{editingTech ? 'Teknoloji Düzenle' : 'Yeni Teknoloji Ekle'}</h2>
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>İsim</label>
                                    <input name="name" defaultValue={editingTech?.name} required className="input glass" style={{ width: '100%' }} />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Açıklama</label>
                                    <textarea name="description" defaultValue={editingTech?.description} className="input glass" style={{ width: '100%', minHeight: '100px' }} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Çeyrek</label>
                                        <select name="quadrant" defaultValue={editingTech?.quadrant || quadrants[0]} className="input glass" style={{ width: '100%' }}>
                                            {quadrants.map(q => <option key={q} value={q}>{q}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Halka</label>
                                        <select name="ring" defaultValue={editingTech?.ring || rings[0]} className="input glass" style={{ width: '100%' }}>
                                            {rings.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Öznitelik</label>
                                    <select name="attribute" defaultValue={editingTech?.attribute || ''} className="input glass" style={{ width: '100%' }}>
                                        <option value="">(Yok)</option>
                                        {attributes.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input type="checkbox" name="active" defaultChecked={editingTech ? editingTech.active : true} />
                                        <span>Aktif</span>
                                    </label>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => setShowModal(false)} className="btn glass" style={{ borderColor: 'var(--ring-exit)', color: 'var(--ring-exit)' }}>İptal</button>
                                    <button type="submit" className="btn glass" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}>Kaydet</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {
                showUserModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                        <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', width: '400px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}</h2>
                            <form onSubmit={handleUserSubmit}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Kullanıcı Adı</label>
                                    <input name="username" defaultValue={editingUser?.username} required className="input glass" style={{ width: '100%' }} />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Şifre {editingUser && '(Değiştirmek için doldurun)'}</label>
                                    <input name="password" type="password" required={!editingUser} className="input glass" style={{ width: '100%' }} />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Yetkiler</label>
                                    <select
                                        name="permissions"
                                        defaultValue={editingUser?.permissions || 'ADMIN'}
                                        className="input glass"
                                        style={{ width: '100%', opacity: editingUser?.username === 'admin' ? 0.5 : 1 }}
                                        disabled={editingUser?.username === 'admin'}
                                    >
                                        <option value="ADMIN">ADMIN (Tam Yetki)</option>
                                        <option value="Araçlar">Sadece Araçlar</option>
                                        <option value="Diller ve Çerçeveler">Sadece Diller</option>
                                        <option value="Platformlar">Sadece Platformlar</option>
                                        <option value="Teknikler">Sadece Teknikler</option>
                                    </select>
                                    {editingUser?.username === 'admin' && (
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                                            Varsayılan admin kullanıcısının yetkileri değiştirilemez.
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => setShowUserModal(false)} className="btn glass" style={{ borderColor: 'var(--ring-exit)', color: 'var(--ring-exit)' }}>İptal</button>
                                    <button type="submit" className="btn glass" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}>Kaydet</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }

            {
                showLdapImportModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
                        <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>LDAP'tan Kullanıcı İçe Aktar</h2>

                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <input
                                    className="input glass"
                                    style={{ flex: 1 }}
                                    placeholder="Kullanıcı Adı veya İsim Ara..."
                                    value={ldapSearchQuery}
                                    onChange={e => setLdapSearchQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && searchLdapUsers()}
                                />
                                <button onClick={searchLdapUsers} className="btn glass" disabled={ldapImportLoading}>
                                    {ldapImportLoading ? 'Aranıyor...' : 'Ara'}
                                </button>
                            </div>

                            <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}>
                                {ldapSearchResults.length === 0 ? (
                                    <div style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Sonuç bulunamadı.</div>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                                                <th style={{ padding: '0.75rem', fontSize: '0.8rem' }}>Hesap</th>
                                                <th style={{ padding: '0.75rem', fontSize: '0.8rem' }}>İsim</th>
                                                <th style={{ padding: '0.75rem', fontSize: '0.8rem' }}>E-posta</th>
                                                <th style={{ padding: '0.75rem', fontSize: '0.8rem' }}>İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {ldapSearchResults.map(u => (
                                                <tr key={u.dn || u.sAMAccountName || u.uid} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{u.sAMAccountName || u.uid}</td>
                                                    <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{u.displayName || u.cn}</td>
                                                    <td style={{ padding: '0.75rem', fontSize: '0.9rem' }}>{u.mail}</td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <button
                                                            onClick={() => importLdapUser(u)}
                                                            className="btn glass"
                                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}>
                                                            Ekle
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={() => setShowLdapImportModal(false)} className="btn glass" style={{ borderColor: 'var(--ring-exit)', color: 'var(--ring-exit)' }}>Kapat</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default AdminDashboard;
