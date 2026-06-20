import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications } from '../services/notificationService';

const NotificationBell = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, onConfirm: null, message: '' });
    const [alertDialog, setAlertDialog] = useState({ isOpen: false, message: '' });

    const fetchNotifications = async () => {
        try {
            if (token) {
                const data = await getNotifications(token);
                setNotifications(data);
            }
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Polling every 1 minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [token]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = async (id, e) => {
        e.stopPropagation();
        try {
            await markAsRead(id, token);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error("Failed to mark as read");
        }
    };

    const handleMarkAllAsRead = async (e) => {
        e.stopPropagation();
        try {
            await markAllAsRead(token);
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error("Failed to mark all as read");
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        try {
            await deleteNotification(id, token);
            setNotifications(notifications.filter(n => n._id !== id));
        } catch (error) {
            console.error("Failed to delete notification");
            if(error.response && error.response.status === 403) {
                setIsOpen(false); // Close dropdown to show alert clearly
                setAlertDialog({ isOpen: true, message: "You cannot delete global broadcast notifications. Please mark them as read instead." });
            }
        }
    };

    const handleClearAll = async (e) => {
        e.stopPropagation();
        setIsOpen(false); // Close dropdown to show modal clearly
        setConfirmDialog({
            isOpen: true,
            message: "Are you sure you want to clear all your notifications?",
            onConfirm: async () => {
                setConfirmDialog({ isOpen: false, onConfirm: null, message: '' });
                try {
                    await clearAllNotifications(token);
                    fetchNotifications();
                } catch (error) {
                    console.error("Failed to clear all notifications");
                }
            }
        });
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(notification._id, { stopPropagation: () => {} });
        }
        setIsOpen(false);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-white transition-colors duration-200 focus:outline-none"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all duration-200">
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                        <h3 className="text-lg font-semibold text-white">Notifications</h3>
                        <div className="flex gap-3">
                            {unreadCount > 0 && (
                                <button 
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Mark all read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button 
                                    onClick={handleClearAll}
                                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-6 text-center text-gray-400">
                                <Bell className="mx-auto h-8 w-8 mb-2 opacity-50" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div 
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors duration-200 flex gap-3 group ${!notification.isRead ? 'bg-blue-900/10' : ''}`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className={`text-sm font-medium truncate pr-2 ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                                                {notification.title}
                                            </h4>
                                            <span className="text-xs text-gray-500 whitespace-nowrap shrink-0">
                                                {formatTime(notification.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 line-clamp-2">
                                            {notification.message}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 justify-center items-end ml-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                        {!notification.isRead && (
                                            <button 
                                                onClick={(e) => handleMarkAsRead(notification._id, e)}
                                                className="text-gray-400 hover:text-blue-400 p-1"
                                                title="Mark as read"
                                            >
                                                <Check size={16} />
                                            </button>
                                        )}
                                        <button 
                                            onClick={(e) => handleDelete(notification._id, e)}
                                            className="text-gray-400 hover:text-red-400 p-1"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Confirm Modal */}
            {confirmDialog.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 transform transition-all">
                        <h3 className="text-lg font-semibold text-white mb-2">Confirm Action</h3>
                        <p className="text-gray-300 text-sm mb-6">{confirmDialog.message}</p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setConfirmDialog({ isOpen: false, onConfirm: null, message: '' }); }}
                                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); confirmDialog.onConfirm(); }}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-lg shadow-red-500/20"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Alert Modal */}
            {alertDialog.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 transform transition-all">
                        <h3 className="text-lg font-semibold text-red-500 mb-2 flex items-center gap-2">
                            <Bell size={20} /> Notice
                        </h3>
                        <p className="text-gray-300 text-sm mb-6">{alertDialog.message}</p>
                        <div className="flex justify-end">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setAlertDialog({ isOpen: false, message: '' }); }}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
