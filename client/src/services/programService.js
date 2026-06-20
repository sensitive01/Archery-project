import { API_URL } from './config';

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const getAllPrograms = async (all = false) => {
    const res = await fetch(`${API_URL}/programs${all ? '?all=true' : ''}`);
    return await res.json();
};

export const createProgram = async (programData) => {
    const res = await fetch(`${API_URL}/programs`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify(programData),
    });
    const data = await res.json();
    return { ok: res.ok, data };
};

export const updateProgram = async (id, programData) => {
    const res = await fetch(`${API_URL}/programs/${id}`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify(programData),
    });
    const data = await res.json();
    return { ok: res.ok, data };
};

export const deleteProgram = async (id) => {
    const res = await fetch(`${API_URL}/programs/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
    });
    const data = await res.json();
    return { ok: res.ok, data };
};
