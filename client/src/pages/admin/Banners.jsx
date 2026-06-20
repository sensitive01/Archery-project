import React, { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Calendar, Image as ImageIcon, Search } from "lucide-react";
import {
  getBanners,
  createBanner,
  deleteBanner,
  updateBanner,
} from "../../services/bannerService";
import { formatDate } from "../../utils/dateFormatter";
import toast from "react-hot-toast";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";




const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [placementFilter, setPlacementFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [formData, setFormData] = useState({
    imageUrl: "",
    title: "",
    description: "",
    position: "Top",
    placement: "Home Page",
    fromDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
  });

  const fetchBanners = async () => {
    try {
      const data = await getBanners();
      setBanners(data);
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
        setFormData((prev) => ({ ...prev, imageUrl: fileData.secure_url }));
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
      if (!formData.imageUrl) {
        toast.error("Please provide a banner image");
        return;
      }

      if (editingBanner) {
        await updateBanner(editingBanner._id, formData);
        toast.success("Banner updated successfully!");
      } else {
        await createBanner(formData);
        toast.success("Banner created successfully!");
      }
      fetchBanners();
      closeModal();
    } catch (error) {
      console.error("Error saving banner:", error);
    }
  };

  const handleEditClick = (banner) => {
    setEditingBanner(banner);
    setFormData({
      imageUrl: banner.imageUrl,
      title: banner.title || "",
      description: banner.description || "",
      position: banner.position || "Top",
      placement: banner.placement || "Home Page",
      fromDate: banner.fromDate ? new Date(banner.fromDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      expiryDate: banner.expiryDate ? new Date(banner.expiryDate).toISOString().split("T")[0] : "",
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await deleteBanner(id);
        toast.success("Banner deleted successfully");
        fetchBanners();
      } catch (error) {
        console.error("Error deleting banner:", error);
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const banner = banners.find((b) => b._id === id);
      if (!banner) return;
      const payload = {
        imageUrl: banner.imageUrl,
        title: banner.title || "",
        description: banner.description || "",
        position: banner.position || "Top",
        placement: banner.placement || "Home Page",
        fromDate: banner.fromDate
          ? new Date(banner.fromDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        expiryDate: banner.expiryDate
          ? new Date(banner.expiryDate).toISOString().split("T")[0]
          : "",
        isActive: !currentStatus,
      };

      await updateBanner(id, payload);
      toast.success(`Banner ${!currentStatus ? "activated" : "deactivated"} successfully`);
      fetchBanners();
    } catch (error) {
      console.error("Toggle active error:", error);
      toast.error("Failed to update status");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setFormData({
      imageUrl: "",
      title: "",
      description: "",
      position: "Top",
      placement: "Home Page",
      fromDate: new Date().toISOString().split("T")[0],
      expiryDate: "",
    });
  };

  const isBannerActive = (banner) => {
    const now = new Date();
    const fromDate = banner.fromDate ? new Date(banner.fromDate) : null;
    const expiryDate = banner.expiryDate ? new Date(banner.expiryDate) : null;

    if (fromDate && fromDate > now) return false;
    if (expiryDate && expiryDate < now) return false;
    return banner.isActive !== false;
  };

  const allPlacements = Array.from(
    new Set(banners.map((b) => b.placement || "Home Page"))
  );

  const filteredBanners = banners.filter((banner) => {
    const matchesSearch =
      (banner.title && banner.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (banner.description && banner.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPlacement =
      placementFilter === "All" || banner.placement === placementFilter;

    const isActive = isBannerActive(banner);
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && isActive) ||
      (statusFilter === "Inactive" && !isActive);

    return matchesSearch && matchesPlacement && matchesStatus;
  });

  const { currentData: paginatedBanners, currentPage, totalPages, next, prev, itemsPerPage } = usePagination(filteredBanners);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900">
            Banner Management
          </h1>
          <p className="text-gray-500 text-sm">
            Upload and manage promotional banners/ads.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-navy text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-brand-red transition-colors font-medium text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Banner
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search banners..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none w-full text-sm"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={placementFilter}
          onChange={(e) => setPlacementFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue outline-none text-sm bg-white cursor-pointer min-w-[150px]"
        >
          <option value="All">All Placements</option>
          {allPlacements.map((place, idx) => (
            <option key={idx} value={place}>
              {place}
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
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Banners Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">SL NO</th>
                <th className="px-6 py-4">Banner Image</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Position / Placement</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedBanners.map((banner, index) => (
                <tr key={banner._id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-16 h-10 rounded-lg overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title || "Banner"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900 text-sm font-outfit max-w-[150px] truncate">
                    {banner.title || <span className="text-gray-300 italic font-normal text-xs">No Title</span>}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 max-w-[200px] truncate">
                    {banner.description || <span className="text-gray-300 italic text-xs">No Description</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-bold bg-brand-navy/10 text-brand-navy px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {banner.placement || "Home Page"} ({banner.position || "Top"})
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    <div className="flex flex-col gap-1">
                      <span><strong>From:</strong> {formatDate(banner.fromDate)}</span>
                      <span><strong>Expires:</strong> {banner.expiryDate ? formatDate(banner.expiryDate) : "No Expiry"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(banner._id, banner.isActive !== false)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-blue ${
                          banner.isActive !== false ? "bg-green-500" : "bg-gray-300"
                        }`}
                        title={banner.isActive !== false ? "Deactivate Banner" : "Activate Banner"}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            banner.isActive !== false ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                      <span className={`text-xs font-semibold uppercase tracking-wider ${isBannerActive(banner) ? "text-green-600" : "text-red-400"}`}>
                        {isBannerActive(banner) ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEditClick(banner)}
                        className="p-2 bg-blue-50 text-brand-blue rounded-lg hover:bg-brand-blue hover:text-white transition-all"
                        title="Edit Banner"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(banner._id)}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                        title="Delete Banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredBanners.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-400 text-sm">
                    No banners found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} next={next} prev={prev} />
      </div>

      {/* Add Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-brand-navy font-outfit">
                {editingBanner ? "Edit Banner" : "New Banner"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <Trash2 className="w-5 h-5 opacity-0" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter banner title"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter banner description"
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                      Position
                    </label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all text-sm bg-white"
                    >
                      <option value="Top">Top</option>
                      <option value="Bottom">Bottom</option>
                      <option value="Sidebar">Sidebar</option>
                      <option value="Popup">Popup</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                      Placement
                    </label>
                    <select
                      name="placement"
                      value={formData.placement}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all text-sm bg-white"
                    >
                      <option value="Home Page">Home Page</option>
                      <option value="Student Dashboard">Student Dashboard</option>
                      <option value="Admin Dashboard">Admin Dashboard</option>
                      <option value="Schedule Page">Schedule Page</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                      From Date
                    </label>
                    <input
                      type="date"
                      name="fromDate"
                      value={formData.fromDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                      Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                  Banner Image
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="banner-upload"
                  />
                  <label
                    htmlFor="banner-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    {formData.imageUrl ? (
                      <img
                        src={formData.imageUrl}
                        alt="Uploaded Banner"
                        className="h-32 object-contain rounded-md"
                      />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-500 font-medium">
                          Click to upload image
                        </span>
                      </>
                    )}
                  </label>
                </div>
                {uploading && (
                  <div className="text-center text-xs text-brand-blue font-bold mt-2">
                    Uploading to Cloudinary...
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors font-outfit"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-brand-navy text-white font-bold rounded-xl hover:bg-brand-red transition-all shadow-md hover:shadow-lg font-outfit disabled:opacity-50"
                >
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
