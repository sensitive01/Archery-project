import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Upload, X, Camera, ToggleLeft, ToggleRight } from 'lucide-react';
import { getAllGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem } from '../../services/galleryService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';

const AdminGallery = () => {
    const { user } = useAuth();
    const token = localStorage.getItem('authToken');
    
    const [galleryItems, setGalleryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', image: '', active: true });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewItem, setPreviewItem] = useState(null);

    const { currentData, currentPage, totalPages, next, prev, itemsPerPage } = usePagination(galleryItems);

    useEffect(() => {
        fetchGallery();
    }, []);

    const fetchGallery = async () => {
        try {
            const data = await getAllGallery(token);
            if (Array.isArray(data)) {
                setGalleryItems(data);
            } else {
                setGalleryItems([]);
            }
        } catch (error) {
            console.error("Failed to load gallery items", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        if (item) {
            setSelectedItem(item);
            setFormData({
                title: item.title,
                description: item.description,
                image: item.image,
                active: item.active
            });
        } else {
            setSelectedItem(null);
            setFormData({ title: '', description: '', image: '', active: true });
        }
        setModalOpen(true);
    };

    const handlePreview = (item) => {
        setPreviewItem(item);
        setPreviewOpen(true);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = "archery-images";

        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", uploadPreset);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: "POST",
                body: data,
            });
            const fileData = await res.json();

            if (fileData.secure_url) {
                setFormData((prev) => ({ ...prev, image: fileData.secure_url }));
            } else {
                toast.error("Upload failed.");
            }
        } catch (err) {
            toast.error("Error uploading image");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (selectedItem) {
                const res = await updateGalleryItem(selectedItem._id, formData, token);
                if (res.ok) {
                    toast.success("Gallery item updated");
                    setModalOpen(false);
                    fetchGallery();
                } else {
                    toast.error(res.data?.message || "Error updating item");
                }
            } else {
                const res = await createGalleryItem(formData, token);
                if (res.ok) {
                    toast.success("Gallery item created");
                    setModalOpen(false);
                    fetchGallery();
                } else {
                    toast.error(res.data?.message || "Error creating item");
                }
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this gallery item?")) return;
        try {
            const res = await deleteGalleryItem(id, token);
            if (res.ok) {
                toast.success("Gallery item deleted");
                fetchGallery();
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            toast.error("Network error");
        }
    };

    const toggleActiveStatus = async (item) => {
        try {
            const updatedData = { ...item, active: !item.active };
            const res = await updateGalleryItem(item._id, updatedData, token);
            if (res.ok) {
                toast.success(`Item ${updatedData.active ? 'enabled' : 'disabled'}`);
                fetchGallery();
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("Network error");
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0F172A' }}>Gallery Management</h1>
                <button 
                    onClick={() => handleOpenModal()} 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#1E40AF', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                    <Plus size={18} /> Add Image
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>Loading gallery...</div>
            ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                    <div className="overflow-x-auto">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                    <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>SL NO</th>
                                    <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>IMAGE & DETAILS</th>
                                    <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>STATUS</th>
                                    <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#64748B', textAlign: 'right' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentData.map((item, index) => (
                                    <tr key={item._id} style={{ borderBottom: '1px solid #E2E8F0', opacity: item.active ? 1 : 0.6 }}>
                                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: '500', color: '#64748B' }}>
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '60px', height: '40px', borderRadius: '6px', backgroundColor: '#F1F5F9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {item.image ? <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera size={20} color="#94A3B8" />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: '#0F172A' }}>{item.title}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <button onClick={() => toggleActiveStatus(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: item.active ? '#10B981' : '#64748B' }}>
                                                {item.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                                <span style={{ fontSize: '13px', fontWeight: '600' }}>{item.active ? 'Enabled' : 'Disabled'}</span>
                                            </button>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handlePreview(item)} style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', cursor: 'pointer' }} title="Preview"><Eye size={16} /></button>
                                                <button onClick={() => handleOpenModal(item)} style={{ background: '#EFF6FF', border: 'none', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E40AF', cursor: 'pointer' }} title="Edit"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(item._id)} style={{ background: '#FEF2F2', border: 'none', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {galleryItems.length === 0 && (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>No gallery items found. Create one to get started.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} next={next} prev={prev} />
                </div>
            )}

            {/* CREATE / EDIT MODAL */}
            {modalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '500px', borderRadius: '12px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedItem ? 'Edit Gallery Item' : 'Add New Image'}</h2>
                            <button type="button" onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>Title (Main text on hover)</label>
                                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} type="text" placeholder="e.g. Outdoor Championship" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>Description / Category (Small tag)</label>
                                <input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} type="text" placeholder="e.g. COMPETITION" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                            </div>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Gallery Image</label>
                                </div>
                                <div style={{ border: '2px dashed #CBD5E1', borderRadius: '6px', padding: '16px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                                    <input type={formData.image ? "hidden" : "file"} accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10 }} />
                                    {uploading ? (
                                        <div style={{ fontSize: '13px', color: '#1E40AF', fontWeight: '600' }}>Uploading...</div>
                                    ) : formData.image ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <img src={formData.image} alt="Preview" style={{ height: '100px', borderRadius: '4px', objectFit: 'cover' }} />
                                            <div style={{ position: 'relative' }}>
                                                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                                                <span style={{ fontSize: '12px', color: '#10B981', fontWeight: '600', textDecoration: 'underline' }}>Change Image</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '13px', color: '#64748B', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                            <Upload size={24} /> 
                                            <span>Click to upload image</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                                <input type="checkbox" id="activeToggle" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} style={{ width: '16px', height: '16px' }} />
                                <label htmlFor="activeToggle" style={{ fontSize: '14px', fontWeight: '600', color: '#475569', cursor: 'pointer' }}>Publish to Website Immediately</label>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '10px 16px', background: '#F1F5F9', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', color: '#475569' }}>Cancel</button>
                                <button type="submit" disabled={submitting || uploading || !formData.image} style={{ padding: '10px 24px', background: '#1E40AF', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: (submitting || uploading || !formData.image) ? 'not-allowed' : 'pointer', opacity: (submitting || uploading || !formData.image) ? 0.7 : 1 }}>{submitting ? 'Saving...' : 'Save Image'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PREVIEW MODAL */}
            {previewOpen && previewItem && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.9)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                        <button type="button" onClick={() => setPreviewOpen(false)} style={{ background: 'white', border: 'none', cursor: 'pointer', color: '#0F172A', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
                    </div>
                    <div style={{ maxWidth: '800px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <img src={previewItem.image} alt={previewItem.title} style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }} />
                        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '100%', textAlign: 'center' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0F172A', marginBottom: '8px' }}>{previewItem.title}</h2>
                            <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6' }}>{previewItem.description}</p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AdminGallery;
