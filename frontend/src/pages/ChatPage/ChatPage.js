// Replace your current ChatPage.js with this updated version:

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import ChatSidebar from '../../components/Chat/ChatSidebar';
import ChatWindow from '../../components/Chat/ChatWindow';
import UserList from '../../components/Chat/UserList';
import './ChatPage.css';

const ChatPage = () => {
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const location = useLocation();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserList, setShowUserList] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const processedStartChatRef = useRef(false);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const lastMessageFetchRef = useRef({});

  const API_URL = 'http://localhost:3001';

  const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchChatRooms = useCallback(async () => {
    try {
      const response = await api.get('/chat/rooms');
      const sortedRooms = response.data.rooms.sort((a, b) => 
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
      setRooms(sortedRooms);
      
      if (!isMobile && sortedRooms.length > 0 && !selectedRoom) {
        setSelectedRoom(sortedRooms[0]);
        fetchMessages(sortedRooms[0]._id);
      }    
    } catch (error) {
      console.error('Failed to load chat rooms:', error);
      if (error.response?.status === 401) {
        window.location.href = '/login';
      }
    } finally {
      setLoading(false);
    }
  }, [selectedRoom, isMobile]);

  useEffect(() => {
    fetchChatRooms();
  }, [fetchChatRooms]);


  // Handle starting/opening a chat from navigation state
  useEffect(() => {
    const startChatWith = location.state?.startChatWith;
    const email = startChatWith?.email?.trim();
    if (!email) return;
    if (processedStartChatRef.current) return;
    if (loading) return;

    const openChatByEmail = async () => {
      try {
        processedStartChatRef.current = true;

        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          alert('Please login to message the host');
          return;
        }

        const resp = await axios.get(`${API_URL}/api/users/search`, {
          params: { query: email },
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!resp.data?.success) {
          console.error('Search API error:', resp.data);
          alert(`Could not find host with email: ${email}. Please make sure the host is registered.`);
          window.history.replaceState({}, document.title);
          return;
        }

        const users = resp.data?.users || [];
        const exactUser = users.find(u => {
          const userEmail = (u.email || '').trim().toLowerCase();
          return userEmail === email.toLowerCase();
        });

        if (!exactUser?._id) {
          console.warn('No user found for email:', email);
          alert(`Host with email "${email}" not found. They may need to create an account first.`);
          window.history.replaceState({}, document.title);
          return;
        }

        const existingRoom = rooms.find(r =>
          Array.isArray(r.participants) &&
          r.participants.some(p => {
            const participantId = p?._id?.toString();
            const participantEmail = (p?.email || '').trim().toLowerCase();
            return (
              participantId === exactUser._id.toString() ||
              participantEmail === email.toLowerCase()
            );
          })
        );

        if (existingRoom?._id) {
          setSelectedRoom(existingRoom);
          fetchMessages(existingRoom._id);
        } else {
          await handleStartNewChat(exactUser._id);
        }
      } catch (error) {
        console.error('Failed to start chat with host by email:', error);
        const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
        alert(`Failed to open chat: ${errorMsg}`);
      } finally {
        window.history.replaceState({}, document.title);
      }
    };

    openChatByEmail();
  }, [location.state, rooms, loading]);

  // Socket event handlers
  useEffect(() => {
    if (!socket || !user?._id) return;

    console.log('Setting up socket listeners for user:', user._id);

    

    const handleIncomingMessage = (message) => {
      console.log('Received message via socket:', {
        messageId: message._id,
        roomId: message.roomId,
        senderId: message.sender?._id,
        currentUserId: user?._id,
        content: message.content
      });

      // Update last fetch reference to prevent polling from overwriting
      if (selectedRoom && selectedRoom._id === message.roomId) {
        lastMessageFetchRef.current[message.roomId] = {
          _id: message._id,
          content: message.content,
          timestamp: Date.now()
        };
      }

      // Update rooms list with new last message
      setRooms(prevRooms => {
        const updatedRooms = prevRooms.map(room => {
          if (room._id === message.roomId) {
            console.log('Updating room last message via socket:', room._id);
            return {
              ...room,
              lastMessage: message,
              updatedAt: new Date().toISOString(),
              unreadCount: selectedRoom?._id === room._id ? 0 : (room.unreadCount || 0) + 1
            };
          }
          return room;
        });

        // If room doesn't exist, sort to bring it to top
        const roomExists = prevRooms.some(r => r._id === message.roomId);
        if (!roomExists) {
          fetchChatRooms(); // Refresh rooms list
          return prevRooms;
        }

        // Sort by updatedAt
        return updatedRooms.sort((a, b) => 
          new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );
      });

      // If this message is for the currently selected room, add it to messages
      if (selectedRoom && message.roomId === selectedRoom._id) {
        console.log('Adding message to current chat window via socket:', message.content);
        setMessages(prev => {
          // Check if message already exists
          const messageExists = prev.some(msg => 
            msg._id === message._id || 
            (msg.isOptimistic && 
             msg.content === message.content && 
             msg.sender?._id === message.sender?._id &&
             Math.abs(new Date(msg.createdAt) - new Date(message.createdAt)) < 5000) // Within 5 seconds
          );
          
          if (messageExists) {
            console.log('Message already exists in UI, skipping');
            return prev;
          }
          
          // Add new message
          const newMessages = [...prev, message];
          // Sort by timestamp to ensure correct order
          return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });
      }
    };

    const handleRoomCreated = (newRoom) => {
      console.log('New room created via socket:', newRoom._id);
      setRooms(prev => {
        const roomExists = prev.some(r => r._id === newRoom._id);
        if (!roomExists) {
          const updatedRooms = [newRoom, ...prev];
          return updatedRooms.sort((a, b) => 
            new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
          );
        }
        return prev;
      });
    };

    const handleUserTyping = ({ roomId, userId, isTyping, userName }) => {
      if (!selectedRoom || selectedRoom._id !== roomId) return;
      
      setTypingUsers(prev => {
        const newTypingUsers = { ...prev };
        if (isTyping && userId !== user?._id) {
          if (!newTypingUsers[roomId]) {
            newTypingUsers[roomId] = new Set();
          }
          newTypingUsers[roomId].add({ userId, userName });
        } else {
          if (newTypingUsers[roomId]) {
            // Create a new Set without the specified user
            const updatedSet = new Set([...newTypingUsers[roomId]].filter(
              item => !(item.userId === userId && item.userName === userName)
            ));
            if (updatedSet.size === 0) {
              delete newTypingUsers[roomId];
            } else {
              newTypingUsers[roomId] = updatedSet;
            }
          }
        }
        return newTypingUsers;
      });
    };

    const handleMessageRead = ({ roomId, userId, messageId }) => {
      // Update read status of messages
      if (selectedRoom && selectedRoom._id === roomId && userId !== user?._id) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, read: true } : msg
        ));
      }
    };

    // Listen for socket events
    socket.on('receive-message', handleIncomingMessage);
    socket.on('room-created', handleRoomCreated);
    socket.on('user-typing', handleUserTyping);
    socket.on('message-read', handleMessageRead);
    socket.on('room-updated', fetchChatRooms);

    // Handle connection issues
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
     
    });

    socket.on('connect', () => {
      console.log('Socket connected, rejoining rooms');
      
      
      if (selectedRoom?._id) {
        socket.emit('join-room', selectedRoom._id);
      }
    });

    return () => {
      console.log('Cleaning up socket listeners');
      socket.off('receive-message', handleIncomingMessage);
      socket.off('room-created', handleRoomCreated);
      socket.off('user-typing', handleUserTyping);
      socket.off('message-read', handleMessageRead);
      socket.off('room-updated', fetchChatRooms);
      socket.off('connect_error');
      socket.off('connect');
      
      // Leave user room
      socket.emit('leave-user', user._id);
    };
  }, [socket, user?._id, selectedRoom, fetchChatRooms]);

  const fetchMessages = async (roomId) => {
    try {
      const response = await api.get(`/chat/messages/${roomId}`);
      const fetchedMessages = response.data.messages || [];
      setMessages(fetchedMessages);
      
      // Update last fetch reference
      const lastMessage = fetchedMessages[fetchedMessages.length - 1];
      if (lastMessage) {
        lastMessageFetchRef.current[roomId] = {
          _id: lastMessage._id,
          content: lastMessage.content,
          timestamp: Date.now()
        };
      }
      
      // Mark messages as read
      if (socket) {
        socket.emit('mark-read', { roomId });
      }
      
      console.log('Fetched messages for room:', roomId, 'count:', fetchedMessages.length);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    fetchMessages(room._id);
    
    // Reset unread count when selecting a room
    setRooms(prev => prev.map(r => 
      r._id === room._id 
        ? { ...r, unreadCount: 0 }
        : r
    ));
    
    // Clear typing indicators
    setTypingUsers({});
  };

  // Join room when selected
  useEffect(() => {
    if (!socket || !selectedRoom?._id) return;

    const roomId = selectedRoom._id;
    console.log('Joining room via socket:', roomId);
    socket.emit('join-room', roomId);

    return () => {
      console.log('Leaving room via socket:', roomId);
      socket.emit('leave-room', roomId);
    };
  }, [socket, selectedRoom?._id]);

  const handleSendMessage = (content) => {
    if (!socket || !selectedRoom || !content.trim()) return;

    const messageContent = content.trim();
    
    // Create optimistic message for immediate UI update
    const optimisticMessage = {
      _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      roomId: selectedRoom._id,
      content: messageContent,
      sender: {
        _id: user?._id,
        name: user?.name,
        email: user?.email,
        profilePhoto: user?.profilePhoto
      },
      createdAt: new Date().toISOString(),
      type: 'text',
      isOptimistic: true,
      read: false
    };

    console.log('Adding optimistic message:', optimisticMessage._id);

    // Add optimistic message to UI immediately
    setMessages(prev => {
      const newMessages = [...prev, optimisticMessage];
      return newMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    });
    
    // Update last fetch reference
    lastMessageFetchRef.current[selectedRoom._id] = {
      _id: optimisticMessage._id,
      content: optimisticMessage.content,
      timestamp: Date.now()
    };
    
    // Update rooms list with optimistic message and bring to top
    setRooms(prev => {
      const updatedRooms = prev.map(room => 
        room._id === selectedRoom._id 
          ? { 
              ...room, 
              lastMessage: optimisticMessage,
              updatedAt: new Date().toISOString(),
              unreadCount: 0
            }
          : room
      );
      
      // Sort by updatedAt to bring to top
      return updatedRooms.sort((a, b) => 
        new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
      );
    });

    // Send via WebSocket
    console.log('Sending message via socket to room:', selectedRoom._id);
    socket.emit('send-message', {
      roomId: selectedRoom._id,
      content: messageContent,
      type: 'text'
    });

    // Stop typing indicator
    socket.emit('typing', {
      roomId: selectedRoom._id,
      isTyping: false
    });
  };

  const handleTyping = (isTyping) => {
    if (!socket || !selectedRoom) return;
    
    socket.emit('typing', {
      roomId: selectedRoom._id,
      userId: user?._id,
      userName: user?.name,
      isTyping
    });
  };

  const handleStartNewChat = async (userId) => {
    try {
      const response = await api.post('/chat/room', {
        participantId: userId
      });

      const newRoom = response.data.room;
      
      // Add to rooms list and sort
      setRooms(prev => {
        const updatedRooms = [newRoom, ...prev];
        return updatedRooms.sort((a, b) => 
          new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        );
      });
      
      setSelectedRoom(newRoom);
      setShowUserList(false);
      fetchMessages(newRoom._id);
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!roomId) return;
    if (!window.confirm('Delete this chat and all its messages?')) return;

    try {
      await api.delete(`/chat/room/${roomId}`);
      setRooms(prev => prev.filter(r => r._id !== roomId));
      if (selectedRoom && selectedRoom._id === roomId) {
        setSelectedRoom(null);
        setMessages([]);
        
        // Clear polling interval
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const handleBackToChats = () => {
    setSelectedRoom(null);
    setMessages([]);
    
    // Clear polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="chat-loading-container">
        <div className="chat-loading-spinner" />
        <div className="chat-loading-text">Loading chats...</div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      {/* Sidebar */}
      {(!isMobile || !selectedRoom) && (
        <ChatSidebar
          rooms={rooms}
          selectedRoom={selectedRoom}
          onSelectRoom={handleSelectRoom}
          onStartNewChat={() => setShowUserList(true)}
          onlineUsers={onlineUsers}
        />
      )}
      
      {/* Chat Window or Welcome */}
      {selectedRoom ? (
        <ChatWindow
          room={selectedRoom}
          messages={messages}
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          onDeleteRoom={() => handleDeleteRoom(selectedRoom?._id)}
          onBack={handleBackToChats}
          isMobile={isMobile}
          typingUsers={typingUsers[selectedRoom._id]}
          messagesEndRef={messagesEndRef}
        />
      ) : !isMobile && (
        <div className="chat-welcome-screen">
          <div className="welcome-content">
            <h2 className="welcome-title">Welcome to ShelterSeek</h2>
            <p className="welcome-message">
              Select a chat or start a new conversation
            </p>
            <button 
              onClick={() => setShowUserList(true)}
              className="welcome-new-chat-button"
            >
              Start New Chat
            </button>
          </div>
        </div>
      )}

      {/* User List Modal */}
      {showUserList && (
        <UserList
          onSelectUser={handleStartNewChat}
          onClose={() => setShowUserList(false)}
        />
      )}
    </div>
  );
};

export default ChatPage;