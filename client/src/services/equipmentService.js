import { API_URL } from './config';

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const getAllEquipment = async (all = false) => {
    const res = await fetch(`${API_URL}/equipment?all=${all}`);
    return await res.json();
};

export const createEquipment = async (data) => {
    const res = await fetch(`${API_URL}/equipment`, {
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

export const updateEquipment = async (id, data) => {
    const res = await fetch(`${API_URL}/equipment/${id}`, {
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

export const deleteEquipment = async (id) => {
    const res = await fetch(`${API_URL}/equipment/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });
    const result = await res.json();
    return { ok: res.ok, data: result };
};
