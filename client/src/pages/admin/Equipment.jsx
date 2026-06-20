import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Box, X, Upload, Trash, Image as ImageIcon, Search } from "lucide-react";
import { getAllEquipment, createEquipment, updateEquipment, deleteEquipment } from "../../services/equipmentService";
import toast from "react-hot-toast";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";

const AdminEquipment = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const initialFormState = {
    itemCode: "",
    name: "",
    qty: "",
    availableQty: "",
    price: "",
    category: "",
    subCategory: "",
    description: "",
    images: [],
    specifications: [],
    active: true,
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchEquipment = async () => {
    try {
      const data = await getAllEquipment(true);
      if (Array.isArray(data)) {
        setEquipmentList(data);
      }
    } catch (error) {
      console.error("Failed to fetch equipment:", error);
      toast.error("Failed to fetch equipment list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setFormData({ ...formData, [name]: val });
  };

  const handleEditClick = (item) => {
    setEditingId(item._id);
    const code = item.itemCode || `ARP${Math.floor(100000 + Math.random() * 900000)}`;
    setFormData({
      itemCode: code,
      name: item.name,
      qty: item.qty,
      availableQty: item.availableQty !== undefined ? item.availableQty : item.qty,
      price: item.price,
      category: item.category || "",
      subCategory: item.subCategory || "",
      description: item.description || "",
      images: item.images || [],
      specifications: item.specifications || [],
      active: item.active !== undefined ? item.active : true,
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const result = await deleteEquipment(id);
        if (result.ok) {
          fetchEquipment();
          toast.success("Product deleted successfully");
        } else {
          toast.error(result.data.message || "Failed to delete product");
        }
      } catch (error) {
        console.error("Error deleting equipment:", error);
        toast.error("An error occurred");
      }
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const item = equipmentList.find((e) => e._id === id);
      if (!item) return;
      const payload = {
        itemCode: item.itemCode,
        qty: Number(item.qty),
        availableQty: item.availableQty !== undefined ? Number(item.availableQty) : Number(item.qty),
        price: Number(item.price),
        category: item.category,
        subCategory: item.subCategory,
        description: item.description || "",
        images: item.images || [],
        specifications: item.specifications || [],
        active: !currentStatus,
      };

      const result = await updateEquipment(id, payload);
      if (result.ok) {
        toast.success(`Product ${!currentStatus ? "activated" : "deactivated"} successfully`);
        fetchEquipment();
      } else {
        toast.error(result.data.message || "Failed to toggle status");
      }
    } catch (error) {
      console.error("Toggle product active error:", error);
      toast.error("An error occurred");
    }
  };

  const handleAddSpec = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...(prev.specifications || []), { type: "", value: "" }],
    }));
  };

  const handleSpecChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedSpecs = [...(prev.specifications || [])];
      updatedSpecs[index] = { ...updatedSpecs[index], [field]: value };
      return { ...prev, specifications: updatedSpecs };
    });
  };

  const handleRemoveSpec = (index) => {
    setFormData((prev) => {
      const updatedSpecs = [...(prev.specifications || [])];
      updatedSpecs.splice(index, 1);
      return { ...prev, specifications: updatedSpecs };
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = "archery-images";

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", uploadPreset);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: data,
          }
        );
        const fileData = await res.json();
        if (fileData.secure_url) {
          uploadedUrls.push(fileData.secure_url);
        } else {
          console.error("Upload failed", fileData);
          toast.error("Upload failed for one or more files. Ensure preset 'archery-images' is configured.");
        }
      }

      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls],
      }));
      toast.success("Images uploaded successfully");
    } catch (err) {
      console.error("Error uploading image", err);
      toast.error("An error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const updatedImages = [...(prev.images || [])];
      updatedImages.splice(index, 1);
      return { ...prev, images: updatedImages };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        itemCode: formData.itemCode || undefined,
        name: formData.name,
        qty: Number(formData.qty),
        availableQty: formData.availableQty !== "" ? Number(formData.availableQty) : Number(formData.qty),
        price: Number(formData.price),
        category: formData.category,
        subCategory: formData.subCategory,
        description: formData.description,
        images: formData.images || [],
        specifications: (formData.specifications || [])
          .filter((s) => s.type && s.type.trim() !== "")
          .map((s) => ({
            type: s.type,
            value: s.value,
          })),
        active: formData.active,
      };

      let result;
      if (editingId) {
        result = await updateEquipment(editingId, payload);
      } else {
        result = await createEquipment(payload);
      }

      if (result.ok) {
        fetchEquipment();
        closeModal();
        toast.success(editingId ? "Product updated successfully" : "Product created successfully");
      } else {
        toast.error(result.data.message || "Failed to save product");
      }
    } catch (error) {
      console.error("Error saving equipment:", error);
      toast.error("An error occurred while saving");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const filteredEquipment = equipmentList.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.itemCode && item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && item.active !== false) ||
      (statusFilter === "Inactive" && item.active === false);

    return matchesSearch && matchesStatus;
  });

  const { currentData: paginatedEquipment, currentPage, totalPages, next, prev, itemsPerPage } = usePagination(filteredEquipment);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900">
            Equipment & Products Inventory
          </h1>
          <p className="text-gray-500 text-sm">
            Add and manage equipment stocks, prices, specifications and public product listings.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            const randomDigits = Math.floor(100000 + Math.random() * 900000);
            setFormData({
              ...initialFormState,
              itemCode: `ARP${randomDigits}`
            });
            setIsModalOpen(true);
          }}
          className="bg-brand-navy text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-brand-red transition-colors font-medium text-sm shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search products..."
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
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Equipment List Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredEquipment.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-outfit tracking-wider">
                <tr>
                  <th className="px-6 py-4">SL NO</th>
                  <th className="px-6 py-4">Item Code</th>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Total Stock</th>
                  <th className="px-6 py-4">Available Stock</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price (₹)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedEquipment.map((item, index) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-gray-700 text-xs">
                      {item.itemCode || "N/A"}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue overflow-hidden flex-shrink-0 border border-gray-100">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Box className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        {item.description && (
                          <span className="text-xs text-gray-400 font-normal line-clamp-1 max-w-xs">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
                        {item.qty} units
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {(() => {
                        const avail = item.availableQty !== undefined ? item.availableQty : item.qty;
                        return (
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              avail > 5 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {avail} units
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-brand-blue border border-blue-100">
                        {item.category || "Uncategorized"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      ₹{item.price}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(item._id, item.active !== false)}
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-blue ${
                            item.active !== false ? "bg-green-500" : "bg-gray-300"
                          }`}
                          title={item.active !== false ? "Deactivate Product" : "Activate Product"}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              item.active !== false ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {item.active !== false ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="p-2 text-gray-400 hover:text-brand-blue hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Equipment"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Equipment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          !loading && (
            <div className="text-center py-16">
              <Box className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-900 font-bold mb-1 font-outfit">No Products Found</h3>
              <p className="text-gray-500 text-sm">
                Get started by adding equipment or kits to your inventory.
              </p>
            </div>
          )
        )}
        {filteredEquipment.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} next={next} prev={prev} />}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto relative animate-in zoom-in duration-200">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center sticky top-0 z-10">
              <h3 className="font-bold text-lg text-brand-navy font-outfit">
                {editingId ? "Edit Product" : "Add Product"}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* 1. Item Code */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                  Item Code (Auto-Generated)
                </label>
                <input
                  type="text"
                  disabled
                  readOnly
                  value={formData.itemCode}
                  placeholder="ARPXXXXXX (Auto)"
                  className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl outline-none text-gray-500 font-mono font-bold"
                />
              </div>

              {/* 2. Product Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-gray-400"
                  placeholder="e.g. Intermediate Recurve Bow"
                />
              </div>

              {/* Category and Subcategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-gray-400"
                    placeholder="e.g. Bows, Arrows"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                    Sub-Category (Optional)
                  </label>
                  <input
                    type="text"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-gray-400"
                    placeholder="e.g. Recurve, Compound"
                  />
                </div>
              </div>



              {/* 3. Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-gray-400 text-sm"
                  placeholder="Enter detailed description of product specifications, usage, or warranty..."
                />
              </div>

              {/* 4. Product Image(s) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                  Product Image(s)
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600">
                    <Upload className="w-4 h-4 text-gray-500" />
                    Upload Files
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {uploading && (
                    <span className="text-brand-blue font-bold text-sm animate-pulse">
                      Uploading to Cloudinary...
                    </span>
                  )}
                </div>

                {formData.images && formData.images.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {formData.images.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="relative group w-full h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                      >
                        <img
                          src={imgUrl}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute inset-0 bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Price */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-gray-400"
                  placeholder="1500"
                />
              </div>

              {/* 6. Specifications Table */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="block text-xs font-bold text-gray-500 font-outfit uppercase tracking-wider">
                    Specifications Table
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="text-xs bg-brand-navy hover:bg-brand-red text-white px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-sm flex items-center gap-1 font-outfit uppercase tracking-wider"
                  >
                    + Add Specification
                  </button>
                </div>

                {formData.specifications && formData.specifications.length > 0 ? (
                  <div className="border border-gray-150 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-xs text-left text-gray-500">
                      <thead className="text-[10px] text-gray-700 uppercase bg-gray-50 tracking-wider">
                        <tr>
                          <th className="px-3 py-2">Specification Key (Type)</th>
                          <th className="px-3 py-2">Value</th>
                          <th className="px-3 py-2 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.specifications.map((spec, index) => (
                          <tr
                            key={index}
                            className="bg-white border-b border-gray-100 last:border-b-0"
                          >
                            <td className="p-2">
                              <input
                                type="text"
                                required
                                value={spec.type}
                                onChange={(e) => handleSpecChange(index, "type", e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-brand-blue text-xs font-medium"
                                placeholder="e.g. Draw Weight, Color, Brand"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                required
                                value={spec.value}
                                onChange={(e) => handleSpecChange(index, "value", e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-brand-blue text-xs font-medium"
                                placeholder="e.g. 30 lbs, Carbon Black, Hoyt"
                              />
                            </td>
                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveSpec(index)}
                                className="text-red-500 hover:text-red-700 font-extrabold text-sm"
                              >
                                &times;
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No specifications added yet.</p>
                )}
              </div>

              {/* 7. Stock (Qty) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                    Total Stock (Qty)
                  </label>
                  <input
                    type="number"
                    name="qty"
                    required
                    value={formData.qty}
                    onChange={(e) => {
                      const newQty = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        qty: newQty,
                        availableQty: editingId ? prev.availableQty : newQty
                      }));
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-gray-400"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 font-outfit uppercase tracking-wider">
                    Available Stock
                  </label>
                  <input
                    type="number"
                    name="availableQty"
                    min="0"
                    value={formData.availableQty}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all placeholder-gray-400"
                    placeholder="Leave empty to match Total Stock"
                  />
                </div>
              </div>

              {/* 8. Active Status Toggle */}
              <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-brand-blue border-gray-300 rounded focus:ring-brand-blue accent-brand-blue cursor-pointer"
                />
                <label htmlFor="active" className="text-sm font-bold text-gray-700 cursor-pointer font-outfit uppercase tracking-wider select-none">
                  Product Active / Enabled (Visible for checkout)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6 sticky bottom-0 bg-white z-10 pb-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors font-outfit text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 bg-brand-navy text-white font-bold rounded-xl hover:bg-brand-red transition-all shadow-md font-outfit text-sm disabled:opacity-50"
                >
                  {editingId ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEquipment;
