import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [messages, setMessages] = useState([]);
    const { user, token, isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated && token) {
            const newSocket = io(import.meta.env.VITE_API_URL, {
                auth: {
                    token: token
                },
                transports: ['websocket', 'polling']
            });

            newSocket.on('connect', () => {
                console.log('Connected to server');
                setIsConnected(true);
            });

            newSocket.on('disconnect', () => {
                console.log('Disconnected from server');
                setIsConnected(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Connection error:', error);
            });

            // Setup event listeners
            newSocket.on('new_notification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
            });

            newSocket.on('client_notification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
            });

            newSocket.on('new_message', (message) => {
                setMessages(prev => [...prev, message]);
            });

            newSocket.on('user_activity', (activity) => {
                // Handle real-time user activity
                console.log('User activity:', activity);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        }
    }, [isAuthenticated, token]);

    const sendMessage = (roomId, message, type = 'text') => {
        if (socket) {
            socket.emit('send_message', { roomId, message, type });
        }
    };

    const markNotificationRead = (notificationId) => {
        if (socket) {
            socket.emit('mark_notification_read', { notificationId });
        }
    };

    const joinSupportChat = (chatId) => {
        if (socket) {
            socket.emit('join_support_chat', { chatId });
        }
    };

    const leaveSupportChat = (chatId) => {
        if (socket) {
            socket.emit('leave_support_chat', { chatId });
        }
    };

    const value = {
        socket,
        isConnected,
        notifications,
        messages,
        sendMessage,
        markNotificationRead,
        joinSupportChat,
        leaveSupportChat
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};