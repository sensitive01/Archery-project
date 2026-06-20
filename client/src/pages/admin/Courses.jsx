import React, { useState } from "react";
import { Plus, Edit2, Trash2, Book, Eye, Search } from "lucide-react";
import {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
} from "../../services/programService";
import { getAllEquipment } from "../../services/equipmentService";
import toast from "react-hot-toast";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const initialFormState = {
    title: "",
    level: "Beginner",
    description: "",
    fees: "",
    duration: "",
    totalClasses: "",
    image: "",
    ageGroup: "",
    sessionDuration: "",
    schedule: "",
    equipment: "",
    features: "",
    kits: [],
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchCourses = async () => {
    try {
      const data = await getAllPrograms(true);
      if (Array.isArray(data)) {
        const formatted = data.map((p) => ({
          id: p._id,
          courseId: p.courseId,
          name: p.title,
          level: p.level,
          description: p.description,
          amount: p.fees,
          duration: p.duration,
          totalClasses: p.totalClasses,
          image: p.image,
          ageGroup: p.ageGroup,
          schedule: p.schedule,
          sessionDuration: p.sessionDuration,
          equipment: p.equipment,
          features: p.features,
          kits: p.kits || [],
          active: p.active !== false,
        }));
        setCourses(formatted);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const [equipmentOptions, setEquipmentOptions] = useState([]);

  const fetchEquipmentOptions = async () => {
    try {
      const data = await getAllEquipment();
      if (Array.isArray(data)) {
        setEquipmentOptions(data);
      }
    } catch (err) {
      console.error("Failed to load equipment options:", err);
    }
  };

  React.useEffect(() => {
    fetchCourses();
    fetchEquipmentOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddSelectedEquipmentRow = () => {
    setFormData((prev) => ({
      ...prev,
      kits: [...(prev.kits || []), { name: "", qty: 1, price: 0 }]
    }));
  };

  const handleEquipmentSelectChange = (index, selectedName) => {
    const matched = equipmentOptions.find(eq => eq.name === selectedName);
    setFormData((prev) => {
      const updatedKits = [...(prev.kits || [])];
      updatedKits[index] = {
        ...updatedKits[index],
        name: selectedName,
        price: matched ? matched.price : 0
      };
      return { ...prev, kits: updatedKits };
    });
  };

  const handleKitRowChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedKits = [...(prev.kits || [])];
      updatedKits[index] = { ...updatedKits[index], [field]: value };
      return { ...prev, kits: updatedKits };
    });
  };

  const handleRemoveKitRow = (index) => {
    setFormData((prev) => {
      const updatedKits = [...(prev.kits || [])];
      updatedKits.splice(index, 1);
      return { ...prev, kits: updatedKits };
    });
  };

  const handleEditClick = (course) => {
    setEditingId(course.id);
    setFormData({
      title: course.name,
      level: course.level,
      description: course.description,
      fees: course.amount,
      duration: course.duration,
      totalClasses: course.totalClasses || "",
      image: course.image,
      ageGroup: course.ageGroup || "",
      schedule: course.schedule || "",
      sessionDuration: course.sessionDuration || "",
      equipment: course.equipment || "",
      features: Array.isArray(course.features)
        ? course.features.join("\n")
        : course.features || "",
      kits: course.kits || [],
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await deleteProgram(id);
        fetchCourses();
        toast.success("Course deleted successfully");
      } catch (error) {
        console.error("Error deleting course:", error);
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const course = courses.find((c) => c.id === id);
      if (!course) return;
      const payload = {
        title: course.name,
        level: course.level,
        description: course.description,
        fees: Number(course.amount),
        duration: course.duration,
        totalClasses: Number(course.totalClasses),
        image: course.image,
        ageGroup: course.ageGroup,
        schedule: course.schedule,
        sessionDuration: course.sessionDuration,
        equipment: course.equipment,
        features: Array.isArray(course.features)
          ? course.features
          : course.features
            ? course.features.split("\n")
            : [],
        kits: course.kits || [],
        active: !currentStatus,
      };

      const result = await updateProgram(id, payload);
      if (result.ok) {
        toast.success(`Course ${!currentStatus ? "activated" : "deactivated"} successfully`);
        fetchCourses();
      } else {
        toast.error("Failed to update course status");
      }
    } catch (error) {
      console.error("Toggle active error:", error);
      toast.error("An error occurred");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
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
        },
      );
      const fileData = await res.json();

      if (fileData.secure_url) {
        setFormData((prev) => ({ ...prev, image: fileData.secure_url }));
      } else {
        console.error("Upload failed", fileData);
        toast.error(
          "Upload failed. Ensure you have an unsigned upload preset 'archery-images' or configure one.",
        );
      }
    } catch (err) {
      console.error("Error uploading image", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const featureList = formData.features
        .split("\n")
        .filter((f) => f.trim() !== "");

      const payload = {
        title: formData.title,
        level: formData.level,
        description: formData.description,
        fees: Number(formData.fees),
        duration: formData.duration,
        totalClasses: Number(formData.totalClasses),
        image: formData.image,
        ageGroup: formData.ageGroup,
        schedule: formData.schedule,
        sessionDuration: Number(formData.sessionDuration),
        equipment: formData.equipment,
        features: featureList,
        kits: (formData.kits || []).filter(k => k.name && k.name.trim() !== "").map(k => ({
          name: k.name,
          qty: k.qty ? Number(k.qty) : undefined,
          price: k.price ? Number(k.price) : undefined
        })),
      };

      let result;
      if (editingId) {
        result = await updateProgram(editingId, payload);
      } else {
        result = await createProgram(payload);
      }

      if (result.ok) {
        fetchCourses();
        closeModal();
      }
    } catch (error) {
      console.error("Error saving course:", error);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (course.courseId && course.courseId.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLevel = levelFilter === "All" || course.level === levelFilter;
    
    const matchesStatus = statusFilter === "All" || 
      (statusFilter === "Active" && course.active) || 
      (statusFilter === "Inactive" && !course.active);
      
    return matchesSearch && matchesLevel && matchesStatus;
  });

  const { currentData: paginatedCourses, currentPage, totalPages, next, prev, itemsPerPage } = usePagination(filteredCourses);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900">
            Course Management
          </h1>
          <p className="text-gray-500 text-sm">
            Create and manage training programs.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData(initialFormState);
            setIsModalOpen(true);
          }}
          className="bg-brand-navy text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-brand-red transition-colors font-medium text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Course
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search courses..."
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

      {/* Courses Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">SL NO</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Fees</th>
                <th className="px-6 py-4">Duration & Sessions</th>
                <th className="px-6 py-4">Equipment Kits</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedCourses.map((course, index) => (
                <tr key={course.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-brand-navy/5 rounded-lg overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center flex-shrink-0">
                        {course.image ? (
                          <img
                            src={course.image}
                            alt={course.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Book className="w-6 h-6 text-brand-blue" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-sm font-outfit">
                          {course.name}
                        </div>
                        {course.courseId && (
                          <span className="text-[10px] font-mono font-bold text-brand-blue bg-blue-50 px-1.5 py-0.5 rounded leading-none">
                            {course.courseId}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider font-outfit leading-none ${
                        course.level === "Beginner"
                          ? "bg-green-100 text-green-700"
                          : course.level === "Intermediate"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {course.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold font-outfit">
                    <div>₹{course.amount}</div>
                    {course.totalClasses ? (
                      <div className="text-[10px] text-gray-400 font-normal leading-none mt-1">
                        ₹{Math.round(course.amount / course.totalClasses)}/session
                      </div>
                    ) : null}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    <div className="flex flex-col gap-0.5">
                      <span><strong>Duration:</strong> {course.duration}</span>
                      {course.totalClasses && (
                        <span><strong>Sessions:</strong> {course.totalClasses} classes</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[200px] text-xs text-gray-600 space-y-1">
                      {course.kits && course.kits.length > 0 ? (
                        course.kits.map((kit, idx) => (
                          <div key={idx} className="flex justify-between gap-2 text-[11px] leading-tight">
                            <span className="truncate">{kit.name}</span>
                            <span className="font-bold text-gray-900 shrink-0">
                              (Qty: {kit.qty || 1})
                            </span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-300 italic text-xs">No Kits</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(course.id, course.active)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-blue ${
                          course.active ? "bg-green-500" : "bg-gray-300"
                        }`}
                        title={course.active ? "Deactivate Course" : "Activate Course"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            course.active ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {course.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(course)}
                        className="p-2 text-brand-blue bg-blue-50 hover:bg-blue-50 rounded-lg hover:bg-brand-blue hover:text-white transition-all"
                        title="Edit Course"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(course.id)}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCourses.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-400 text-sm">
                    No courses found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} next={next} prev={prev} />
      </div>

      {/* Add/Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto relative">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-bold text-lg text-brand-navy font-outfit">
                {editingId ? "Edit Course" : "Add New Course"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <Trash2 className="w-5 h-5 opacity-0" /> {/* Spacer */}
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                  Course Name
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-gray-400"
                  placeholder="e.g. Master Archery Class"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                    Level
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none bg-white transition-all"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    name="fees"
                    required
                    value={formData.fees}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-gray-400"
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                    Duration
                  </label>
                  <input
                    type="text"
                    name="duration"
                    required
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-gray-400"
                    placeholder="e.g. 4 Weeks"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                    Total Sessions
                  </label>
                  <input
                    type="number"
                    name="totalClasses"
                    required
                    value={formData.totalClasses}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-gray-400"
                    placeholder="e.g. 24"
                  />
                </div>
              </div>

              {/*               <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                  Schedule
                </label>
                <input
                  type="text"
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-gray-400"
                  placeholder="e.g. Mon, Wed, Fri 5 PM"
                />
              </div> */}

              {/* Equipment field hidden as per request, but kept in state/DB if needed later
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                  Equipment
                </label>
                <input
                  type="text"
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-gray-400"
                  placeholder="e.g. Rental Provided"
                />
              </div>
*/}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                  Session Duration
                </label>
                <input
                  type="number"
                  name="sessionDuration"
                  value={formData.sessionDuration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-gray-400"
                  placeholder="e.g. 60"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                  Course Image
                </label>
                <div className="flex gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                  />
                  {uploading && (
                    <div className="flex items-center text-brand-blue font-bold text-sm">
                      Uploading...
                    </div>
                  )}
                </div>
                {formData.image && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                    <span className="font-semibold text-xs">Image uploaded successfully</span>
                    <a
                      href={formData.image}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-gray-100 hover:bg-gray-200 text-brand-navy rounded-lg transition-colors inline-flex items-center gap-1.5 font-semibold text-xs text-brand-navy"
                      title="View Image"
                    >
                      <Eye className="w-4 h-4" /> View Image
                    </a>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows="6"
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-gray-400"
                  placeholder="Course details..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                  Features (One per line)
                </label>
                <textarea
                  rows="3"
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-gray-400"
                  placeholder="e.g. &#10;Safety orientation&#10;Equipment handling&#10;Stance & Form&#10;Scoring games&#10;Mental toughness"
                ></textarea>
                <div className="mt-2 text-xs text-gray-500">
                  <p className="font-bold mb-1">Suggestions (Click to copy):</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Safety orientation",
                      "Equipment handling",
                      "Breathing techniques",
                      "Stance & Posture",
                      "Target practice",
                      "Mental focus",
                      "Tournament prep",
                    ].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => {
                          const lines = formData.features
                            ? formData.features.split("\n")
                            : [];
                          if (!lines.map((l) => l.trim()).includes(s)) {
                            setFormData({
                              ...formData,
                              features: formData.features
                                ? formData.features + "\n" + s
                                : s,
                            });
                          }
                        }}
                        className="bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-600 transition-colors"
                      >
                        + {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white pb-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors font-outfit"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-8 py-3 bg-brand-navy text-white font-bold rounded-xl hover:bg-brand-red transition-all shadow-md hover:shadow-lg font-outfit disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading
                    ? "Processing..."
                    : editingId
                      ? "Update Course"
                      : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminCourses;
