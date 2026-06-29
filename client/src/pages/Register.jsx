import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Target, Mail, Lock, User, Loader, ArrowRight, Phone, Shield, CheckCircle, Smartphone, UserCheck, CreditCard, Check, XCircle, AlertCircle, Calendar, Heart, Briefcase, MapPin, Activity, FileText, ChevronRight, ShieldCheck, Globe, Info, Box, ShoppingCart
} from "lucide-react";
import { sendOtp, verifyOtp, registerUser } from "../services/authService";
import { getAllPrograms } from "../services/programService";
import { getBatches } from "../services/batchService";
import { getAllEquipment } from "../services/equipmentService";
import { API_URL } from "../services/config";
import { formatDate } from "../utils/dateFormatter";

// ASSETS
const heroImg = "/ref-banner.png";

const Register = () => {
  const navigate = useNavigate();
  const { loginWithUserData, user } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  // Search parameters from redirect
  const urlProgramId = searchParams.get("programId") || searchParams.get("courseId") || "";
  const urlBatchId = searchParams.get("batchId") || "";

  // Step Control
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", mobile: "", password: "", confirmPassword: "", otp: "",
    dob: "", age: "", gender: "", bloodGroup: "", aadhaar: "", category: "Student",
    institutionName: "", institutionDesignation: "", guardianName: "", guardianContact: "",
    address: "", medicalConditions: "", emergencyContactName: "", emergencyContactNumber: "",
    preferredBatch: "Weekday", previousExperience: "No", previousExperienceDetails: "",
    declaration: false,
  });

  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);

  const [selectedProgramId, setSelectedProgramId] = useState(urlProgramId);
  const [selectedBatchId, setSelectedBatchId] = useState(urlBatchId);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [timer, setTimer] = useState(0);
  const [status, setStatus] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(null); // { studentId, email }
  const [countdown, setCountdown] = useState(8);

  const showStatus = (message, type = "success") => {
    setStatus({ message, type });
    // Error stays for 8 seconds, success for 5 seconds
    setTimeout(() => setStatus(null), type === "error" ? 8000 : 5000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const progs = await getAllPrograms();
        setPrograms(progs || []);

        const bts = await getBatches();
        setBatches(bts || []);

        const eq = await getAllEquipment(false); // only active
        setEquipmentList(eq || []);
      } catch (err) {
        console.error("Failed to load checkout options:", err);
      }
    };
    fetchData();
  }, []);

  // Update selected program if URL parameter changes
  useEffect(() => {
    if (urlProgramId) setSelectedProgramId(urlProgramId);
    if (urlBatchId) setSelectedBatchId(urlBatchId);
  }, [urlProgramId, urlBatchId]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === "checkbox" ? checked : value;

    if (name === "mobile") {
       val = val.replace(/\D/g, '').slice(0, 10);
    }

    if (name === "dob") {
      const birthDate = new Date(val);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      setFormData((prev) => ({ ...prev, [name]: val, age: age >= 0 ? age : 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: val }));
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) { showStatus("Email required", "error"); return; }
    setIsSendingOtp(true);
    try {
      const { ok, data } = await sendOtp(formData.email);
      if (ok) { 
        setOtpSent(true); 
        setTimer(60); 
        showStatus(`OTP Sent!`, "success"); 
        if (data.otp) {
          console.log("Dev OTP Code:", data.otp);
          window.devOtpCode = data.otp;
        }
      }
      else showStatus(data.message || "Failed to send OTP", "error");
    } catch { showStatus("Network error", "error"); }
    finally { setIsSendingOtp(false); }
  };

  const handleVerifyOtp = async () => {
    if (!formData.otp) { showStatus("Enter OTP", "error"); return; }
    setIsVerifyingOtp(true);
    try {
      const { ok, data } = await verifyOtp(formData.email, formData.otp);
      if (ok && data.success) { setOtpVerified(true); showStatus("Verified!", "success"); }
      else showStatus("Invalid OTP", "error");
    } catch { showStatus("Verification failed", "error"); }
    finally { setIsVerifyingOtp(false); }
  };

  const handleNextStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.mobile || !formData.dob || !formData.gender) {
      showStatus("Please fill all required identity fields", "error"); return;
    }
    if (!otpVerified) { showStatus("Email verification required", "error"); return; }
    if (!formData.declaration) { showStatus("Safety declaration required", "error"); return; }
    setCurrentStep(2);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const completeRegistration = async (payload) => {
    try {
      const { ok, data } = await registerUser(payload);
      if (ok) {
        // Show success screen with student ID and email
        setRegistrationSuccess({
          studentId: data.studentId,
          email: payload.email,
          firstName: payload.firstName,
        });
        // Start countdown to navigate to login
        let count = 8;
        setCountdown(count);
        const interval = setInterval(() => {
          count -= 1;
          setCountdown(count);
          if (count <= 0) {
            clearInterval(interval);
            navigate("/login");
          }
        }, 1000);
      } else {
        showStatus(data.message || "Registration failed. Please try again.", "error");
      }
    } catch (err) {
      showStatus(err.message || "An error occurred.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalRegistration = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    setIsLoading(true);
    try {
      if (grandTotal === 0) {
          // Bypass payment for zero-total or enroll later
          const payload = {
             ...formData,
             previousExperience: formData.previousExperience === "Yes",
             programId: selectedProgramId || undefined,
             batchId: selectedBatchId || undefined,
             equipmentId: selectedEquipmentId || undefined,
             paymentDetails: {
               amount: 0,
               razorpay_payment_id: `ARPAY_FREE_${Date.now()}`,
             }
          };
          await completeRegistration(payload);
          return;
      }

      // 1. Create payment order on backend
      const orderRes = await fetch(`${API_URL}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: grandTotal })
      });
      if (!orderRes.ok) {
         throw new Error("Failed to initialize payment gateway");
      }
      const orderData = await orderRes.json();

      // 2. Check if Mock Payment
      if (orderData.key_id === 'rzp_test_dummy') {
         showStatus("Simulating payment in dev environment...", "success");
         const payload = {
            ...formData,
            previousExperience: formData.previousExperience === "Yes",
            programId: selectedProgramId,
            batchId: selectedBatchId || undefined,
            equipmentId: selectedEquipmentId || undefined,
            paymentDetails: {
              amount: grandTotal * 100,
              razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(7).toUpperCase()}`,
              razorpay_order_id: orderData.id,
            }
         };
         await completeRegistration(payload);
         return;
      }

      // 3. Load Razorpay and open checkout modal
      const loaded = await loadRazorpayScript();
      if (!loaded) {
         throw new Error("Failed to load Razorpay SDK. Check your internet connection.");
      }

      const options = {
         key: orderData.key_id,
         amount: orderData.amount,
         currency: orderData.currency,
         name: "Archery Academy",
         description: selectedProgram ? selectedProgram.title : "Academy Registration",
         order_id: orderData.id,
         handler: async (response) => {
            setIsLoading(true);
            try {
                // Verify payment
                const verifyRes = await fetch(`${API_URL}/payments/verify-payment`, {
                   method: "POST",
                   headers: { "Content-Type": "application/json" },
                   body: JSON.stringify(response)
                });
                const verifyData = await verifyRes.json();
                if (!verifyRes.ok || !verifyData.success) {
                   throw new Error(verifyData.message || "Payment verification failed");
                }
                // Show success toast for payment
                showStatus("Payment successful! Registering...", "success");

                // Register User
                const payload = {
                   ...formData,
                   previousExperience: formData.previousExperience === "Yes",
                   programId: selectedProgramId,
                   batchId: selectedBatchId || undefined,
                   equipmentId: selectedEquipmentId || undefined,
                   paymentDetails: {
                      amount: orderData.amount,
                      razorpay_payment_id: response.razorpay_payment_id,
                      razorpay_order_id: response.razorpay_order_id,
                      razorpay_signature: response.razorpay_signature
                   }
                };
                await completeRegistration(payload);
            } catch (err) {
               showStatus(err.message, "error");
               setIsLoading(false);
            }
         },
         prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.mobile
         },
         theme: { color: "#1E40AF" },
         modal: {
            ondismiss: () => {
               showStatus("Payment cancelled by user", "error");
               setIsLoading(false);
            }
         }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      showStatus(err.message, "error");
      setIsLoading(false);
    }
  };

  // Helper Find Selects
  const selectedProgram = programs.find((p) => p._id === selectedProgramId);
  const selectedBatch = batches.find((b) => b._id === selectedBatchId);
  const selectedEquipment = equipmentList.find((eq) => eq._id === selectedEquipmentId);

  // Filter batches by selected program
  const filteredBatches = batches.filter(
    (b) => b.program?._id === selectedProgramId || b.program === selectedProgramId
  );

  const coursePrice = selectedProgram ? selectedProgram.fees || 0 : 0;
  const eqPrice = selectedEquipment ? selectedEquipment.price || 0 : 0;
  const grandTotal = coursePrice + eqPrice;

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

      {/* ====== REGISTRATION SUCCESS SCREEN ====== */}
      {registrationSuccess && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.97)',
          backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '24px',
            padding: '28px 24px', maxWidth: '460px', width: '100%',
            textAlign: 'center', boxShadow: '0 40px 80px rgba(0,0,0,0.5)',
            animation: 'popIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            position: 'relative', maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', overflowX: 'hidden'
          }}>
            {/* Top gradient bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #16a34a, #22c55e, #4ade80)' }} />
            
            {/* Animated checkmark circle */}
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #16a34a, #22c55e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 0 0 10px rgba(34, 197, 94, 0.1)'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
              Registration Successful! 🎉
            </h2>
            <p style={{ color: '#64748B', fontSize: '12px', fontWeight: '600', margin: '0 0 18px' }}>
              Welcome, <strong style={{ color: '#0F172A' }}>{registrationSuccess.firstName}</strong>! Your enrollment is confirmed.
            </p>

            {/* Student ID + Email side by side */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '14px' }}>
              <div style={{ backgroundColor: '#eff6ff', border: '1.5px dashed #3b82f6', borderRadius: '12px', padding: '12px' }}>
                <p style={{ fontSize: '9px', fontWeight: '900', color: '#1E40AF', letterSpacing: '1.5px', margin: '0 0 5px' }}>STUDENT ID</p>
                <p style={{ fontSize: '17px', fontWeight: '900', color: '#0F172A', fontFamily: 'monospace', letterSpacing: '2px', margin: 0 }}>
                  {registrationSuccess.studentId}
                </p>
              </div>
              <div style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: '12px', padding: '12px', textAlign: 'left' }}>
                <p style={{ fontSize: '9px', fontWeight: '900', color: '#16a34a', letterSpacing: '1.5px', margin: '0 0 5px' }}>📧 EMAIL SENT</p>
                <p style={{ fontSize: '10px', color: '#334155', fontWeight: '700', margin: 0, wordBreak: 'break-all' }}>{registrationSuccess.email}</p>
                <p style={{ fontSize: '10px', color: '#64748B', margin: '3px 0 0' }}>Invoice + temp password</p>
              </div>
            </div>

            {/* Next steps compact */}
            <div style={{ backgroundColor: '#f8fafc', borderRadius: '10px', padding: '12px 14px', marginBottom: '14px', textAlign: 'left' }}>
              <p style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8', letterSpacing: '1.5px', margin: '0 0 8px' }}>NEXT STEPS</p>
              {["Check email for login credentials", "Login with your temporary password", "Set a new password on first login"].map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: i < 2 ? '6px' : 0 }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#1E40AF', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '900', flexShrink: 0 }}>{i + 1}</div>
                  <p style={{ margin: 0, fontSize: '11px', color: '#334155', fontWeight: '600' }}>{step}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%', backgroundColor: '#1E40AF', color: 'white',
                padding: '13px', borderRadius: '100px', border: 'none',
                fontWeight: '900', fontSize: '13px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                boxShadow: '0 8px 20px rgba(30, 64, 175, 0.3)'
              }}
            >
              GO TO LOGIN
              <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '2px 10px', fontSize: '11px' }}>
                Auto in {countdown}s
              </span>
            </button>
          </div>
        </div>
      )}
      
      {/* PREMIUM GLASSMORPHIC ENROLMENT CARD */}
      <div style={{ 
          width: '95%', 
          maxWidth: '700px', 
          backgroundColor: 'rgba(255, 255, 255, 0.98)', 
          backdropFilter: 'blur(30px)',
          borderRadius: '32px', 
          boxShadow: '0 50px 100px rgba(0,0,0,0.5)', 
          padding: 'clamp(20px, 5vw, 35px)',
          animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          maxHeight: 'calc(100vh - 40px)', overflowY: 'auto', overflowX: 'hidden',
          margin: '20px 0',
          boxSizing: 'border-box'
      }}>
         <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'linear-gradient(90deg, #1E40AF, #ef4444)' }} />

      {/* COMPACT PROGRESS TRACKER */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
         <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontSize: '10px', fontWeight: '900', color: currentStep === 1 ? '#1E40AF' : '#94a3b8', letterSpacing: '2px', marginBottom: '8px' }}>STEP 01</p>
            <div style={{ height: '4px', backgroundColor: currentStep >= 1 ? '#1E40AF' : '#f1f5f9', borderRadius: '4px' }} />
         </div>
         <div style={{ flex: 1, textAlign: 'center' }}>
            <p style={{ fontSize: '10px', fontWeight: '900', color: currentStep === 2 ? '#1E40AF' : '#94a3b8', letterSpacing: '2px', marginBottom: '8px' }}>STEP 02</p>
            <div style={{ height: '4px', backgroundColor: currentStep >= 2 ? '#1E40AF' : '#f1f5f9', borderRadius: '4px' }} />
         </div>
      </div>

         <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <div style={{ backgroundColor: '#eff6ff', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', color: '#1E40AF' }}>
              {currentStep === 1 && <User size={26} />}
              {currentStep === 2 && <ShoppingCart size={26} />}
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', marginBottom: '5px', letterSpacing: '-1px' }}>
              {currentStep === 1 && "ATHLETE DETAILS"}
              {currentStep === 2 && "CHECKOUT & SUMMARY"}
            </h2>
            <p style={{ color: '#64748B', fontSize: '13px', fontWeight: '600' }}>Official Academy Registration</p>
         </div>

         {status && (
            <div style={{
              position: 'fixed',
              bottom: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 99999,
              padding: '14px 24px',
              borderRadius: '12px',
              backgroundColor: status.type === 'success' ? '#def7ec' : '#fde8e8',
              color: status.type === 'success' ? '#03543f' : '#9b1c1c',
              border: status.type === 'success' ? '1px solid #6fcf97' : '1px solid #f87171',
              fontSize: '13px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
              maxWidth: '500px',
              width: '90%',
              animation: 'fadeInUp 0.3s ease'
            }}>
               <Info size={16} style={{ flexShrink: 0 }} /> {status.message}
               <button
                 onClick={() => setStatus(null)}
                 style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: '900', fontSize: '16px', lineHeight: 1, padding: '0 4px' }}
               >&times;</button>
            </div>
         )}

         {currentStep === 1 && (
            <div style={{ animation: 'stepEnter 0.5s ease' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '15px' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>FIRST NAME</label>
                      <input name="firstName" value={formData.firstName} onChange={handleChange} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', outline: 'none', fontSize: '14px', fontWeight: '700' }} placeholder="John" />
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>LAST NAME</label>
                      <input name="lastName" value={formData.lastName} onChange={handleChange} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', outline: 'none', fontSize: '14px', fontWeight: '700' }} placeholder="Doe" />
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>DATE OF BIRTH</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleChange} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', outline: 'none', fontSize: '14px', fontWeight: '700' }} />
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>GENDER</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', outline: 'none', fontSize: '14px', fontWeight: '700' }}>
                         <option value="">Select</option>
                         <option value="Male">Male</option>
                         <option value="Female">Female</option>
                      </select>
                   </div>
                   <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>MOBILE NUMBER</label>
                      <input name="mobile" value={formData.mobile} onChange={handleChange} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', outline: 'none', fontSize: '14px', fontWeight: '700' }} placeholder="+91 98765 43210" />
                   </div>

                   <div style={{ gridColumn: '1 / -1', backgroundColor: '#f8fafc', padding: 'clamp(15px, 4vw, 25px)', borderRadius: '16px', border: '1px solid #f1f5f9', boxSizing: 'border-box' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'end', flexWrap: 'wrap' }}>
                         <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>EMAIL ADDRESS</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} disabled={otpVerified} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', outline: 'none', fontSize: '14px', fontWeight: '700' }} placeholder="you@example.com" />
                         </div>
                          {!otpVerified && (
                             <button 
                                onClick={handleSendOtp} 
                                disabled={isSendingOtp || (timer > 0)} 
                                style={{ 
                                   backgroundColor: '#0F172A', 
                                   color: 'white', 
                                   padding: '16px 20px', 
                                   borderRadius: '10px', 
                                   border: 'none', 
                                   fontWeight: '900', 
                                   fontSize: '12px', 
                                   cursor: (isSendingOtp || timer > 0) ? 'not-allowed' : 'pointer', 
                                   flexShrink: 0,
                                   display: 'flex',
                                   alignItems: 'center',
                                   gap: '6px'
                                }}
                             >
                                {isSendingOtp ? (
                                   <>
                                      <Loader className="animate-spin w-4 h-4" /> SENDING OTP...
                                   </>
                                ) : (
                                   timer > 0 ? `${timer}s` : "SEND OTP"
                                )}
                             </button>
                          )}
                      </div>
                      {otpSent && !otpVerified && (
                         <div style={{ marginTop: '20px', display: 'flex', gap: '6px', alignItems: 'end', flexWrap: 'wrap', animation: 'fadeIn 0.3s ease', boxSizing: 'border-box' }}>
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                               <label style={{ fontSize: '9px', fontWeight: '900', color: '#94a3b8' }}>VERIFICATION CODE</label>
                               <input name="otp" maxLength="4" value={formData.otp} onChange={handleChange} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', outline: 'none', fontSize: '16px', fontWeight: '900', letterSpacing: '8px', textAlign: 'center' }} placeholder="0000" />
                            </div>
                            <button onClick={handleVerifyOtp} disabled={isVerifyingOtp} style={{ backgroundColor: '#1E40AF', color: 'white', padding: '16px 20px', borderRadius: '10px', border: 'none', fontWeight: '900', fontSize: '12px', cursor: 'pointer', flexShrink: 0 }}>
                               {isVerifyingOtp ? "..." : "VERIFY"}
                            </button>
                         </div>
                      )}
                      {otpVerified && <div style={{ color: '#059669', fontSize: '12px', fontWeight: '800', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={14} /> SECURED & VERIFIED</div>}
                   </div>

                   <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'flex', gap: '15px', cursor: 'pointer', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                         <input type="checkbox" name="declaration" checked={formData.declaration} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: '#1E40AF' }} />
                         <span style={{ fontSize: '12px', color: '#64748B', fontWeight: '600', lineHeight: '1.6' }}>I agree to all safety protocols and academy policies.</span>
                      </label>
                   </div>

                   <button onClick={handleNextStep1} style={{ gridColumn: '1 / -1', backgroundColor: '#1E40AF', color: 'white', padding: '14px', borderRadius: '100px', border: 'none', fontWeight: '900', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px', transition: 'all 0.3s ease', boxShadow: '0 10px 30px rgba(30, 64, 175, 0.2)' }}>
                      CONTINUE TO CHECKOUT <ChevronRight size={18} />
                   </button>
                </div>
            </div>
         )}

         {currentStep === 2 && (
            <div style={{ animation: 'stepEnter 0.5s ease' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                   
                   {/* COURSE SELECTOR DROPDOWNS (IF NOT DEFINED VIA URL) */}
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '15px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                        <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>SELECT COURSE / PROGRAM *</label>
                        <select 
                          value={selectedProgramId} 
                          onChange={(e) => {
                            setSelectedProgramId(e.target.value);
                            setSelectedBatchId(""); // reset batch on program switch
                          }} 
                          style={{ padding: '16px', borderRadius: '10px', border: '1px solid #f1f5f9', backgroundColor: '#f8fafc', outline: 'none', fontSize: '14px', fontWeight: '700', color: '#0F172A', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                        >
                          <option value="">-- Choose Course --</option>
                          {programs.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.title} ({p.level})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
                        <label style={{ fontSize: '10px', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px' }}>SELECT BATCH</label>
                        <select 
                          value={selectedBatchId} 
                          onChange={(e) => setSelectedBatchId(e.target.value)}
                          disabled={!selectedProgramId}
                          style={{ padding: '16px', borderRadius: '10px', border: '1px solid #f1f5f9', backgroundColor: selectedProgramId ? '#f8fafc' : '#e2e8f0', outline: 'none', fontSize: '14px', fontWeight: '700', color: '#0F172A', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                        >
                          <option value="">-- Select Batch (Optional) --</option>
                          {filteredBatches.map((b) => (
                            <option key={b._id} value={b._id}>
                              {b.name} - {b.time} ({b.days?.join(', ')})
                            </option>
                          ))}
                        </select>
                      </div>
                   </div>

                   {/* SELECTED DETAILS DISPLAY */}
                   {selectedProgram && (
                      <div style={{ backgroundColor: '#F0F6FF', border: '1px solid #D2E1F8', padding: '25px', borderRadius: '18px' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                               <span style={{ fontSize: '9px', fontWeight: '900', color: '#1E40AF', letterSpacing: '1.5px', textTransform: 'uppercase' }}>SELECTED COURSE DETAILS</span>
                               <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', margin: '5px 0' }}>{selectedProgram.title}</h3>
                               <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>{selectedProgram.description}</p>
                            </div>
                            <span style={{ backgroundColor: '#1E40AF', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '900' }}>{selectedProgram.level}</span>
                         </div>
                         <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', fontSize: '12px', borderTop: '1px solid #D2E1F8', paddingTop: '15px', marginTop: '10px' }}>
                            <div>
                               <span style={{ color: '#64748B', display: 'block' }}>Course Duration</span>
                               <strong style={{ color: '#0F172A' }}>{selectedProgram.duration}</strong>
                            </div>
                            <div>
                               <span style={{ color: '#64748B', display: 'block' }}>Course Fee</span>
                               <strong style={{ color: '#0F172A' }}>₹{selectedProgram.fees}</strong>
                            </div>
                         </div>

                         {/* BATCH DETAIL SUB CARD */}
                         {selectedBatch && (
                            <div style={{ backgroundColor: 'white', border: '1px solid #E2EAF8', borderRadius: '12px', padding: '15px', marginTop: '20px' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1E40AF', fontSize: '9px', fontWeight: '900', letterSpacing: '1px', marginBottom: '8px' }}>
                                  <Calendar size={12} /> BATCH TIMINGS & LOCATION
                               </div>
                               <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>
                                  {selectedBatch.name} ({selectedBatch.time})
                               </div>
                               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '11px', color: '#64748B', marginTop: '8px' }}>
                                  {selectedBatch.days && (
                                     <span><strong>Days:</strong> {selectedBatch.days.join(', ')}</span>
                                  )}
                                  {selectedBatch.location && (
                                     <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={12} /> {selectedBatch.location}</span>
                                  )}
                                  {selectedBatch.startDate && (
                                     <span><strong>Starts:</strong> {formatDate(selectedBatch.startDate)}</span>
                                  )}
                               </div>
                            </div>
                         )}
                      </div>
                   )}

                   {/* EQUIPMENT OPTIONAL UPGRADE SECTION */}
                   {equipmentList.length > 0 && (
                      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0F172A', marginBottom: '15px' }}>
                            <Box size={18} style={{ color: '#1E40AF' }} />
                            <h4 style={{ fontSize: '16px', fontWeight: '800' }}>BEGINNER BASIC BOW</h4>
                         </div>
                         <p style={{ color: '#64748B', fontSize: '12px', marginBottom: '15px' }}>Acquire official archery bows or protective gear alongside your course enrolment. Highly recommended by coaches.</p>
                         
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                             {equipmentList.map((eq) => {
                                const isOutOfStock = eq.availableQty !== undefined ? eq.availableQty <= 0 : eq.qty <= 0;
                                const isSelected = selectedEquipmentId === eq._id;
                                return (
                                   <label 
                                     key={eq._id} 
                                     style={{ 
                                       display: 'flex', 
                                       flexDirection: 'column',
                                       gap: '10px', 
                                       padding: '15px', 
                                       borderRadius: '12px', 
                                       border: isSelected ? '2px solid #1E40AF' : '1px solid #f1f5f9',
                                       backgroundColor: isOutOfStock ? '#f8fafc' : isSelected ? '#F0F6FF' : '#ffffff',
                                       cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                                       opacity: isOutOfStock ? 0.6 : 1,
                                       transition: 'all 0.2s'
                                     }}
                                   >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>
                                        <input 
                                          type="checkbox" 
                                          disabled={isOutOfStock}
                                          checked={isSelected}
                                          onChange={() => {
                                             if (!isOutOfStock) {
                                                setSelectedEquipmentId(isSelected ? "" : eq._id);
                                             }
                                          }}
                                          style={{ width: '18px', height: '18px', accentColor: '#1E40AF', cursor: isOutOfStock ? 'not-allowed' : 'pointer', flexShrink: 0 }}
                                        />
                                        {eq.images && eq.images.length > 0 ? (
                                           <img src={eq.images[0]} alt={eq.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', flexShrink: 0 }} />
                                        ) : (
                                           <div style={{ width: '50px', height: '50px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', flexShrink: 0 }}><Box size={20} /></div>
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                           <span style={{ fontSize: '13px', fontWeight: '800', color: '#0F172A', display: 'block' }}>
                                              {eq.name}
                                              {isOutOfStock && <span style={{ marginLeft: '8px', color: '#ef4444', fontSize: '10px', fontWeight: '900', letterSpacing: '0.5px' }}>(OUT OF STOCK)</span>}
                                           </span>
                                        </div>
                                        <span style={{ fontSize: '14px', fontWeight: '900', color: isOutOfStock ? '#94a3b8' : '#0F172A', flexShrink: 0 }}>₹{eq.price}</span>
                                      </div>
                                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block', lineHeight: '1.5' }}>{eq.description || "Official academy grade gear"}</span>
                                   </label>
                                );
                             })}
                         </div>
                      </div>
                   )}

                   {/* TOTAL CHECKOUT SUMMARY */}
                   <div style={{ backgroundColor: '#0F172A', color: 'white', padding: '25px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)', marginTop: '10px' }}>
                      <span style={{ fontSize: '9px', fontWeight: '900', color: '#ef4444', letterSpacing: '2px', display: 'block', marginBottom: '15px' }}>CHECKOUT SUMMARY</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px', marginBottom: '15px' }}>
                         <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ opacity: 0.7 }}>Course Enrolment Fee:</span>
                            <span style={{ fontWeight: '700' }}>₹{coursePrice}</span>
                         </div>
                         {selectedEquipment && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
                               <span style={{ opacity: 0.9 }}>Add-on: {selectedEquipment.name}:</span>
                               <span style={{ fontWeight: '700' }}>+ ₹{eqPrice}</span>
                            </div>
                         )}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{ fontWeight: '800', fontSize: '15px' }}>TOTAL DUE:</span>
                         <span style={{ fontWeight: '900', fontSize: '22px', color: '#ef4444' }}>₹{grandTotal}</span>
                      </div>
                   </div>

                   <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                      <button onClick={() => setCurrentStep(1)} style={{ backgroundColor: '#f1f5f9', color: '#64748B', padding: '18px 30px', borderRadius: '100px', border: 'none', fontWeight: '900', fontSize: '13px', cursor: 'pointer' }}>BACK</button>
                      <button onClick={handleFinalRegistration} disabled={isLoading} style={{ flex: 1, backgroundColor: '#1E40AF', color: 'white', padding: '14px', borderRadius: '100px', border: 'none', fontWeight: '900', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'all 0.3s ease', boxShadow: '0 10px 30px rgba(30, 64, 175, 0.3)' }}>
                         {isLoading ? (
                            <>
                               <Loader className="animate-spin w-4 h-4" /> PROCESSING...
                            </>
                         ) : grandTotal === 0 ? (
                            <>
                               <UserCheck size={18} /> COMPLETE REGISTRATION (ENROLL LATER) <ChevronRight size={18} />
                            </>
                         ) : (
                            <>
                               <CreditCard size={18} /> PAY ₹{grandTotal} <ChevronRight size={18} />
                            </>
                         )}
                      </button>
                   </div>
                </div>
            </div>
         )}

         <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
            <p style={{ color: '#64748B', fontSize: '14px', fontWeight: '700' }}>
               Already registered? <Link to="/login" style={{ color: '#1E40AF', textDecoration: 'none', fontWeight: '900', borderBottom: '2px solid #1E40AF', paddingBottom: '2px' }}>Sign in portal</Link>
            </p>
         </div>
      </div>

      <style>{`
         @keyframes fadeInUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
         @keyframes fadeInDown { from { opacity: 0; transform: translateX(-50%) translateY(-20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
         @keyframes stepEnter { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
         @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
         @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
         @keyframes popIn { from { opacity: 0; transform: scale(0.8) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
         @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 15px rgba(34, 197, 94, 0.12); } 50% { box-shadow: 0 0 0 20px rgba(34, 197, 94, 0.06); } }
         .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

export default Register;
