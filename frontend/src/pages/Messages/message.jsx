import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path as needed

function Message() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, token } = useAuth();

    useEffect(() => {
        // Check if user is logged in
        if (!user || !token) {
            navigate('/traveler-login', { 
                state: { 
                    redirectTo: '/chat',
                    message: 'Please login to use chat'
                }
            });
            return;
        }

        // If host data is provided, navigate to chat with that user
        if (location.state?.hostId) {
            // Instead of local messages, redirect to main chat page
            // The chat page will handle creating/opening chat with this host
            navigate('/chat', { 
                state: { 
                    startChatWith: {
                        id: location.state.hostId,
                        name: location.state.hostName,
                        email: location.state.hostEmail
                    }
                }
            });
        } else {
            // No specific host, just go to chat page
            navigate('/chat');
        }
    }, [location.state, navigate, user, token]);

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
                    animation: 'spin 1s linear infinite'
                }}>
                    💬
                </div>
                <p>Redirecting to chat...</p>
            </div>
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default Message;