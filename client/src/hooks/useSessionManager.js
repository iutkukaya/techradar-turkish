import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const useSessionManager = () => {
    const navigate = useNavigate();
    const lastRefreshTime = useRef(Date.now());

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const refreshToken = async () => {
            const now = Date.now();
            // Only refresh if more than 1 minute has passed since last refresh
            // to avoid spamming the server on every mouse move
            if (now - lastRefreshTime.current < 60000) return;

            lastRefreshTime.current = now;

            try {
                const currentToken = localStorage.getItem('token');
                if (!currentToken) return;

                const response = await fetch('/api/auth/refresh', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${currentToken}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('token', data.token);
                    console.log('Session extended');
                } else {
                    // If refresh fails (e.g. token expired), log out
                    if (response.status === 401 || response.status === 403) {
                        localStorage.removeItem('token');
                        navigate('/login');
                    }
                }
            } catch (error) {
                console.error('Failed to refresh session:', error);
            }
        };

        const handleActivity = () => {
            refreshToken();
        };

        // Listen for user activity
        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('click', handleActivity);
        window.addEventListener('scroll', handleActivity);
        window.addEventListener('wheel', handleActivity); // For mouse wheel scrolling

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('scroll', handleActivity);
            window.removeEventListener('wheel', handleActivity);
        };
    }, [navigate]);
};

export default useSessionManager;
