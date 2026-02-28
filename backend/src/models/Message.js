// src/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'senderModel' 
  },
  senderModel: { 
    type: String, 
    enum: ['Traveler', 'Host'], 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['text', 'image', 'file'], 
    default: 'text' 
  },
  mediaUrl: { 
    type: String 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
  readAt: { 
    type: Date 
  },
  roomId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ChatRoom',
    required: true 
  },
  deleted: { 
    type: Boolean, 
    default: false 
  },
  deletedAt: { 
    type: Date 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add indexes for better performance
messageSchema.index({ roomId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

// Use the default mongoose connection
const Message = mongoose.model('Message', messageSchema);
module.exports = Message;