import React, { useState, useEffect } from "react";
import {
  Search,
  MoreVertical,
  Mail,
  Phone,
  Eye,
  Edit2,
  Ban,
  CheckCircle,
  X,
  Save,
  Plus,
  Calendar,
  Activity,
  Briefcase,
  MapPin,
  Shield,
  Info,
  Trash2,
} from "lucide-react";
import {
  getStudents,
  updateStudent,
  toggleBlockUser,
  deleteStudent,
} from "../../services/userService";
import { registerUser } from "../../services/authService";
import { getAllPrograms } from "../../services/programService";
import { getBatches } from "../../services/batchService";
import { formatDate } from "../../utils/dateFormatter";
import toast from "react-hot-toast";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";

const AdminMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");

  // Modal States
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(null); // ID of row with open menu
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Programs & Batches for assignment
  const [programs, setPrograms] = useState([]);
  const [batches, setBatches] = useState([]);

  // New Student Form State
  const [addUserData, setAddUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    dob: "",
    age: "",
    gender: "",
    bloodGroup: "",
    category: "Student",
    aadhaar: "",
    address: "",
    guardianName: "",
    guardianContact: "",
    institutionName: "",
    institutionDesignation: "",
    preferredBatch: "Weekday",
    previousExperience: false,
    previousExperienceDetails: "",
    medicalConditions: "",
    emergencyContactName: "",
    emergencyContactNumber: "",
    programId: "",
    batchId: ""
  });

  useEffect(() => {
    fetchMembers();
    fetchProgramsAndBatches();
  }, []);

  const fetchMembers = async () => {
    try {
      const data = await getStudents();
      if (Array.isArray(data)) {
        setMembers(data);
      } else {
        setMembers([]);
        if (data.message) toast.error(data.message);
      }
    } catch (err) {
      console.error("Failed to fetch members", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgramsAndBatches = async () => {
    try {
      const pData = await getAllPrograms();
      setPrograms(pData || []);
      const bData = await getBatches();
      setBatches(bData || []);
    } catch (err) {
      console.error("Failed to load programs/batches", err);
    }
  };

  const getCalculatedAge = (birthDateString) => {
    if (!birthDateString) return "";
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge >= 0 ? calculatedAge : 0;
  };

  const getFilteredBatches = (selectedProgramId) => {
    if (!selectedProgramId) return batches;
    return batches.filter(b => {
      const pId = b.program && typeof b.program === 'object' ? b.program._id : b.program;
      return pId === selectedProgramId;
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      if (!addUserData.firstName || !addUserData.lastName || !addUserData.email) {
        toast.error("First name, last name and email are required");
        return;
      }

      const payload = {
        ...addUserData,
        age: addUserData.dob ? getCalculatedAge(addUserData.dob) : null
      };

      const { ok, data } = await registerUser(payload);
      if (ok) {
        toast.success("Student registered successfully! A welcome email with temporary password has been sent.");
        setIsAddModalOpen(false);
        // Reset form
        setAddUserData({
          firstName: "",
          lastName: "",
          email: "",
          mobile: "",
          dob: "",
          age: "",
          gender: "",
          bloodGroup: "",
          category: "Student",
          aadhaar: "",
          address: "",
          guardianName: "",
          guardianContact: "",
          institutionName: "",
          institutionDesignation: "",
          preferredBatch: "Weekday",
          previousExperience: false,
          previousExperienceDetails: "",
          medicalConditions: "",
          emergencyContactName: "",
          emergencyContactNumber: "",
          programId: "",
          batchId: ""
        });
        fetchMembers();
      } else {
        toast.error(data?.message || "Registration failed");
      }
    } catch (err) {
      console.error("Failed to register student:", err);
      toast.error("An error occurred during student registration");
    }
  };

  const handleToggleBlock = async (id) => {
    try {
      const { ok } = await toggleBlockUser(id);
      if (ok) {
        setMembers(
          members.map((m) => {
            if (m._id === id) {
              const newStatus = m.status === "active" ? "blocked" : "active";
              toast.success(`User ${newStatus === "active" ? "unblocked" : "blocked"} successfully`);
              return {
                ...m,
                status: newStatus,
              };
            }
            return m;
          }),
        );
        setShowActionMenu(null);
      }
    } catch (err) {
      console.error("Failed to toggle block status", err);
      toast.error("Failed to update block status");
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this member? All associated batch assignments will be updated.")) {
      try {
        const { ok, data } = await deleteStudent(id);
        if (ok) {
          toast.success("Member deleted successfully");
          fetchMembers();
          setShowActionMenu(null);
        } else {
          toast.error(data?.message || "Failed to delete member");
        }
      } catch (err) {
        console.error("Delete student error", err);
        toast.error("An error occurred");
      }
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      // Auto-calculate age if dob is updated
      const updatedUserPayload = {
        ...editUser,
        age: editUser.dob ? getCalculatedAge(editUser.dob) : editUser.age
      };

      const { ok, data: updated } = await updateStudent(editUser._id, updatedUserPayload);

      if (ok) {
        setMembers(members.map((m) => (m._id === updated._id ? updated : m)));
        setEditUser(null);
        toast.success("Member details updated successfully");
      } else {
        toast.error("Failed to update: " + updated.message);
      }
    } catch (err) {
      console.error("Update failed", err);
      toast.error("An error occurred during update");
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.studentId && member.studentId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && member.status === "active") ||
      (statusFilter === "Blocked" && member.status === "blocked");

    const matchesCourse =
      courseFilter === "All" ||
      (member.enrolledPrograms &&
        member.enrolledPrograms.some(
          (p) => (p._id || p) === courseFilter
        ));

    return matchesSearch && matchesStatus && matchesCourse;
  });

  const { currentData: paginatedMembers, currentPage, totalPages, next, prev, itemsPerPage } = usePagination(filteredMembers);

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading members...</div>
    );

  return (
    <div className="relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900">
            Member Management
          </h1>
          <p className="text-gray-500 text-sm">
            View and manage registered members.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none w-full text-sm"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm bg-white cursor-pointer min-w-[120px]"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Blocked">Blocked</option>
          </select>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm bg-white cursor-pointer max-w-[200px]"
          >
            <option value="All">All Courses</option>
            {programs.map((prog) => (
              <option key={prog._id} value={prog._id}>
                {prog.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-brand-navy hover:bg-brand-navy/90 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-outfit tracking-wider">
              <tr>
                <th className="px-6 py-4 w-12">SL NO</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Join Date</th>
                <th className="px-6 py-4">Enrolled Course</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedMembers.map((member, index) => (
                <tr
                  key={member._id}
                  className="hover:bg-gray-50 transition-colors relative"
                >
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-brand-navy rounded-full flex items-center justify-center text-white text-sm font-bold uppercase">
                        {member.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: {member.studentId || "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail className="w-3 h-3" /> {member.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone className="w-3 h-3" /> {member.mobile || "N/A"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                    {formatDate(member.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    {member.enrolledPrograms &&
                    member.enrolledPrograms.length > 0 ? (
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wider">
                        {member.enrolledPrograms[0].title || "Enrolled"}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400 italic">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleBlock(member._id)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-blue ${
                          member.status === "active" ? "bg-green-500" : "bg-red-400"
                        }`}
                        title={member.status === "active" ? "Block Student" : "Unblock Student"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            member.status === "active" ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {member.status || "active"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="text-gray-500 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-all font-bold"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActionMenu(
                          showActionMenu === member._id ? null : member._id,
                        );
                      }}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Dropout Menu */}
                    {showActionMenu === member._id && (
                      <div
                        className={`absolute right-12 z-50 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 ${index >= filteredMembers.length - 2 ? "bottom-2" : "top-8"}`}
                      >
                        <button
                          onClick={() => {
                            setViewUser(member);
                            setShowActionMenu(null);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4 text-blue-500" /> View Details
                        </button>
                        <button
                          onClick={() => {
                            setEditUser(member);
                            setShowActionMenu(null);
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4 text-amber-500" /> Edit Member
                        </button>
                        <button
                          onClick={() => handleToggleBlock(member._id)}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2 ${member.status === "blocked" ? "text-green-600" : "text-red-650"}`}
                        >
                          {member.status === "blocked" ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-500" /> Unblock User
                            </>
                          ) : (
                            <>
                              <Ban className="w-4 h-4 text-red-500" /> Block User
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteClick(member._id)}
                          className="w-full text-left px-4 py-3 text-sm text-red-650 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" /> Delete Member
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500 text-sm"
                  >
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} next={next} prev={prev} />
      </div>

      {/* VIEW USER MODAL */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-brand-navy p-6 flex justify-between items-start text-white">
              <div>
                <h2 className="text-xl font-bold font-outfit">
                  {viewUser.firstName} {viewUser.lastName}
                </h2>
                <p className="text-blue-200 text-sm mt-1">{viewUser.email}</p>
              </div>
              <button
                onClick={() => setViewUser(null)}
                className="text-white/70 hover:text-white bg-white/10 p-1.5 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
              {/* Account details */}
              <div className="grid grid-cols-3 gap-4 pb-4 border-b border-gray-150 text-sm">
                <div>
                  <p className="text-gray-450 text-[10px] uppercase font-bold">Student ID</p>
                  <p className="font-bold text-brand-navy font-mono">{viewUser.studentId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-450 text-[10px] uppercase font-bold">Status</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold capitalize mt-1 ${
                    viewUser.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {viewUser.status || "active"}
                  </span>
                </div>
                <div>
                  <p className="text-gray-455 text-[10px] uppercase font-bold">Registration Type</p>
                  <p className="font-semibold text-gray-800 capitalize">{viewUser.registrationType || "self"}</p>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-3 pb-4 border-b border-gray-150">
                <h3 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-450 text-[10px] uppercase font-bold">Mobile</p>
                    <p className="font-semibold text-gray-800">{viewUser.mobile || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-450 text-[10px] uppercase font-bold">Date of Birth</p>
                    <p className="font-semibold text-gray-800">{formatDate(viewUser.dob) || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-450 text-[10px] uppercase font-bold">Age</p>
                    <p className="font-semibold text-gray-800">{viewUser.age !== undefined && viewUser.age !== null ? viewUser.age : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-450 text-[10px] uppercase font-bold">Gender</p>
                    <p className="font-semibold text-gray-800">{viewUser.gender || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-450 text-[10px] uppercase font-bold">Blood Group</p>
                    <p className="font-semibold text-gray-800">{viewUser.bloodGroup || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-450 text-[10px] uppercase font-bold">Category</p>
                    <p className="font-semibold text-gray-800">{viewUser.category || "N/A"}</p>
                  </div>
                  <div className="col-span-1 sm:col-span-3">
                    <p className="text-gray-450 text-[10px] uppercase font-bold">Aadhaar / ID</p>
                    <p className="font-semibold text-gray-800">{viewUser.aadhaar || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Institution & Training */}
              <div className="space-y-3 pb-4 border-b border-gray-150">
                <h3 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Institution & Training
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-450 text-[10px] uppercase font-bold">Institution Name</p>
                    <p className="font-semibold text-gray-800">{viewUser.institutionName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-450 text-[10px] uppercase font-bold">Class / Designation</p>
                    <p className="font-semibold text-gray-800">{viewUser.institutionDesignation || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-450 text-[10px] uppercase font-bold">Preferred Training Batch</p>
                    <p className="font-semibold text-gray-800">{viewUser.preferredBatch || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-450 text-[10px] uppercase font-bold">Previous Experience</p>
                    <p className="font-semibold text-gray-800">{viewUser.previousExperience ? "Yes" : "No"}</p>
                  </div>
                  {viewUser.previousExperience && (
                    <div className="col-span-2">
                      <p className="text-gray-450 text-[10px] uppercase font-bold">Experience Details</p>
                      <p className="font-semibold text-gray-800 bg-gray-50 p-2 rounded border border-gray-100">{viewUser.previousExperienceDetails || "N/A"}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact & Emergency info */}
              <div className="space-y-3 pb-4 border-b border-gray-150">
                <h3 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Contact & Emergency Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="col-span-2">
                    <p className="text-gray-450 text-[10px] uppercase font-bold">Address</p>
                    <p className="font-semibold text-gray-800">{viewUser.address || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-450 text-[10px] uppercase font-bold">Guardian Name</p>
                    <p className="font-semibold text-gray-800">{viewUser.guardianName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-450 text-[10px] uppercase font-bold">Guardian Contact</p>
                    <p className="font-semibold text-gray-800">{viewUser.guardianContact || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-450 text-[10px] uppercase font-bold">Emergency Contact Name</p>
                    <p className="font-semibold text-gray-800">{viewUser.emergencyContactName || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-gray-450 text-[10px] uppercase font-bold">Emergency Phone</p>
                    <p className="font-semibold text-gray-800">{viewUser.emergencyContactNumber || "N/A"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-450 text-[10px] uppercase font-bold">Medical Conditions</p>
                    <p className={`font-semibold p-2 rounded border ${
                      viewUser.medicalConditions ? "text-red-700 bg-red-50 border-red-100" : "text-gray-850 bg-gray-50 border-gray-100"
                    }`}>
                      {viewUser.medicalConditions || "None declared"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Course enrollments */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" /> Enrolled Programs
                </h3>
                {viewUser.enrolledPrograms?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {viewUser.enrolledPrograms.map((p, i) => (
                      <span
                        key={i}
                        className="bg-brand-red/10 text-brand-red px-3 py-1 rounded-lg text-xs font-bold"
                      >
                        {p.title || "Unknown Program"}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-450 italic text-sm">No active enrollments</p>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-150 flex justify-end">
              <button
                onClick={() => setViewUser(null)}
                className="px-5 py-2 text-sm font-bold text-gray-650 hover:bg-gray-100 rounded-lg cursor-pointer bg-white border border-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-gray-50 border-b border-gray-100 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 font-outfit">
                Edit Member Profile
              </h2>
              <button
                onClick={() => setEditUser(null)}
                className="text-gray-400 hover:text-gray-650 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateUser} className="flex flex-col">
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
                
                {/* Account Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">Account Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">First Name *</label>
                      <input
                        required
                        value={editUser.firstName}
                        onChange={(e) => setEditUser({ ...editUser, firstName: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Last Name *</label>
                      <input
                        required
                        value={editUser.lastName}
                        onChange={(e) => setEditUser({ ...editUser, lastName: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Email (Uneditable)</label>
                      <input
                        disabled
                        value={editUser.email}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed outline-none"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Mobile Number</label>
                      <input
                        value={editUser.mobile || ""}
                        onChange={(e) => setEditUser({ ...editUser, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Date of Birth</label>
                      <input
                        type="date"
                        value={editUser.dob ? new Date(editUser.dob).toISOString().split("T")[0] : ""}
                        onChange={(e) => setEditUser({ ...editUser, dob: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Age (Auto-calculated)</label>
                      <input
                        disabled
                        placeholder="Auto-calculated on save"
                        value={editUser.dob ? getCalculatedAge(editUser.dob) : (editUser.age || "")}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-450 cursor-not-allowed outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Gender</label>
                      <select
                        value={editUser.gender || ""}
                        onChange={(e) => setEditUser({ ...editUser, gender: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Blood Group</label>
                      <select
                        value={editUser.bloodGroup || ""}
                        onChange={(e) => setEditUser({ ...editUser, bloodGroup: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                      >
                        <option value="">Select Blood Group</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                      <select
                        value={editUser.category || ""}
                        onChange={(e) => setEditUser({ ...editUser, category: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                      >
                        <option value="">Select Category</option>
                        <option value="Student">Student</option>
                        <option value="Corporate Employee">Corporate Employee</option>
                        <option value="Professional">Professional</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Aadhaar / ID</label>
                      <input
                        value={editUser.aadhaar || ""}
                        onChange={(e) => setEditUser({ ...editUser, aadhaar: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Institution & Training */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">Institution & Training Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Institution Name</label>
                      <input
                        value={editUser.institutionName || ""}
                        onChange={(e) => setEditUser({ ...editUser, institutionName: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Class / Designation</label>
                      <input
                        value={editUser.institutionDesignation || ""}
                        onChange={(e) => setEditUser({ ...editUser, institutionDesignation: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Preferred Batch</label>
                      <select
                        value={editUser.preferredBatch || ""}
                        onChange={(e) => setEditUser({ ...editUser, preferredBatch: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                      >
                        <option value="Weekday">Weekday</option>
                        <option value="Weekend">Weekend</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Previous Experience</label>
                      <select
                        value={editUser.previousExperience ? "true" : "false"}
                        onChange={(e) => setEditUser({ ...editUser, previousExperience: e.target.value === "true" })}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    {editUser.previousExperience && (
                      <div className="col-span-1 sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Experience Details</label>
                        <textarea
                          rows="2"
                          value={editUser.previousExperienceDetails || ""}
                          onChange={(e) => setEditUser({ ...editUser, previousExperienceDetails: e.target.value })}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact & Emergency info */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">Contact & Emergency Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Residential Address</label>
                      <textarea
                        rows="2"
                        value={editUser.address || ""}
                        onChange={(e) => setEditUser({ ...editUser, address: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Registration Type</label>
                      <select
                        value={editUser.registrationType || "self"}
                        onChange={(e) => setEditUser({ ...editUser, registrationType: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                      >
                        <option value="self">Self</option>
                        <option value="guardian">Guardian / Minor</option>
                      </select>
                    </div>
                    {editUser.registrationType === "guardian" && (
                      <>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">Guardian Name</label>
                          <input
                            value={editUser.guardianName || ""}
                            onChange={(e) => setEditUser({ ...editUser, guardianName: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                          />
                        </div>
                        <div className="col-span-1 sm:col-span-2 space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">Guardian Contact Phone</label>
                          <input
                            value={editUser.guardianContact || ""}
                            onChange={(e) => setEditUser({ ...editUser, guardianContact: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                          />
                        </div>
                      </>
                    )}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Emergency Contact Name</label>
                      <input
                        value={editUser.emergencyContactName || ""}
                        onChange={(e) => setEditUser({ ...editUser, emergencyContactName: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Emergency Contact Phone</label>
                      <input
                        value={editUser.emergencyContactNumber || ""}
                        onChange={(e) => setEditUser({ ...editUser, emergencyContactNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Medical Conditions</label>
                      <textarea
                        rows="2"
                        placeholder="Asthma, allergies, none, etc."
                        value={editUser.medicalConditions || ""}
                        onChange={(e) => setEditUser({ ...editUser, medicalConditions: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer bg-white border border-gray-250"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-brand-navy hover:bg-brand-navy/95 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-brand-navy p-6 flex justify-between items-start text-white">
              <div>
                <h2 className="text-xl font-bold font-outfit">
                  Register New Student
                </h2>
                <p className="text-blue-200 text-sm mt-1">Direct admin registration (Bypasses OTP verification)</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/70 hover:text-white bg-white/10 p-1.5 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddUser} className="flex flex-col">
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
                
                {/* Account Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">Account Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">First Name *</label>
                      <input
                        required
                        placeholder="First name"
                        value={addUserData.firstName}
                        onChange={(e) => setAddUserData({ ...addUserData, firstName: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Last Name *</label>
                      <input
                        required
                        placeholder="Last name"
                        value={addUserData.lastName}
                        onChange={(e) => setAddUserData({ ...addUserData, lastName: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Email Address *</label>
                      <input
                        required
                        type="email"
                        placeholder="student@example.com"
                        value={addUserData.email}
                        onChange={(e) => setAddUserData({ ...addUserData, email: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Mobile Number</label>
                      <input
                        placeholder="10-digit number"
                        value={addUserData.mobile}
                        onChange={(e) => setAddUserData({ ...addUserData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">Personal Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Date of Birth</label>
                      <input
                        type="date"
                        value={addUserData.dob}
                        onChange={(e) => setAddUserData({ ...addUserData, dob: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Age (Auto-calculated)</label>
                      <input
                        disabled
                        placeholder="Enter date of birth to calculate"
                        value={addUserData.dob ? getCalculatedAge(addUserData.dob) : ""}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-450 cursor-not-allowed outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Gender</label>
                      <select
                        value={addUserData.gender}
                        onChange={(e) => setAddUserData({ ...addUserData, gender: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Blood Group</label>
                      <select
                        value={addUserData.bloodGroup}
                        onChange={(e) => setAddUserData({ ...addUserData, bloodGroup: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                      >
                        <option value="">Select Blood Group</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                      <select
                        value={addUserData.category}
                        onChange={(e) => setAddUserData({ ...addUserData, category: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                      >
                        <option value="Student">Student</option>
                        <option value="Corporate Employee">Corporate Employee</option>
                        <option value="Professional">Professional</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Aadhaar / ID</label>
                      <input
                        placeholder="Aadhaar or ID number"
                        value={addUserData.aadhaar}
                        onChange={(e) => setAddUserData({ ...addUserData, aadhaar: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Institution & Training Preferences */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">Institution & Training</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Institution Name</label>
                      <input
                        placeholder="School/College/Company"
                        value={addUserData.institutionName}
                        onChange={(e) => setAddUserData({ ...addUserData, institutionName: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Class / Designation</label>
                      <input
                        placeholder="Class or Designation"
                        value={addUserData.institutionDesignation}
                        onChange={(e) => setAddUserData({ ...addUserData, institutionDesignation: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Preferred Training Batch</label>
                      <select
                        value={addUserData.preferredBatch}
                        onChange={(e) => setAddUserData({ ...addUserData, preferredBatch: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                      >
                        <option value="Weekday">Weekday</option>
                        <option value="Weekend">Weekend</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Previous Experience</label>
                      <select
                        value={addUserData.previousExperience ? "true" : "false"}
                        onChange={(e) => setAddUserData({ ...addUserData, previousExperience: e.target.value === "true" })}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                      >
                        <option value="false">No</option>
                        <option value="true">Yes</option>
                      </select>
                    </div>
                    {addUserData.previousExperience && (
                      <div className="col-span-1 sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase">Experience Details</label>
                        <textarea
                          rows="2"
                          placeholder="Provide details about previous archery experience"
                          value={addUserData.previousExperienceDetails}
                          onChange={(e) => setAddUserData({ ...addUserData, previousExperienceDetails: e.target.value })}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional Immediate Enrollment */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-brand-blue" /> Direct Class Enrollment (Optional)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Select Program</label>
                      <select
                        value={addUserData.programId}
                        onChange={(e) => setAddUserData({ ...addUserData, programId: e.target.value, batchId: "" })}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                      >
                        <option value="">-- Do Not Enroll Yet --</option>
                        {programs.map(p => (
                          <option key={p._id} value={p._id}>{p.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Select Batch</label>
                      <select
                        disabled={!addUserData.programId}
                        value={addUserData.batchId}
                        onChange={(e) => setAddUserData({ ...addUserData, batchId: e.target.value })}
                        className={`w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-blue outline-none ${
                          !addUserData.programId ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <option value="">-- Select Batch --</option>
                        {getFilteredBatches(addUserData.programId).map(b => (
                          <option key={b._id} value={b._id}>{b.name} ({b.time})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact & Emergency info */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <h3 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">Contact & Emergency Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Residential Address</label>
                      <textarea
                        rows="2"
                        placeholder="Residential address"
                        value={addUserData.address}
                        onChange={(e) => setAddUserData({ ...addUserData, address: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Registration Type</label>
                      <select
                        value={addUserData.registrationType}
                        onChange={(e) => setAddUserData({ ...addUserData, registrationType: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand-blue outline-none"
                      >
                        <option value="self">Self</option>
                        <option value="guardian">Guardian (Minor)</option>
                      </select>
                    </div>
                    {addUserData.registrationType === "guardian" && (
                      <>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">Guardian Name</label>
                          <input
                            placeholder="Guardian full name"
                            value={addUserData.guardianName}
                            onChange={(e) => setAddUserData({ ...addUserData, guardianName: e.target.value })}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                          />
                        </div>
                        <div className="col-span-1 sm:col-span-2 space-y-1">
                          <label className="text-xs font-bold text-gray-500 uppercase">Guardian Contact Phone</label>
                          <input
                            placeholder="Guardian contact number"
                            value={addUserData.guardianContact}
                            onChange={(e) => setAddUserData({ ...addUserData, guardianContact: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                          />
                        </div>
                      </>
                    )}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Emergency Contact Name</label>
                      <input
                        placeholder="Emergency contact name"
                        value={addUserData.emergencyContactName}
                        onChange={(e) => setAddUserData({ ...addUserData, emergencyContactName: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Emergency Contact Phone</label>
                      <input
                        placeholder="Emergency contact phone number"
                        value={addUserData.emergencyContactNumber}
                        onChange={(e) => setAddUserData({ ...addUserData, emergencyContactNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Medical Conditions</label>
                      <textarea
                        rows="2"
                        placeholder="Describe any medical conditions (e.g. Asthma, allergies)"
                        value={addUserData.medicalConditions}
                        onChange={(e) => setAddUserData({ ...addUserData, medicalConditions: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer bg-white border border-gray-250"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-bold text-white bg-brand-navy hover:bg-brand-navy/95 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Register Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMembers;
