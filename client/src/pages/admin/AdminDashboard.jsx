import React, { useState, useEffect } from "react";
import { Users, DollarSign, BookOpen, UserCog } from "lucide-react";
import { getDashboardStats } from "../../services/adminService";
import { formatDate } from "../../utils/dateFormatter";
import BannersDisplay from "../../components/BannersDisplay";

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const result = await getDashboardStats();
      setData(result);
    } catch (err) {
      console.error("Failed stats", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-outfit">
        Loading dashboard statistics...
      </div>
    );
  }

  const stats = [
    {
      label: "Total Members",
      value: data?.totalMembers || 0,
      icon: Users,
      color: "text-brand-blue",
      bg: "bg-brand-blue/10",
    },
    {
      label: "Total Revenue",
      value: data?.totalRevenue ? `₹${data.totalRevenue}` : "₹0",
      icon: DollarSign,
      color: "text-brand-red",
      bg: "bg-brand-red/10",
    },
    {
      label: "Active Courses",
      value: data?.activeCourses || 0,
      icon: BookOpen,
      color: "text-brand-navy",
      bg: "bg-brand-navy/10",
    },
    {
      label: "Total Coaches",
      value: data?.totalCoaches || 0,
      icon: UserCog,
      color: "text-brand-yellow",
      bg: "bg-brand-yellow/20",
    },
  ];

  return (
    <div>
      <BannersDisplay placement="Admin Dashboard" position="Popup" />
      <BannersDisplay placement="Admin Dashboard" position="Top" />
      <h1 className="text-2xl font-bold font-outfit text-gray-900 mb-8">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium font-outfit uppercase tracking-wider">
                {stat.label}
              </p>
              <h3 className="text-3xl font-bold text-gray-900 font-outfit">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold font-outfit text-xl mb-6 text-brand-navy">
            Recent Enrollments
          </h3>
          <div className="space-y-4">
            {data?.recentEnrollments?.length > 0 ? (
              data.recentEnrollments.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/80 transition-colors rounded-lg px-2 -mx-2"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-navy/5 rounded-full flex items-center justify-center font-bold text-brand-navy font-outfit uppercase">
                      {user.firstName?.charAt(0)}
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-gray-900 font-outfit">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-gray-500 text-xs text-brand-blue">
                        Joined:{" "}
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-brand-navy bg-brand-navy/10 px-3 py-1.5 rounded-full uppercase tracking-wider">
                    New
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm p-4">
                No recent enrollments found.
              </p>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-bold font-outfit text-xl mb-6 text-brand-navy">
            Low Attendance Alert
          </h3>
          <div className="space-y-4">
            {data?.lowAttendance?.length > 0 ? (
              data.lowAttendance.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 hover:bg-brand-red/5 transition-colors rounded-lg px-2 -mx-2"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-brand-red/10 rounded-full flex items-center justify-center font-bold text-brand-red font-outfit uppercase">
                      {student.firstName?.charAt(0)}
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-gray-900 font-outfit">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-brand-red text-xs font-medium">
                        {/* Mock message for now until we calculate exact absences */}
                        Recent Absence
                      </p>
                    </div>
                  </div>
                  <button className="text-xs font-bold text-white bg-brand-navy px-4 py-2 rounded-full hover:bg-brand-blue transition-all shadow-sm">
                    Contact
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm p-4">
                No low attendance alerts.
              </p>
            )}
          </div>
        </div>
      </div>
      <BannersDisplay placement="Admin Dashboard" position="Bottom" />
    </div>
  );
};

export default AdminDashboard;
