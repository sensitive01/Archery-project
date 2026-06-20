import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../services/config";
import { Mail, Key, Lock, ArrowRight, Loader, ShieldAlert, CheckCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const heroImg = "/ref-banner.png";

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email address");
    
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }
      
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter the OTP");
    
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid OTP");
      }
      
      toast.success("OTP verified successfully!");
      setStep(3);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (password.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim(), newPassword: password.trim() })
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to reset password");
      }
      
      toast.success("Password reset successfully!");
      navigate("/login");
    } catch (error) {
      toast.error(error.message);
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
         <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #3B82F6, #1E40AF)' }} />

         <Link to="/login" style={{ position: 'absolute', top: '20px', left: '20px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}>
            <ArrowLeft size={16} /> Back
         </Link>

         <div style={{ textAlign: 'center', marginBottom: '25px', marginTop: '10px' }}>
            <div style={{ backgroundColor: '#eff6ff', width: '56px', height: '56px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: '#1E40AF' }}>
               <ShieldAlert size={28} />
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#0F172A', marginBottom: '10px', letterSpacing: '-1px' }}>
              Account Recovery
            </h2>
            <p style={{ color: '#64748B', fontSize: '13px', fontWeight: '600', lineHeight: 1.6 }}>
              {step === 1 && "Enter your registered email address to receive a verification code."}
              {step === 2 && "Enter the 4-digit verification code sent to your email."}
              {step === 3 && "Create a new permanent password for your account."}
            </p>
         </div>

         {/* STEP 1: EMAIL */}
         {step === 1 && (
           <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                 <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>EMAIL ADDRESS</label>
                 <div style={{ position: 'relative' }}>
                     <Mail size={16} color="#1E40AF" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                     <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        style={{ 
                           width: '100%', padding: '12px 12px 12px 45px', borderRadius: '12px', 
                           border: '1px solid #e2e8f0', backgroundColor: '#ffffff', 
                           outline: 'none', fontSize: '14px', fontWeight: '700', color: '#0F172A'
                        }} 
                        placeholder="you@example.com" 
                     />
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
                    <><Loader className="animate-spin w-4 h-4" /> SENDING CODE...</>
                 ) : (
                    <>SEND VERIFICATION CODE <ArrowRight size={18} /></>
                 )}
              </button>
           </form>
         )}

         {/* STEP 2: OTP */}
         {step === 2 && (
           <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                 <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>VERIFICATION CODE (OTP)</label>
                 <div style={{ position: 'relative' }}>
                     <Key size={16} color="#1E40AF" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }} />
                     <input 
                        type="text" 
                        required 
                        value={otp} 
                        onChange={(e) => setOtp(e.target.value)} 
                        style={{ 
                           width: '100%', padding: '12px 12px 12px 45px', borderRadius: '12px', 
                           border: '1px solid #e2e8f0', backgroundColor: '#ffffff', 
                           outline: 'none', fontSize: '14px', fontWeight: '700', color: '#0F172A',
                           letterSpacing: '5px'
                        }} 
                        placeholder="0000"
                        maxLength={4}
                     />
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
                    <><Loader className="animate-spin w-4 h-4" /> VERIFYING...</>
                 ) : (
                    <>VERIFY CODE <ArrowRight size={18} /></>
                 )}
              </button>
           </form>
         )}

         {/* STEP 3: NEW PASSWORD */}
         {step === 3 && (
           <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                 <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>NEW PASSWORD</label>
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
                 <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>CONFIRM NEW PASSWORD</label>
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
                    <><Loader className="animate-spin w-4 h-4" /> UPDATING...</>
                 ) : (
                    <>UPDATE PASSWORD <ArrowRight size={18} /></>
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

export default ForgotPassword;
