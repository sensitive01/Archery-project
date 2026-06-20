import { API_URL } from './config';

const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const getBatches = async (all = false) => {
    const res = await fetch(`${API_URL}/batches${all ? '?all=true' : ''}`);
    return await res.json();
};

export const createBatch = async (batchData) => {
    const res = await fetch(`${API_URL}/batches`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify(batchData),
    });
    const data = await res.json();
    return { ok: res.ok, data };
};

export const updateBatch = async (id, batchData) => {
    const res = await fetch(`${API_URL}/batches/${id}`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify(batchData),
    });
    const data = await res.json();
    return { ok: res.ok, data };
};

export const deleteBatch = async (id) => {
    const res = await fetch(`${API_URL}/batches/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders()
    });
    const data = await res.json();
    return { ok: res.ok, data };
};

export const assignStudentToBatch = async (batchId, studentId, details = {}) => {
    const res = await fetch(`${API_URL}/batches/${batchId}/assign`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify({ studentId, ...details }),
    });
    const data = await res.json();
    return { ok: res.ok, data };
};

export const removeStudentFromBatch = async (batchId, studentId) => {
    const res = await fetch(`${API_URL}/batches/${batchId}/remove`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        body: JSON.stringify({ studentId }),
    });
    const data = await res.json();
    return { ok: res.ok, data };
};

export const getStudentBatches = async (studentId) => {
    const res = await fetch(`${API_URL}/batches/student/${studentId}`, {
        headers: getAuthHeaders()
    });
    return await res.json();
};
