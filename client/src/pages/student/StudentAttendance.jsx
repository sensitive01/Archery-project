import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getStudent } from "../../services/userService";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
  Loader,
  X,
  ImageOff,
  User,
} from "lucide-react";
import { formatDate } from "../../utils/dateFormatter";

const StatusBadge = ({ status }) => {
  const map = {
    present: "bg-green-100 text-green-700 border-green-200",
    absent: "bg-red-100 text-red-700 border-red-200",
    late: "bg-amber-100 text-amber-700 border-amber-200",
  };
  const cls = map[status?.toLowerCase()] || "bg-gray-100 text-gray-600 border-gray-200";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${cls}`}>
      {status ? status.toUpperCase() : "UNATTENDED"}
    </span>
  );
};

const AttendanceDetailModal = ({ record, onClose }) => {
  if (!record) return null;

  const dateObj = record.date ? new Date(record.date) : null;
  const dateStr = dateObj
    ? dateObj.toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
    : "—";

  // Format checkInTime (stored as "HH:MM" in IST) to 12-hour AM/PM display
  let timeStr = "Not recorded";
  if (record.checkInTime) {
    const [h, m] = record.checkInTime.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    timeStr = `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
  }

  const isPresent = record.status === "present";
  const isLate = record.status === "late";
  const isAbsent = record.status === "absent";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(15,23,42,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        style={{ animation: "popIn 0.3s cubic-bezier(0.16,1,0.3,1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div
          className={`h-1.5 w-full ${
            isPresent ? "bg-green-500" : isLate ? "bg-amber-500" : "bg-red-500"
          }`}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 font-outfit text-lg">Attendance Details</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Photo */}
        <div className="mx-6 mt-5 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center" style={{ height: "200px" }}>
          {record.photo ? (
            <img
              src={record.photo}
              alt="Check-in selfie"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              {isPresent || isLate ? (
                <>
                  <ImageOff className="w-10 h-10" />
                  <span className="text-xs font-medium">No photo uploaded</span>
                </>
              ) : (
                <>
                  <User className="w-10 h-10" />
                  <span className="text-xs font-medium">Student was absent</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="px-6 py-5 space-y-3">
          {/* Status */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
            <StatusBadge status={record.status} />
          </div>

          {/* Date */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</span>
            <span className="text-sm font-bold text-gray-900">{dateStr}</span>
          </div>

          {/* Time */}
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Check-In Time</span>
            <span className="text-sm font-bold text-gray-900">{timeStr}</span>
          </div>

          {/* Remarks if any */}
          {record.remarks && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">Remarks</span>
              <span className="text-sm text-gray-700">{record.remarks}</span>
            </div>
          )}
        </div>

        {/* View full photo link */}
        {record.photo && (
          <div className="px-6 pb-5">
            <a
              href={record.photo}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-navy text-white text-sm font-bold hover:bg-blue-900 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Open Full Photo
            </a>
          </div>
        )}
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

const StudentAttendance = () => {
  const { user } = useAuth();
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await getStudent(user._id);
        if (data && data.attendance) {
          const sorted = [...data.attendance].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          setAttendanceList(sorted);
        }
      } catch (err) {
        console.error("Failed to load attendance:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchAttendance();
  }, [user]);

  const totalMarked = attendanceList.filter(
    (a) => a.status === "present" || a.status === "absent" || a.status === "late"
  ).length;
  const presentCount = attendanceList.filter((a) => a.status === "present").length;
  const absentCount = attendanceList.filter((a) => a.status === "absent").length;
  const lateCount = attendanceList.filter((a) => a.status === "late").length;
  const attendanceRate =
    totalMarked > 0 ? Math.round(((presentCount + lateCount) / totalMarked) * 100) : 0;

  const filteredAttendance = attendanceList.filter((record) => {
    if (activeTab === "All") return true;
    return record.status?.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="space-y-6">
      {/* Detail Modal */}
      {selectedRecord && (
        <AttendanceDetailModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold font-outfit text-gray-900">My Attendance</h1>
        <p className="text-gray-500 text-sm">Monitor your attendance rate and review session check-in logs.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24 text-brand-blue">
          <Loader className="animate-spin h-8 w-8 mr-2" />
          <span className="font-medium">Loading attendance history...</span>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-black shrink-0 text-sm">
                {attendanceRate}%
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Attendance Rate</span>
                <span className="text-lg font-black text-gray-950 leading-none">
                  {attendanceRate >= 80 ? "Excellent" : attendanceRate >= 50 ? "Good" : "Needs Focus"}
                </span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Present</span>
                <span className="text-xl font-black text-gray-900 leading-none">{presentCount} Days</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Absent</span>
                <span className="text-xl font-black text-gray-900 leading-none">{absentCount} Days</span>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Late</span>
                <span className="text-xl font-black text-gray-900 leading-none">{lateCount} Days</span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:flex-wrap gap-4 items-start sm:items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900 font-outfit">Attendance History</h3>
              <div className="flex flex-wrap gap-1">
                {["All", "Present", "Absent", "Late"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === tab
                        ? "bg-brand-navy text-white shadow-sm"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-sm text-left text-gray-500 min-w-[600px]">
                <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Session Date</th>
                    <th className="px-6 py-4 whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 whitespace-nowrap">Check-In Selfie</th>
                    <th className="px-6 py-4 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAttendance.length > 0 ? (
                    filteredAttendance.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={record.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {record.photo ? (
                            <img
                              src={record.photo}
                              alt="selfie"
                              className="w-9 h-9 rounded-lg object-cover border border-gray-200"
                            />
                          ) : (
                            <span className="text-xs text-gray-400 italic">No Photo</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-brand-blue hover:bg-blue-100 text-xs font-bold transition-colors border border-blue-100"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                        <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        <p className="font-medium text-sm">No attendance records found for "{activeTab}".</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentAttendance;
