import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Globe, ArrowRight, ShieldCheck, ChevronRight } from "lucide-react";
import { API_URL } from "../services/config";

const Contact = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });

  useEffect(() => {
    const subjectParam = searchParams.get("subject");
    const messageParam = searchParams.get("message");
    if (subjectParam || messageParam) {
      setFormData((prev) => ({
        ...prev,
        subject: subjectParam || prev.subject,
        message: messageParam || prev.message,
      }));
    }
  }, [searchParams]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    try {
      const response = await fetch(`${API_URL}/contact/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setStatus({ type: "success", message: "Your message has been sent successfully. We will contact you within 24 hours." });
        setFormData({ firstName: "", lastName: "", email: "", subject: "General Inquiry", message: "" });
      } else {
        const data = await response.json();
        setStatus({ type: "error", message: data.message || "Enrollment failed. Please try again." });
      }
    } catch (error) {
      setStatus({ type: "error", message: "Server connection failed. Please check your network." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'Outfit', sans-serif", color: '#0F172A', overflowX: 'hidden' }}>
      
      {/* ================================================================ */}
      {/* 1. CINEMATIC HERO SECTION                                      */}
      {/* ================================================================ */}
      <section style={{ 
          position: 'relative',
          minHeight: '60vh',
          backgroundColor: '#0F172A', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          textAlign: 'center', 
          color: 'white',
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(30, 64, 175, 0.5)), url('/ref-banner.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          padding: '80px 5%'
      }}>
        <div style={{ animation: 'fadeInDown 0.8s ease', position: 'relative', zIndex: 2 }}>
           <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3ABEF9', padding: '8px 24px', borderRadius: '100px', marginBottom: '30px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Globe size={14} /> <span style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '4px' }}>GLOBAL ENQUIRY</span>
           </div>
           <h1 style={{ fontSize: 'clamp(36px, 8vw, 72px)', fontWeight: '900', margin: '20px 0', letterSpacing: '-3px', lineHeight: '1.1' }}>CONNECT WITH OUR ACADEMY</h1>
           <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', color: 'rgba(255,255,255,0.7)', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>Whether you're looking for elite training or general information, our team is ready to assist you.</p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 2. CONTACT HUB (FORM & INFO)                                  */}
      {/* ================================================================ */}
      <section className="section-wrapper" style={{ marginTop: '-80px', position: 'relative', zIndex: 10 }}>
         <div className="site-container" style={{ 
             display: 'grid', 
             gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
             gap: '40px'
         }}>
            
            {/* LEFT: INFORMATION CARDS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
               <div style={{ backgroundColor: '#1E40AF', padding: '50px', borderRadius: '24px', color: 'white', boxShadow: '0 30px 60px rgba(30, 64, 175, 0.2)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }}><ShieldCheck size={200} /></div>
                  <h3 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '40px' }}>OFFICE HQ</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '35px' }}>
                     <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px' }}><MapPin size={24} /></div>
                        <div><p style={{ fontWeight: '800', margin: 0, fontSize: '14px' }}>ADDRESS</p><p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginTop: '5px', lineHeight: '1.6' }}>No. 123/7, BM Kawal, Agara Cross, Bengaluru-82</p></div>
                     </div>
                     <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px' }}><Phone size={24} /></div>
                        <div><p style={{ fontWeight: '800', margin: 0, fontSize: '14px' }}>PHONE</p><p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginTop: '5px' }}>+91 9353897319</p></div>
                     </div>
                     <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '12px' }}><Clock size={24} /></div>
                        <div><p style={{ fontWeight: '800', margin: 0, fontSize: '14px' }}>HOURS</p><p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginTop: '5px' }}>MON - SAT (09:00 - 18:00)</p><p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>SUN (CLOSED)</p></div>
                     </div>
                  </div>
               </div>

               <div style={{ height: '350px', borderRadius: '24px', overflow: 'hidden', border: '1px solid #f1f5f9', boxShadow: '0 20px 40px rgba(0,0,0,0.02)' }}>
                  <iframe width="100%" height="100%" frameBorder="0" style={{ filter: 'grayscale(1) contrast(1.2) opacity(0.8)' }} src="https://maps.google.com/maps?q=Sri+International+Public+School+No+123%2F7+BM+Kawal+Agara+Cross+Bangalore&t=&z=15&ie=UTF8&output=embed"></iframe>
               </div>
            </div>

            {/* RIGHT: CONTACT FORM */}
            <div style={{ backgroundColor: 'white', padding: 'clamp(30px, 5vw, 60px)', borderRadius: '24px', boxShadow: '0 40px 100px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
               <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '900', color: '#0F172A', marginBottom: '15px' }}>SEND A MESSAGE</h3>
                  <p style={{ color: '#64748B', fontWeight: '600', fontSize: '14px' }}>Responses are typically delivered within one business day.</p>
               </div>

               {status && (
                  <div style={{ padding: '20px 30px', borderRadius: '8px', marginBottom: '40px', backgroundColor: status.type === 'success' ? '#def7ec' : '#fde8e8', color: status.type === 'success' ? '#03543f' : '#9b1c1c', border: '1px solid currentColor', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '15px' }}>
                     {status.type === 'success' ? <ShieldCheck size={20} /> : <ArrowRight size={20} />} {status.message}
                  </div>
               )}

               <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '25px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>FIRST NAME</label>
                     <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required style={{ padding: '15px 20px', borderRadius: '8px', border: '1px solid #f1f5f9', outline: 'none', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: '700' }} placeholder="John" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>LAST NAME</label>
                     <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required style={{ padding: '15px 20px', borderRadius: '8px', border: '1px solid #f1f5f9', outline: 'none', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: '700' }} placeholder="Doe" />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>EMAIL ADDRESS</label>
                     <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ padding: '15px 20px', borderRadius: '8px', border: '1px solid #f1f5f9', outline: 'none', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: '700' }} placeholder="john@example.com" />
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>SUBJECT</label>
                     <select name="subject" value={formData.subject} onChange={handleChange} style={{ padding: '15px 20px', borderRadius: '8px', border: '1px solid #f1f5f9', outline: 'none', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: '700' }}>
                        <option>General Inquiry</option>
                        <option>Elite Performance Enrollment</option>
                        <option>Private Coaching Consultation</option>
                        <option>Corporate Team Building</option>
                        {!["General Inquiry", "Elite Performance Enrollment", "Private Coaching Consultation", "Corporate Team Building"].includes(formData.subject) && (
                            <option value={formData.subject}>{formData.subject}</option>
                         )}
                     </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                     <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>MESSAGE</label>
                     <textarea name="message" value={formData.message} onChange={handleChange} rows="5" required style={{ padding: '15px 20px', borderRadius: '8px', border: '1px solid #f1f5f9', outline: 'none', backgroundColor: '#f8fafc', fontSize: '15px', fontWeight: '700', resize: 'none' }} placeholder="Detail your specific requirements..."></textarea>
                  </div>
                  <button type="submit" disabled={isSubmitting} style={{ gridColumn: '1 / -1', backgroundColor: '#1E40AF', color: 'white', padding: '18px', borderRadius: '100px', border: 'none', fontWeight: '900', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', transition: 'all 0.3s ease' }}>
                     {isSubmitting ? "SENDING..." : <><Send size={18} /> TRANSMIT MESSAGE</>}
                  </button>
               </form>
            </div>

         </div>
      </section>

      {/* ================================================================ */}
      {/* 3. QUICK ASSISTANCE HELP SECTION (RESPONSIVE)                  */}
      {/* ================================================================ */}
      <section className="section-wrapper" style={{ backgroundColor: '#f8fafc', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
         <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: '900', color: '#0F172A', marginBottom: '20px' }}>URGENT ASSISTANCE?</h2>
         <p style={{ color: '#64748B', maxWidth: '600px', margin: '0 auto 60px', fontSize: '18px' }}>For immediate training slot availability or emergency scheduling, please contact us via direct telephone.</p>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
               <div style={{ backgroundColor: '#eff6ff', color: '#1E40AF', padding: '15px', borderRadius: '12px' }}><MessageSquare size={24} /></div>
               <h4 style={{ fontWeight: '900', margin: 0 }}>LIVE CHAT</h4>
               <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>Available 10AM - 4PM IST</p>
               <span style={{ color: '#1E40AF', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>START CHAT <ChevronRight size={16} /></span>
            </div>
            <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
               <div style={{ backgroundColor: '#eff6ff', color: '#1E40AF', padding: '15px', borderRadius: '12px' }}><Phone size={24} /></div>
               <h4 style={{ fontWeight: '900', margin: 0 }}>HOTLINE</h4>
               <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>Direct Access for Members</p>
               <span style={{ color: '#1E40AF', fontWeight: '800', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>+91 93538 97319 <ChevronRight size={16} /></span>
            </div>
         </div>
      </section>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Contact;
