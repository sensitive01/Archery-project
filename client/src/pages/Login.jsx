import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Target, Mail, Lock, ArrowRight, Loader, ShieldCheck, UserPlus, Info, ArrowLeft } from "lucide-react";

// ASSETS
const heroImg = "/ref-banner.png";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const result = await login(formData.email.trim(), formData.password.trim());
    if (result.success) {
      if (result.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } else {
      if (result.errorType === "USER_NOT_FOUND") {
        setShowRegisterModal(true);
      } else {
        setError(result.message);
      }
    }
    setIsLoading(false);
  };

  return (
    <div style={{ 
        minHeight: 'calc(100vh - 80px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#0F172A', 
        fontFamily: "'Outfit', sans-serif",
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url('${heroImg}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '20px',
        boxSizing: 'border-box'
    }}>
      
      {/* PREMIUM GLASSMORHPIC LOGIN CARD */}
      <div className="login-card" style={{ 
          width: '92%', 
          maxWidth: '430px', 
          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
          backdropFilter: 'blur(30px)',
          borderRadius: '32px', 
          boxShadow: '0 40px 100px rgba(0,0,0,0.4)', 
          padding: 'clamp(20px, 6vw, 35px)', 
          animation: 'cardEnter 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          maxHeight: 'calc(100vh - 80px)', overflowY: 'auto', overflowX: 'hidden'
      }}>
         {/* SUBTLE BRAND ACCENT */}
         <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #3B82F6, #1E40AF)' }} />

         <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <div style={{ 
                backgroundColor: '#eff6ff', 
                width: '56px', height: '56px', borderRadius: '14px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 15px', 
                color: '#1E40AF'
            }}>
               <Target size={30} />
            </div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: '900', color: '#0F172A', marginBottom: '8px', letterSpacing: '-1px' }}>WELCOME BACK</h2>
            <p style={{ color: '#64748B', fontWeight: '600', fontSize: '13px', letterSpacing: '0.5px' }}>
               PRO PLAYER ACCESS PORTAL
            </p>
         </div>

         <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {error && (
               <div style={{ 
                   padding: '14px 20px', backgroundColor: '#fde8e8', color: '#9b1c1c', 
                   borderRadius: '12px', border: '1px solid rgba(155, 28, 28, 0.2)', 
                   fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px'
               }}>
                  <Info size={16} /> {error}
               </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
               <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>EMAIL ADDRESS</label>
               <div style={{ position: 'relative' }}>
                  <Mail size={16} color="#1E40AF" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                  <input 
                     type="email" 
                     required 
                     value={formData.email} 
                     onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                     style={{ 
                        width: '100%', padding: '12px 12px 12px 45px', borderRadius: '14px', 
                        border: '1px solid #e2e8f0', backgroundColor: '#ffffff', 
                        outline: 'none', fontSize: '14px', fontWeight: '700', color: '#0F172A'
                     }} 
                     placeholder="you@example.com" 
                  />
               </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
               <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>PASSWORD</label>
               <div style={{ position: 'relative' }}>
                  <Lock size={16} color="#1E40AF" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                  <input 
                     type="password" 
                     required 
                     value={formData.password} 
                     onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                     style={{ 
                        width: '100%', padding: '12px 12px 12px 45px', borderRadius: '14px', 
                        border: '1px solid #e2e8f0', backgroundColor: '#ffffff', 
                        outline: 'none', fontSize: '14px', fontWeight: '700', color: '#0F172A'
                     }} 
                     placeholder="••••••••" 
                  />
               </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
               <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', fontWeight: '700', cursor: 'pointer' }}>
                  <input type="checkbox" style={{ accentColor: '#1E40AF' }} /> Remember
               </label>
               <Link to="/forgot-password" style={{ fontSize: '12px', color: '#1E40AF', textDecoration: 'none', fontWeight: '800' }}>Recovery</Link>
            </div>

            <button type="submit" disabled={isLoading} style={{ 
                backgroundColor: '#1E40AF', color: 'white', padding: '14px', 
                borderRadius: '100px', border: 'none', fontWeight: '900', 
                fontSize: '14px', cursor: 'pointer', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', gap: '12px', 
                marginTop: '10px', transition: 'all 0.4s ease', 
                boxShadow: '0 20px 40px rgba(30, 64, 175, 0.3)'
            }}>
               {isLoading ? "AUTHENTICATING..." : <><ShieldCheck size={18} /> ACCESS ACCOUNT <ArrowRight size={18} /></>}
            </button>
         </form>

         <div style={{ marginTop: '20px', textAlign: 'center', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
            <p style={{ color: '#64748B', fontSize: '13px', fontWeight: '700' }}>
               New Athlete? <Link to="/register" style={{ color: '#1E40AF', textDecoration: 'none', fontWeight: '900', borderBottom: '2px solid #1E40AF', paddingBottom: '2px' }}>Enroll Today</Link>
            </p>
         </div>
      </div>

      {/* Register Prompt Modal */}
      {showRegisterModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15,23,42,0.85)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
           <div style={{ backgroundColor: '#ffffff', padding: '35px 25px', borderRadius: '24px', width: '90%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', animation: 'cardEnter 0.4s ease-out' }}>
              <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                 <UserPlus size={32} />
              </div>
              <h3 style={{ color: '#0F172A', fontSize: '22px', fontWeight: '900', marginBottom: '10px' }}>Account Not Found</h3>
              <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '25px', fontWeight: '500', lineHeight: '1.5' }}>We couldn't find any account associated with this email. Would you like to enroll?</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 <button onClick={() => navigate('/register')} style={{ backgroundColor: '#1E40AF', color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '800', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                    Yes, Create Account
                 </button>
                 <button onClick={() => setShowRegisterModal(false)} style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: '800', cursor: 'pointer', transition: 'background-color 0.2s' }}>
                    Try Another Email
                 </button>
              </div>
           </div>
        </div>
      )}

      <style>{`
         @keyframes cardEnter { from { opacity: 0; transform: translateY(40px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
};

export default Login;
