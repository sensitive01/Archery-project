import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../services/config";
import { Clock, Calendar, Users, Target, ArrowRight, ShieldCheck, CreditCard, Ticket, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
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

// Pricing configuration
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

const timeSlots = {
  'Weekday': ['6:00 AM - 9:00 AM'],
  'Weekend': ['6:00 AM - 9:00 AM', '4:00 PM - 6:30 PM']
};

const StudentPayAndPlay = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'book_new'
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    contactName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
    mobileNumber: user?.mobile || '',
    email: user?.email || '',
    dayType: 'Weekday',
    date: '',
    timeSlot: '',
    packageType: 'Place and Range',
    bookingType: 'Single'
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch user bookings
  const fetchBookings = async () => {
    if (!user?.email) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/payandplay?email=${encodeURIComponent(user.email)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load your bookings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  // Update price when form changes
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.timeSlot) {
      toast.error("Please select a date and time slot.");
      return;
    }

    setIsSubmitting(true);
    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error("Failed to load payment gateway.");
        setIsSubmitting(false);
        return;
      }

      const orderRes = await fetch(`${API_URL}/payments/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalPrice })
      });
      const orderData = await orderRes.json();

      if (!orderData || !orderData.id) throw new Error("Failed to create order");

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Archers Portal",
        description: `Pay & Play: ${formData.packageType}`,
        order_id: orderData.id,
        handler: async function (response) {
          try {
            toast.loading("Verifying payment...", { id: "payment-verify" });
            const saveRes = await fetch(`${API_URL}/payandplay`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                ...formData, 
                persons: 1, 
                totalPrice,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
              })
            });

            if (!saveRes.ok) throw new Error('Failed to save booking');

            toast.success("Session booked successfully!", { id: "payment-verify" });
            fetchBookings();
            setActiveTab('bookings');
            // Reset date/time
            setFormData(prev => ({ ...prev, date: '', timeSlot: '' }));
          } catch (error) {
            toast.error("Payment successful but booking failed.", { id: "payment-verify" });
          } finally {
            setIsSubmitting(false);
          }
        },
        prefill: {
          name: formData.contactName,
          email: formData.email,
          contact: formData.mobileNumber
        },
        theme: { color: "#1E40AF" }
      };

      if (orderData.key_id === 'rzp_test_dummy') {
        options.handler({
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_order_id: orderData.id,
          razorpay_signature: "mock_signature"
        });
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error(`Payment Failed: ${response.error.description}`);
        setIsSubmitting(false);
      });
      rzp.open();
    } catch (error) {
      toast.error("Error initiating payment.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900">
            Pay & Play
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your casual archery sessions and bookings.
          </p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'bookings' 
                ? 'bg-white text-brand-navy shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Bookings
          </button>
          <button
            onClick={() => setActiveTab('book_new')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'book_new' 
                ? 'bg-white text-brand-navy shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Book New Session
          </button>
        </div>
      </div>

      {/* Bookings List Tab */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-10 text-center text-gray-500">Loading your bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Ticket className="w-8 h-8 text-brand-blue" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Sessions Booked</h3>
              <p className="text-gray-500 mb-6 max-w-sm">You haven't booked any Pay & Play sessions yet. Book one to start shooting!</p>
              <button 
                onClick={() => setActiveTab('book_new')}
                className="bg-brand-navy text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-900 transition-colors"
              >
                Book Your First Session
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-bold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Package</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{booking.date}</div>
                        <div className="text-xs text-brand-blue">{booking.timeSlot}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">{booking.packageType}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-700">
                          {booking.bookingType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        ₹{booking.totalPrice}
                      </td>
                      <td className="px-6 py-4">
                        {booking.status === 'Confirmed' || booking.paymentStatus === 'Completed' ? (
                          <span className="flex items-center gap-1.5 text-green-600 font-bold text-xs bg-green-50 px-2.5 py-1 rounded-lg w-fit">
                            <CheckCircle className="w-3.5 h-3.5" /> Confirmed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-orange-600 font-bold text-xs bg-orange-50 px-2.5 py-1 rounded-lg w-fit">
                            <Clock className="w-3.5 h-3.5" /> {booking.paymentStatus}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Book New Session Tab */}
      {activeTab === 'book_new' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 font-outfit border-b border-gray-100 pb-4">
              Book a Pay & Play Session
            </h2>
            
            <form onSubmit={handleBooking} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Day Type Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Day</label>
                  <div className="flex gap-3">
                    {['Weekday', 'Weekend'].map(type => (
                      <div 
                        key={type}
                        onClick={() => handleInputChange({ target: { name: 'dayType', value: type }})}
                        className={`flex-1 py-3 text-center rounded-xl cursor-pointer text-sm font-bold border transition-all ${
                          formData.dayType === type ? "bg-blue-50 border-brand-blue text-brand-blue" : "bg-white border-gray-200 text-gray-600 hover:border-blue-200"
                        }`}
                      >
                        {type}s
                      </div>
                    ))}
                  </div>
                </div>

                {/* Booking Type */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Booking Type</label>
                  <div className="flex gap-3">
                    {['Single', 'Shared'].map(bType => (
                      <div 
                        key={bType}
                        onClick={() => handleInputChange({ target: { name: 'bookingType', value: bType }})}
                        className={`flex-1 py-3 text-center rounded-xl cursor-pointer text-sm font-bold border transition-all ${
                          formData.bookingType === bType ? "bg-brand-navy border-brand-navy text-white" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {bType}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Package Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Package</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.keys(pricing[formData.dayType]).map((type) => (
                    <div 
                      key={type}
                      onClick={() => handleInputChange({ target: { name: 'packageType', value: type }})}
                      className={`p-4 rounded-xl cursor-pointer border transition-all ${
                        formData.packageType === type ? "bg-blue-50/50 border-brand-blue shadow-sm" : "bg-white border-gray-200 hover:border-blue-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Target className={`w-5 h-5 ${formData.packageType === type ? 'text-brand-blue' : 'text-gray-400'}`} />
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${formData.packageType === type ? 'border-brand-blue' : 'border-gray-300'}`}>
                          {formData.packageType === type && <div className="w-2 h-2 bg-brand-blue rounded-full" />}
                        </div>
                      </div>
                      <span className={`font-bold text-sm ${formData.packageType === type ? "text-brand-navy" : "text-gray-700"}`}>
                        {type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Date</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-blue z-10 pointer-events-none">
                      <Calendar className="w-4 h-4" />
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
                        const day = date.getDay();
                        if (formData.dayType === 'Weekday') {
                          return day !== 0 && day !== 6;
                        } else {
                          return day === 0 || day === 6;
                        }
                      }}
                      minDate={new Date()}
                      placeholderText="Select a date"
                      required
                      dateFormat="yyyy-MM-dd"
                      wrapperClassName="w-full"
                      customInput={
                        <input 
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-900 outline-none focus:border-brand-blue"
                        />
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Time Slot</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-blue z-10 pointer-events-none">
                      <Clock className="w-4 h-4" />
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
                        const hour = time.getHours();
                        if (formData.dayType === 'Weekday') {
                          return hour >= 6 && hour <= 8;
                        } else {
                          return (hour >= 6 && hour <= 8) || (hour >= 16 && hour <= 17);
                        }
                      }}
                      required
                      wrapperClassName="w-full"
                      customInput={
                        <input 
                          value={formData.timeSlot || ""}
                          readOnly
                          placeholder="Select Time"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-900 outline-none focus:border-brand-blue cursor-pointer"
                        />
                      }
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-navy hover:bg-blue-900 text-white py-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Processing Payment..." : <>Complete Booking & Pay ₹{totalPrice} <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </div>

          {/* Pricing Summary Sidebar */}
          <div className="bg-brand-navy rounded-2xl p-6 text-white h-fit shadow-xl shadow-brand-navy/20 relative overflow-hidden">
            <Target className="absolute -top-10 -right-10 w-48 h-48 text-white/5 pointer-events-none" />
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              <CreditCard className="w-5 h-5 text-brand-blue" /> Summary
            </h3>
            
            <div className="space-y-4 text-sm text-gray-300 relative z-10">
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                <span>Account</span>
                <span className="font-bold text-white truncate max-w-[150px]">{formData.email}</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                <span>Package</span>
                <span className="font-bold text-white truncate max-w-[120px]">{formData.packageType}</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                <span>Type</span>
                <span className="font-bold text-white">{formData.bookingType}</span>
              </div>
              {formData.date && (
                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-brand-blue/30">
                  <span>Schedule</span>
                  <span className="font-bold text-brand-blue text-right">
                    {formData.date}<br/>
                    <span className="text-xs">{formData.timeSlot}</span>
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-end relative z-10">
              <span className="text-gray-400 font-bold text-xs uppercase">Total Payable</span>
              <span className="text-3xl font-bold text-white">₹{totalPrice}</span>
            </div>
            
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-brand-blue bg-white/5 py-2 rounded-lg relative z-10 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure Checkout
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPayAndPlay;
