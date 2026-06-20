import { API_URL } from './config';

export const getNotifications = async (token) => {
    const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
};

export const markAsRead = async (id, token) => {
    const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
};

export const markAllAsRead = async (token) => {
    const res = await fetch(`${API_URL}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
};

export const deleteNotification = async (id, token) => {
    const res = await fetch(`${API_URL}/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if(!res.ok) {
        const error = new Error("Failed");
        error.response = { status: res.status };
        throw error;
    }
    return data;
};

export const clearAllNotifications = async (token) => {
    const res = await fetch(`${API_URL}/notifications/clear-all`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
};
