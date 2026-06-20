import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getStudent, updateStudent } from "../../services/userService";
import {
  User,
  Calendar,
  Phone,
  MapPin,
  Activity,
  Edit2,
  Save,
  Mail,
  Shield,
  Briefcase,
  Target,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";

const SectionHeader = ({ title, icon: Icon, description }) => (
  <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
    {Icon && (
      <div className="p-2.5 bg-brand-navy/5 text-brand-navy rounded-xl">
        <Icon className="w-5 h-5" />
      </div>
    )}
    <div>
      <h3 className="text-base font-bold text-gray-900 tracking-tight">
        {title}
      </h3>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
  </div>
);

const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex flex-col gap-1.5 p-3.5 rounded-xl hover:bg-gray-50/80 transition-colors border border-transparent hover:border-gray-100">
    <div className="flex items-center gap-2 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
      {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
      {label}
    </div>
    <div className="text-gray-900 text-sm font-semibold pl-6">
      {value || <span className="text-gray-300 italic font-normal">Not provided</span>}
    </div>
  </div>
);

const EditRow = ({
  label,
  name,
  value,
  type = "text",
  options,
  placeholder,
  disabled = false,
  onChange,
}) => (
  <div className="flex flex-col gap-1.5 p-1">
    <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider pl-1">
      {label}
    </label>
    <div className="relative">
      {type === "select" ? (
        <select
          name={name}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 outline-none transition-all duration-200"
        >
          <option value="">Select</option>
          {options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          name={name}
          value={value || ""}
          onChange={onChange}
          rows="2"
          disabled={disabled}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 outline-none resize-none transition-all duration-200"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          disabled={disabled || name === "email"}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10 outline-none transition-all duration-200 ${
            disabled || name === "email" ? "opacity-60 cursor-not-allowed bg-gray-100" : ""
          }`}
        />
      )}
    </div>
  </div>
);

const StudentProfile = () => {
  const { user, loginWithUserData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dtqj22wwe";
    const uploadPreset = "archery-images";
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("upload_preset", uploadPreset);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: uploadFormData,
        }
      );
      const fileData = await res.json();
      if (fileData.secure_url) {
        setFormData((prev) => ({ ...prev, profilePic: fileData.secure_url }));
        setProfileData((prev) => ({ ...prev, profilePic: fileData.secure_url }));
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getStudent(user._id);
        setProfileData(data);
        setFormData(data);
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "mobile" || name === "guardianContact" || name === "emergencyContactNumber") {
       value = value.replace(/\D/g, '').slice(0, 10);
    }

    if (name === "dob") {
      const birthDate = new Date(value);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) calculatedAge--;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        age: calculatedAge >= 0 ? calculatedAge : 0,
      }));
    } else if (name === "previousExperience") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "Yes"
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      const { ok, data } = await updateStudent(user._id, formData);
      if (ok) {
        toast.success("Profile updated successfully");
        setProfileData(data);
        loginWithUserData(data); // update global user context
        setIsEditing(false);
      } else {
        toast.error(data.message || "Failed to update profile");
      }
    } catch {
      toast.error("Error updating profile");
    }
  };

  const handleCancel = () => {
    setFormData(profileData);
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "N/A";
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${day}-${month}-${year}`;
    } catch (e) {
      return "N/A";
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-red"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-10">
      
      {/* Top Page Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal information and archery preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Overview & Institution */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          
          {/* Profile Summary Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-br from-brand-navy to-blue-900"></div>
            
            <div className="w-24 h-24 rounded-full bg-white p-1.5 shadow-md relative mt-8 mb-4 z-10">
              <div className="w-full h-full rounded-full bg-brand-navy flex items-center justify-center text-white text-3xl font-bold uppercase overflow-hidden">
                {profileData?.profilePic ? (
                  <img src={profileData.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  profileData?.firstName?.[0]
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-brand-blue text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-sm border-2 border-white">
                  <Upload className="w-3.5 h-3.5" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              )}
            </div>
            {uploading && <p className="text-xs text-brand-blue font-bold mb-2">Uploading...</p>}
            
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              {profileData?.firstName} {profileData?.lastName}
            </h2>
            <p className="text-sm text-gray-500 font-medium mb-4">{profileData?.email}</p>
            
            <div className="flex flex-wrap justify-center gap-2 w-full mb-6">
              <span className="px-3 py-1 bg-blue-50 text-brand-navy text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> {profileData?.role}
              </span>
              <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 ${
                profileData?.status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${profileData?.status === "active" ? "bg-green-500" : "bg-red-500"}`}></span>
                {profileData?.status}
              </span>
            </div>

            <div className="w-full bg-gray-50 rounded-xl p-4 flex justify-between items-center mb-6 border border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Student ID</span>
              <span className="text-sm font-bold text-gray-900 font-mono bg-white px-2 py-1 rounded border border-gray-200">{profileData?.studentId}</span>
            </div>

            <div className="w-full mt-auto">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full py-3 bg-brand-navy text-white text-sm font-bold rounded-xl hover:bg-brand-navy/90 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Edit2 className="w-4 h-4" /> Edit Profile Details
                </button>
              ) : (
                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={handleSave}
                    className="w-full py-3 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="w-full py-3 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Institution & Training Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <SectionHeader title="Institution & Training" icon={Briefcase} description="Academic and archery background" />
            <div className="grid grid-cols-1 gap-y-4">
              {isEditing ? (
                <>
                  <EditRow label="Guardian Name" name="guardianName" value={formData.guardianName} onChange={handleChange} />
                  <EditRow label="Guardian Contact" name="guardianContact" value={formData.guardianContact} onChange={handleChange} />
                  <EditRow label="Institution Name" name="institutionName" value={formData.institutionName} onChange={handleChange} />
                  <EditRow label="Class / Designation" name="institutionDesignation" value={formData.institutionDesignation} onChange={handleChange} placeholder="e.g. 10th Grade / Developer" />
                  <EditRow label="Preferred Batch" name="preferredBatch" type="select" options={["Weekday", "Weekend"]} value={formData.preferredBatch} onChange={handleChange} />
                  <EditRow label="Prior Experience" name="previousExperience" type="select" options={["Yes", "No"]} value={formData.previousExperience ? "Yes" : "No"} onChange={handleChange} />
                </>
              ) : (
                <>
                  <InfoRow label="Guardian Name" value={profileData?.guardianName} icon={User} />
                  <InfoRow label="Guardian Contact" value={profileData?.guardianContact} icon={Phone} />
                  <InfoRow label="Institution Name" value={profileData?.institutionName} icon={Briefcase} />
                  <InfoRow label="Class / Designation" value={profileData?.institutionDesignation} icon={Target} />
                  <InfoRow label="Preferred Batch" value={profileData?.preferredBatch} icon={Calendar} />
                  <InfoRow label="Prior Experience" value={profileData?.previousExperience ? "Yes" : "No"} icon={Target} />
                </>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Personal & Emergency Details */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          
          {/* Personal Information Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <SectionHeader title="Personal Information" icon={User} description="Basic details and identity" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {isEditing ? (
                <>
                  <EditRow label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
                  <EditRow label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
                  <EditRow label="Date of Birth" name="dob" type="date" value={formatDateForInput(formData.dob)} onChange={handleChange} />
                  <EditRow label="Age" name="age" type="number" value={formData.age} disabled={true} placeholder="Auto-calculated" onChange={handleChange} />
                  <EditRow label="Gender" name="gender" type="select" options={["Male", "Female", "Other"]} value={formData.gender} onChange={handleChange} />
                  <EditRow label="Blood Group" name="bloodGroup" type="select" options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]} value={formData.bloodGroup} onChange={handleChange} />
                  <EditRow label="Category" name="category" type="select" options={["Student", "Corporate Employee", "Professional", "Other"]} value={formData.category} onChange={handleChange} />
                  <EditRow label="Aadhaar / ID" name="aadhaar" value={formData.aadhaar} onChange={handleChange} />
                </>
              ) : (
                <>
                  <InfoRow label="Email Address" value={profileData?.email} icon={Mail} />
                  <InfoRow label="Mobile Number" value={profileData?.mobile} icon={Phone} />
                  <InfoRow label="Date of Birth" value={formatDate(profileData?.dob)} icon={Calendar} />
                  <InfoRow label="Age" value={profileData?.age} icon={User} />
                  <InfoRow label="Gender" value={profileData?.gender} icon={User} />
                  <InfoRow label="Blood Group" value={profileData?.bloodGroup} icon={Activity} />
                  <InfoRow label="Category" value={profileData?.category} icon={Briefcase} />
                  <InfoRow label="Aadhaar ID" value={profileData?.aadhaar} icon={Shield} />
                </>
              )}
            </div>
          </div>

          {/* Contact & Emergency */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <SectionHeader title="Contact & Emergency" icon={Phone} description="How to reach you" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {isEditing ? (
                <>
                  <div className="sm:col-span-2">
                    <EditRow label="Full Address" name="address" type="textarea" value={formData.address} onChange={handleChange} />
                  </div>
                  <EditRow label="Emergency Contact Name" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} placeholder="Name" />
                  <EditRow label="Emergency Contact Phone" name="emergencyContactNumber" value={formData.emergencyContactNumber} onChange={handleChange} placeholder="Phone" />
                  <div className="sm:col-span-2">
                    <EditRow label="Medical Conditions" name="medicalConditions" type="textarea" value={formData.medicalConditions} onChange={handleChange} placeholder="None or describe condition" />
                  </div>
                </>
              ) : (
                <>
                  <div className="sm:col-span-2">
                    <InfoRow label="Full Address" value={profileData?.address} icon={MapPin} />
                  </div>
                  <InfoRow label="Emergency Contact" value={profileData?.emergencyContactName} icon={User} />
                  <InfoRow label="Emergency Phone" value={profileData?.emergencyContactNumber} icon={Phone} />
                  <div className="sm:col-span-2">
                    <InfoRow label="Medical Conditions" value={profileData?.medicalConditions} icon={Activity} />
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
