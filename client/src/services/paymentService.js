import { API_URL } from './config';

export const createOrder = async (amount) => {
    const res = await fetch(`${API_URL}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
    });
    if (!res.ok) throw new Error("Failed to initiate payment");
    return await res.json();
};

export const purchaseProduct = async (payload) => {
    const res = await fetch(`${API_URL}/payments/purchase-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to complete product purchase");
    }
    return await res.json();
};

export const getMyPurchases = async () => {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${API_URL}/payments/my-purchases`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch purchases");
    return await res.json();
};
