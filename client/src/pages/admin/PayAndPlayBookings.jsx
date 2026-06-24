import React, { useState, useEffect } from "react";
import { Search, Loader2, Settings, X, Plus, Trash2 } from "lucide-react";
import { getPayAndPlayBookings, getPayAndPlaySettings, updatePayAndPlaySettings } from "../../services/payAndPlayService";
import { formatDate } from "../../utils/dateFormatter";
import toast from "react-hot-toast";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";

const PayAndPlayBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsData, setSettingsData] = useState({ weekdaySlots: [], weekendSlots: [] });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleOpenSettings = async () => {
    setShowSettingsModal(true);
    setSettingsLoading(true);
    try {
      const data = await getPayAndPlaySettings();
      setSettingsData({
        weekdaySlots: data.weekdaySlots || [],
        weekendSlots: data.weekendSlots || []
      });
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await updatePayAndPlaySettings(settingsData);
      toast.success("Settings updated successfully!");
      setShowSettingsModal(false);
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const addSlot = (type) => {
    setSettingsData(prev => ({
      ...prev,
      [type]: [...prev[type], { startHour: 6, endHour: 9 }]
    }));
  };

  const removeSlot = (type, index) => {
    setSettingsData(prev => {
      const newSlots = [...prev[type]];
      newSlots.splice(index, 1);
      return { ...prev, [type]: newSlots };
    });
  };

  const updateSlot = (type, index, field, value) => {
    setSettingsData(prev => {
      const newSlots = [...prev[type]];
      newSlots[index] = { ...newSlots[index], [field]: parseInt(value) };
      return { ...prev, [type]: newSlots };
    });
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getPayAndPlayBookings();
      setBookings(data);
    } catch (error) {
      toast.error("Failed to fetch bookings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.mobileNumber.includes(searchTerm);
    
    const currentStatus = booking.paymentStatus || 'Pending';
    const matchesStatus = filterStatus === "All" || currentStatus === filterStatus;
    
    const matchesDate = filterDate ? booking.date === filterDate : true;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const { currentData: paginatedBookings, currentPage, totalPages, next, prev, itemsPerPage } = usePagination(filteredBookings);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-outfit text-gray-900">
          Pay and Play Bookings
        </h1>
        <button 
          onClick={handleOpenSettings}
          className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-lg hover:bg-brand-blue transition-colors font-outfit"
        >
          <Settings size={18} /> Manage Timings
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue font-outfit"
            />
          </div>
          <div className="flex gap-4">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue font-outfit text-sm text-gray-700 bg-white"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue font-outfit text-sm text-gray-700 bg-white"
            >
              <option value="All">All Payments</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-outfit tracking-wider">
              <tr>
                <th className="px-6 py-4">SL NO</th>
                <th className="px-6 py-4">Booked On</th>
                <th className="px-6 py-4">Booked Slot</th>
                <th className="px-6 py-4">Contact Person</th>
                <th className="px-6 py-4">Package Details</th>
                <th className="px-6 py-4">Total Price</th>
                <th className="px-6 py-4">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <Loader2 className="w-8 h-8 text-brand-blue animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500 font-outfit">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((booking, index) => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 font-outfit">
                        {formatDate(booking.createdAt)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 font-outfit">
                        {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-brand-navy font-outfit">
                        {formatDate(booking.date)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 font-outfit">
                        {booking.timeSlot} <span className="text-xs">({booking.dayType})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 font-outfit flex flex-col gap-1">
                        <span>{booking.contactName}</span>
                        <span className="text-xs text-gray-500">{booking.email}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1 font-outfit">
                        {booking.mobileNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-brand-navy font-outfit">
                        {booking.packageType}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 font-outfit">
                        {booking.bookingType} Booking
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900 font-outfit text-lg">
                        ₹{booking.totalPrice}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            booking.paymentStatus === "Completed"
                              ? "bg-green-100 text-green-700"
                              : booking.paymentStatus === "Failed"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {booking.paymentStatus || 'Pending'}
                        </span>
                        {booking.razorpayPaymentId && (
                          <span className="text-[10px] text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200 truncate max-w-[150px]" title={booking.razorpayPaymentId}>
                            {booking.razorpayPaymentId}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredBookings.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} next={next} prev={prev} />}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold font-outfit text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-brand-blue" />
                Pay & Play Timings Settings
              </h2>
              <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              {settingsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
                </div>
              ) : (
                <div className="space-y-8">
                  {['weekdaySlots', 'weekendSlots'].map((slotType) => (
                    <div key={slotType} className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold font-outfit text-gray-800 capitalize">
                          {slotType === 'weekdaySlots' ? 'Weekday Timings' : 'Weekend Timings'}
                        </h3>
                        <button 
                          onClick={() => addSlot(slotType)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 text-sm font-medium rounded-md text-brand-blue hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={16} /> Add Range
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {settingsData[slotType].length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No time slots defined. Bookings will be closed.</p>
                        ) : (
                          settingsData[slotType].map((slot, index) => (
                            <div key={index} className="flex items-center gap-4 bg-white p-3 rounded border border-gray-200 shadow-sm">
                              <div className="flex-1 flex items-center gap-2">
                                <span className="text-sm text-gray-500 font-medium w-12">From</span>
                                <select 
                                  value={slot.startHour}
                                  onChange={(e) => updateSlot(slotType, index, 'startHour', e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none"
                                >
                                  {[...Array(24)].map((_, i) => (
                                    <option key={i} value={i}>{`${i.toString().padStart(2, '0')}:00`}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex-1 flex items-center gap-2">
                                <span className="text-sm text-gray-500 font-medium w-8">To</span>
                                <select 
                                  value={slot.endHour}
                                  onChange={(e) => updateSlot(slotType, index, 'endHour', e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-brand-blue/20 outline-none"
                                >
                                  {[...Array(25)].map((_, i) => (
                                    <option key={i} value={i}>{`${i.toString().padStart(2, '0')}:00`}</option>
                                  ))}
                                </select>
                              </div>
                              <button 
                                onClick={() => removeSlot(slotType, index)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
                                title="Remove time range"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveSettings}
                disabled={savingSettings || settingsLoading}
                className="px-5 py-2.5 text-sm font-medium text-white bg-brand-navy rounded-lg hover:bg-brand-blue flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {savingSettings && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayAndPlayBookings;
