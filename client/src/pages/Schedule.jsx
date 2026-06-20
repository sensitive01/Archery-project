import React, { useState, useEffect, useRef } from "react";
import { Calendar, Clock, MapPin, ArrowRight, Filter, ChevronRight, User, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getBatches } from "../services/batchService";
import { formatDate } from "../utils/dateFormatter";
import BannersDisplay from "../components/BannersDisplay";

const Schedule = () => {
  const [filter, setFilter] = useState("All");
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const batches = await getBatches();
        
        // Filter active batches: startDate+time has NOT passed by more than 1 hour yet
        const now = new Date();

        const activeBatches = batches.filter((batch) => {
          if (!batch.startDate) return false;
          const rawDate = new Date(batch.startDate);
          if (isNaN(rawDate.getTime())) return false;

          // Build the batch's start datetime using its date + time string (e.g. "8:00 AM")
          const startYear = rawDate.getUTCFullYear();
          const startMonth = rawDate.getUTCMonth();
          const startDay = rawDate.getUTCDate();

          // Parse the time string (e.g. "8:00 AM - 9:00 AM" → take first part "8:00 AM")
          let batchStartDateTime = new Date(startYear, startMonth, startDay);
          if (batch.time) {
            const timeStr = batch.time.split("-")[0].trim(); // "8:00 AM"
            const timeParts = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (timeParts) {
              let hours = parseInt(timeParts[1], 10);
              const minutes = parseInt(timeParts[2], 10);
              const period = timeParts[3].toUpperCase();
              if (period === "PM" && hours !== 12) hours += 12;
              if (period === "AM" && hours === 12) hours = 0;
              batchStartDateTime.setHours(hours, minutes, 0, 0);
            }
          }

          // Hide the batch if it started more than 1 hour ago
          const oneHourAfterStart = new Date(batchStartDateTime.getTime() + 60 * 60 * 1000);
          return now < oneHourAfterStart;
        });

        // Map database fields to the fields used by components
        const formattedBatches = activeBatches.map((batch) => ({
          time: batch.time,
          level: batch.level,
          type: batch.program?.title || batch.name,
          coach: batch.coach ? `${batch.coach.firstName} ${batch.coach.lastName}` : "TBA",
          spots: batch.capacity - (batch.students?.length || 0),
          capacity: batch.capacity,
          batchId: batch._id,
          programId: batch.program?._id || batch.program || "",
          startDate: batch.startDate,
          days: batch.days || [],
          location: batch.location,
        }));

        // Sort by startDate first, then by time
        formattedBatches.sort((a, b) => {
          const dateA = new Date(a.startDate);
          const dateB = new Date(b.startDate);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime();
          }
          return (a.time || "").localeCompare(b.time || "");
        });

        setScheduleData(formattedBatches);
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  const levels = ["All", "Beginner", "Intermediate", "Advanced", "Open"];

  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Outfit', sans-serif", color: '#1E40AF', backgroundColor: '#ffffff' }}>
     <div style={{ textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f1f5f9', borderTop: '4px solid #1E40AF', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
        <p style={{ fontWeight: '800', letterSpacing: '2px', fontSize: '12px' }}>CALIBRATING SLOTS...</p>
     </div>
     <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
  </div>;

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'Outfit', sans-serif", color: '#0F172A', overflowX: 'hidden' }}>
      <BannersDisplay placement="Schedule Page" position="Popup" />
      <div className="site-container">
        <BannersDisplay placement="Schedule Page" position="Top" />
      </div>
      
      {/* ================================================================ */}
      {/* 1. PREMIUM HEADER SECTION                                      */}
      {/* ================================================================ */}
      <section style={{ 
          position: 'relative',
          height: '60vh',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          textAlign: 'center', 
          color: 'white',
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(30, 64, 175, 0.5)), url('/ref-banner.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
      }}>
        <div style={{ animation: 'fadeInDown 0.8s ease' }}>
           <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3ABEF9', padding: '8px 20px', borderRadius: '4px', marginBottom: '30px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Calendar size={14} /> <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '4px' }}>TRAINING CALENDAR</span>
           </div>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: '900', margin: '15px 0', letterSpacing: '-1.5px' }}>SESSIONS & SLOTS</h1>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', maxWidth: '700px', margin: '0 auto' }}>Select your proficiency level to view the weekly high-performance schedule.</p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 2. FILTER & LEGEND BAR                                         */}
      {/* ================================================================ */}
      <section style={{ maxWidth: '1200px', margin: '-50px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
         <div style={{ 
             backgroundColor: 'white', 
             padding: 'clamp(20px, 5vw, 40px) clamp(20px, 5vw, 50px)', 
             borderRadius: '16px', 
             boxShadow: '0 40px 100px rgba(0,0,0,0.08)', 
             border: '1px solid #f1f5f9',
             display: 'flex',
             flexDirection: 'column',
             gap: '30px'
         }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <Filter size={20} color="#1E40AF" style={{ flexShrink: 0 }} />
                  <span style={{ fontWeight: '900', fontSize: '13px', letterSpacing: '1px' }}>FILTER BY SKILL LEVEL</span>
               </div>
               <div ref={dropdownRef} style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
                  <div 
                     onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                     style={{
                        width: '100%',
                        padding: '12px 25px',
                        borderRadius: '100px',
                        border: '2px solid #e2e8f0',
                        backgroundColor: '#f8fafc',
                        color: '#1E40AF',
                        fontWeight: '900',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                        userSelect: 'none'
                     }}
                  >
                     <span>{filter === 'All' ? 'ALL SKILL LEVELS' : filter.toUpperCase()}</span>
                     <ChevronRight size={18} style={{ transform: isDropdownOpen ? 'rotate(-90deg)' : 'rotate(90deg)', transition: 'transform 0.3s ease' }} />
                  </div>
                  
                  {isDropdownOpen && (
                     <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        marginTop: '10px',
                        backgroundColor: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                        border: '1px solid #e2e8f0',
                        overflow: 'hidden',
                        zIndex: 50,
                        display: 'flex',
                        flexDirection: 'column'
                     }}>
                        {levels.map((l) => (
                           <div 
                              key={l}
                              onClick={() => { setFilter(l); setIsDropdownOpen(false); }}
                              style={{ 
                                 padding: '14px 25px', 
                                 fontWeight: '800', 
                                 fontSize: '12px',
                                 color: filter === l ? '#1E40AF' : '#64748B',
                                 backgroundColor: filter === l ? '#f1f5f9' : 'transparent',
                                 cursor: 'pointer',
                                 borderBottom: '1px solid #f8fafc',
                                 transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => { if(filter !== l) e.currentTarget.style.backgroundColor = '#f8fafc' }}
                              onMouseLeave={(e) => { if(filter !== l) e.currentTarget.style.backgroundColor = 'transparent' }}
                           >
                              {l === 'All' ? 'ALL SKILL LEVELS' : l.toUpperCase()}
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
            
            <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />
            
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', fontSize: '11px', fontWeight: '800', color: '#94a3b8', flexWrap: 'wrap' }}>
               <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6', flexShrink: 0 }}></div> REGULAR SESSION</span>
               <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1E40AF', flexShrink: 0 }}></div> COMPETITION SLOTS</span>
               <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B', flexShrink: 0 }}></div> EVALUATION REQUIRED</span>
            </div>
         </div>
      </section>

      {/* ================================================================ */}
      {/* 3. STRUCTURED SCHEDULE GRID (RESPONSIVE)                       */}
      {/* ================================================================ */}
      <section className="site-container" style={{ margin: '100px auto', padding: '0 5%' }}>
         {(() => {
            const filteredBatches = scheduleData.filter((batch) => filter === "All" || batch.level === filter);
            if (filteredBatches.length === 0) {
               return (
                  <div style={{ textAlign: 'center', padding: '80px 40px', backgroundColor: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                     <Calendar size={48} color="#94a3b8" style={{ margin: '0 auto 20px' }} />
                     <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '10px' }}>No Active Batches Scheduled</h3>
                     <p style={{ color: '#64748B', fontSize: '15px' }}>There are currently no active batches listed for the selected level starting today or in the future.</p>
                  </div>
               );
            }
            return (
               <div style={{ animation: 'fadeInRight 0.5s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                     <div style={{ backgroundColor: '#1E40AF', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 20px rgba(30, 64, 175, 0.2)', flexShrink: 0 }}>
                        <Calendar size={24} />
                     </div>
                     <h2 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: '900', color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.5px' }}>ACTIVE TRAINING BATCHES</h2>
                     <div style={{ flexGrow: 1, height: '1px', backgroundColor: '#f1f5f9' }} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                     {filteredBatches.map((batch, idx) => (
                        <div key={batch.batchId} style={{ 
                            backgroundColor: 'white', 
                            padding: 'clamp(20px, 4vw, 30px)', 
                            borderRadius: '16px', 
                            border: '1px solid #e2e8f0', 
                            borderLeft: '4px solid #1E40AF',
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', 
                            gap: '30px',
                            alignItems: 'center',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 8px 30px rgba(0,0,0,0.04)',
                            boxSizing: 'border-box',
                            width: '100%',
                            minWidth: 0
                        }} 
                        onMouseEnter={(e) => { 
                           e.currentTarget.style.transform = 'translateY(-5px)'; 
                           e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.06)'; 
                           e.currentTarget.style.borderTopColor = '#1E40AF';
                           e.currentTarget.style.borderRightColor = '#1E40AF';
                           e.currentTarget.style.borderBottomColor = '#1E40AF';
                        }}
                        onMouseLeave={(e) => { 
                           e.currentTarget.style.transform = 'translateY(0)'; 
                           e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.01)'; 
                           e.currentTarget.style.borderTopColor = '#f1f5f9';
                           e.currentTarget.style.borderRightColor = '#f1f5f9';
                           e.currentTarget.style.borderBottomColor = '#f1f5f9';
                        }}
                        >
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <div style={{ fontSize: '18px', fontWeight: '900', color: '#1E40AF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                 <Clock size={18} /> {batch.time}
                              </div>
                              <div style={{ fontSize: '14px', fontWeight: '800', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                 <Calendar size={16} style={{ color: '#94A3B8' }} /> {batch.days ? batch.days.join(", ") : ""}
                              </div>
                              <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '1px', textTransform: 'uppercase' }}>LOCAL TIME & DAYS</span>
                           </div>
                           
                           <div className="card-middle">
                              <h3 style={{ fontSize: '18px', fontWeight: '900', margin: '0 0 12px', color: '#0F172A' }}>{batch.type}</h3>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                 <span style={{ fontSize: '11px', fontWeight: '900', backgroundColor: '#eff6ff', color: '#1E40AF', padding: '4px 12px', borderRadius: '100px', letterSpacing: '1px' }}>{batch.level ? batch.level.toUpperCase() : ""}</span>
                                 {batch.startDate && (
                                     <span style={{ fontSize: '11px', fontWeight: '900', backgroundColor: '#ecfdf5', color: '#047857', padding: '4px 12px', borderRadius: '100px', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Calendar size={12} /> STARTS: {formatDate(batch.startDate)}
                                     </span>
                                 )}
                                 {batch.days && batch.days.length > 0 && (
                                    <span style={{ fontSize: '11px', fontWeight: '900', backgroundColor: '#f5f3ff', color: '#6d28d9', padding: '4px 12px', borderRadius: '100px', letterSpacing: '1px' }}>
                                       {batch.days.length} {batch.days.length === 1 ? 'CLASS' : 'CLASSES'} / WEEK
                                    </span>
                                 )}
                              </div>

                              {/* 3. Coach & Location Details */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', minWidth: 0 }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '14px', fontWeight: '600', minWidth: 0 }}>
                                    <User size={16} color="#94a3b8" style={{ flexShrink: 0 }} /> Coach: <span style={{ color: '#0F172A' }}>{batch.coach}</span>
                                 </div>
                                 {batch.location ? (
                                    <a 
                                       href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(batch.location)}`}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       style={{ 
                                          fontSize: '14px', 
                                          fontWeight: '600', 
                                          color: '#c2410c', 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          gap: '8px',
                                          textDecoration: 'none',
                                          transition: 'all 0.2s',
                                          width: '100%',
                                          minWidth: 0
                                       }}
                                       onMouseEnter={(e) => { e.currentTarget.style.color = '#9a3412'; e.currentTarget.style.textDecoration = 'underline'; }}
                                       onMouseLeave={(e) => { e.currentTarget.style.color = '#c2410c'; e.currentTarget.style.textDecoration = 'none'; }}
                                       title={batch.location}
                                    >
                                       <MapPin size={16} style={{ flexShrink: 0 }} /> 
                                       <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{batch.location}</span>
                                    </a>
                                 ) : (
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#64748B', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                       <MapPin size={16} style={{ flexShrink: 0 }} /> RANGE ALPHA
                                    </span>
                                 )}
                              </div>
                           </div>

                           <div className="card-right">
                              <div style={{ marginBottom: '20px' }}>
                                 <div style={{ fontSize: '13px', fontWeight: '800', color: batch.spots > 0 ? '#0F172A' : '#ef4444', marginBottom: '8px' }}>
                                    {batch.spots > 0 ? `${batch.spots} SLOTS REMAINING` : 'FULLY BOOKED'}
                                 </div>
                                 <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                                    <div style={{ width: `${(1 - batch.spots / batch.capacity) * 100}%`, height: '100%', backgroundColor: batch.spots > 0 ? '#1E40AF' : '#ef4444', transition: 'width 1s ease' }}></div>
                                 </div>
                              </div>
                              <Link to={`/register?programId=${batch.programId}&batchId=${batch.batchId}`} style={{ 
                                  backgroundColor: batch.spots > 0 ? '#1E40AF' : '#f1f5f9', 
                                  color: batch.spots > 0 ? 'white' : '#94a3b8', 
                                  padding: '12px 35px', 
                                  borderRadius: '6px', 
                                  textDecoration: 'none', 
                                  fontWeight: '900', 
                                  fontSize: '12px', 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '10px',
                                  transition: 'all 0.3s'
                              }}>
                                 {batch.spots > 0 ? 'ENROLL NOW' : 'WAITLIST'} <ChevronRight size={16} />
                              </Link>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            );
         })()}
      </section>

      {/* ================================================================ */}
      {/* 4. PERFORMANCE NOTICE                                         */}
      {/* ================================================================ */}
      <section style={{ backgroundColor: '#f8fafc', padding: '100px 40px', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
         <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ color: '#1E40AF', marginBottom: '25px' }}><Info size={48} style={{ margin: '0 auto' }} /></div>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', marginBottom: '20px' }}>SESSION PROTOCOLS</h2>
            <p style={{ color: '#64748B', fontSize: '15px', lineHeight: '1.7', marginBottom: '35px' }}>
               All sessions start promptly at the designated time. Archers are required to arrive 15 minutes early for technical calibration and muscle activation routines. Safety orientation is mandatory for all first-time visitors.
            </p>
            <Link to="/contact" style={{ color: '#1E40AF', fontWeight: '900', textDecoration: 'none', fontSize: '15px', borderBottom: '2px solid #1E40AF', paddingBottom: '5px' }}>ENQUIRE ABOUT PRIVATE COACHING HOURS</Link>
         </div>
      </section>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @media (min-width: 800px) {
          .card-middle {
            border-left: 1px solid #f1f5f9;
            padding-left: 40px;
          }
          .card-right {
            text-align: right;
          }
        }
        @media (max-width: 799px) {
          .card-middle {
            border-left: none;
            padding-left: 0;
          }
          .card-right {
            text-align: left;
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
          }
        }
      `}</style>
      <div className="site-container">
        <BannersDisplay placement="Schedule Page" position="Bottom" />
      </div>
    </div>
  );
};

export default Schedule;
