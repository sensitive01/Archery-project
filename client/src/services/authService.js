import { API_URL } from './config';

export const loginUser = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
        const error = new Error(data.message || "Login failed");
        error.errorType = data.errorType;
        throw error;
    }
    return data;
};

export const sendOtp = async (email) => {
    const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return { ok: res.ok, data };
};

export const verifyOtp = async (email, otp) => {
    const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    return { ok: res.ok, data };
};

export const registerUser = async (payload) => {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { ok: res.ok, data };
};
