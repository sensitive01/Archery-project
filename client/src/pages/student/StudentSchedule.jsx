import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, ArrowRight } from "lucide-react";
import { getStudent } from "../../services/userService";

const getISTDateString = (dateInput) => {
  if (!dateInput) return "";
  const dateObj = new Date(dateInput);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(dateObj);
};

// Helper to parse schedule string into array of weekday numbers (0=Sunday)
const parseScheduleDays = (scheduleStr) => {
  if (!scheduleStr) return [];
  const daysMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  return scheduleStr
    .split(/[,;]+/)
    .map((d) => d.trim().toLowerCase())
    .map((d) => daysMap[d])
    .filter((d) => d !== undefined);
};

// Generate upcoming session dates based on total classes and scheduled weekdays
const generateSessionDates = (total, scheduleDays, start = new Date()) => {
  const dates = [];
  let cur = new Date(start);
  // start from today (midnight)
  cur.setHours(0, 0, 0, 0);
  while (dates.length < total) {
    const wd = cur.getDay();
    if (scheduleDays.includes(wd)) {
      dates.push(cur.toISOString().substring(0, 10));
    }
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
};

const StudentSchedule = () => {
  const { user } = useAuth();
  const enrolledPrograms = user?.enrolledPrograms || [];
  const [attendanceList, setAttendanceList] = useState([]);
  const [batchData, setBatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      loadAttendance();
    }
  }, [user]);

  const loadAttendance = async () => {
    try {
      const data = await getStudent(user._id);
      if (data) {
        if (data.attendance) {
          setAttendanceList(data.attendance);
        }
        if (data.batch) {
          setBatchData(data.batch);
          console.log('Fetched batchData:', data.batch);
        }
      }
    } catch (err) {
      console.error("Failed to load schedule data:", err);
    } finally {
      setLoading(false);
    }
  };

  const todayStr = getISTDateString(new Date());

  const allSessions = (batchData?.sessionDates || []).map((sessionDate, idx) => {
    const session = idx + 1;
    const attRecord = attendanceList.find((att) => {
      if (!att.date) return false;
      return getISTDateString(att.date) === getISTDateString(sessionDate);
    });
    const status = attRecord ? attRecord.status : "unattended";
    
    return {
      session,
      sessionDate,
      status,
      isPast: getISTDateString(sessionDate) < todayStr || status === "present" || status === "absent" || status === "late"
    };
  });

  // Helper calculations (based on scheduled sessions only)
  const presentCount = allSessions.filter(s => s.status === 'present').length;
  const absentCount = allSessions.filter(s => s.status === 'absent').length;
  const lateCount = allSessions.filter(s => s.status === 'late').length;
  const totalClasses = allSessions.length;
  const remainingCount = totalClasses - (presentCount + absentCount + lateCount);

  const upcomingSessions = allSessions.filter(s => !s.isPast);
  const completedSessions = allSessions.filter(s => s.isPast);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900">
            My Class Schedule
          </h1>
          <p className="text-gray-500">
            Track your classes, view your attendance status, and check upcoming range sessions.
          </p>
        </div>
      </div>

      {enrolledPrograms.length > 0 ? (
        <div className="grid gap-6">
          {/* Attendance Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 font-bold shrink-0">
                P
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Present</span>
                <span className="text-xl font-black text-gray-900 leading-none">{presentCount} Days</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-bold shrink-0">
                A
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Absent</span>
                <span className="text-xl font-black text-gray-900 leading-none">{absentCount} Days</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold shrink-0">
                L
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Late</span>
                <span className="text-xl font-black text-gray-900 leading-none">{lateCount} Days</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 font-bold shrink-0">
                R
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Remaining</span>
                <span className="text-xl font-black text-gray-900 leading-none">{remainingCount} Classes</span>
              </div>
            </div>
          </div>

          {enrolledPrograms.map((program, index) => {
            const hasBatchDetails = batchData && (batchData.program?._id === program._id || batchData.program === program._id);
            const scheduleText = hasBatchDetails && batchData.time
              ? `${batchData.time} (${batchData.days?.join(', ') || ''})`
              : program.schedule;
            const locationText = hasBatchDetails ? batchData.location : null;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-bold text-gray-900">
                        {program.title}
                      </h2>
                      <span className="bg-brand-blue/10 text-brand-blue text-xs font-bold px-2 py-1 rounded-md uppercase">
                        {program.level}
                      </span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-600 mt-2">
                      {scheduleText && (
                        <span className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                          <span>{scheduleText}</span>
                        </span>
                      )}
                      {locationText && (
                        <span className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
                          <span>{locationText}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              {/* Upcoming Sessions */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-blue animate-pulse"></span>
                  Upcoming Sessions ({upcomingSessions.length})
                </h3>
                {upcomingSessions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingSessions.map((s) => {
                      const dateStr = getISTDateString(s.sessionDate);
                      const parts = dateStr.split("-");
                      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                      const monthShort = parts.length === 3 ? monthNames[parseInt(parts[1], 10) - 1] : "";
                      const dayNum = parts.length === 3 ? parseInt(parts[2], 10) : "";
                      return (
                        <div
                          key={s.sessionDate}
                          className="rounded-xl p-4 flex gap-4 items-center border border-gray-200 bg-gray-50/50 text-gray-600 transition-all hover:bg-white hover:shadow-sm"
                        >
                          <div className="bg-white w-12 h-12 rounded-lg flex flex-col items-center justify-center border border-gray-200 shadow-sm shrink-0">
                            <span className="text-xs font-bold text-gray-400">{monthShort}</span>
                            <span className="text-lg font-bold text-brand-navy">{dayNum}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900 text-sm">Session {s.session}</p>
                              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded uppercase ml-auto">Unattended</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">5:00 PM - 6:30 PM</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">No upcoming classes scheduled.</p>
                )}
              </div>

              {/* Completed/Past Sessions */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  Completed/Past Sessions ({completedSessions.length})
                </h3>
                {completedSessions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedSessions.map((s) => {
                      const dateStr = getISTDateString(s.sessionDate);
                      const parts = dateStr.split("-");
                      const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
                      const monthShort = parts.length === 3 ? monthNames[parseInt(parts[1], 10) - 1] : "";
                      const dayNum = parts.length === 3 ? parseInt(parts[2], 10) : "";
                      
                      let cardStyle = "bg-gray-50/50 border-gray-200 text-gray-400";
                      let statusBadge = (
                        <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded uppercase ml-auto">Unattended</span>
                      );
                      
                      if (s.status === "present") {
                        cardStyle = "bg-green-50/70 border-green-300 text-green-800 ring-1 ring-green-300/50 shadow-sm";
                        statusBadge = (
                          <span className="text-[10px] font-bold text-white bg-green-600 px-2 py-0.5 rounded uppercase ml-auto">Present</span>
                        );
                      } else if (s.status === "absent") {
                        cardStyle = "bg-red-50/70 border-red-300 text-red-800 ring-1 ring-red-300/50 shadow-sm";
                        statusBadge = (
                          <span className="text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded uppercase ml-auto">Absent</span>
                        );
                      } else if (s.status === "late") {
                        cardStyle = "bg-amber-50/70 border-amber-300 text-amber-800 ring-1 ring-amber-300/50 shadow-sm";
                        statusBadge = (
                          <span className="text-[10px] font-bold text-white bg-amber-500 px-2 py-0.5 rounded uppercase ml-auto">Late</span>
                        );
                      }
                      
                      return (
                        <div
                          key={s.sessionDate}
                          className={`rounded-xl p-4 flex gap-4 items-center border transition-all ${cardStyle}`}
                        >
                          <div className="bg-white w-12 h-12 rounded-lg flex flex-col items-center justify-center border border-gray-200 shadow-sm shrink-0">
                            <span className="text-xs font-bold text-gray-400">{monthShort}</span>
                            <span className="text-lg font-bold text-brand-navy">{dayNum}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900 text-sm">Session {s.session}</p>
                              {statusBadge}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">5:00 PM - 6:30 PM</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">No completed classes yet.</p>
                )}
              </div>

            </div>
          );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            No Scheduled Classes
          </h2>
          <p className="text-gray-500 mb-6">
            Enroll in a program to see your weekly schedule.
          </p>
          <Link
            to="/programs"
            className="px-6 py-2 bg-brand-navy text-white rounded-lg font-bold hover:bg-gray-800 transition-colors"
          >
            Find a Program
          </Link>
        </div>
      )}
    </div>
  );
};

export default StudentSchedule;



