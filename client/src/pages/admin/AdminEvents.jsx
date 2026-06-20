import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Calendar, Clock, Image as ImageIcon, X, Eye, Upload } from 'lucide-react';
import { getEvents, createEvent, updateEvent, deleteEvent, removeEnrollment } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';

const formatTime = (timeString) => {
   if (!timeString) return '';
   const [hours, minutes] = timeString.split(':');
   const hour = parseInt(hours, 10);
   const ampm = hour >= 12 ? 'PM' : 'AM';
   const formattedHour = hour % 12 || 12;
   return `${formattedHour}:${minutes} ${ampm}`;
};

const AdminEvents = () => {
    const { user } = useAuth();
    const token = localStorage.getItem('authToken');
    
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [enrollmentsModalOpen, setEnrollmentsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', image: '', date: '', time: '', location: '', maxParticipants: '' });
    const [enrollmentToRemove, setEnrollmentToRemove] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [hourOpen, setHourOpen] = useState(false);
    const [minOpen, setMinOpen] = useState(false);

    const { currentData: currentEvents, currentPage: currentEventPage, totalPages: totalEventPages, next: nextEventPage, prev: prevEventPage, itemsPerPage: itemsPerPageEvents } = usePagination(events);
    const { currentData: currentEnrollments, currentPage: currentEnrollmentPage, totalPages: totalEnrollmentPages, next: nextEnrollmentPage, prev: prevEnrollmentPage, itemsPerPage: itemsPerPageEnrollments } = usePagination(selectedEvent?.enrollments || []);

    const hoursList = Array.from({ length: 18 }).map((_, i) => {
        const hour24 = i + 5;
        const h = hour24.toString().padStart(2, '0');
        const displayH = hour24 % 12 || 12;
        const ampm = hour24 < 12 ? 'AM' : 'PM';
        return { value: h, label: `${displayH} ${ampm}` };
    });

    const minsList = ['00', '15', '30', '45'].map(m => ({ value: m, label: m }));

    const selectedHourValue = formData.time ? formData.time.split(':')[0] : '';
    const selectedMinValue = formData.time ? formData.time.split(':')[1] : '';
    const selectedHourLabel = hoursList.find(h => h.value === selectedHourValue)?.label || 'Hour';
    const selectedMinLabel = minsList.find(m => m.value === selectedMinValue)?.label || 'Min';

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const data = await getEvents();
            if (Array.isArray(data)) {
                setEvents(data);
            } else {
                setEvents([]);
            }
        } catch (error) {
            toast.error("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (event = null) => {
        if (event) {
            setSelectedEvent(event);
            setFormData({
                name: event.name,
                description: event.description,
                image: event.image || '',
                date: event.date,
                time: event.time,
                location: event.location || '',
                maxParticipants: event.maxParticipants
            });
        } else {
            setSelectedEvent(null);
            setFormData({ name: '', description: '', image: '', date: '', time: '', location: '', maxParticipants: '' });
        }
        setModalOpen(true);
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
            if (selectedEvent) {
                const res = await updateEvent(selectedEvent._id, formData, token);
                if (res.ok) {
                    toast.success("Event updated successfully");
                    setModalOpen(false);
                    fetchEvents();
                } else {
                    toast.error(res.data?.message || "Error updating event");
                }
            } else {
                const res = await createEvent(formData, token);
                if (res.ok) {
                    toast.success("Event created successfully");
                    setModalOpen(false);
                    fetchEvents();
                } else {
                    toast.error(res.data?.message || "Error creating event");
                }
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id) => {
        setEventToDelete(id);
    };

    const executeDeleteEvent = async () => {
        if (!eventToDelete) return;
        try {
            const res = await deleteEvent(eventToDelete, token);
            if (res.ok) {
                toast.success("Event deleted");
                fetchEvents();
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setEventToDelete(null);
        }
    };

    const viewEnrollments = (event) => {
        setSelectedEvent(event);
        setEnrollmentsModalOpen(true);
    };

    const handleRemoveEnrollment = (enrollmentId) => {
        setEnrollmentToRemove(enrollmentId);
    };

    const executeRemoveEnrollment = async () => {
        if (!enrollmentToRemove) return;
        try {
            const res = await removeEnrollment(selectedEvent._id, enrollmentToRemove, token);
            if (res.ok) {
                toast.success("Enrollment removed successfully");
                // Update selectedEvent state to reflect removal
                const updatedEvent = {
                    ...selectedEvent,
                    enrollments: selectedEvent.enrollments.filter(e => e._id !== enrollmentToRemove)
                };
                setSelectedEvent(updatedEvent);
                // Also update the main events array
                setEvents(events.map(ev => ev._id === updatedEvent._id ? updatedEvent : ev));
            } else {
                toast.error(res.data?.message || "Failed to remove enrollment");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setEnrollmentToRemove(null);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0F172A' }}>Manage Events</h1>
                <button 
                    onClick={() => handleOpenModal()} 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#1E40AF', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                >
                    <Plus size={18} /> Add Event
                </button>
            </div>

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>Loading events...</div>
            ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
                    <div className="overflow-x-auto">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                    <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>SL NO</th>
                                    <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>EVENT</th>
                                    <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>DATE & TIME</th>
                                    <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>ENROLLMENTS</th>
                                    <th style={{ padding: '16px', fontSize: '13px', fontWeight: '600', color: '#64748B', textAlign: 'right' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentEvents.map((event, index) => (
                                    <tr key={event._id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: '500', color: '#64748B' }}>
                                            {(currentEventPage - 1) * itemsPerPageEvents + index + 1}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#F1F5F9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {event.image ? <img src={event.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={20} color="#94A3B8" />}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '600', color: '#0F172A' }}>{event.name}</div>
                                                    <div style={{ fontSize: '13px', color: '#64748B', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.description}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '14px', marginBottom: '4px' }}>
                                                <Calendar size={14} /> {new Date(event.date).toLocaleDateString('en-GB').replace(/\//g, '-')}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B', fontSize: '13px' }}>
                                                <Clock size={14} /> {formatTime(event.time)}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: event.enrollments?.length >= event.maxParticipants ? '#EF4444' : '#10B981' }}>
                                                    <Users size={16} /> {event.enrollments?.length || 0} / {event.maxParticipants}
                                                </div>
                                                <button onClick={() => viewEnrollments(event)} style={{ background: 'none', border: '1px solid #E2E8F0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', color: '#1E40AF', fontWeight: '600' }}>View</button>
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                                <button onClick={() => handleOpenModal(event)} style={{ background: '#EFF6FF', border: 'none', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E40AF', cursor: 'pointer' }} title="Edit"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(event._id)} style={{ background: '#FEF2F2', border: 'none', width: '32px', height: '32px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {events.length === 0 && (
                                    <tr>
                                        <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>No events found. Create one to get started.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination currentPage={currentEventPage} totalPages={totalEventPages} next={nextEventPage} prev={prevEventPage} />
                </div>
            )}

            {/* CREATE / EDIT MODAL */}
            {modalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '600px', borderRadius: '12px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedEvent ? 'Edit Event' : 'Add New Event'}</h2>
                            <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>Event Name</label>
                                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>Description</label>
                                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', resize: 'vertical' }}></textarea>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>Location</label>
                                <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} type="text" placeholder="e.g. Main Arena" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>Date</label>
                                    <input required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} type="date" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>Time</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <div style={{ position: 'relative', width: '100%' }}>
                                            <div 
                                                onClick={() => setHourOpen(!hourOpen)}
                                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}
                                            >
                                                <span>{selectedHourLabel}</span>
                                                <span style={{ fontSize: '10px', color: '#64748B' }}>▼</span>
                                            </div>
                                            {hourOpen && (
                                                <>
                                                    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setHourOpen(false)} />
                                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: 'white', border: '1px solid #CBD5E1', borderRadius: '6px', maxHeight: '150px', overflowY: 'auto', zIndex: 50, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                                        {hoursList.map(opt => (
                                                            <div 
                                                                key={opt.value} 
                                                                onClick={() => { setFormData({...formData, time: `${opt.value}:${selectedMinValue || '00'}`}); setHourOpen(false); }}
                                                                style={{ padding: '8px 10px', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid #F1F5F9' }}
                                                            >
                                                                {opt.label}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <span style={{ alignSelf: 'center', fontWeight: 'bold', color: '#475569' }}>:</span>

                                        <div style={{ position: 'relative', width: '100%' }}>
                                            <div 
                                                onClick={() => setMinOpen(!minOpen)}
                                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}
                                            >
                                                <span>{selectedMinLabel}</span>
                                                <span style={{ fontSize: '10px', color: '#64748B' }}>▼</span>
                                            </div>
                                            {minOpen && (
                                                <>
                                                    <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setMinOpen(false)} />
                                                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: 'white', border: '1px solid #CBD5E1', borderRadius: '6px', maxHeight: '150px', overflowY: 'auto', zIndex: 50, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                                                        {minsList.map(opt => (
                                                            <div 
                                                                key={opt.value} 
                                                                onClick={() => { setFormData({...formData, time: `${selectedHourValue || '12'}:${opt.value}`}); setMinOpen(false); }}
                                                                style={{ padding: '8px 10px', cursor: 'pointer', fontSize: '14px', borderBottom: '1px solid #F1F5F9' }}
                                                            >
                                                                {opt.label}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#475569' }}>Max Participants</label>
                                    <input required value={formData.maxParticipants} onChange={e => setFormData({...formData, maxParticipants: e.target.value})} type="number" min="1" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1' }} />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>Event Image</label>
                                        {formData.image && (
                                            <a href={formData.image} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#1E40AF', textDecoration: 'none', fontWeight: '600' }}>
                                                <Eye size={14} /> Preview
                                            </a>
                                        )}
                                    </div>
                                    <div style={{ border: '2px dashed #CBD5E1', borderRadius: '6px', padding: '12px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                                        {uploading ? (
                                            <div style={{ fontSize: '13px', color: '#1E40AF', fontWeight: '600' }}>Uploading...</div>
                                        ) : formData.image ? (
                                            <div style={{ fontSize: '13px', color: '#10B981', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                <ImageIcon size={16} /> Image Uploaded
                                            </div>
                                        ) : (
                                            <div style={{ fontSize: '13px', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                                <Upload size={16} /> Click to upload
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '10px 16px', background: '#F1F5F9', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', color: '#475569' }}>Cancel</button>
                                <button type="submit" disabled={submitting || uploading} style={{ padding: '10px 24px', background: '#1E40AF', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: (submitting || uploading) ? 'not-allowed' : 'pointer', opacity: (submitting || uploading) ? 0.7 : 1 }}>{submitting ? 'Saving...' : 'Save Event'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* VIEW ENROLLMENTS MODAL */}
            {enrollmentsModalOpen && selectedEvent && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '700px', borderRadius: '12px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Enrollments</h2>
                                <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>{selectedEvent.name} ({selectedEvent.enrollments?.length || 0} / {selectedEvent.maxParticipants})</p>
                            </div>
                            <button onClick={() => setEnrollmentsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}><X size={24} /></button>
                        </div>
                        
                        <div className="overflow-x-auto" style={{ border: '1px solid #E2E8F0', borderRadius: '8px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                        <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>SL NO</th>
                                        <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>STUDENT</th>
                                        <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#64748B' }}>ENROLLED AT</th>
                                        <th style={{ padding: '12px 16px', fontSize: '13px', fontWeight: '600', color: '#64748B', textAlign: 'right' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentEnrollments.length > 0 ? (
                                        currentEnrollments.map((en, index) => (
                                            <tr key={en._id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                                                <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '500', color: '#64748B' }}>
                                                    {(currentEnrollmentPage - 1) * itemsPerPageEnrollments + index + 1}
                                                </td>
                                                <td style={{ padding: '12px 16px' }}>
                                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A' }}>{en.name}</div>
                                                    <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>{en.email}</div>
                                                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{en.mobile}</div>
                                                </td>
                                                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#94A3B8' }}>{new Date(en.enrolledAt).toLocaleString()}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                                                    <button onClick={() => handleRemoveEnrollment(en._id)} style={{ background: '#FEF2F2', border: 'none', padding: '6px 10px', borderRadius: '6px', color: '#EF4444', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                                        <Trash2 size={14} /> Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>No enrollments yet.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={currentEnrollmentPage} totalPages={totalEnrollmentPages} next={nextEnrollmentPage} prev={prevEnrollmentPage} />
                    </div>
                </div>
            )}

            {/* CONFIRM REMOVE MODAL */}
            {enrollmentToRemove && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '400px', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                                <Trash2 size={20} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F172A', margin: 0 }}>Remove Enrollment</h3>
                        </div>
                        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
                            Are you sure you want to remove this student from the event? This action cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => setEnrollmentToRemove(null)} 
                                style={{ padding: '10px 16px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: '#475569', flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={executeRemoveEnrollment} 
                                style={{ padding: '10px 16px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', flex: 1 }}
                            >
                                Yes, Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONFIRM DELETE EVENT MODAL */}
            {eventToDelete && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '400px', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
                                <Trash2 size={20} />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F172A', margin: 0 }}>Delete Event</h3>
                        </div>
                        <p style={{ color: '#475569', fontSize: '14px', marginBottom: '24px', lineHeight: '1.5' }}>
                            Are you sure you want to delete this event? This action cannot be undone and will remove all enrollments associated with it.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button 
                                onClick={() => setEventToDelete(null)} 
                                style={{ padding: '10px 16px', background: 'white', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', color: '#475569', flex: 1 }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={executeDeleteEvent} 
                                style={{ padding: '10px 16px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', flex: 1 }}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminEvents;
