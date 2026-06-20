import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils/dateFormatter";
import {
  Calendar,
  TrendingUp,
  Award,
  User,
  Clock,
  AlertCircle,
  Loader,
  Target,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import BannersDisplay from "../components/BannersDisplay";

// Helper to calculate attendance percentage
const calculateAttendance = (attendance = []) => {
  const marked = attendance.filter((a) => a.status === "present" || a.status === "absent" || a.status === "late");
  if (!marked.length) return 100;
  const present = marked.filter((a) => a.status === "present").length;
  // If late counts as present, add that too. assuming late is present.
  const late = marked.filter((a) => a.status === "late").length;
  return Math.round(((present + late) / marked.length) * 100);
};

// Helper to calculate average score
const calculateAvgScore = (scores = []) => {
  if (!scores.length) return 0;
  const total = scores.reduce((acc, curr) => acc + (curr.score || 0), 0);
  return Math.round(total / scores.length);
};

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading || !user)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="w-8 h-8 animate-spin text-brand-red" />
      </div>
    );

  const attendancePct = calculateAttendance(user.attendance);
  const avgScore = calculateAvgScore(user.performanceScores);
  const enrolledPrograms = user.enrolledPrograms || [];
  const recentScores = user.performanceScores
    ? [...user.performanceScores]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    : [];

  const stats = [
    {
      label: "Attendance Rate",
      value: `${attendancePct}%`,
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label: "Average Score",
      value: avgScore > 0 ? avgScore : "N/A",
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
    {
      label: "Active Programs",
      value: enrolledPrograms.length,
      icon: Award,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-24">
      <BannersDisplay placement="Student Dashboard" position="Popup" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BannersDisplay placement="Student Dashboard" position="Top" />
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="w-20 h-20 bg-brand-red/10 rounded-full flex items-center justify-center text-brand-red font-bold text-3xl shrink-0">
              {user.firstName?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-3xl font-bold font-outfit text-gray-900">
                Welcome, {user.firstName}!
              </h1>
              <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                  <User className="w-3.5 h-3.5" /> ID: {user.studentId || "N/A"}
                </span>
                <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                  <BookOpen className="w-3.5 h-3.5" />{" "}
                  {enrolledPrograms.length > 0
                    ? enrolledPrograms[0].level
                    : "Student"}{" "}
                  Level
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`bg-white p-6 rounded-2xl shadow-sm border ${stat.border} flex items-center gap-5 transition-transform hover:-translate-y-1 duration-300`}
            >
              <div
                className={`w-14 h-14 ${stat.bg} rounded-xl flex items-center justify-center ${stat.color} shadow-inner`}
              >
                <stat.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold text-gray-900 font-outfit">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Packages / Programs Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h2 className="text-xl font-bold font-outfit text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-brand-red" />
                  My Packages & Classes
                </h2>
                {/* <button className="text-brand-blue text-sm font-medium hover:underline">View All</button> */}
              </div>

              <div className="p-6">
                {enrolledPrograms.length > 0 ? (
                  <div className="space-y-4">
                    {enrolledPrograms.map((program, index) => (
                      <div
                        key={program._id || index}
                        className="group border border-gray-200 rounded-xl p-5 hover:border-brand-blue/30 hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50"
                      >
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-blue transition-colors">
                                {program.title}
                              </h3>
                              <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                Active
                              </span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                {program.schedule || "Schedule TBD"}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-gray-400" />
                                {program.level} Level
                              </p>
                            </div>
                          </div>

                          <button
                            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all flex items-center justify-center gap-2 group-hover:bg-brand-blue group-hover:text-white group-hover:border-transparent"
                            onClick={() => navigate("/myschedule")}
                          >
                            View Schedule <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      No Active Packages
                    </h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                      You haven't enrolled in any packages yet. Check out our
                      programs to get started.
                    </p>
                    <button
                      onClick={() => navigate("/programs")}
                      className="bg-brand-red text-white px-6 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-sm"
                    >
                      Browse Programs
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Performance History */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h2 className="text-xl font-bold font-outfit text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand-red" />
                  Performance History
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Distance</th>
                      <th className="px-6 py-4">Score</th>
                      <th className="px-6 py-4">Coach Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentScores.length > 0 ? (
                      recentScores.map((score, i) => (
                        <tr
                          key={i}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {formatDate(score.date)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {score.distance}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-brand-blue">
                            {score.score}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 italic">
                            "{score.notes}"
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-8 text-center text-gray-500 text-sm"
                        >
                          No performance records found yet. Keep practicing!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Upcoming Schedule Widget - Mocked for now if no specific class schedule in DB */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold font-outfit mb-5 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-red" /> Upcoming Classes
              </h2>
              <div className="space-y-4">
                {/* We map enrolled programs to a generic schedule since we don't have individual class sessions in DB yet */}
                {enrolledPrograms.length > 0 ? (
                  enrolledPrograms.map((prog, i) => (
                    <div
                      key={i}
                      className="flex gap-4 items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0"
                    >
                      <div className="bg-brand-red/5 w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 border border-brand-red/10">
                        <span className="text-[10px] text-brand-red font-bold uppercase">
                          Weekly
                        </span>
                        <Clock className="w-4 h-4 text-brand-red mt-1" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">
                          {prog.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {prog.schedule || "Check with coach"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No upcoming classes.</p>
                )}
              </div>
              <button
                onClick={() => navigate("/myschedule")}
                className="w-full mt-5 bg-gray-50 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200"
              >
                View Full Calendar
              </button>
            </div>

            {/* Promo / Motivation */}
            <div className="bg-gradient-to-br from-brand-blue to-blue-800 p-8 rounded-2xl shadow-lg text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Target className="w-32 h-32" />
              </div>
              <h3 className="font-bold text-xl mb-3 relative z-10">
                Competition Ready?
              </h3>
              <p className="text-blue-100 text-sm mb-6 relative z-10 leading-relaxed">
                The State Championship is coming up next month. Ensure your
                equipment is tuned and you're hitting your practice goals.
              </p>
              <button className="w-full bg-white text-brand-blue py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg relative z-10">
                Register for Event
              </button>
            </div>
          </div>
        </div>
        <BannersDisplay placement="Student Dashboard" position="Bottom" />
      </div>
    </div>
  );
};

export default Dashboard;
