const Notification = require('../models/Notification');

// Helper to create a notification internally
const createNotification = async ({ userId, role, title, message, type, link }) => {
  try {
    const notification = await Notification.create({
      userId: userId || null,
      role,
      title,
      message,
      type,
      link
    });
    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const role = req.user.role;
    let query = { role };

    // If student, get specific notifications OR broadcast notifications (userId: null)
    if (role === 'student') {
      query = { 
        role: 'student', 
        $or: [{ userId: req.user._id }, { userId: null }] 
      };
    }

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Authorization check
    if (notification.role !== req.user.role) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (req.user.role === 'student' && notification.userId && notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: 'Server error marking notification as read' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    const role = req.user.role;
    let query = { role, isRead: false };

    if (role === 'student') {
      query = { 
        role: 'student', 
        $or: [{ userId: req.user._id }, { userId: null }],
        isRead: false
      };
    }

    await Notification.updateMany(query, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error marking notifications as read' });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Authorization check
    if (notification.role !== req.user.role) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (req.user.role === 'student' && notification.userId && notification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // For broadcast notifications (userId is null), deleting it means it's gone for everyone.
    // If we only want the student to dismiss it from their view, we'd need a more complex schema 
    // (e.g. tracking "dismissedBy"). For simplicity, if a student deletes a broadcast, it's deleted.
    // However, it's safer to only allow admins to delete broadcasts.
    if (req.user.role === 'student' && !notification.userId) {
      // It's a broadcast notification. Instead of deleting, we could mark as read,
      // but the user wants 'clear'. Let's just delete it for now (or throw error).
      // Given simplicity, we'll allow deleting broadcast if the user is a student? No, that deletes for all.
      return res.status(403).json({ message: 'Cannot delete broadcast notifications. Please mark as read instead.' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notification removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting notification' });
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications/clear-all
// @access  Private
const clearAllNotifications = async (req, res) => {
  try {
    const role = req.user.role;
    
    if (role === 'admin') {
      await Notification.deleteMany({ role: 'admin' });
    } else if (role === 'student') {
      // Only delete their specific notifications. Broadcasts cannot be bulk deleted by students.
      await Notification.deleteMany({ role: 'student', userId: req.user._id });
    }
    
    res.json({ message: 'Notifications cleared' });
  } catch (error) {
    res.status(500).json({ message: 'Server error clearing notifications' });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
};
