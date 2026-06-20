import React, { useState, useEffect } from "react";
import { Target, Calendar, MapPin, Users, CheckCircle, Clock } from "lucide-react";
import { getEvents, enrollInEvent } from "../services/eventService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const formatTime = (timeString) => {
   if (!timeString) return '';
   const [hours, minutes] = timeString.split(':');
   const hour = parseInt(hours, 10);
   const ampm = hour >= 12 ? 'PM' : 'AM';
   const formattedHour = hour % 12 || 12;
   return `${formattedHour}:${minutes} ${ampm}`;
};

const Events = () => {
   const { user } = useAuth();
   const [events, setEvents] = useState([]);
   const [loading, setLoading] = useState(true);
   const [enrollModal, setEnrollModal] = useState({ open: false, event: null });
   const [formData, setFormData] = useState({ name: "", email: "", mobile: "" });
   const [enrolling, setEnrolling] = useState(false);

   useEffect(() => {
      fetchEvents();
   }, []);

   useEffect(() => {
      if (user) {
         setFormData({
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || "",
            email: user.email || "",
            mobile: user.mobileNumber || user.mobile || ""
         });
      }
   }, [user]);

   const fetchEvents = async () => {
      try {
         const data = await getEvents();
         setEvents(data);
      } catch (error) {
         console.error("Failed to fetch events", error);
         toast.error("Failed to load events");
      } finally {
         setLoading(false);
      }
   };

   const handleEnrollSubmit = async (e) => {
      e.preventDefault();
      if (!formData.name || !formData.email || !formData.mobile) {
         toast.error("Please fill all fields");
         return;
      }
      if (formData.mobile.length !== 10) {
         toast.error("Mobile number must be exactly 10 digits");
         return;
      }
      setEnrolling(true);
      try {
         const res = await enrollInEvent(enrollModal.event._id, formData);
         if (res.ok) {
            toast.success(res.data.message || "Successfully enrolled!");
            setEnrollModal({ open: false, event: null });
            setFormData({ name: "", email: "", mobile: "" });
            fetchEvents(); // Refresh data to update counts
         } else {
            toast.error(res.data.message || "Failed to enroll");
         }
      } catch (error) {
         toast.error("An error occurred during enrollment");
      } finally {
         setEnrolling(false);
      }
   };

   return (
      <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingBottom: "60px", fontFamily: "'Outfit', sans-serif" }}>
         {/* Hero Section */}
         <section style={{ 
             position: 'relative', 
             minHeight: '50vh', 
             backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(30, 64, 175, 0.4)), url('/ref-banner.png')`, 
             backgroundSize: 'cover', 
             backgroundPosition: 'center', 
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center', 
             textAlign: 'center',
             color: 'white',
             padding: '120px 5% 60px'
         }}>
           <div style={{ animation: 'fadeInDown 0.8s ease' }}>
              <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '4px', textTransform: 'uppercase', color: '#3B82F6' }}>DISCOVER & COMPETE</span>
              <h1 style={{ fontSize: 'clamp(32px, 8vw, 72px)', fontWeight: '900', margin: '15px 0', letterSpacing: '-0.02em' }}>UPCOMING EVENTS</h1>
              <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', maxWidth: '600px', margin: '0 auto', opacity: 0.9 }}>Join our tournaments, workshops, and community gatherings. Experience our 10-year legacy.</p>
           </div>
         </section>

         <div className="site-container" style={{ marginTop: "60px" }}>

            {loading ? (
               <div style={{ textAlign: "center", padding: "40px" }}>Loading events...</div>
            ) : events.length === 0 ? (
               <div style={{ textAlign: "center", padding: "40px", color: "#64748B", backgroundColor: "white", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                  <Calendar size={48} color="#94A3B8" style={{ margin: "0 auto 15px" }} />
                  <p>No upcoming events currently scheduled. Please check back later.</p>
               </div>
            ) : (
               <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))", gap: "30px" }}>
                  {events.map((event) => {
                     const isFull = event.enrollments?.length >= event.maxParticipants;
                     return (
                        <div key={event._id} style={{ backgroundColor: "white", borderRadius: "16px", overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid rgba(15, 23, 42, 0.05)", display: "flex", flexDirection: "column" }}>
                           {event.image ? (
                              <img src={event.image} alt={event.name} style={{ width: "100%", height: "auto", maxHeight: "300px", objectFit: "contain", backgroundColor: "#f8fafc", borderBottom: "1px solid #f1f5f9" }} />
                           ) : (
                              <div style={{ height: "200px", backgroundColor: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                 <Target size={48} color="#94A3B8" />
                              </div>
                           )}
                           <div style={{ padding: "25px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#1E40AF", fontSize: "14px", fontWeight: "700", marginBottom: "10px" }}>
                                 <Calendar size={16} />
                                 <span>{new Date(event.date).toLocaleDateString()}</span>
                                 <span style={{ color: "#cbd5e1" }}>|</span>
                                 <Clock size={16} />
                                 <span>{formatTime(event.time)}</span>
                              </div>
                              <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#0F172A", marginBottom: "10px" }}>{event.name}</h3>
                              <p style={{ color: "#64748B", fontSize: "15px", lineHeight: "1.6", marginBottom: "20px", flexGrow: 1 }}>
                                 {event.description}
                              </p>
                              
                              <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "15px", marginBottom: "20px" }}>
                                 <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", color: "#64748B", fontSize: "13px", flex: 1, minWidth: 0 }}>
                                    <MapPin size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
                                    <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{event.location || 'Main Arena'}</span>
                                 </div>
                                 <div style={{ display: "flex", alignItems: "center", gap: "6px", color: isFull ? "#ef4444" : "#10b981", fontSize: "13px", fontWeight: "600", flexShrink: 0, whiteSpace: "nowrap" }}>
                                    <Users size={14} />
                                    <span>{event.enrollments?.length || 0} / {event.maxParticipants} Full</span>
                                 </div>
                              </div>

                              <button 
                                 onClick={() => setEnrollModal({ open: true, event })}
                                 disabled={isFull}
                                 style={{ 
                                    width: "100%", 
                                    padding: "12px", 
                                    backgroundColor: isFull ? "#f1f5f9" : "#1E40AF", 
                                    color: isFull ? "#94a3b8" : "white", 
                                    border: "none", 
                                    borderRadius: "8px", 
                                    fontWeight: "700", 
                                    cursor: isFull ? "not-allowed" : "pointer",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: "8px"
                                 }}
                              >
                                 {isFull ? "EVENT FULL" : "ENROLL NOW"}
                              </button>
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}
         </div>

         {/* ENROLLMENT MODAL */}
         {enrollModal.open && enrollModal.event && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.7)", zIndex: 5000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
               <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "clamp(20px, 5vw, 30px)", width: "100%", maxWidth: "450px", position: "relative" }}>
                  <button 
                     onClick={() => setEnrollModal({ open: false, event: null })}
                     style={{ position: "absolute", top: "20px", right: "20px", background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#94a3b8" }}
                  >&times;</button>
                  
                  <h3 style={{ fontSize: "24px", fontWeight: "800", color: "#0F172A", marginBottom: "5px" }}>Enroll for Event</h3>
                  <p style={{ color: "#1E40AF", fontWeight: "600", marginBottom: "25px" }}>{enrollModal.event.name}</p>

                  <form onSubmit={handleEnrollSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                     {user ? (
                        <div style={{ backgroundColor: "#f1f5f9", padding: "15px", borderRadius: "8px", color: "#475569", fontSize: "14px" }}>
                           <p style={{ margin: "0 0 5px 0" }}><strong>Name:</strong> {formData.name}</p>
                           <p style={{ margin: "0 0 5px 0" }}><strong>Email:</strong> {formData.email}</p>
                           <p style={{ margin: "0 0 0 0" }}><strong>Mobile:</strong> {formData.mobile}</p>
                           <p style={{ marginTop: "15px", fontSize: "13px", color: "#1E40AF", fontWeight: "600" }}>Please confirm your enrollment.</p>
                        </div>
                     ) : (
                        <>
                           <div>
                              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "5px" }}>Full Name</label>
                              <input 
                                 type="text" 
                                 required 
                                 value={formData.name}
                                 onChange={(e) => setFormData({...formData, name: e.target.value})}
                                 style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontFamily: "inherit" }}
                              />
                           </div>
                           <div>
                              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "5px" }}>Email Address</label>
                              <input 
                                 type="email" 
                                 required 
                                 value={formData.email}
                                 onChange={(e) => setFormData({...formData, email: e.target.value})}
                                 style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontFamily: "inherit" }}
                              />
                           </div>
                           <div>
                              <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "5px" }}>Mobile Number</label>
                              <input 
                                 type="tel" 
                                 required 
                                 value={formData.mobile}
                                 onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setFormData({...formData, mobile: val});
                                 }}
                                 style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontFamily: "inherit" }}
                              />
                           </div>
                        </>
                     )}
                     <button 
                        type="submit" 
                        disabled={enrolling}
                        style={{ marginTop: "10px", width: "100%", padding: "14px", backgroundColor: "#1E40AF", color: "white", border: "none", borderRadius: "8px", fontWeight: "800", cursor: enrolling ? "not-allowed" : "pointer", opacity: enrolling ? 0.7 : 1 }}
                     >
                        {enrolling ? "ENROLLING..." : "CONFIRM ENROLLMENT"}
                     </button>
                  </form>
               </div>
            </div>
         )}

         <style>{`
            @keyframes fadeInDown {
               from { opacity: 0; transform: translateY(-30px); }
               to { opacity: 1; transform: translateY(0); }
            }
         `}</style>
      </div>
   );
};

export default Events;
