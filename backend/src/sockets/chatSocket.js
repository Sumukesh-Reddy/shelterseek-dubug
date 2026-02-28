// src/sockets/chatSocket.js
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { Traveler, Host } = require('../models/User');
const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');

const setupSocket = (io) => {
  console.log('🔌 Setting up Socket.IO...');
  
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || 
                    socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        console.log('❌ No token provided for socket connection');
        return next(new Error('Authentication error: No token'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'myjwtsecret');
      
      let user = await Traveler.findById(decoded.id);
      if (!user) {
        user = await Host.findById(decoded.id);
      }
      
      if (!user) {
        console.log('❌ User not found for socket connection:', decoded.id);
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        accountType: user.accountType,
        profilePhoto: user.profilePhoto
      };
      
      console.log('✅ Socket authenticated for user:', user.email);
      next();
    } catch (error) {
      console.error('❌ Socket authentication error:', error.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('🔗 User connected:', socket.userId);
    
    // Update online status
    Promise.all([
      Traveler.findByIdAndUpdate(socket.userId, { online: true, lastSeen: new Date() }).exec(),
      Host.findByIdAndUpdate(socket.userId, { online: true, lastSeen: new Date() }).exec()
    ]).catch(err => console.error('Error updating online status:', err));

    socket.broadcast.emit('user-online', { userId: socket.userId });
    socket.join(`user:${socket.userId}`);

    // Handle ping/pong for connection health
    socket.on('ping', (cb) => {
      if (typeof cb === 'function') cb();
    });

    // Join a specific room
    socket.on('join-room', (roomId) => {
      if (!roomId) return;
      socket.join(roomId);
      console.log(`User ${socket.userId} joined room: ${roomId}`);
    });

    // Leave a room
    socket.on('leave-room', (roomId) => {
      if (!roomId) return;
      socket.leave(roomId);
      console.log(`User ${socket.userId} left room: ${roomId}`);
    });

    // Send message - FIXED VERSION
    socket.on('send-message', async (data) => {
      try {
        console.log('📨 Send message received:', data);
        
        const { roomId, content, type = 'text', mediaUrl } = data || {};

        if (!roomId || !content || !content.trim()) {
          return socket.emit('message-error', { error: 'Room ID and message content are required' });
        }
        
        // Validate roomId is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(roomId)) {
          return socket.emit('message-error', { error: 'Invalid room ID format' });
        }

        const room = await ChatRoom.findById(roomId);
        if (!room) {
          console.log('❌ Chat room not found:', roomId);
          return socket.emit('message-error', { error: 'Chat room not found' });
        }

        const isParticipant = room.participants.some(
          (p) => p.toString() === socket.userId.toString()
        );
        if (!isParticipant) {
          console.log('❌ User not a participant:', socket.userId);
          return socket.emit('message-error', { error: 'You are not a participant in this room' });
        }
        
        let senderModel = 'Traveler';
        let sender = await Traveler.findById(socket.userId);
        if (!sender) {
          sender = await Host.findById(socket.userId);
          senderModel = 'Host';
        }

        if (!sender) {
          return socket.emit('message-error', { error: 'Sender not found' });
        }
        
        console.log('💾 Saving message to database...');
        
        // Create and save the message - FIXED: Don't use new with Message
        const messageData = {
          sender: new mongoose.Types.ObjectId(socket.userId),
          senderModel,
          content: content.trim(),
          type,
          mediaUrl,
          roomId: new mongoose.Types.ObjectId(roomId),
          read: false,
          createdAt: new Date()
        };
        
        const message = await Message.create(messageData);
        console.log('✅ Message saved with ID:', message._id);
        
        // Update room's lastMessage
        room.lastMessage = message._id;
        room.updatedAt = new Date();
        await room.save();

        const populatedSender = {
          _id: socket.userId,
          name: sender?.name || 'Unknown',
          profilePhoto: sender?.profilePhoto || null,
          email: sender?.email || ''
        };

        const outMessage = {
          ...message.toObject(),
          sender: populatedSender
        };

        console.log('📤 Emitting message to room:', roomId);
        
        // Emit to room
        io.to(roomId).emit('receive-message', outMessage);

        // Emit to each participant's personal room
        for (const participantId of room.participants) {
          const pid = participantId.toString();
          if (pid === socket.userId.toString()) continue;
          
          io.to(`user:${pid}`).emit('receive-message', outMessage);
          io.to(`user:${pid}`).emit('room-updated', {
            ...room.toObject(),
            lastMessage: outMessage,
            updatedAt: new Date()
          });
        }

        socket.emit('message-sent', { 
          success: true, 
          message: outMessage 
        });
        
      } catch (error) {
        console.error('❌ Send message error:', error);
        console.error('Error stack:', error.stack);
        socket.emit('message-error', { 
          error: 'Failed to send message: ' + error.message 
        });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      const { roomId, isTyping } = data;
      socket.to(roomId).emit('user-typing', {
        userId: socket.userId,
        userName: socket.user.name,
        isTyping
      });
    });

    // Mark message as read
    socket.on('mark-read', async (data) => {
      try {
        const { roomId } = data;
        
        // Mark all messages in room as read
        await Message.updateMany(
          {
            roomId,
            sender: { $ne: socket.userId },
            read: false
          },
          {
            read: true,
            readAt: new Date()
          }
        );

        // Notify others
        io.to(roomId).emit('messages-read', {
          roomId,
          userId: socket.userId,
          readAt: new Date()
        });
      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log('🔌 User disconnected:', socket.userId);
      
      if (socket.userId) {
        await Traveler.findByIdAndUpdate(socket.userId, { online: false, lastSeen: new Date() }).exec();
        await Host.findByIdAndUpdate(socket.userId, { online: false, lastSeen: new Date() }).exec();
        
        socket.broadcast.emit('user-offline', { userId: socket.userId });
      }
    });
  });

  return io;
};

module.exports = setupSocket;