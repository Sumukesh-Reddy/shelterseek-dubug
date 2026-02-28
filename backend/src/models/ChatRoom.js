// src/models/ChatRoom.js
const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  name: { 
    type: String 
  },
  participants: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'participantModels'
  }],
  participantModels: [{ 
    type: String, 
    enum: ['Traveler', 'Host'],
    required: true 
  }],
  isGroup: { 
    type: Boolean, 
    default: false 
  },
  groupPhoto: { 
    type: String 
  },
  groupAdmin: { 
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'groupAdminModel'
  },
  groupAdminModel: { 
    type: String, 
    enum: ['Traveler', 'Host'] 
  },
  lastMessage: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Message' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt timestamp on save
chatRoomSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('ChatRoom', chatRoomSchema);