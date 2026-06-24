import { API_URL } from "./config";

export const getPayAndPlayBookings = async () => {
  const token = localStorage.getItem('authToken');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await fetch(`${API_URL}/payandplay`, { headers });
  if (!response.ok) {
    throw new Error("Failed to fetch Pay and Play bookings");
  }
  return response.json();
};

export const getPayAndPlaySettings = async () => {
  const response = await fetch(`${API_URL}/payandplay/settings`);
  if (!response.ok) {
    throw new Error("Failed to fetch Pay and Play settings");
  }
  return response.json();
};

export const updatePayAndPlaySettings = async (settingsData) => {
  const token = localStorage.getItem('authToken');
  const headers = { 
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  const response = await fetch(`${API_URL}/payandplay/settings`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(settingsData)
  });
  if (!response.ok) {
    throw new Error("Failed to update Pay and Play settings");
  }
  return response.json();
};
