import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Linkedin, Mail, Award, User } from "lucide-react";

import { getStudentBatches } from "../../services/batchService";

const StudentCoaches = () => {
  const { user } = useAuth();
  const [coaches, setCoaches] = useState([]);

  const fetchMyCoaches = async () => {
    try {
      const batches = await getStudentBatches(user._id);
      // Extract unique coaches from batches
      const uniqueCoaches = [];
      const seenIds = new Set();
      batches.forEach((batch) => {
        if (batch.coach && typeof batch.coach === "object") {
          if (!seenIds.has(batch.coach._id)) {
            seenIds.add(batch.coach._id);
            uniqueCoaches.push({
              ...batch.coach,
              programTitle: batch.program?.title || "General", // Attach program info
            });
          }
        }
      });
      setCoaches(uniqueCoaches);
    } catch (error) {
      console.error("Failed to fetch coaches", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyCoaches();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900">
            My Instructors
          </h1>
          <p className="text-gray-500">
            Connect with the experts guiding your journey.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map((coach, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-gray-200 p-6 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
              {coach.profilePic ? (
                <img
                  src={coach.profilePic}
                  alt={`${coach.firstName} ${coach.lastName}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-gray-500">
                  {coach.firstName?.charAt(0)}
                </span>
              )}
            </div>

            <div>
              <h3 className="font-bold text-gray-900 text-lg">
                {coach.firstName} {coach.lastName}
              </h3>
              <p className="text-brand-red text-sm font-medium mb-1">
                {coach.programTitle || "Coach"}
              </p>
              <p className="text-xs text-gray-400 mb-2 truncate max-w-[150px]">
                {coach.email}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {/* Render specialization if array or string */}
                {(Array.isArray(coach.specialization)
                  ? coach.specialization
                  : [coach.specialization]
                ).map((spec, i) =>
                  spec ? (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide"
                    >
                      {spec}
                    </span>
                  ) : null,
                )}
              </div>
              <button className="text-brand-blue text-sm font-bold flex items-center gap-1 hover:underline">
                <Mail className="w-3 h-3" /> Message Coach
              </button>
            </div>
          </div>
        ))}
      </div>

      {coaches.length === 0 && (
        <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-xl text-sm flex items-start gap-3">
          <User className="w-5 h-5 mt-0.5 shrink-0" />
          <p>
            You have not been assigned to any batches with a dedicated coach
            yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentCoaches;
