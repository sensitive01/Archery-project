import { API_URL } from './config';

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const getStudents = async () => {
    const res = await fetch(`${API_URL}/users/students`, {
        headers: getAuthHeaders()
    });
    return await res.json();
};

export const getStudent = async (id) => {
    const res = await fetch(`${API_URL}/users/${id}`, { 
        headers: getAuthHeaders() 
    });
    return await res.json();
};

export const updateStudent = async (id, data) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    return { ok: res.ok, data: result };
};

export const toggleBlockUser = async (id) => {
    const res = await fetch(`${API_URL}/users/${id}/toggle-block`, {
        method: "PATCH",
        headers: getAuthHeaders(),
    });
    return { ok: res.ok };
};
// ... (previous code)

export const getCoaches = async () => {
    const res = await fetch(`${API_URL}/users/coaches`, {
        headers: getAuthHeaders()
    });
    return await res.json();
};

export const createCoach = async (data) => {
    const res = await fetch(`${API_URL}/users/coaches`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    return { ok: res.ok, data: result };
};

export const updateCoach = async (id, data) => {
    const res = await fetch(`${API_URL}/users/coaches/${id}`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify(data),
    });
    const result = await res.json();
    return { ok: res.ok, data: result };
};

export const deleteCoach = async (id) => {
    const res = await fetch(`${API_URL}/users/coaches/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    const result = await res.json();
    return { ok: res.ok, data: result };
};

export const deleteStudent = async (id) => {
    const res = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    const result = await res.json();
    return { ok: res.ok, data: result };
};
