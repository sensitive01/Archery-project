import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Award, TrendingUp, Target, Calendar } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { formatDate } from "../../utils/dateFormatter";
// You might need an API to fetch specific performance data if not in 'user' object or needs refresh
// import { getMyPerformance } from "../../services/studentService";

const StudentPerformance = () => {
  const { user } = useAuth();
  // Mock data for now if user.performanceScores is empty, otherwise map it
  const [scores, setScores] = useState([]);

  useEffect(() => {
    if (user && user.performanceScores) {
      // Sort by date
      const sorted = [...user.performanceScores].sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      );
      setScores(
        sorted.map((s) => ({
          date: formatDate(s.date),
          score: s.score,
          distance: s.distance,
          notes: s.notes,
        })),
      );
    } else {
      // Fallback mock data for visualization
      setScores([
        { date: "Jan 10", score: 240, distance: "18m" },
        { date: "Jan 17", score: 255, distance: "18m" },
        { date: "Jan 24", score: 250, distance: "30m" },
        { date: "Jan 31", score: 265, distance: "30m" },
      ]);
    }
  }, [user]);

  const averageScore =
    scores.length > 0
      ? Math.round(
          scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length,
        )
      : 0;

  const bestScore =
    scores.length > 0 ? Math.max(...scores.map((s) => s.score)) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-outfit text-gray-900">
          My Performance
        </h1>
        <p className="text-gray-500 text-sm">
          Track your progress and shooting scores.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-brand-blue">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Average Score</p>
            <h3 className="text-2xl font-bold text-gray-900">{averageScore}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Personal Best</p>
            <h3 className="text-2xl font-bold text-gray-900">{bestScore}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Progress</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {scores.length > 1
                ? scores[scores.length - 1].score - scores[0].score > 0
                  ? "+"
                  : ""
                : ""}
              {scores.length > 1
                ? scores[scores.length - 1].score - scores[0].score
                : 0}{" "}
              pts
            </h3>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-lg text-gray-900 mb-6">Score History</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scores}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#003566"
                strokeWidth={3}
                dot={{ r: 4, fill: "#003566", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Recent Sessions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Distance</th>
                <th className="px-6 py-3 font-medium">Score</th>
                <th className="px-6 py-3 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scores.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.distance || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-brand-navy/10 text-brand-navy rounded font-bold text-xs">
                      {item.score}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                    {item.notes || "-"}
                  </td>
                </tr>
              ))}
              {scores.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-400"
                  >
                    No performance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;
