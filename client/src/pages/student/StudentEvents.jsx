import React, { useState, useEffect } from 'react';
import { useAuth } from "../../context/AuthContext";
import { getEvents, enrollInEvent } from "../../services/eventService";
import { Calendar, Users, MapPin, CheckCircle, Ticket, Clock, Target } from 'lucide-react';
import toast from 'react-hot-toast';

const formatTime = (timeString) => {
   if (!timeString) return '';
   const [hours, minutes] = timeString.split(':');
   const hour = parseInt(hours, 10);
   const ampm = hour >= 12 ? 'PM' : 'AM';
   const formattedHour = hour % 12 || 12;
   return `${formattedHour}:${minutes} ${ampm}`;
};

const StudentEvents = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my_events'); // 'my_events' or 'upcoming'
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollingEventId, setEnrollingEventId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async (event) => {
    if (!user) return;
    setEnrollingEventId(event._id);
    try {
      const formData = {
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || "",
        email: user.email,
        mobile: user.mobileNumber || user.mobile || ""
      };
      const res = await enrollInEvent(event._id, formData);
      if (res.ok) {
        toast.success(res.data.message || "Successfully enrolled!");
        fetchEvents();
      } else {
        toast.error(res.data.message || "Failed to enroll");
      }
    } catch (error) {
      toast.error("An error occurred during enrollment");
    } finally {
      setEnrollingEventId(null);
    }
  };

  const myEvents = events.filter(e => e.enrollments?.some(en => en.email === user?.email));
  const upcomingEvents = events;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900">Events</h1>
          <p className="text-gray-500 text-sm">Manage your event enrollments and discover upcoming tournaments.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('my_events')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'my_events' 
                ? 'bg-white text-brand-navy shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Enrollments
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'upcoming' 
                ? 'bg-white text-brand-navy shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Upcoming Events
          </button>
        </div>
      </div>

      {activeTab === 'my_events' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="p-10 text-center text-gray-500">Loading your enrollments...</div>
          ) : myEvents.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Ticket className="w-8 h-8 text-brand-blue" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No Event Enrollments</h3>
              <p className="text-gray-500 mb-6 max-w-sm">You haven't enrolled in any upcoming events yet.</p>
              <button 
                onClick={() => setActiveTab('upcoming')}
                className="bg-brand-navy text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-900 transition-colors"
              >
                Browse Upcoming Events
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 text-xs uppercase font-bold border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Event Details</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myEvents.map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{event.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                           <MapPin size={12} /> {event.location || 'Main Arena'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{new Date(event.date).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-500">{formatTime(event.time)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-200 flex items-center w-max gap-1">
                          <CheckCircle className="w-3 h-3" /> Enrolled
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'upcoming' && (
        <div>
          {isLoading ? (
            <div className="p-10 text-center text-gray-500">Loading events...</div>
          ) : upcomingEvents.length === 0 ? (
             <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                 <Calendar className="w-8 h-8 text-gray-400" />
               </div>
               <h3 className="text-lg font-bold text-gray-900 mb-2">No Upcoming Events</h3>
               <p className="text-gray-500 max-w-sm">There are no new events available for enrollment at the moment. Check back later!</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingEvents.map((event) => {
                const isFull = event.enrollments?.length >= event.maxParticipants;
                const isEnrolled = event.enrollments?.some(en => en.email === user?.email);
                
                // Properly handle both relative paths and absolute Cloudinary URLs
                const imageUrl = event.image 
                  ? (event.image.startsWith('http') ? event.image : `http://localhost:5001${event.image}`) 
                  : null;

                return (
                  <div key={event._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
                     {/* Image Section */}
                     <div className="relative h-56 w-full bg-gray-900 overflow-hidden border-b border-gray-100 flex items-center justify-center">
                        {imageUrl ? (
                           <>
                              {/* Blurred Background to fill gaps */}
                              <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover blur-xl opacity-60 scale-110 group-hover:scale-125 transition-transform duration-700" />
                              {/* Foreground Uncropped Image */}
                              <img src={imageUrl} alt={event.name} className="relative z-10 w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500 drop-shadow-2xl" />
                           </>
                        ) : (
                           <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 opacity-90 group-hover:scale-105 transition-transform duration-500"></div>
                        )}
                        
                        {/* Overlay gradient for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>
                        
                        {/* Date Badge */}
                        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur shadow-md rounded-xl p-2 flex flex-col items-center justify-center min-w-[3.5rem] border border-white/20 z-30">
                           <span className="text-[10px] font-bold text-[#e63946] uppercase tracking-wider">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                           <span className="text-xl font-black text-gray-900 leading-none mt-0.5">{new Date(event.date).getDate()}</span>
                        </div>
                        
                        {/* Status Badge */}
                        {isEnrolled && (
                           <div className="absolute top-4 right-4 bg-[#10b981] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 z-30">
                              <CheckCircle size={14} /> Enrolled
                           </div>
                        )}
                     </div>

                     <div className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#1E40AF] transition-colors">{event.name}</h3>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4 font-medium">
                           <div className="flex items-center gap-1.5 bg-blue-50/50 text-blue-700 px-2.5 py-1 rounded-lg">
                              <Clock size={15} />
                              {formatTime(event.time)}
                           </div>
                           <div className="flex items-center gap-1.5 bg-red-50/50 text-red-700 px-2.5 py-1 rounded-lg">
                              <MapPin size={15} />
                              {event.location || 'Main Arena'}
                           </div>
                        </div>
                        
                        <p className="text-sm text-gray-500 mb-6 flex-grow leading-relaxed">{event.description}</p>
                        
                        <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-auto">
                           <div className={`flex items-center gap-2 text-sm font-bold ${isFull && !isEnrolled ? 'text-red-500' : 'text-gray-700'}`}>
                              <div className={`p-1.5 rounded-lg ${isFull && !isEnrolled ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>
                                 <Users size={16} />
                              </div>
                              {event.enrollments?.length || 0} / {event.maxParticipants} <span className="font-medium text-gray-400">Spots</span>
                           </div>
                           
                           {!isEnrolled ? (
                              <button
                                 onClick={() => handleEnroll(event)}
                                 disabled={isFull || enrollingEventId === event._id}
                                 className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                                    isFull 
                                       ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                       : 'bg-[#1E40AF] text-white hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-900/20 active:scale-95'
                                 }`}
                              >
                                 {enrollingEventId === event._id ? 'Enrolling...' : isFull ? 'Event Full' : 'Enroll Now'}
                              </button>
                           ) : (
                              <div className="px-5 py-2 rounded-xl font-bold text-sm bg-green-50 text-green-600 border border-green-100 flex items-center gap-2">
                                 <CheckCircle size={16} /> Joined
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentEvents;
