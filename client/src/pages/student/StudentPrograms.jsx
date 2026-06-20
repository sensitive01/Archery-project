import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Target, Clock, Calendar, AlertCircle, X, Users, IndianRupee, Layers } from "lucide-react";

const ProgramDetailsModal = ({ program, onClose }) => {
  if (!program) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="bg-brand-navy p-6 sm:p-8 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative z-10 flex flex-col items-start gap-4">
            <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              {program.level || 'Beginner'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-outfit leading-tight">
              {program.title}
            </h2>
          </div>
          <Target className="absolute -bottom-10 -right-10 w-48 h-48 text-brand-blue/10 pointer-events-none" />
        </div>
        
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {program.description || 'No description provided.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 text-brand-navy font-bold text-sm mb-1">
                <Calendar className="w-4 h-4" /> Classes
              </div>
              <p className="text-gray-600 text-sm font-medium">
                {program.totalClasses ? `${program.totalClasses} Sessions` : (program.schedule || 'Flexible/Self-Paced')}
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 text-brand-navy font-bold text-sm mb-1">
                <Clock className="w-4 h-4" /> Duration
              </div>
              <p className="text-gray-600 text-sm font-medium">
                {program.duration || 'Standard'}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 text-brand-navy font-bold text-sm mb-1">
                <Users className="w-4 h-4" /> Age Group
              </div>
              <p className="text-gray-600 text-sm font-medium">
                {program.ageGroup || 'All Ages'}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 text-brand-navy font-bold text-sm mb-1">
                <IndianRupee className="w-4 h-4" /> Fees
              </div>
              <p className="text-gray-600 text-sm font-medium">
                {program.fees ? `₹${program.fees}` : 'Contact Academy'}
              </p>
            </div>
          </div>

          {program.features && program.features.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Key Features</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {program.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-blue-50/50 px-3 py-2 rounded-lg border border-blue-100/50">
                    <div className="w-1.5 h-1.5 bg-brand-blue rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentPrograms = () => {
  const { user } = useAuth();
  const enrolledPrograms = user?.enrolledPrograms || [];
  const [selectedProgram, setSelectedProgram] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900">
            My Programs
          </h1>
          <p className="text-gray-500">
            Manage and view your enrolled courses.
          </p>
        </div>
        {enrolledPrograms.length > 0 && (
          <Link
            to="/programs"
            className="text-sm text-brand-blue font-medium hover:underline"
          >
            Browse More Programs
          </Link>
        )}
      </div>

      {enrolledPrograms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledPrograms.map((program, index) => (
            <div
              key={program._id || index}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group cursor-default relative"
            >
              <div className="bg-brand-navy p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {program.level || 'Beginner'}
                    </span>
                    <Target className="w-6 h-6 text-brand-red opacity-80" />
                  </div>
                  <h3 className="text-xl font-bold font-outfit line-clamp-1">
                    {program.title}
                  </h3>
                </div>
                <div className="absolute -bottom-6 -right-6 text-brand-blue/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
                  <Target className="w-32 h-32" />
                </div>
              </div>

              <div className="p-6 space-y-4 flex-grow">
                <p className="text-gray-600 text-sm line-clamp-2 min-h-[40px]">
                  {program.description || 'Welcome to this archery program.'}
                </p>

                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                    <Calendar className="w-4 h-4 text-brand-blue flex-shrink-0" />
                    <span className="font-medium truncate">
                      {program.totalClasses ? `${program.totalClasses} Sessions` : (program.schedule || "Flexible Schedule")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg">
                    <Clock className="w-4 h-4 text-brand-blue flex-shrink-0" />
                    <span className="font-medium truncate">
                      {program.duration || "Self-Paced"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 mt-auto flex items-center justify-between">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Active
                </span>
                <button 
                  onClick={() => setSelectedProgram(program)}
                  className="text-brand-navy font-bold text-sm hover:text-brand-red transition-colors flex items-center gap-1"
                >
                  View Details <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto mt-10">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Layers className="w-10 h-10 text-brand-blue" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 font-outfit">
            No Programs Enrolled
          </h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
            You haven't enrolled in any archery courses yet. Explore our beginner, intermediate, and advanced programs to start your journey.
          </p>
          <Link
            to="/programs"
            className="inline-flex items-center gap-2 bg-brand-navy text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-900 transition-colors shadow-lg shadow-blue-900/20"
          >
            Explore Courses <Target className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Program Details Modal */}
      <ProgramDetailsModal 
        program={selectedProgram} 
        onClose={() => setSelectedProgram(null)} 
      />
    </div>
  );
};

export default StudentPrograms;
