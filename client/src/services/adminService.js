import { API_URL } from './config';

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const getDashboardStats = async () => {
    try {
        const res = await fetch(`${API_URL}/admin/stats`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch stats');
        return await res.json();
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return null;
    }
};

export const getTransactions = async () => {
    try {
        const res = await fetch(`${API_URL}/admin/transactions`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch transactions');
        return await res.json();
    } catch (error) {
        console.error("Fetch transactions error:", error);
        return [];
    }
};

export const getAttendance = async (date, all) => {
    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_URL}/admin/attendance?date=${date || ''}&all=${all ? 'true' : 'false'}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error('Failed to fetch attendance');
        return await res.json();
    } catch (error) {
        console.error("Fetch attendance error:", error);
        return [];
    }
};

export const updateAttendance = async (studentId, date, status, photo) => {
    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_URL}/admin/attendance`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ studentId, date, status, photo })
        });
        const data = await res.json();
        return { ok: res.ok, data };
    } catch (error) {
        console.error("Update attendance error:", error);
        return { ok: false, data: { message: error.message } };
    }
};

export const updateOrderFulfillment = async (orderId, fulfillmentStatus) => {
    try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_URL}/admin/orders/fulfillment`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ orderId, fulfillmentStatus })
        });
        const data = await res.json();
        return { ok: res.ok, data };
    } catch (error) {
        console.error("Update order fulfillment error:", error);
        return { ok: false, data: { message: error.message } };
    }
};

