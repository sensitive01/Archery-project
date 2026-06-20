

import React, { useState, useEffect } from "react";
import { Plus, Star, Shield, X, Edit2, Trash2, Upload, Eye, Search } from "lucide-react";
import { getCoaches, createCoach, updateCoach, deleteCoach, toggleBlockUser } from "../../services/userService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";

const AdminCoaches = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editCoachId, setEditCoachId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [viewingCoach, setViewingCoach] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [specFilter, setSpecFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [newCoach, setNewCoach] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    experience: "",
    specialization: "",
    password: "",
    profilePic: "",
    bio: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const data = await getCoaches();
      // Ensure data is array
      setCoaches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch coaches error", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setIsEdit(false);
    setEditCoachId(null);
    setNewCoach({
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      experience: "",
      specialization: "",
      password: "",
      profilePic: "",
      bio: "",
    });
    setShowModal(true);
  };

  const handleEditClick = (coach) => {
    setIsEdit(true);
    setEditCoachId(coach._id);
    setNewCoach({
      firstName: coach.firstName || "",
      lastName: coach.lastName || "",
      email: coach.email || "",
      mobile: coach.mobile || "",
      experience: coach.experience || "",
      specialization: coach.specialization ? coach.specialization.join(", ") : "",
      password: "", // blank password by default for editing
      profilePic: coach.profilePic || "",
      bio: coach.bio || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this coach?")) {
      try {
        const { ok, data } = await deleteCoach(id);
        if (ok) {
          fetchCoaches();
          toast.success("Coach deleted successfully");
        } else {
          toast.error(data.message || "Failed to delete coach");
        }
      } catch (err) {
        console.error("Delete coach error", err);
        toast.error("An error occurred");
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = "archery-images";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const fileData = await res.json();
      if (fileData.secure_url) {
        setNewCoach((prev) => ({ ...prev, profilePic: fileData.secure_url }));
        toast.success("Profile picture uploaded successfully");
      } else {
        console.error("Upload failed details:", fileData);
        toast.error("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Error uploading image", err);
      toast.error("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newCoach,
        specialization: newCoach.specialization
          ? newCoach.specialization.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };

      if (isEdit && !payload.password) {
        delete payload.password;
      }

      let result;
      if (isEdit) {
        result = await updateCoach(editCoachId, payload);
      } else {
        result = await createCoach(payload);
      }

      const { ok, data } = result;
      if (ok) {
        fetchCoaches();
        setShowModal(false);
        toast.success(
          isEdit ? "Coach updated successfully" : "Coach created successfully"
        );
      } else {
        toast.error(data.message || "Failed to save coach");
      }
    } catch (err) {
      console.error("Save coach error", err);
      toast.error("An error occurred");
    }
  };

  const allSpecializations = Array.from(
    new Set(coaches.flatMap((c) => c.specialization || []))
  );

  const filteredCoaches = coaches.filter((coach) => {
    const matchesSearch =
      `${coach.firstName} ${coach.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coach.employeeId && coach.employeeId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpec =
      specFilter === "All" ||
      (coach.specialization && coach.specialization.includes(specFilter));

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && coach.status === "active") ||
      (statusFilter === "Blocked" && coach.status === "blocked");

    return matchesSearch && matchesSpec && matchesStatus;
  });

  const { currentData: paginatedCoaches, currentPage, totalPages, next, prev, itemsPerPage } = usePagination(filteredCoaches);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900">
            Coach Management
          </h1>
          <p className="text-gray-500 text-sm">
            Oversee coaching staff and assignments.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="bg-brand-navy text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-brand-red transition-colors font-medium text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Coach
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search coaches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none w-full text-sm"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={specFilter}
          onChange={(e) => setSpecFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm bg-white cursor-pointer min-w-[150px]"
        >
          <option value="All">All Specializations</option>
          {allSpecializations.map((spec, idx) => (
            <option key={idx} value={spec}>
              {spec}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm bg-white cursor-pointer min-w-[120px]"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Blocked">Blocked</option>
        </select>
      </div>

      {/* Coaches Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-outfit tracking-wider">
              <tr>
                <th className="px-6 py-4">SL NO</th>
                <th className="px-6 py-4">Coach</th>
                <th className="px-6 py-4">Contact Info</th>
                <th className="px-6 py-4">Specialization</th>
                <th className="px-6 py-4">Stats</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCoaches.map((coach, index) => (
                <tr key={coach._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm">
                        {coach.profilePic ? (
                          <img
                            src={coach.profilePic}
                            alt={`${coach.firstName} ${coach.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-sm text-gray-600">
                            {coach.firstName?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm font-outfit">
                          {coach.firstName} {coach.lastName}
                        </div>
                        {coach.employeeId && (
                          <span className="text-[10px] font-mono font-bold text-brand-blue bg-blue-50 px-1.5 py-0.5 rounded">
                            {coach.employeeId}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    <div className="flex flex-col gap-0.5">
                      <span>{coach.email}</span>
                      <span>{coach.mobile}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {coach.specialization && coach.specialization.map((spec, sIdx) => (
                        <span key={sIdx} className="text-[10px] font-bold bg-brand-navy/10 text-brand-navy px-2 py-0.5 rounded-full uppercase">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-700">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1 font-medium">
                        <Shield className="w-3 h-3 text-brand-blue" />
                        {coach.experience || 0} Years Exp
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Star className="w-3 h-3 text-brand-yellow fill-current" />
                        {coach.rating || "5.0"} Rating
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const { ok } = await toggleBlockUser(coach._id);
                            if (ok) {
                              toast.success(`Coach ${coach.status === "active" ? "blocked" : "unblocked"} successfully`);
                              fetchCoaches();
                            }
                          } catch (err) {
                            console.error("Toggle block status error", err);
                            toast.error("Failed to update status");
                          }
                        }}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-blue ${
                          coach.status === "active" ? "bg-green-500" : "bg-red-400"
                        }`}
                        title={coach.status === "active" ? "Block Coach" : "Unblock Coach"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            coach.status === "active" ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {coach.status || "active"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => setViewingCoach(coach)}
                        className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                        title="View Profile"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => navigate("/admin/batches")}
                        className="px-3 py-1.5 text-xs font-bold text-brand-blue bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"
                        title="Assign Class"
                      >
                        Assign
                      </button>
                      <button
                        onClick={() => handleEditClick(coach)}
                        className="p-2 text-brand-blue bg-blue-50 hover:bg-brand-blue hover:text-white rounded-lg transition-all"
                        title="Edit Coach"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(coach._id)}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                        title="Delete Coach"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredCoaches.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-500 text-sm">
                    No coaches found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} next={next} prev={prev} />
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl animate-in zoom-in duration-300">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">
                {isEdit ? "Edit Coach" : "Add New Coach"}
              </h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              
              {/* Profile Picture Row */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="profile-pic-upload"
                  />
                  <label
                    htmlFor="profile-pic-upload"
                    className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-gray-400" />
                    {uploading ? "Uploading..." : "Upload Image"}
                  </label>
                  {newCoach.profilePic && (
                    <div className="flex items-center gap-2">
                      <img
                        src={newCoach.profilePic}
                        alt="Profile preview"
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <a
                        href={newCoach.profilePic}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-gray-400 hover:text-brand-blue"
                        title="View Full Image"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setNewCoach((prev) => ({ ...prev, profilePic: "" }))}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    First Name
                  </label>
                  <input
                    required
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                    value={newCoach.firstName}
                    onChange={(e) =>
                      setNewCoach({ ...newCoach, firstName: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Last Name
                  </label>
                  <input
                    required
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                    value={newCoach.lastName}
                    onChange={(e) =>
                      setNewCoach({ ...newCoach, lastName: e.target.value })
                    }
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Email Address
                  </label>
                  <input
                    required
                    type="email"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                    value={newCoach.email}
                    onChange={(e) =>
                      setNewCoach({ ...newCoach, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    {isEdit ? "Password (leave blank to keep current)" : "Password"}
                  </label>
                  <input
                    required={!isEdit}
                    type="password"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                    placeholder="••••••••"
                    value={newCoach.password}
                    onChange={(e) =>
                      setNewCoach({ ...newCoach, password: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Mobile Number
                  </label>
                  <input
                    required
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                    value={newCoach.mobile}
                    onChange={(e) =>
                      setNewCoach({ ...newCoach, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Specialization
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                    placeholder="e.g. Recurve"
                    value={newCoach.specialization}
                    onChange={(e) =>
                      setNewCoach({
                        ...newCoach,
                        specialization: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Experience (Yrs)
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                    value={newCoach.experience}
                    onChange={(e) =>
                      setNewCoach({ ...newCoach, experience: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Biography / Bio
                </label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none h-20 resize-none"
                  placeholder="Share details about the coach's credentials, philosophy, or teaching history..."
                  value={newCoach.bio}
                  onChange={(e) =>
                    setNewCoach({ ...newCoach, bio: e.target.value })
                  }
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-bold hover:bg-brand-navy/90"
                >
                  {isEdit ? "Save Changes" : "Save Coach"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {viewingCoach && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header banner/background */}
            <div className="h-24 bg-brand-navy relative">
              <button 
                onClick={() => setViewingCoach(null)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 pb-6 relative">
              {/* Profile image floating up */}
              <div className="flex justify-between items-end -mt-12 mb-4">
                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg overflow-hidden border border-gray-100 flex items-center justify-center">
                  {viewingCoach.profilePic ? (
                    <img
                      src={viewingCoach.profilePic}
                      alt={`${viewingCoach.firstName} ${viewingCoach.lastName}`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="font-bold text-3xl text-gray-400">
                      {viewingCoach.firstName?.charAt(0)}
                    </span>
                  )}
                </div>
                
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                    viewingCoach.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {viewingCoach.status.toUpperCase()}
                </span>
              </div>

              {/* Identity details */}
              <div className="mb-6">
                <h3 className="font-bold text-2xl text-gray-900 leading-tight">
                  {viewingCoach.firstName} {viewingCoach.lastName}
                </h3>
                <p className="text-sm text-brand-blue font-bold uppercase tracking-wider mt-1">
                  {viewingCoach.specialization && viewingCoach.specialization.join(", ")}
                </p>
                <p className="text-xs text-gray-400 font-mono mt-1">
                  ID: {viewingCoach.employeeId || "N/A"}
                </p>
              </div>

              {/* Grid Information */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 py-4 mb-6">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Experience
                  </span>
                  <span className="text-gray-800 font-bold flex items-center gap-1.5 mt-0.5">
                    <Shield className="w-4 h-4 text-brand-blue" />
                    {viewingCoach.experience || 0} Years
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Rating
                  </span>
                  <span className="text-gray-800 font-bold flex items-center gap-1.5 mt-0.5">
                    <Star className="w-4 h-4 text-brand-yellow fill-current" />
                    {viewingCoach.rating || "5.0"} / 5.0
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Email Address
                  </span>
                  <span className="text-gray-700 text-sm font-semibold block truncate mt-0.5 font-outfit">
                    {viewingCoach.email}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Mobile Number
                  </span>
                  <span className="text-gray-700 text-sm font-semibold block mt-0.5">
                    {viewingCoach.mobile || "N/A"}
                  </span>
                </div>
              </div>

              {/* Bio section */}
              <div className="mb-6">
                <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">
                  Biography / Bio
                </span>
                <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  {viewingCoach.bio || "No biography details provided yet."}
                </p>
              </div>

              {/* Action row */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setViewingCoach(null)}
                  className="px-5 py-2 text-gray-500 hover:bg-gray-100 rounded-xl text-sm font-bold transition-all"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleEditClick(viewingCoach);
                    setViewingCoach(null);
                  }}
                  className="px-5 py-2 bg-brand-navy text-white rounded-xl text-sm font-bold hover:bg-brand-navy/90 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Edit2 className="w-4 h-4" /> Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoaches;
