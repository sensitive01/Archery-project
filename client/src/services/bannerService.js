import { API_URL } from './config';

export const getBanners = async () => {
    const res = await fetch(`${API_URL}/banners`);
    return res.json();
};

export const getActiveBanners = async () => {
    const res = await fetch(`${API_URL}/banners/active`);
    return res.json();
};

export const createBanner = async (bannerData) => {
    const res = await fetch(`${API_URL}/banners`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerData),
    });
    return res.json();
};

export const deleteBanner = async (id) => {
    const res = await fetch(`${API_URL}/banners/${id}`, {
        method: 'DELETE',
    });
    return res.json();
};

export const updateBanner = async (id, bannerData) => {
    const res = await fetch(`${API_URL}/banners/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerData),
    });
    return res.json();
};
