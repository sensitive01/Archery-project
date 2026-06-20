const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null // null implies broadcast to role
  },
  role: { 
    type: String,
    enum: ['admin', 'student'],
    required: true
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String,
    default: 'system' // e.g. 'registration', 'payment', 'batch', 'event', 'attendance', 'system'
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  link: { 
    type: String,
    default: '' // optional URL to navigate when clicked
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
