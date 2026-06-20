const API_URL = import.meta.env.VITE_API_URL + "/gallery";

export const getActiveGallery = async () => {
    const response = await fetch(`${API_URL}`);
    const data = await response.json();
    return data;
};

export const getAllGallery = async (token) => {
    const response = await fetch(`${API_URL}/all`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    return data;
};

export const createGalleryItem = async (galleryData, token) => {
    const response = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(galleryData)
    });
    const data = await response.json();
    return { ok: response.ok, data };
};

export const updateGalleryItem = async (id, galleryData, token) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(galleryData)
    });
    const data = await response.json();
    return { ok: response.ok, data };
};

export const deleteGalleryItem = async (id, token) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    return { ok: response.ok, data };
};
