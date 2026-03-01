import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path as needed

function Messages() {
    const navigate = useNavigate();
    const { user, token } = useAuth();

    useEffect(() => {
        // Check if user is logged in
        if (!user || !token) {
            navigate('/traveler-login', { 
                state: { 
                    redirectTo: '/chat',
                    message: 'Please login to view your messages'
                }
            });
            return;
        }

        // Redirect to the real chat page
        navigate('/chat');
    }, [navigate, user, token]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            backgroundColor: '#36393f'
        }}>
            <div style={{
                textAlign: 'center',
                color: 'white'
            }}>
                <div style={{
                    fontSize: '48px',
                    marginBottom: '20px',
                    animation: 'pulse 2s infinite'
                }}>
                    📨
                </div>
                <p>Loading your messages...</p>
            </div>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.1); }
                }
            `}</style>
        </div>
    );
}

export default Messages;