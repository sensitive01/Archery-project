import React, { useState, useEffect } from "react";
import TimePicker from "../../components/TimePicker";
import toast from "react-hot-toast";
import {
  Plus,
  UserPlus,
  Users,
  X,
  Clock,
  Calendar,
  Check,
  Search,
  BookOpen,
  Edit2,
  Trash2,
  MapPin,
  Eye,
  Mail,
  Phone,
  Info,
  ExternalLink,
  Baby,
  Upload,
} from "lucide-react";
import {
  getBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  assignStudentToBatch,
  removeStudentFromBatch,
} from "../../services/batchService";
import { getStudents, getCoaches } from "../../services/userService";
import { getAllPrograms } from "../../services/programService";
import { formatDate } from "../../utils/dateFormatter";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";

const AdminBatches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [showStudentsModal, setShowStudentsModal] = useState(false);
  const [selectedBatchForStudents, setSelectedBatchForStudents] = useState(null);
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedBatchForPreview, setSelectedBatchForPreview] = useState(null);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Programs (Courses) & Coaches
  const [programs, setPrograms] = useState([]);
  const [coaches, setCoaches] = useState([]);

  // Create/Edit Batch Form Data
  const [editingBatchId, setEditingBatchId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const initialBatchState = {
    name: "",
    programId: "", // Store selected program ID
    level: "Beginner",
    days: [],
    time: "",
    coach: "",
    capacity: 20,
    location: "",
    startDate: "",
  };
  const [newBatch, setNewBatch] = useState(initialBatchState);

  // Time States
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const formatTime = (time) => {
    // 24h to 12h conversion
    if (!time) return "";
    const [hour, minute] = time.split(":");
    const h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minute} ${ampm}`;
  };

  const parseTimeRange = (timeString) => {
    // Convert "08:00 AM - 09:30 PM" back to start/end for pickers if needed
    // This is complex because TimePicker expects "HH:MM".
    // For simplicity in this edit, we might reset times or try to parse if standard format.
    // "04:30 PM" -> "16:30"
    const to24 = (tStr) => {
      const [time, period] = tStr.trim().split(" ");
      let [h, m] = time.split(":");
      h = parseInt(h);
      if (period === "PM" && h !== 12) h += 12;
      if (period === "AM" && h === 12) h = 0;
      return `${h.toString().padStart(2, "0")}:${m}`;
    };

    if (timeString && timeString.includes("-")) {
      const [start, end] = timeString.split("-");
      return { start: to24(start), end: to24(end) };
    }
    return { start: "", end: "" };
  };

  useEffect(() => {
    if (startTime && endTime) {
      setNewBatch((prev) => ({
        ...prev,
        time: `${formatTime(startTime)} - ${formatTime(endTime)}`,
      }));
    }
  }, [startTime, endTime]);

  // Assign Student Data
  const [students, setStudents] = useState([]);
  const [assignSearch, setAssignSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Assign Student Payment details
  const [feeStatus, setFeeStatus] = useState("Paid"); // Paid or FREE
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [paymentProof, setPaymentProof] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [comments, setComments] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);

  const daysOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    fetchBatches();
    fetchPrograms();
    fetchCoachesList();
  }, []);

  const fetchCoachesList = async () => {
    try {
      const data = await getCoaches();
      setCoaches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch coaches error", err);
    }
  };

  const fetchBatches = async () => {
    try {
      const data = await getBatches(true);
      if (Array.isArray(data)) {
        setBatches(data);
      } else {
        setBatches([]);
        if (data.message) toast.error(data.message);
      }
    } catch (err) {
      console.error("Fetch batches error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const data = await getAllPrograms();
      setPrograms(data || []);
    } catch (err) {
      console.error("Fetch programs error", err);
    }
  };

  const handleCreateOrUpdateBatch = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newBatch,
        program: newBatch.programId,
      };

      let result;
      if (editingBatchId) {
        result = await updateBatch(editingBatchId, payload);
      } else {
        result = await createBatch(payload);
      }

      if (result.ok) {
        fetchBatches();
        closeCreateModal();
        toast.success(
          editingBatchId
            ? "Batch updated successfully"
            : "Batch created successfully",
        );
      } else {
        toast.error(result.data.message);
      }
    } catch (err) {
      console.error("Save batch error", err);
      toast.error("An error occurred");
    }
  };

  const handleEditClick = (batch) => {
    setEditingBatchId(batch._id);
    setNewBatch({
      name: batch.name,
      programId: batch.program ? batch.program._id : "",
      level: batch.level,
      days: batch.days,
      time: batch.time,
      coach: batch.coach
        ? typeof batch.coach === "object"
          ? batch.coach._id
          : batch.coach
        : "",
      capacity: batch.capacity,
      location: batch.location || "",
      startDate: batch.startDate ? new Date(batch.startDate).toISOString().substring(0, 10) : "",
    });

    // Attempt to parse time to populate pickers
    try {
      const { start, end } = parseTimeRange(batch.time);
      setStartTime(start);
      setEndTime(end);
    } catch (e) {
      console.log("Time parse error", e);
    }

    setShowCreateModal(true);
  };

  const handleDeleteClick = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Batch",
      message: "Are you sure you want to delete this batch? This action cannot be undone.",
      onConfirm: async () => {
        closeConfirmModal();
        try {
          await deleteBatch(id);
          fetchBatches();
          toast.success("Batch deleted successfully");
        } catch (err) {
          console.error("Error deleting batch", err);
          toast.error("Failed to delete batch");
        }
      }
    });
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const batch = batches.find((b) => b._id === id);
      if (!batch) return;
      const payload = {
        name: batch.name,
        programId: batch.program ? batch.program._id : "",
        level: batch.level,
        days: batch.days,
        time: batch.time,
        coach: batch.coach
          ? typeof batch.coach === "object"
            ? batch.coach._id
            : batch.coach
          : "",
        capacity: batch.capacity,
        location: batch.location || "",
        startDate: batch.startDate ? new Date(batch.startDate).toISOString().substring(0, 10) : "",
        active: !currentStatus,
      };

      const result = await updateBatch(id, payload);
      if (result.ok) {
        toast.success(`Batch ${!currentStatus ? "enabled" : "disabled"} successfully`);
        fetchBatches();
      } else {
        toast.error("Failed to toggle batch status");
      }
    } catch (err) {
      console.error("Toggle batch active error", err);
      toast.error("An error occurred");
    }
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setEditingBatchId(null);
    setNewBatch(initialBatchState);
    setStartTime("");
    setEndTime("");
  };

  const handleProgramSelect = (e) => {
    const pId = e.target.value;
    const selectedProgram = programs.find((p) => p._id === pId);

    setNewBatch((prev) => ({
      ...prev,
      programId: pId,
      level: selectedProgram ? selectedProgram.level : prev.level,
    }));
  };

  const toggleDay = (day) => {
    const currentDays = newBatch.days;
    if (currentDays.includes(day)) {
      setNewBatch({ ...newBatch, days: currentDays.filter((d) => d !== day) });
    } else {
      setNewBatch({ ...newBatch, days: [...currentDays, day] });
    }
  };

  const openAssignModal = async (batchId) => {
    setSelectedBatchId(batchId);
    setFeeStatus("Paid");
    setPaymentMode("Cash");
    setPaymentProof("");
    setTransactionId("");
    setComments("");
    setAssignSearch("");
    setSelectedStudentId(null);
    setShowAssignModal(true);
    try {
      const data = await getStudents();
      const batch = batches.find((b) => b._id === batchId);
      const alreadyInBatch =
        batch?.students.map((s) => (typeof s === "object" ? s._id : s)) || [];

      const eligible = data.filter(
        (s) => s.status === "active" && !alreadyInBatch.includes(s._id),
      );
      setStudents(eligible);
    } catch (err) {
      console.error("Fetch students error", err);
    }
  };

  const handleProofUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingProof(true);
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
        setPaymentProof(fileData.secure_url);
        toast.success("Payment proof uploaded successfully");
      } else {
        console.error("Upload failed details:", fileData);
        toast.error("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Error uploading proof", err);
      toast.error("Error uploading proof");
    } finally {
      setUploadingProof(false);
    }
  };

  const handleAssignStudent = async () => {
    if (!selectedStudentId) return;
    try {
      const details = {
        feeStatus,
        paymentMode: feeStatus === "FREE" ? "FREE" : paymentMode,
        paymentProof,
        transactionId: feeStatus === "FREE" ? "" : transactionId,
        comments,
      };

      const { ok, data } = await assignStudentToBatch(
        selectedBatchId,
        selectedStudentId,
        details
      );
      if (ok) {
        fetchBatches();
        setShowAssignModal(false);
        setSelectedStudentId(null);
        toast.success("Student assigned successfully");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Assign error", err);
      toast.error("Failed to assign student");
    }
  };

  const handleRemoveStudent = (studentId) => {
    setConfirmModal({
      isOpen: true,
      title: "Remove Student",
      message: "Are you sure you want to remove this student from the batch? Their schedule will also be removed.",
      onConfirm: async () => {
        closeConfirmModal();
        try {
          const { ok, data } = await removeStudentFromBatch(selectedBatchForStudents._id, studentId);
          if (ok) {
            toast.success("Student removed successfully");
            setSelectedBatchForStudents(prev => ({
              ...prev,
              students: prev.students.filter(s => {
                 const sId = typeof s === 'object' ? s._id : s;
                 return sId !== studentId;
              })
            }));
            fetchBatches();
          } else {
            toast.error(data.message || "Failed to remove student");
          }
        } catch (err) {
          console.error("Remove student error", err);
          toast.error("Failed to remove student");
        }
      }
    });
  };

  const filteredStudents = students.filter(
    (s) =>
      s.firstName.toLowerCase().includes(assignSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(assignSearch.toLowerCase()),
  );

  const filteredBatches = batches.filter((batch) => {
    const matchesSearch =
      batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (batch.batchId && batch.batchId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLevel = levelFilter === "All" || batch.level === levelFilter;

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && batch.active !== false) ||
      (statusFilter === "Inactive" && batch.active === false);

    return matchesSearch && matchesLevel && matchesStatus;
  });

  const { currentData: paginatedBatches, currentPage, totalPages, next, prev, itemsPerPage } = usePagination(filteredBatches);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900">
            Batch Management
          </h1>
          <p className="text-gray-500 text-sm">
            Create and manage training batches and assign coaches.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBatchId(null);
            setNewBatch(initialBatchState);
            setShowCreateModal(true);
          }}
          className="bg-brand-navy text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-brand-red transition-colors font-medium text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Batch
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none w-full text-sm"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm bg-white cursor-pointer min-w-[120px]"
        >
          <option value="All">All Levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm bg-white cursor-pointer min-w-[120px]"
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">SL NO</th>
                <th className="px-6 py-4">Batch</th>
                <th className="px-6 py-4">Course & Level</th>
                <th className="px-6 py-4">Schedule & Time</th>
                <th className="px-6 py-4">Start Date & Location</th>
                <th className="px-6 py-4">Coach</th>
                <th className="px-6 py-4">Enrolled / Capacity</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedBatches.map((batch, index) => (
                <tr key={batch._id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900 text-sm font-outfit truncate max-w-[150px]" title={batch.name}>
                      {batch.name}
                    </div>
                    {batch.batchId && (
                      <span className="text-[10px] font-mono font-bold text-brand-blue bg-blue-50 px-1.5 py-0.5 rounded leading-none mt-1 inline-block">
                        {batch.batchId}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {batch.program ? (
                      <div className="flex flex-col gap-1 max-w-[150px]">
                        <span className="font-semibold text-gray-800 truncate" title={batch.program.title}>{batch.program.title}</span>
                        <span className={`w-fit text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                          batch.level === "Beginner"
                            ? "bg-green-100 text-green-700"
                            : batch.level === "Intermediate"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                        }`}>
                          {batch.level}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">No Course</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-gray-800">{batch.days.join(", ")}</span>
                      <span className="text-gray-400">{batch.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    <div className="flex flex-col gap-0.5 max-w-[200px]">
                      <span><strong>Starts:</strong> {formatDate(batch.startDate)}</span>
                      {batch.location && <span className="truncate" title={batch.location}><strong>Loc:</strong> {batch.location}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-800 font-medium">
                    <div className="truncate max-w-[120px]" title={batch.coach ? (typeof batch.coach === "object" ? `${batch.coach.firstName} ${batch.coach.lastName}` : "Assigned") : ""}>
                      {batch.coach
                        ? typeof batch.coach === "object"
                          ? `${batch.coach.firstName} ${batch.coach.lastName}`
                          : "Assigned"
                        : <span className="text-gray-450 italic">Unassigned</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col min-w-[120px]">
                      <button
                        onClick={() => { setSelectedBatchForStudents(batch); setShowStudentsModal(true); }}
                        className="flex items-center gap-1.5 text-xs font-semibold text-brand-blue hover:text-brand-navy hover:underline transition-colors mb-1"
                        title="View enrolled students"
                      >
                        <Users className="w-3.5 h-3.5" />
                        {batch.students.length} / {batch.capacity} Students
                      </button>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-blue rounded-full transition-all duration-500"
                          style={{
                            width: `${(batch.students.length / batch.capacity) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(batch._id, batch.active !== false)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-blue ${
                          batch.active !== false ? "bg-green-500" : "bg-gray-300"
                        }`}
                        title={batch.active !== false ? "Disable Batch" : "Enable Batch"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            batch.active !== false ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {batch.active !== false ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => { setSelectedBatchForPreview(batch); setShowPreviewModal(true); }}
                        className="p-1.5 text-brand-blue bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                        title="Preview details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedBatchForStudents(batch); setShowStudentsModal(true); }}
                        className="p-1.5 text-brand-blue bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                        title="Enrolled students data"
                      >
                        <Baby className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditClick(batch)}
                        className="p-1.5 text-brand-blue bg-blue-50 hover:bg-brand-blue hover:text-white rounded transition-colors"
                        title="Edit Batch"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(batch._id)}
                        className="p-1.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded transition-colors"
                        title="Delete Batch"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openAssignModal(batch._id)}
                        disabled={batch.students.length >= batch.capacity}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-900 text-white rounded text-xs font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        title="Assign student"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Assign
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-gray-400 text-sm">
                    No batches found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} next={next} prev={prev} />
      </div>

      {/* CREATE/EDIT BATCH MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl animate-in zoom-in duration-300">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">
                {editingBatchId ? "Edit Batch" : "Create New Batch"}
              </h3>
              <button onClick={closeCreateModal}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form
              onSubmit={handleCreateOrUpdateBatch}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Batch Name
                </label>
                <input
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                  placeholder="e.g. Morning Squad A"
                  value={newBatch.name}
                  onChange={(e) =>
                    setNewBatch({ ...newBatch, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                  Link Course (Program)
                </label>
                <select
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                  value={newBatch.programId}
                  onChange={handleProgramSelect}
                >
                  <option value="">-- Select Course --</option>
                  {programs.map((prog) => (
                    <option key={prog._id} value={prog._id}>
                      {prog.title} ({prog.level})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  Linking a course helps track what is being taught.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Level
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                    value={newBatch.level}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, level: e.target.value })
                    }
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Capacity
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                    value={newBatch.capacity}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, capacity: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                  Days (Mon-Sun)
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOptions.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-colors border ${newBatch.days.includes(day) ? "bg-brand-navy text-white border-brand-navy" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"}`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Time (Start - End)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-1/2">
                      <TimePicker
                        label="Start"
                        value={startTime}
                        onChange={setStartTime}
                      />
                    </div>
                    <span className="text-gray-400 font-bold">-</span>
                    <div className="w-1/2">
                      <TimePicker
                        label="End"
                        value={endTime}
                        onChange={setEndTime}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Assign Coach
                  </label>
                  <select
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                    value={newBatch.coach}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, coach: e.target.value })
                    }
                  >
                    <option value="">-- Select Coach --</option>
                    {coaches.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.firstName} {c.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Starting Date *
                  </label>
                  <input
                    required
                    type="date"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                    value={newBatch.startDate}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Main Range, Target Area A..."
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                    value={newBatch.location}
                    onChange={(e) =>
                      setNewBatch({ ...newBatch, location: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-bold hover:bg-brand-navy/90"
                >
                  {editingBatchId ? "Update Batch" : "Create Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN STUDENT MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[80vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center shrink-0">
              <h3 className="font-bold text-lg">Assign Student</h3>
              <button onClick={() => setShowAssignModal(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {selectedStudentId ? (
              <div className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
                {/* Selected Student Card */}
                {(() => {
                  const student = students.find(s => s._id === selectedStudentId);
                  return (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-sm">
                          {student?.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {student?.firstName} {student?.lastName}
                          </p>
                          <p className="text-xs text-gray-500">{student?.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedStudentId(null)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline"
                      >
                        Change Student
                      </button>
                    </div>
                  );
                })()}

                {/* Fee Status: FREE | Paid */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-2">
                    Fee Status
                  </label>
                  <div className="flex gap-2">
                    {["Paid", "FREE"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setFeeStatus(status)}
                        className={`flex-1 py-2 px-4 rounded-lg border text-sm font-bold transition-all ${feeStatus === status ? "bg-brand-navy text-white border-brand-navy" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {feeStatus === "Paid" && (
                  <>
                    {/* Payment Mode */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                          Payment Mode
                        </label>
                        <select
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                          value={paymentMode}
                          onChange={(e) => setPaymentMode(e.target.value)}
                        >
                          <option value="Cash">Cash</option>
                          <option value="Bank Transfer">Bank Transfer</option>
                          <option value="UPI">UPI</option>
                          <option value="Card">Card</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Transaction ID */}
                      <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                          Transaction ID
                        </label>
                        <input
                          type="text"
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none"
                          placeholder="e.g. UPI Ref / Receipt No"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Payment Proof */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                        Payment Proof
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleProofUpload}
                          className="hidden"
                          id="proof-upload"
                        />
                        <label
                          htmlFor="proof-upload"
                          className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <Upload className="w-4 h-4 text-gray-400" />
                          {uploadingProof ? "Uploading..." : "Upload Proof"}
                        </label>
                        {paymentProof && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> File Uploaded
                            </span>
                            <a
                              href={paymentProof}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-brand-blue hover:underline"
                            >
                              View
                            </a>
                            <button
                              type="button"
                              onClick={() => setPaymentProof("")}
                              className="text-xs text-red-500 hover:underline ml-1"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Comments */}
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">
                    Comments
                  </label>
                  <textarea
                    rows="2"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-blue outline-none resize-none"
                    placeholder="Enter payment reference notes, comments, etc."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 border-b bg-gray-50 shrink-0">
                  <div className="relative">
                    <input
                      className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-blue"
                      placeholder="Data search by name or email..."
                      value={assignSearch}
                      onChange={(e) => setAssignSearch(e.target.value)}
                    />
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="overflow-y-auto p-2 space-y-1 flex-1">
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <div
                        key={student._id}
                        onClick={() => setSelectedStudentId(student._id)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors border border-transparent hover:bg-gray-50`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                            {student.firstName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-400 py-8 text-sm">
                      No eligible students found.
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="p-4 border-t bg-gray-50 shrink-0 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignStudent}
                disabled={!selectedStudentId || uploadingProof}
                className="px-6 py-2 bg-brand-navy text-white rounded-lg text-sm font-bold hover:bg-brand-navy/90 disabled:opacity-50"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
      {/* VIEW STUDENTS MODAL */}
      {showStudentsModal && selectedBatchForStudents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-brand-navy text-white">
              <div>
                <h3 className="font-bold text-lg">{selectedBatchForStudents.name}</h3>
                <p className="text-xs text-white/70 mt-0.5">
                  {selectedBatchForStudents.students.length} of {selectedBatchForStudents.capacity} students enrolled
                </p>
              </div>
              <button onClick={() => setShowStudentsModal(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100">
              <div
                className="h-full bg-brand-blue transition-all"
                style={{ width: `${(selectedBatchForStudents.students.length / selectedBatchForStudents.capacity) * 100}%` }}
              />
            </div>

            {/* Student list */}
            <div className="overflow-y-auto flex-1 p-4">
              {selectedBatchForStudents.students.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No students enrolled yet</p>
                  <p className="text-gray-400 text-sm mt-1">Use the Assign button to add students.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedBatchForStudents.students.map((student, idx) => {
                    const s = typeof student === 'object' ? student : { _id: student };
                    return (
                      <div key={s._id || idx} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-brand-navy flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {s.firstName ? s.firstName.charAt(0).toUpperCase() : '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {s.firstName || 'Unknown'} {s.lastName || ''}
                            </p>
                            {s.studentId && (
                              <span className="text-[10px] font-mono font-bold text-brand-blue bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0">
                                {s.studentId}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            {s.email && (
                              <span className="flex items-center gap-1 text-xs text-gray-500 truncate">
                                <Mail className="w-3 h-3 flex-shrink-0" /> {s.email}
                              </span>
                            )}
                            {s.mobile && (
                              <span className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                                <Phone className="w-3 h-3" /> {s.mobile}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-gray-400 flex-shrink-0">#{idx + 1}</span>
                        <button 
                          onClick={() => handleRemoveStudent(s._id)}
                          className="ml-2 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          title="Remove Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t bg-gray-50 flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {selectedBatchForStudents.capacity - selectedBatchForStudents.students.length} seat(s) remaining
              </span>
              <button
                onClick={() => {
                  setShowStudentsModal(false);
                  openAssignModal(selectedBatchForStudents._id);
                }}
                disabled={selectedBatchForStudents.students.length >= selectedBatchForStudents.capacity}
                className="flex items-center gap-2 px-4 py-2 bg-brand-navy text-white rounded-lg text-sm font-bold hover:bg-brand-navy/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <UserPlus className="w-4 h-4" /> Assign Student
              </button>
            </div>
          </div>
        </div>
      )}
      {/* PROGRAM DETAILS MODAL */}
      {showProgramModal && selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center" style={{ background: 'linear-gradient(135deg, #0F172A, #1E40AF)' }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-white/70" />
                  <span className="text-xs font-bold text-white/60 uppercase tracking-widest">Program Details</span>
                </div>
                <h3 className="font-bold text-xl text-white">{selectedProgram.title}</h3>
                {selectedProgram.courseId && (
                  <span className="text-xs font-mono text-white/50">{selectedProgram.courseId}</span>
                )}
              </div>
              <button onClick={() => setShowProgramModal(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-5">
              {/* Key stats grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Level', value: selectedProgram.level, color: selectedProgram.level === 'Beginner' ? 'bg-green-50 text-green-700 border-green-200' : selectedProgram.level === 'Intermediate' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200' },
                  { label: 'Course Fee', value: selectedProgram.fees ? `₹${selectedProgram.fees}` : '—', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                  { label: 'Duration', value: selectedProgram.duration || '—', color: 'bg-gray-50 text-gray-700 border-gray-200' },
                  { label: 'Total Classes', value: selectedProgram.totalClasses ? `${selectedProgram.totalClasses} classes` : '—', color: 'bg-gray-50 text-gray-700 border-gray-200' },
                  { label: 'Age Group', value: selectedProgram.ageGroup || '—', color: 'bg-gray-50 text-gray-700 border-gray-200' },
                  { label: 'Status', value: selectedProgram.active !== false ? 'Active' : 'Inactive', color: selectedProgram.active !== false ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200' },
                ].map(({ label, value, color }) => (
                  <div key={label} className={`rounded-lg border p-3 ${color}`}>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1">{label}</p>
                    <p className="font-bold text-sm">{value}</p>
                  </div>
                ))}
              </div>

              {/* Description */}
              {selectedProgram.description && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Description</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedProgram.description}</p>
                </div>
              )}

              {/* Equipment & Schedule */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {selectedProgram.equipment && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Equipment</p>
                    <p className="text-sm text-gray-700 font-medium">{selectedProgram.equipment}</p>
                  </div>
                )}
                {selectedProgram.schedule && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Schedule</p>
                    <p className="text-sm text-gray-700 font-medium">{selectedProgram.schedule}</p>
                  </div>
                )}
              </div>

              {/* Features */}
              {selectedProgram.features && selectedProgram.features.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Course Features</p>
                  <ul className="space-y-1.5">
                    {selectedProgram.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowProgramModal(false)}
                className="px-5 py-2 bg-brand-navy text-white rounded-lg text-sm font-bold hover:bg-brand-navy/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH & COURSE UNIFIED PREVIEW MODAL */}
      {showPreviewModal && selectedBatchForPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-brand-navy text-white">
              <div>
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-0.5">Batch & Course Preview</span>
                <h3 className="font-bold text-xl">{selectedBatchForPreview.name}</h3>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 space-y-6">
              {/* Batch Section */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-blue mb-3 flex items-center gap-1.5 pb-1 border-b border-gray-100">
                  <Calendar className="w-4 h-4" /> Batch Schedule & Info
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column info */}
                  <div className="space-y-3">
                    {selectedBatchForPreview.batchId && (
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Batch ID</span>
                        <span className="text-sm font-mono font-bold text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{selectedBatchForPreview.batchId}</span>
                      </div>
                    )}
                    {selectedBatchForPreview.startDate && (
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Starting Date</span>
                        <span className="text-sm font-semibold text-gray-800">
                          {formatDate(selectedBatchForPreview.startDate)}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Schedule Days</span>
                      <span className="text-sm font-medium text-gray-800">{selectedBatchForPreview.days.join(", ")}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Timings</span>
                      <span className="text-sm font-medium text-gray-800">{selectedBatchForPreview.time}</span>
                    </div>
                  </div>

                  {/* Right Column info */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Assigned Coach</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {selectedBatchForPreview.coach
                          ? typeof selectedBatchForPreview.coach === "object"
                            ? `${selectedBatchForPreview.coach.firstName} ${selectedBatchForPreview.coach.lastName}`
                            : "Unknown"
                          : "Unassigned"}
                      </span>
                    </div>
                    {selectedBatchForPreview.location && (
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Location</span>
                        <span className="text-sm text-gray-700 flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                          {selectedBatchForPreview.location}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Enrolment Status</span>
                      <div className="flex items-center gap-3">
                        <div className="w-2/3 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand-blue rounded-full"
                            style={{ width: `${(selectedBatchForPreview.students.length / selectedBatchForPreview.capacity) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-700">
                          {selectedBatchForPreview.students.length} / {selectedBatchForPreview.capacity} Seats
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Section */}
              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-blue mb-3 flex items-center gap-1.5 pb-1 border-b border-gray-100">
                  <BookOpen className="w-4 h-4" /> Linked Course Details
                </h4>

                {selectedBatchForPreview.program ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h5 className="font-bold text-lg text-gray-900">{selectedBatchForPreview.program.title}</h5>
                        {selectedBatchForPreview.program.courseId && (
                          <span className="text-xs font-mono text-gray-500">{selectedBatchForPreview.program.courseId}</span>
                        )}
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                        selectedBatchForPreview.program.level === "Beginner"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : selectedBatchForPreview.program.level === "Intermediate"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}>
                        {selectedBatchForPreview.program.level}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Course Fee</span>
                        <span className="font-bold text-gray-800">₹{selectedBatchForPreview.program.fees}</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Duration</span>
                        <span className="font-bold text-gray-800">{selectedBatchForPreview.program.duration || '—'}</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Total Classes</span>
                        <span className="font-bold text-gray-800">{selectedBatchForPreview.program.totalClasses ? `${selectedBatchForPreview.program.totalClasses} classes` : '—'}</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-0.5">Age Group</span>
                        <span className="font-bold text-gray-800">{selectedBatchForPreview.program.ageGroup || '—'}</span>
                      </div>
                    </div>

                    {selectedBatchForPreview.program.description && (
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Description</span>
                        <p className="text-sm text-gray-600 leading-relaxed">{selectedBatchForPreview.program.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedBatchForPreview.program.equipment && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Equipment Required</span>
                          <span className="text-sm text-gray-700 font-medium">{selectedBatchForPreview.program.equipment}</span>
                        </div>
                      )}
                      {selectedBatchForPreview.program.schedule && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <span className="text-[10px] text-gray-400 font-bold uppercase block mb-0.5">Recommended Schedule</span>
                          <span className="text-sm text-gray-700 font-medium">{selectedBatchForPreview.program.schedule}</span>
                        </div>
                      )}
                    </div>

                    {selectedBatchForPreview.program.features && selectedBatchForPreview.program.features.length > 0 && (
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block mb-2">Features Included</span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedBatchForPreview.program.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-sm text-gray-700">
                              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50/50 p-4 rounded-lg border border-amber-100/60">
                    <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>No course is linked to this batch. Edit the batch to link a course.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  handleEditClick(selectedBatchForPreview);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-bold transition-colors"
              >
                Edit Batch
              </button>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2 bg-brand-navy text-white rounded-lg text-sm font-bold hover:bg-brand-navy/90 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border-8 border-red-50/50">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 font-outfit">{confirmModal.title}</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                {confirmModal.message}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={closeConfirmModal}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm shadow-red-200"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminBatches;
