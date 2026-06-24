import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Users, Target, ArrowRight, ShieldCheck, CreditCard, User, Phone, Mail, ArrowLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_URL } from '../services/config';
import { getPayAndPlaySettings } from '../services/payAndPlayService';
import archeryRangeImg from '../assets/archery_range.png';
import archeryBowImg from '../assets/archery_bow.png';
import outdoorImg from "../../public/courses/oudoorimage.jpeg"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const parseTime = (timeStr) => {
  if (!timeStr) return null;
  const startPart = timeStr.split(' - ')[0];
  const [time, period] = startPart.split(' ');
  let [hours, minutes] = time.split(':');
  hours = parseInt(hours, 10);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  const d = new Date();
  d.setHours(hours, parseInt(minutes, 10), 0, 0);
  return d;
};

const formatTimeRange = (date) => {
  const formatHour = (h) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    let hr = h % 12;
    hr = hr ? hr : 12;
    return `${hr}:00 ${ampm}`;
  };
  const startHour = date.getHours();
  const endHour = startHour + 1;
  return `${formatHour(startHour)} - ${formatHour(endHour)}`;
};

const CustomTimeInput = React.forwardRef(({ value, onClick, onChange, customValue, disabled }, ref) => (
  <input
    value={customValue || ""}
    onClick={disabled ? undefined : onClick}
    onChange={onChange}
    readOnly
    disabled={disabled}
    placeholder={disabled ? "Select Date First" : "Select Time"}
    style={{ width: "100%", padding: "12px 12px 12px 38px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px", fontWeight: "600", outline: "none", color: disabled ? "#94A3B8" : "#0F172A", backgroundColor: disabled ? "#E2E8F0" : "#F8FAFC", cursor: disabled ? "not-allowed" : "pointer" }}
    ref={ref}
  />
));

