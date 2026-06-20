import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../services/config";
import { Lock, ShieldAlert, ArrowRight, Loader, CheckCircle, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const heroImg = "/ref-banner.png";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { user, loginWithUserData } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user?.token}`
        },
        body: JSON.stringify({ newPassword: password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Password reset failed");
      }

      toast.success("Password updated successfully!");
      setIsDone(true);
      
      // Update local storage and context
      const updatedUser = { ...user, needsPasswordReset: false };
      loginWithUserData(updatedUser);

      setTimeout(() => {
        if (updatedUser.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 1500);

    } catch (err) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
        minHeight: 'calc(100vh - 80px)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#0F172A', 
        fontFamily: "'Outfit', sans-serif",
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url('${heroImg}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        padding: '20px',
        boxSizing: 'border-box'
    }}>
      
      <div style={{ 
          width: '100%', 
          maxWidth: '450px', 
          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
          backdropFilter: 'blur(30px)',
          borderRadius: '32px', 
          boxShadow: '0 50px 100px rgba(0,0,0,0.5)', 
          padding: '25px 35px 30px',
          animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', overflowX: 'hidden'
      }}>
         <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #ef4444, #1E40AF)' }} />

         <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <div style={{ backgroundColor: '#fee2e2', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: '#ef4444' }}>
               {isDone ? <CheckCircle size={28} style={{ color: '#10b981' }} /> : <ShieldAlert size={28} />}
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A', marginBottom: '10px', letterSpacing: '-1px' }}>
              {isDone ? "ACCESS GRANTED" : "Change Password"}
            </h2>
            <p style={{ color: '#64748B', fontSize: '13px', fontWeight: '600', lineHeight: 1.6 }}>
              {isDone 
                ? "Your credentials have been securely updated. Redirecting you to your account portal..."
                : "You logged in using a temporary credentials key. Please establish a custom permanent password key to proceed."
              }
            </p>
         </div>

         {!isDone && (
           <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                 <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>NEW PERMANENT KEY</label>
                 <div style={{ position: 'relative' }}>
                     <Lock size={16} color="#1E40AF" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                     <input 
                        type={showPassword ? 'text' : 'password'}
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        style={{ 
                           width: '100%', padding: '12px 40px 12px 45px', borderRadius: '12px', 
                           border: '1px solid #e2e8f0', backgroundColor: '#ffffff', 
                           outline: 'none', fontSize: '14px', fontWeight: '700', color: '#0F172A'
                        }} 
                        placeholder="••••••••" 
                     />
                     <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px', display: 'flex', alignItems: 'center' }}>
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                     </button>
                  </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                 <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>CONFIRM KEY</label>
                 <div style={{ position: 'relative' }}>
                     <Lock size={16} color="#1E40AF" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                     <input 
                        type={showConfirmPassword ? 'text' : 'password'}
                        required 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        style={{ 
                           width: '100%', padding: '12px 40px 12px 45px', borderRadius: '12px', 
                           border: '1px solid #e2e8f0', backgroundColor: '#ffffff', 
                           outline: 'none', fontSize: '14px', fontWeight: '700', color: '#0F172A'
                        }} 
                        placeholder="••••••••" 
                     />
                     <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px', display: 'flex', alignItems: 'center' }}>
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                     </button>
                  </div>
              </div>

              <button type="submit" disabled={isLoading} style={{ 
                  backgroundColor: '#1E40AF', color: 'white', padding: '14px', 
                  borderRadius: '100px', border: 'none', fontWeight: '900', 
                  fontSize: '13px', cursor: 'pointer', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', gap: '6px', 
                  marginTop: '10px', transition: 'all 0.3s ease', 
                  boxShadow: '0 10px 30px rgba(30, 64, 175, 0.2)'
              }}>
                 {isLoading ? (
                    <>
                       <Loader className="animate-spin w-4 h-4" /> REWRITING ACCESS KEY...
                    </>
                 ) : (
                    <>
                       UPDATE & ENTER PORTAL <ArrowRight size={18} />
                    </>
                 )}
              </button>
           </form>
         )}
      </div>

      <style>{`
         @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
         @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
         .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default ResetPassword;
