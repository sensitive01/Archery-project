import React, { useState, useEffect, useMemo } from "react";
import { ClipboardCheck, Search, Filter, Calendar, History, Clock, X, User, Upload } from "lucide-react";
import { getAttendance, updateAttendance } from "../../services/adminService";
import { getStudent } from "../../services/userService";
import { getBatches } from "../../services/batchService";
import toast from "react-hot-toast";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";

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

const formatLocalDateStr = (dateStr) => {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  return `${day}-${month}-${year}`;
};

const AdminAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [allBatches, setAllBatches] = useState([]);
  const [modalSelectedDate, setModalSelectedDate] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, onConfirm: null, message: '' });

  // Filter States
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Fetch batches & all attendance data on mount
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const batches = await getBatches();
        setAllBatches(batches || []);
      } catch (err) {
        console.error("Failed to load batches:", err);
      }
    };
    fetchBatches();
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const data = await getAttendance(null, true);
      setAttendance(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load attendance records");
    } finally {
      setLoading(false);
    }
  };

  // Derive filter options dynamically
  const courses = useMemo(() => {
    const map = {};
    attendance.forEach(r => {
      if (r.courseId && !map[r.courseId]) {
        map[r.courseId] = r.courseTitle;
      }
    });
    return Object.entries(map).map(([id, title]) => ({ id, title }));
  }, [attendance]);

  const batches = useMemo(() => {
    const map = {};
    attendance.forEach(r => {
      if (selectedCourse && r.courseId !== selectedCourse) return;
      if (r.batchId && !map[r.batchId]) {
        map[r.batchId] = r.batch;
      }
    });
    return Object.entries(map).map(([id, label]) => ({ id, label }));
  }, [attendance, selectedCourse]);

  const candidates = useMemo(() => {
    const map = {};
    attendance.forEach(r => {
      if (selectedCourse && r.courseId !== selectedCourse) return;
      if (selectedBatch && r.batchId !== selectedBatch) return;
      if (r.studentId && !map[r.studentId]) {
        map[r.studentId] = r.name;
      }
    });
    return Object.entries(map).map(([id, name]) => ({ id, name }));
  }, [attendance, selectedCourse, selectedBatch]);

  // Clean up dependent filters when upper levels change
  useEffect(() => {
    if (selectedCourse) {
      const batchStillValid = attendance.some(r => r.courseId === selectedCourse && r.batchId === selectedBatch);
      if (!batchStillValid) {
        setSelectedBatch("");
      }
    }
  }, [selectedCourse, attendance]);

  useEffect(() => {
    if (selectedBatch) {
      const candidateStillValid = attendance.some(r => r.batchId === selectedBatch && r.studentId === selectedCandidate);
      if (!candidateStillValid) {
        setSelectedCandidate("");
      }
    }
  }, [selectedBatch, attendance]);

  // Mark Attendance Modal state
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [selectedRecordForMark, setSelectedRecordForMark] = useState(null);

  // Student History Modal state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);
  const [studentHistory, setStudentHistory] = useState([]);

  // Preview Details Modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecordForDetails, setSelectedRecordForDetails] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);


  // Photo uploading state
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Camera preview state
  const [stream, setStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = React.useRef(null);

  const startCamera = async () => {
    try {
      setCapturedPhoto("");
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" }
      });
      setStream(mediaStream);
      
      // Delay slightly to ensure video element is bound to DOM when camera turns on
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
      
      setCameraActive(true);
    } catch (err) {
      console.error("Failed to access webcam:", err);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 192;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
      setCapturedPhoto(dataUrl);
      stopCamera();
    }
  };

  const handleCloseMarkModal = () => {
    setShowMarkModal(false);
    stopCamera();
    setCapturedPhoto("");
  };

  // Automatically handle camera activation when modal visibility changes
  useEffect(() => {
    if (showMarkModal) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [showMarkModal]);

  const handleViewHistory = async (record) => {
    setSelectedStudentForHistory(record);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const data = await getStudent(record.studentId);
      if (data && data.attendance) {
        setStudentHistory(data.attendance);
      } else {
        setStudentHistory([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load attendance history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = "archery-images";

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );
      const fileData = await res.json();

      if (fileData.secure_url) {
        setCapturedPhoto(fileData.secure_url);
        toast.success("Photo uploaded to Cloudinary successfully!");
      } else {
        console.error("Upload failed", fileData);
        toast.error("Upload failed. Ensure Cloudinary settings are correct.");
      }
    } catch (err) {
      console.error("Error uploading image", err);
      toast.error("Error uploading image to Cloudinary");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const submitAttendanceStatus = (status) => {
    if (!selectedRecordForMark || !modalSelectedDate) return;
    
    if (!capturedPhoto) {
      setConfirmDialog({
        isOpen: true,
        message: `Do you want to continue marking ${selectedRecordForMark.name} as ${status} without a verification photo?`,
        onConfirm: () => {
          setConfirmDialog({ isOpen: false, onConfirm: null, message: '' });
          executeAttendanceSubmit(status);
        }
      });
      return;
    }
    executeAttendanceSubmit(status);
  };

  const executeAttendanceSubmit = async (status) => {
    setUploadingPhoto(true);
    let finalPhoto = capturedPhoto;

    try {
      if (capturedPhoto && capturedPhoto.startsWith("data:")) {
        // Upload webcam base64 snapshot to Cloudinary
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = "archery-images";
        const data = new FormData();
        data.append("file", capturedPhoto);
        data.append("upload_preset", uploadPreset);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: data,
          }
        );
        const fileData = await uploadRes.json();
        if (fileData.secure_url) {
          finalPhoto = fileData.secure_url;
        } else {
          console.error("Cloudinary upload failed for webcam photo:", fileData);
          toast.error("Failed to upload photo to Cloudinary. Attendance not updated.");
          setUploadingPhoto(false);
          return;
        }
      }

      const res = await updateAttendance(
        selectedRecordForMark.studentId,
        modalSelectedDate,
        status,
        finalPhoto
      );

      if (res.ok) {
        setAttendance((prev) =>
          prev.map((item) => {
            if (item.studentId === selectedRecordForMark.studentId && item.batchId === selectedRecordForMark.batchId) {
              // Update studentAttendance array
              let updatedAtt = [...(item.studentAttendance || [])];
              const recordIndex = updatedAtt.findIndex(att => getISTDateString(att.date) === modalSelectedDate);
              if (recordIndex > -1) {
                updatedAtt[recordIndex] = { ...updatedAtt[recordIndex], status: status.toLowerCase(), photo: finalPhoto };
              } else {
                updatedAtt.push({
                  date: new Date(modalSelectedDate),
                  status: status.toLowerCase(),
                  photo: finalPhoto
                });
              }
              
              const isCurrentPageDate = modalSelectedDate === item.date;
              return {
                ...item,
                status: isCurrentPageDate ? status : item.status,
                studentAttendance: updatedAtt
              };
            }
            return item;
          })
        );
        toast.success(`Marked ${selectedRecordForMark.name} as ${status} for ${modalSelectedDate}`);
        handleCloseMarkModal();
      } else {
        toast.error(res.data?.message || "Failed to update attendance");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while updating attendance");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const isAnyFilterActive = !!(selectedCourse || selectedBatch || selectedCandidate || fromDate || toDate);

  const filteredAttendance = useMemo(() => {
    return attendance.filter((record) => {
      // 1. Mandatory filters
      if (selectedCourse && record.courseId !== selectedCourse) return false;
      if (selectedBatch && record.batchId !== selectedBatch) return false;
      if (selectedCandidate && record.studentId !== selectedCandidate) return false;
      if (fromDate && record.date < fromDate) return false;
      if (toDate && record.date > toDate) return false;

      // 2. Search term
      const matchesSearch =
        record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.batch.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      // 3. Status filter
      const matchesStatus = statusFilter === "All" || record.status === statusFilter;
      if (!matchesStatus) return false;

      return true;
    });
  }, [attendance, selectedCourse, selectedBatch, selectedCandidate, fromDate, toDate, searchTerm, statusFilter]);

  const displayedAttendance = useMemo(() => {
    if (selectedCandidate) {
      // Detail View: return all records for the selected candidate
      return filteredAttendance;
    }

    // Summary View: Group by studentId + batchId
    const grouped = {};
    filteredAttendance.forEach(record => {
      const key = `${record.studentId}_${record.batchId}`;
      if (!grouped[key]) {
        grouped[key] = {
          ...record,
          allRecords: [record]
        };
      } else {
        grouped[key].allRecords.push(record);
      }
    });

    return Object.values(grouped).map(group => {
      const records = group.allRecords;
      const totalSessions = records.length;
      
      const presentCount = records.filter(r => r.status === 'Present').length;
      const lateCount = records.filter(r => r.status === 'Late').length;
      const absentCount = records.filter(r => r.status === 'Absent').length;
      const markedCount = presentCount + lateCount + absentCount;
      
      const rate = markedCount > 0 ? Math.round(((presentCount + lateCount) / markedCount) * 100) : 0;
      
      let dateDesc = "All Sessions";
      if (fromDate || toDate) {
        const sortedDates = records.map(r => r.date).sort();
        if (sortedDates.length > 0) {
          dateDesc = `${formatLocalDateStr(sortedDates[0])} - ${formatLocalDateStr(sortedDates[sortedDates.length - 1])}`;
        }
      }

      return {
        ...group,
        date: dateDesc,
        isSummary: true,
        rate: rate,
        markedCount: markedCount,
        presentCount: presentCount,
        lateCount: lateCount,
        absentCount: absentCount,
        totalSessions: totalSessions
      };
    });
  }, [filteredAttendance, selectedCandidate, fromDate, toDate]);

  const handleExportCSV = () => {
    if (displayedAttendance.length === 0) return;

    // Headers
    const headers = ["Candidate Name", "Course", "Batch", "Date", "Status / Rate", "Identity Photo Presence"];
    
    // Rows
    const rows = displayedAttendance.map(record => {
      const statusText = record.isSummary 
        ? (record.markedCount > 0 ? `${record.rate}% (${record.presentCount + record.lateCount}/${record.markedCount})` : "No Sessions Marked")
        : record.status;
      return [
        record.name,
        record.courseTitle,
        record.batch,
        record.date,
        statusText,
        record.photo ? "Yes" : "No"
      ];
    });

    // Construct CSV
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_export_${getISTDateString(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { currentData: paginatedAttendance, currentPage: attendancePage, totalPages: attendanceTotalPages, next: nextAttendance, prev: prevAttendance, itemsPerPage: itemsPerPageAttendance } = usePagination(displayedAttendance);
  const { currentData: paginatedHistory, currentPage: historyPage, totalPages: historyTotalPages, next: nextHistory, prev: prevHistory } = usePagination([...studentHistory].sort((a, b) => new Date(b.date) - new Date(a.date)));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900">Attendance Tracker</h1>
          <p className="text-gray-500 text-sm">Monitor and mark daily student presence across batches.</p>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-6 mb-6">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 font-bold text-gray-800">
            <Filter className="w-5 h-5 text-brand-blue" />
            <span>Attendance Filters</span>
          </div>
          {isAnyFilterActive && (
            <button
              onClick={() => {
                setSelectedCourse("");
                setSelectedBatch("");
                setSelectedCandidate("");
                setFromDate("");
                setToDate("");
                setSearchTerm("");
                setStatusFilter("All");
              }}
              className="text-xs text-brand-blue hover:text-blue-800 font-bold flex items-center gap-1 cursor-pointer bg-transparent border-none"
            >
              <X className="w-3.5 h-3.5" />
              Clear All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* Course Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-250 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all text-sm bg-white font-semibold text-gray-700"
            >
              <option value="">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          {/* Batch Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Batch</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-250 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all text-sm bg-white font-semibold text-gray-700"
            >
              <option value="">All Batches</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.label}</option>
              ))}
            </select>
          </div>

          {/* Candidate Selector */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Candidate</label>
            <select
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-250 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all text-sm bg-white font-semibold text-gray-700"
            >
              <option value="">All Candidates</option>
              {candidates.map(cand => (
                <option key={cand.id} value={cand.id}>{cand.name}</option>
              ))}
            </select>
          </div>

          {/* From Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-250 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all text-sm bg-white font-semibold text-gray-700"
            />
          </div>

          {/* To Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-250 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all text-sm bg-white font-semibold text-gray-700"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mt-6 pt-4 border-t border-gray-100">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder-gray-400 text-sm"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto justify-end">
            <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200">
              {["All", "Present", "Late", "Absent", "Unattended"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === status
                      ? "bg-brand-navy text-white shadow-sm"
                      : "bg-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCSV}
              disabled={!isAnyFilterActive || displayedAttendance.length === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all ${
                isAnyFilterActive && displayedAttendance.length > 0
                  ? "bg-brand-blue text-white hover:bg-blue-600 cursor-pointer"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {isAnyFilterActive ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-outfit tracking-wider">
                <tr>
                  <th className="px-6 py-4">SL NO</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Batch Details</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-500 font-medium">
                      <div className="flex justify-center items-center gap-2 text-brand-blue">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-blue"></div>
                        <span>Loading attendance...</span>
                      </div>
                    </td>
                  </tr>
                ) : displayedAttendance.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-400">
                      No attendance records found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  paginatedAttendance.map((record, index) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                        {(attendancePage - 1) * itemsPerPageAttendance + index + 1}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-xs flex-shrink-0">
                          {record.name ? record.name.charAt(0) : "?"}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewHistory(record)}
                            className="font-bold text-gray-900 hover:text-brand-blue hover:underline text-left text-sm"
                            title="View Attendance History"
                          >
                            {record.name}
                          </button>
                          <button
                            onClick={() => handleViewHistory(record)}
                            className="p-1 text-gray-400 hover:text-brand-blue rounded-lg transition-colors"
                            title="View Attendance History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{record.courseTitle}</td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{record.batch}</td>
                      <td className="px-6 py-4 text-gray-500">
                        {record.isSummary ? record.date : formatLocalDateStr(record.date)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {record.isSummary ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-brand-blue/10 text-brand-blue border border-brand-blue/20">
                              {record.markedCount > 0 ? `${record.rate}% (${record.presentCount + record.lateCount}/${record.markedCount})` : "No Sessions Marked"}
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              record.status === "Present"
                                ? "bg-green-100 text-green-700"
                                : record.status === "Late"
                                ? "bg-amber-100 text-amber-700"
                                : record.status === "Unattended"
                                ? "bg-gray-100 text-gray-600"
                                : "bg-red-100 text-red-700"
                            }`}>
                              {record.status}
                            </span>
                          )}

                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center gap-3 justify-end">
                           <button
                             onClick={() => {
                               setSelectedRecordForDetails(record);
                               setShowDetailsModal(true);
                             }}
                             className="text-gray-600 hover:text-brand-blue font-bold text-xs bg-transparent border-none cursor-pointer"
                           >
                             View Details
                           </button>
                           <span className="text-gray-300 font-medium">|</span>
                           <button
                             onClick={() => {
                               setSelectedRecordForMark(record);
                               if (record.isSummary) {
                                 // Find batch session dates to determine default selected date
                                 const batchObj = allBatches.find(b => b._id === record.batchId);
                                 const dates = batchObj?.sessionDates || [];
                                 
                                 // Find the first unmarked date
                                 const unmarkedDate = dates.find(d => {
                                   const dateStr = getISTDateString(d);
                                   const attMatch = record.studentAttendance?.find(att => getISTDateString(att.date) === dateStr);
                                   return !attMatch || !["present", "absent", "late"].includes(attMatch.status.toLowerCase());
                                 });

                                 if (unmarkedDate) {
                                   setModalSelectedDate(getISTDateString(unmarkedDate));
                                 } else if (dates.length > 0) {
                                   setModalSelectedDate(getISTDateString(dates[0]));
                                 } else {
                                   setModalSelectedDate("");
                                 }
                               } else {
                                 setModalSelectedDate(record.date);
                               }
                               setShowMarkModal(true);
                             }}
                             className="text-brand-blue hover:text-blue-800 font-bold text-xs bg-transparent border-none cursor-pointer"
                           >
                             Mark Change
                           </button>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination currentPage={attendancePage} totalPages={attendanceTotalPages} next={nextAttendance} prev={prevAttendance} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-150 p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-brand-blue/10 flex items-center justify-center text-brand-blue mb-4">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Select a Filter to View Attendance</h3>
          <p className="text-gray-500 text-sm max-w-md">
            Please select at least one filter option (Batch, Course, Candidate, or Date Range) to display records.
          </p>
        </div>
      )}

      {/* MARK ATTENDANCE MODAL */}
      {showMarkModal && selectedRecordForMark && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in duration-300">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-brand-navy text-white">
              <h3 className="font-bold text-lg">Mark Attendance</h3>
              <button onClick={handleCloseMarkModal} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Mark attendance status for <strong className="text-gray-900">{selectedRecordForMark.name}</strong>
              </p>

              {/* Camera Capture Section */}
              <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-150 rounded-xl p-4 space-y-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider self-start">Identity Verification</span>
                
                {uploadingPhoto ? (
                  <div className="w-full max-w-[240px] h-[160px] rounded-lg border border-gray-200 bg-white flex flex-col items-center justify-center p-3 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue mb-2"></div>
                    <p className="text-[10px] text-gray-500 font-semibold">Processing photo...</p>
                  </div>
                ) : capturedPhoto ? (
                  <div className="relative w-full max-w-[240px] h-[160px] rounded-lg overflow-hidden border-2 border-brand-blue shadow-md">
                    <img 
                      src={capturedPhoto} 
                      alt="Captured identity" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={startCamera}
                      className="absolute bottom-1 right-1 bg-brand-navy/80 hover:bg-brand-navy text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm transition-all shadow-sm"
                    >
                      Retake
                    </button>
                  </div>
                ) : cameraActive ? (
                  <div className="relative w-full max-w-[240px] h-[160px] rounded-lg overflow-hidden border border-gray-200 bg-black shadow-md flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={capturePhoto}
                      className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-brand-red/90 hover:bg-brand-red text-white text-[10px] font-bold px-3 py-1.5 rounded backdrop-blur-sm transition-all shadow-md flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                      Capture
                    </button>
                  </div>
                ) : (
                  <div className="w-full max-w-[240px] h-[160px] rounded-lg border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center p-3 text-center">
                    <User className="w-8 h-8 text-gray-300 mb-1" />
                    <p className="text-[10px] text-gray-400 font-medium mb-2">Camera access is required for verification</p>
                    <button
                      onClick={startCamera}
                      className="bg-brand-navy hover:bg-brand-navy/95 text-white text-[10px] font-bold px-3 py-1.5 rounded transition-all shadow-sm"
                    >
                      Enable Camera
                    </button>
                  </div>
                )}

                <div className="w-full flex items-center justify-between gap-2 border-t pt-3 mt-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Or Upload Image</span>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm">
                    <Upload className="w-3.5 h-3.5 text-gray-500" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-xs text-gray-400">
                  <span className="block font-bold uppercase">Batch</span>
                  <span className="text-gray-700 font-medium">{selectedRecordForMark.batch}</span>
                </div>
                <div className="text-xs text-gray-400">
                  <span className="block font-bold uppercase">Date</span>
                  {selectedRecordForMark.isSummary ? (
                    (() => {
                      const batchObj = allBatches.find(b => b._id === selectedRecordForMark.batchId);
                      const dates = batchObj?.sessionDates || [];
                      const dateStrings = dates.map(d => getISTDateString(d));

                      if (dateStrings.length > 0) {
                        return (
                          <select
                            value={modalSelectedDate}
                            onChange={(e) => setModalSelectedDate(e.target.value)}
                            className="mt-1 block w-full rounded-lg border border-gray-200 bg-white p-1.5 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                          >
                            <option value="">-- Select Date --</option>
                            {dateStrings.map(dateStr => {
                              const labelStr = formatLocalDateStr(dateStr);
                              
                              // Check if student has attendance for this dateStr
                              let statusText = "";
                              if (selectedRecordForMark?.studentAttendance) {
                                const attMatch = selectedRecordForMark.studentAttendance.find(att => {
                                  if (!att.date) return false;
                                  return getISTDateString(att.date) === dateStr;
                                });
                                if (attMatch && ["present", "absent", "late"].includes(attMatch.status.toLowerCase())) {
                                  statusText = attMatch.status.charAt(0).toUpperCase() + attMatch.status.slice(1);
                                }
                              }
                              
                              const displayLabel = statusText ? `${labelStr} (${statusText})` : labelStr;

                              return (
                                <option key={dateStr} value={dateStr}>
                                  {displayLabel}
                                </option>
                              );
                            })}
                          </select>
                        );
                      }
                      return <span className="text-gray-700 font-medium">{modalSelectedDate}</span>;
                    })()
                  ) : (
                    <span className="text-gray-700 font-semibold text-sm block mt-1">
                      {formatLocalDateStr(modalSelectedDate)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={() => submitAttendanceStatus("Present")}
                  disabled={uploadingPhoto}
                  className={`w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-sm shadow-sm ${uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Present
                </button>
                <button
                  onClick={() => submitAttendanceStatus("Absent")}
                  disabled={uploadingPhoto}
                  className={`w-full py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-sm shadow-sm ${uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Absent
                </button>
                <button
                  onClick={() => submitAttendanceStatus("Late")}
                  disabled={uploadingPhoto}
                  className={`w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors text-sm shadow-sm ${uploadingPhoto ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Late
                </button>
              </div>
            </div>
            <div className="px-6 py-3 border-t bg-gray-50 flex justify-end">
              <button
                onClick={handleCloseMarkModal}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE HISTORY MODAL */}
      {showHistoryModal && selectedStudentForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl w-full max-w-xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b flex justify-between items-center bg-brand-navy text-white bg-gradient-to-r from-brand-navy to-brand-blue">
              <div>
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-0.5">Student Profile</span>
                <h3 className="font-bold text-lg">{selectedStudentForHistory.name}</h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto p-6 flex-1 space-y-6">
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-brand-blue">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
                  <span className="font-semibold text-sm">Loading attendance history...</span>
                </div>
              ) : (
                <>
                  {/* Summary Stats Grid */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: "Total Sessions", value: studentHistory.length, color: "bg-gray-50 text-gray-700 border-gray-100" },
                      { label: "Present", value: studentHistory.filter(h => h.status === 'present').length, color: "bg-green-50 text-green-700 border-green-100" },
                      { label: "Late", value: studentHistory.filter(h => h.status === 'late').length, color: "bg-amber-50 text-amber-700 border-amber-100" },
                      { label: "Absent", value: studentHistory.filter(h => h.status === 'absent').length, color: "bg-red-50 text-red-700 border-red-100" }
                    ].map((stat, idx) => (
                      <div key={idx} className={`rounded-xl border p-3 text-center ${stat.color}`}>
                        <span className="text-[9px] font-bold uppercase tracking-wider block opacity-70 mb-1 leading-none">{stat.label}</span>
                        <span className="text-xl font-bold">{stat.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Presence Rate */}
                  {studentHistory.length > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-brand-blue">Attendance Percentage</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Calculated based on (Present + Late) / Marked classes</p>
                      </div>
                      <div className="text-2xl font-black text-brand-blue">
                        {(() => {
                          const marked = studentHistory.filter(h => h.status === 'present' || h.status === 'absent' || h.status === 'late');
                          if (!marked.length) return 100;
                          return Math.round(
                            ((studentHistory.filter(h => h.status === 'present' || h.status === 'late').length) / marked.length) * 100
                          );
                        })()}%
                      </div>
                    </div>
                  )}

                  {/* History List Table */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Attendance History Log</h4>
                    {studentHistory.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        No attendance records marked yet.
                      </p>
                    ) : (
                      <div className="border border-gray-100 rounded-xl overflow-x-auto shadow-sm">
                        <table className="w-full text-sm text-left text-gray-500">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-semibold tracking-wider">
                            <tr>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {paginatedHistory.map((history, i) => (
                              <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 font-medium text-gray-900">
                                  {formatLocalDateStr(getISTDateString(history.date))}
                                </td>
                                <td className="px-4 py-3 flex items-center justify-between gap-3">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    history.status === "present"
                                      ? "bg-green-100 text-green-700"
                                      : history.status === "late"
                                      ? "bg-amber-100 text-amber-700"
                                      : history.status === "unattended"
                                      ? "bg-gray-100 text-gray-600"
                                      : "bg-red-100 text-red-700"
                                  }`}>
                                    {history.status}
                                  </span>
                                  {history.photo && (
                                    <div className="relative group">
                                      <img 
                                        src={history.photo} 
                                        alt="Identity verification" 
                                        className="w-10 h-10 object-cover rounded-lg border border-gray-200 cursor-zoom-in"
                                      />
                                      <div className="hidden group-hover:block absolute bottom-12 right-0 z-50 p-1 bg-white border rounded-xl shadow-xl">
                                        <img 
                                          src={history.photo} 
                                          alt="Identity verification full size" 
                                          className="w-48 h-36 object-cover rounded-lg"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {studentHistory.length > 0 && <Pagination currentPage={historyPage} totalPages={historyTotalPages} next={nextHistory} prev={prevHistory} />}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end shrink-0">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-5 py-2 bg-brand-navy text-white rounded-lg text-sm font-bold hover:bg-brand-navy/90 transition-colors"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

       {/* PREVIEW DETAILS MODAL */}
       {showDetailsModal && selectedRecordForDetails && (() => {
         const batchObj = allBatches.find(b => b._id === selectedRecordForDetails.batchId);
         const dates = batchObj?.sessionDates || [];
         const studentAttendance = selectedRecordForDetails.studentAttendance || [];
         
          const sessionsList = dates.map((d, idx) => {
           const dateStr = getISTDateString(d);
           const attMatch = studentAttendance.find(att => getISTDateString(att.date) === dateStr);
           const status = attMatch ? attMatch.status : "unattended";
           const photo = attMatch ? attMatch.photo : "";
           const checkInTime = attMatch ? attMatch.checkInTime : "";
           return {
             session: idx + 1,
             dateStr,
             status: status.charAt(0).toUpperCase() + status.slice(1),
             photo,
             checkInTime
           };
         });
 
         const presentCount = sessionsList.filter(s => s.status === 'Present').length;
         const absentCount = sessionsList.filter(s => s.status === 'Absent').length;
         const lateCount = sessionsList.filter(s => s.status === 'Late').length;
         const unattendedCount = sessionsList.filter(s => s.status === 'Unattended').length;
 
         return (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
             <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in duration-300">
               {/* Header */}
               <div className="px-6 py-4 border-b flex justify-between items-center bg-brand-navy text-white bg-gradient-to-r from-brand-navy to-brand-blue">
                 <div>
                   <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-0.5">
                     {!selectedRecordForDetails.isSummary ? "Attendance Record" : "Preview Details"}
                   </span>
                   <h3 className="font-bold text-lg">{selectedRecordForDetails.name}</h3>
                 </div>
                 <button onClick={() => setShowDetailsModal(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                   <X className="w-5 h-5 text-white" />
                 </button>
               </div>
 
               {/* Content */}
               <div className="overflow-y-auto p-6 flex-1 space-y-6">
                 
                 {/* === SINGLE RECORD VIEW (non-summary row) === */}
                 {!selectedRecordForDetails.isSummary ? (() => {
                   const rec = selectedRecordForDetails;
                   // Format checkInTime HH:MM -> 12hr AM/PM
                   let timeDisplay = "Not recorded";
                   if (rec.checkInTime) {
                     const [h, m] = rec.checkInTime.split(":").map(Number);
                     const ampm = h >= 12 ? "PM" : "AM";
                     const hour12 = h % 12 || 12;
                     timeDisplay = `${hour12}:${String(m).padStart(2, "0")} ${ampm}`;
                   }
                   const isPresent = rec.status === "Present";
                   const isLate = rec.status === "Late";
                   return (
                     <>
                       {/* Photo */}
                       <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center" style={{ height: "220px" }}>
                         {rec.photo ? (
                           <img src={rec.photo} alt="Check-in selfie" className="w-full h-full object-cover" />
                         ) : (
                           <div className="flex flex-col items-center gap-2 text-gray-400">
                             <User className="w-12 h-12" />
                             <span className="text-xs font-medium">{isPresent || isLate ? "No photo uploaded" : "Student was absent/unattended"}</span>
                           </div>
                         )}
                       </div>
                       {/* Details cards */}
                       <div className="grid grid-cols-1 gap-3">
                         <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</span>
                           <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                             rec.status === "Present" ? "bg-green-100 text-green-700 border-green-200"
                             : rec.status === "Late" ? "bg-amber-100 text-amber-700 border-amber-200"
                             : rec.status === "Absent" ? "bg-red-100 text-red-700 border-red-200"
                             : "bg-gray-100 text-gray-600 border-gray-200"
                           }`}>{rec.status || "Unattended"}</span>
                         </div>
                         <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</span>
                           <span className="text-sm font-bold text-gray-900">{formatLocalDateStr(rec.date)}</span>
                         </div>
                         <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Check-In Time</span>
                           <span className="text-sm font-bold text-gray-900">{timeDisplay}</span>
                         </div>
                         <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Batch</span>
                           <span className="text-sm font-bold text-gray-900">{rec.batch}</span>
                         </div>
                       </div>
                       {rec.photo && (
                         <a href={rec.photo} target="_blank" rel="noreferrer"
                           className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-brand-navy text-white text-sm font-bold hover:bg-blue-900 transition-colors">
                           Open Full Photo
                         </a>
                       )}
                     </>
                   );
                 })() : (
                 <>
                 {/* Course & Batch Details Grid */}
                 <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                   <div>
                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Course Details</h4>
                     <p className="text-gray-900 font-bold text-base mb-1">{batchObj?.program?.title || "Program Details"}</p>
                     <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Level: <span className="text-brand-blue font-bold">{batchObj?.level || "Beginner"}</span></p>
                   </div>
                   <div>
                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Batch Schedule</h4>
                     <p className="text-gray-900 font-bold text-sm mb-1">{batchObj?.name} - {batchObj?.time}</p>
                     <p className="text-xs text-gray-500 font-medium">Days: <span className="text-gray-700 font-bold">{batchObj?.days?.join(", ") || "N/A"}</span></p>
                     {batchObj?.location && (
                       <p className="text-xs text-gray-500 font-medium mt-0.5">Location: <span className="text-gray-700 font-bold">{batchObj.location}</span></p>
                     )}
                   </div>
                 </div>
 
                 {/* Summary Stats Grid */}
                 <div className="grid grid-cols-4 gap-3">
                   {[
                     { label: "Total Classes", value: sessionsList.length, color: "bg-gray-50 text-gray-700 border-gray-100" },
                     { label: "Present", value: presentCount, color: "bg-green-50 text-green-700 border-green-100" },
                     { label: "Late", value: lateCount, color: "bg-amber-50 text-amber-700 border-amber-100" },
                     { label: "Absent", value: absentCount, color: "bg-red-50 text-red-700 border-red-100" }
                   ].map((stat, idx) => (
                     <div key={idx} className={`rounded-xl border p-3 text-center ${stat.color}`}>
                       <span className="text-[9px] font-bold uppercase tracking-wider block opacity-70 mb-1 leading-none">{stat.label}</span>
                       <span className="text-xl font-bold">{stat.value}</span>
                     </div>
                   ))}
                 </div>
 
                 {/* Attendance table */}
                 <div>
                   <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Scheduled Sessions & Attendance Status</h4>
                   {sessionsList.length === 0 ? (
                     <p className="text-sm text-gray-400 text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                       No scheduled session dates found for this batch.
                     </p>
                   ) : (
                     <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                       <table className="w-full text-sm text-left text-gray-500">
                         <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-semibold tracking-wider">
                           <tr>
                             <th className="px-4 py-3">Session</th>
                             <th className="px-4 py-3">Scheduled Date</th>
                             <th className="px-4 py-3">Check-In Time</th>
                             <th className="px-4 py-3">Attendance Status</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                           {sessionsList.map((session, i) => (
                             <tr key={i} className="hover:bg-gray-50 transition-colors">
                               <td className="px-4 py-3 font-semibold text-gray-900">
                                 Session {session.session}
                               </td>
                               <td className="px-4 py-3 font-medium text-gray-600">
                                 {formatLocalDateStr(session.dateStr)}
                               </td>
                               <td className="px-4 py-3 text-gray-600">
                                 {(() => {
                                   if (!session.checkInTime) return <span className="text-gray-400 text-xs italic">—</span>;
                                   const [h, m] = session.checkInTime.split(":").map(Number);
                                   const ampm = h >= 12 ? "PM" : "AM";
                                   const hour12 = h % 12 || 12;
                                   return <span className="font-semibold">{hour12}:{String(m).padStart(2,"0")} {ampm}</span>;
                                 })()}
                               </td>
                                <td className="px-4 py-3 flex items-center justify-between gap-3">
                                 <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                   session.status === "Present"
                                     ? "bg-green-100 text-green-700"
                                     : session.status === "Late"
                                     ? "bg-amber-100 text-amber-700"
                                     : session.status === "Unattended"
                                     ? "bg-gray-100 text-gray-600"
                                     : "bg-red-100 text-red-700"
                                 }`}>
                                   {session.status}
                                 </span>

                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>
                     </div>
                   )}
                 </div>
                 </>
                 )}
               </div>
 
               {/* Footer */}
               <div className="px-6 py-4 border-t bg-gray-50 flex justify-end shrink-0">
                 <button
                   onClick={() => setShowDetailsModal(false)}
                   className="px-5 py-2 bg-brand-navy text-white rounded-lg text-sm font-bold hover:bg-brand-navy/90 transition-colors"
                 >
                   Close
                 </button>
               </div>
             </div>
           </div>
         );
       })()}
 
      {/* Confirm Action Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 transform transition-all animate-in zoom-in duration-300">
                <h3 className="text-lg font-semibold text-white mb-2">Confirm Action</h3>
                <p className="text-gray-300 text-sm mb-6">{confirmDialog.message}</p>
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setConfirmDialog({ isOpen: false, onConfirm: null, message: '' })}
                        className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => confirmDialog.onConfirm()}
                        className="px-4 py-2 text-sm font-medium text-white bg-brand-blue hover:bg-blue-600 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendance;