const PayAndPlay = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    contactName: '',
    mobileNumber: '',
    email: '',
    dayType: 'Weekday',
    date: '',
    timeSlot: '',
    packageType: 'Place and Range',
    bookingType: 'Single'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [timings, setTimings] = useState({ weekdaySlots: [], weekendSlots: [] });
  const [loadingTimings, setLoadingTimings] = useState(true);

  useEffect(() => {
    const fetchTimings = async () => {
      try {
        const data = await getPayAndPlaySettings();
        setTimings({
          weekdaySlots: data.weekdaySlots || [],
          weekendSlots: data.weekendSlots || []
        });
      } catch (error) {
        console.error("Failed to load timings:", error);
      } finally {
        setLoadingTimings(false);
      }
    };
    fetchTimings();
  }, []);

  const pricing = {
    'Weekday': {
      'Place and Range': { 'Single': 149, 'Shared': 199 },
      'Place, Range, Bow and Arrow': { 'Single': 199, 'Shared': 249 }
    },
    'Weekend': {
      'Place and Range': { 'Single': 169, 'Shared': 249 },
      'Place, Range, Bow and Arrow': { 'Single': 299, 'Shared': 349 }
    }
  };

  const packageImages = {
    'Place and Range': archeryRangeImg,
    'Place, Range, Bow and Arrow': outdoorImg
  };

  useEffect(() => {
    const price = pricing[formData.dayType]?.[formData.packageType]?.[formData.bookingType] || 0;
    setTotalPrice(price);
  }, [formData]);

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    if (name === 'mobileNumber') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'dayType') {
        newData.timeSlot = '';
        newData.date = '';
      }
      return newData;
    });
  };

  // Time slots are now fetched dynamically from backend

  const handleContinue = (e) => {
    e.preventDefault();
    if (!formData.date || !formData.timeSlot) {
      toast.error("Please fill in all details including Date and Time Slot");
      return;
    }
    setStep(2);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!formData.contactName || !formData.mobileNumber || !formData.email) {
      toast.error("Please fill in your contact details completely");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load payment gateway. Please check your internet connection.");
        setIsSubmitting(false);
        return;
      }

      // 2. Create order on backend
      const orderRes = await fetch(`${API_URL}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice })
      });
      const orderData = await orderRes.json();

      if (!orderData || !orderData.id) {
        throw new Error("Failed to create payment order");
      }

      // 3. Setup Razorpay options
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Archery Range",
        description: `Booking for ${formData.packageType}`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            toast.loading("Verifying payment...", { id: "payment-verify" });

            // 4. Save booking details along with payment info
            const saveRes = await fetch(`${API_URL}/payandplay`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...formData,
                persons: 1,
                totalPrice,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
              })
            });

            if (!saveRes.ok) {
              throw new Error('Failed to save booking');
            }

            toast.success("Payment successful! Booking confirmed.", { id: "payment-verify" });
            setFormData({
              contactName: '',
              mobileNumber: '',
              email: '',
              dayType: 'Weekday',
              date: '',
              timeSlot: '',
              packageType: 'Place and Range',
              bookingType: 'Single'
            });
            setStep(1);
          } catch (error) {
            console.error("Booking save error:", error);
            toast.error("Payment successful but booking failed. Contact support.", { id: "payment-verify" });
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: formData.contactName,
          email: formData.email,
          contact: formData.mobileNumber
        },
        theme: {
          color: "#1E40AF"
        }
      };

      // If we got a mock key back, handle mock payment directly
      if (orderData.key_id === 'rzp_test_dummy') {
        const mockResponse = {
          razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(7).toUpperCase()}`,
          razorpay_order_id: orderData.id,
          razorpay_signature: "mock_signature_for_dev_only"
        };
        options.handler(mockResponse);
        return;
      }

      // 5. Open Razorpay checkout modal
      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response) {
        toast.error(`Payment Failed: ${response.error.description}`);
        setIsSubmitting(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Error initiating payment. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#F8FAFC", minHeight: "100vh", paddingBottom: "40px", fontFamily: "'Outfit', sans-serif" }}>
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
          <span style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '4px', textTransform: 'uppercase', color: '#3B82F6' }}>START SHOOTING</span>
          <h1 style={{ fontSize: 'clamp(36px, 8vw, 72px)', fontWeight: '900', margin: '15px 0', letterSpacing: '-2px' }}>PAY AND PLAY</h1>
          <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', maxWidth: '600px', margin: '0 auto', opacity: 0.9 }}>Experience the thrill of archery without long-term commitments.</p>
        </div>
      </section>

      <div className="site-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 15px", marginTop: "-40px", position: "relative", zIndex: 20 }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '25px' }} className="lg:grid-cols-3">

          {/* Booking Form Area */}
          <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "clamp(15px, 5vw, 25px)", boxShadow: "0 20px 40px rgba(0,0,0,0.05)", border: "1px solid #E2E8F0" }} className="lg:col-span-2">

            {/* Step Indicators */}
            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap", marginBottom: "25px", borderBottom: "1px solid #E2E8F0", paddingBottom: "15px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: step === 1 ? "#1E40AF" : "#94A3B8", fontWeight: "800", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: step === 1 ? "#1E40AF" : "#E2E8F0", color: step === 1 ? "white" : "#94A3B8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0 }}>1</span>
                Session Details
              </div>
              <ChevronRight size={16} color="#CBD5E1" style={{ margin: "0 2px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: step === 2 ? "#1E40AF" : "#94A3B8", fontWeight: "800", fontSize: "13px", textTransform: "uppercase", letterSpacing: "1px" }}>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: step === 2 ? "#1E40AF" : "#E2E8F0", color: step === 2 ? "white" : "#94A3B8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", flexShrink: 0 }}>2</span>
                Personal Info
              </div>
            </div>
            {step === 1 ? (
              <form onSubmit={handleContinue} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Day Type Selection */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Select Day</label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {['Weekday', 'Weekend'].map(type => (
                      <div
                        key={type}
                        onClick={() => handleInputChange({ target: { name: 'dayType', value: type } })}
                        style={{
                          flex: 1,
                          padding: "12px",
                          textAlign: "center",
                          backgroundColor: formData.dayType === type ? "#EFF6FF" : "white",
                          border: formData.dayType === type ? "2px solid #1E40AF" : "1px solid #E2E8F0",
                          borderRadius: "10px",
                          cursor: "pointer",
                          fontWeight: "700",
                          fontSize: "14px",
                          color: formData.dayType === type ? "#1E40AF" : "#64748B",
                          transition: "all 0.2s"
                        }}
                      >
                        {type}s
                      </div>
                    ))}
                  </div>
                </div>
                {/* Package Selection */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Select Package</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px" }}>
                    {Object.keys(pricing[formData.dayType]).map((type) => (
                      <div
                        key={type}
                        onClick={() => handleInputChange({ target: { name: 'packageType', value: type } })}
                        style={{
                          borderRadius: "12px",
                          cursor: "pointer",
                          overflow: "hidden",
                          border: formData.packageType === type ? "2px solid #1E40AF" : "1px solid #E2E8F0",
                          backgroundColor: formData.packageType === type ? "#EFF6FF" : "white",
                          boxShadow: formData.packageType === type ? "0 4px 12px rgba(30,64,175,0.1)" : "none",
                          transition: "all 0.2s",
                          position: "relative"
                        }}
                        className="hover:shadow-md"
                      >
                        <div style={{ height: "130px", width: "100%", backgroundImage: `url(${packageImages[type]})`, backgroundSize: "cover", backgroundPosition: 'center', borderBottom: "1px solid #E2E8F0" }}>
                          <div style={{ position: "absolute", top: "10px", right: "10px", width: "22px", height: "22px", borderRadius: "50%", backgroundColor: formData.packageType === type ? "#1E40AF" : "rgba(255,255,255,0.9)", border: formData.packageType === type ? "2px solid white" : "1px solid #CBD5E1", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                            {formData.packageType === type && <div style={{ width: "8px", height: "8px", backgroundColor: "white", borderRadius: "50%" }}></div>}
                          </div>
                        </div>
                        <div style={{ padding: "12px", textAlign: "center", minHeight: "50px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontWeight: formData.packageType === type ? "800" : "600", color: formData.packageType === type ? "#1E40AF" : "#475569", fontSize: "13px", lineHeight: "1.3" }}>{type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Booking Type */}
                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Booking Type</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {['Single', 'Shared'].map(bType => (
                      <div
                        key={bType}
                        onClick={() => handleInputChange({ target: { name: 'bookingType', value: bType } })}
                        style={{
                          flex: 1,
                          padding: "10px",
                          textAlign: "center",
                          backgroundColor: formData.bookingType === bType ? "#1E40AF" : "#F8FAFC",
                          border: formData.bookingType === bType ? "1px solid #1E40AF" : "1px solid #E2E8F0",
                          color: formData.bookingType === bType ? "white" : "#64748B",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "700",
                          fontSize: "13px",
                          transition: "all 0.2s"
                        }}
                      >
                        {bType}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date & Time Selection */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Date</label>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", zIndex: 10 }}>
                        <Calendar size={16} />
                      </div>
                      <DatePicker
                        selected={formData.date ? new Date(formData.date) : null}
                        onChange={(date) => {
                          if (!date) {
                            handleInputChange({ target: { name: 'date', value: '' } });
                            return;
                          }
                          const offset = date.getTimezoneOffset();
                          const localDate = new Date(date.getTime() - (offset * 60 * 1000));
                          const dateStr = localDate.toISOString().split('T')[0];
                          handleInputChange({ target: { name: 'date', value: dateStr } });
                        }}
                        filterDate={(date) => {
                          if (loadingTimings) return false;
                          const day = date.getDay();
                          const isWeekend = day === 0 || day === 6;

                          if (formData.dayType === 'Weekday' && isWeekend) return false;
                          if (formData.dayType === 'Weekend' && !isWeekend) return false;

                          const ranges = formData.dayType === 'Weekday' ? timings.weekdaySlots : timings.weekendSlots;
                          if (!ranges || ranges.length === 0) return false;

                          const today = new Date();
                          if (date.toDateString() === today.toDateString()) {
                            const maxEndHour = Math.max(...ranges.map(r => r.endHour));
                            if (today.getHours() >= maxEndHour - 1) {
                              return false;
                            }
                          }
                          return true;
                        }}
                        minDate={new Date()}
                        placeholderText="Select a date"
                        required
                        dateFormat="yyyy-MM-dd"
                        wrapperClassName="w-full"
                        customInput={
                          <input
                            style={{ width: "100%", padding: "12px 12px 12px 38px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px", fontWeight: "600", outline: "none", color: "#0F172A", backgroundColor: "#F8FAFC" }}
                          />
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Time Slot</label>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", zIndex: 10 }}>
                        <Clock size={16} />
                      </div>
                      <DatePicker
                        selected={formData.timeSlot ? parseTime(formData.timeSlot) : null}
                        onChange={(date) => {
                          if (!date) {
                            handleInputChange({ target: { name: 'timeSlot', value: '' } });
                            return;
                          }
                          handleInputChange({ target: { name: 'timeSlot', value: formatTimeRange(date) } });
                        }}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={60}
                        timeCaption="Time"
                        filterTime={(time) => {
                          if (loadingTimings) return false;
                          const hour = time.getHours();


                          if (formData.date) {
                            const selectedDate = new Date(formData.date);
                            const today = new Date();
                            if (selectedDate.toDateString() === today.toDateString()) {
                              if (hour <= today.getHours()) {
                                return false;
                              }
                            }
                          }

                          const ranges = formData.dayType === 'Weekday' ? timings.weekdaySlots : timings.weekendSlots;
                          if (!ranges || ranges.length === 0) return false;
                          return ranges.some(range => hour >= range.startHour && hour < range.endHour);
                        }}
                        required
                        disabled={!formData.date}
                        wrapperClassName="w-full"
                        customInput={<CustomTimeInput customValue={formData.timeSlot} disabled={!formData.date} />}
                      />
                    </div>
                  </div>
                </div>

                {/* Continue Button */}
                <button
                  type="submit"
                  style={{
                    width: "100%",
                    backgroundColor: "#1E40AF",
                    color: "white",
                    padding: "16px",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: "800",
                    fontSize: "15px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginTop: "10px",
                    transition: "background-color 0.2s"
                  }}
                  className="hover:bg-blue-800"
                >
                  Continue <ArrowRight size={18} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleBooking} style={{ display: "flex", flexDirection: "column", gap: "20px", animation: "fadeIn 0.3s ease" }}>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", cursor: "pointer", color: "#64748B", fontSize: "14px", fontWeight: "600" }} onClick={() => setStep(1)} className="hover:text-brand-blue">
                  <ArrowLeft size={16} /> Back to Session Details
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Contact Name</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. John Doe"
                      style={{ width: "100%", padding: "14px 12px 14px 38px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px", fontWeight: "600", outline: "none", color: "#0F172A", backgroundColor: "#F8FAFC" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Mobile Number</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. 9876543210"
                      style={{ width: "100%", padding: "14px 12px 14px 38px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px", fontWeight: "600", outline: "none", color: "#0F172A", backgroundColor: "#F8FAFC" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "8px" }}>Email ID</label>
                  <div style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. john@example.com"
                      style={{ width: "100%", padding: "14px 12px 14px 38px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "14px", fontWeight: "600", outline: "none", color: "#0F172A", backgroundColor: "#F8FAFC" }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    backgroundColor: isSubmitting ? "#94A3B8" : "#3B82F6",
                    color: "white",
                    padding: "16px",
                    borderRadius: "10px",
                    border: "none",
                    fontWeight: "800",
                    fontSize: "15px",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    marginTop: "10px",
                    transition: "background-color 0.2s"
                  }}
                  className={isSubmitting ? "" : "hover:bg-blue-600"}
                >
                  {isSubmitting ? "Processing..." : <><>Pay Now</> <ArrowRight size={18} /></>}
                </button>
              </form>
            )}
          </div>

          {/* Price Summary Container */}
          <div className="mt-8 md:mt-32 lg:mt-40" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: "#0F172A", borderRadius: "16px", padding: "25px", color: "white", boxShadow: "0 20px 40px rgba(15,23,42,0.2)" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                <CreditCard size={20} color="#3B82F6" /> Booking Summary
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "15px" }}>

                {/* Booking Details Section */}
                <div style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "15px", marginBottom: "5px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Package</span>
                    <span style={{ fontWeight: "600", color: "white", textAlign: "right" }}>{formData.packageType}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Type</span>
                    <span style={{ fontWeight: "600", color: "white" }}>{formData.bookingType} ({formData.dayType})</span>
                  </div>
                  {formData.date && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Date</span>
                      <span style={{ fontWeight: "600", color: "white" }}>{formData.date}</span>
                    </div>
                  )}
                  {formData.timeSlot && (
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Time</span>
                      <span style={{ fontWeight: "600", color: "white" }}>{formData.timeSlot}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px", fontWeight: "800" }}>Total Amount</span>
                  <span style={{ fontSize: "28px", fontWeight: "900", color: "#3B82F6" }}>₹{totalPrice}</span>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "15px", color: "rgba(255,255,255,0.5)", fontSize: "11px" }}>
                <ShieldCheck size={12} /> Secure online payment
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default PayAndPlay;
