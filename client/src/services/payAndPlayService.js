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
