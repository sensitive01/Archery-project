import { API_URL } from './config';

export const getEvents = async () => {
    const res = await fetch(`${API_URL}/events`);
    if (!res.ok) throw new Error('Failed to fetch events');
    return await res.json();
};

export const createEvent = async (eventData, token) => {
    const res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(eventData),
    });
    const data = await res.json();
    return { ok: res.ok, data };
};

export const updateEvent = async (id, eventData, token) => {
    const res = await fetch(`${API_URL}/events/${id}`, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(eventData),
    });
    const data = await res.json();
    return { ok: res.ok, data };
};

export const deleteEvent = async (id, token) => {
    const res = await fetch(`${API_URL}/events/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const data = await res.json();
    return { ok: res.ok, data };
};

export const enrollInEvent = async (id, enrollmentData) => {
    const res = await fetch(`${API_URL}/events/${id}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(enrollmentData),
    });
    const data = await res.json();
    return { ok: res.ok, data };
};

export const removeEnrollment = async (eventId, enrollmentId, token) => {
    const res = await fetch(`${API_URL}/events/${eventId}/enroll/${enrollmentId}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const data = await res.json();
    return { ok: res.ok, data };
};
