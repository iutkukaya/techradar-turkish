import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                navigate('/admin');
            } else {
                setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
            }
        } catch (err) {
            setError('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="card glass" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Yönetici Girişi</h2>
                {error && <div style={{ color: 'var(--accent-danger)', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label>Kullanıcı Adı</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>Şifre</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Giriş Yap</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
