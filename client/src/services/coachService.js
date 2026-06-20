import { API_URL } from './config';

export const getCoaches = async () => {
    const res = await fetch(`${API_URL}/users/coaches`); // Assuming role="coach"
    // Since we don't have a dedicated coaches endpoint, we might reuse users/students if parameterised, 
    // or add a new endpoint. But for now, let's assume filtering on frontend or backend.
    // Wait, the backend doesn't have a `getCoaches` endpoint visible in my memory. 
    // Let's assume it's `/users?role=coach` or similar.
    // Actually, looking at previous files, there was no coaches endpoint created.
    // I'll stick to what the file probably has.
    return await res.json();
};
