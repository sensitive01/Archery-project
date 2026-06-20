import React, { useState, useEffect } from "react";
import { ShoppingBag, Search, Filter, CheckCircle2, Clock, XCircle, Loader } from "lucide-react";
import { getTransactions, updateOrderFulfillment } from "../../services/adminService";
import toast from "react-hot-toast";
import { formatDate } from "../../utils/dateFormatter";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";

const AdminPurchases = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const allTxns = await getTransactions();
      if (Array.isArray(allTxns)) {
        // Filter out orders that have a gear purchase (i.e. equipmentId is defined)
        const gearPurchases = allTxns.filter(txn => txn.equipmentId);
        
        // Map to structured table format
        const formatted = gearPurchases.map(txn => ({
          id: txn.transactionId,
          dbId: txn._id,
          memberName: txn.user 
            ? `${txn.user.firstName} ${txn.user.lastName}` 
            : (txn.guestName || "Guest Buyer"),
          memberEmail: txn.user ? txn.user.email : (txn.guestEmail || "N/A"),
          memberMobile: txn.user ? txn.user.mobile : (txn.guestMobile || "N/A"),
          product: txn.equipmentId ? txn.equipmentId.name : "Archery Gear",
          amount: txn.equipmentId && txn.equipmentId.price !== undefined ? txn.equipmentId.price : txn.amount,
          createdAt: txn.createdAt,
          date: txn.createdAt ? new Date(txn.createdAt).toISOString().substring(0, 10) : "",
          status: txn.fulfillmentStatus || "Pending"
        }));
        setPurchases(formatted);
      }
    } catch (error) {
      console.error("Failed to load purchases:", error);
      toast.error("Failed to load equipment purchases");
    } finally {
      setLoading(false);
    }
  };

  const handleFulfillmentChange = async (dbId, newStatus) => {
    try {
      const { ok, data } = await updateOrderFulfillment(dbId, newStatus);
      if (ok) {
        toast.success("Fulfillment status updated successfully");
        setPurchases(prev => prev.map(p => p.dbId === dbId ? { ...p, status: newStatus } : p));
      } else {
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating fulfillment status");
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const getLocalDateString = (dateInput) => {
    if (!dateInput) return "";
    try {
      const d = new Date(dateInput);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("en-CA");
    } catch (e) {
      return "";
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setFromDate("");
    setToDate("");
  };

  const filteredPurchases = purchases.filter((order) => {
    const matchesSearch = 
      order.memberName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.memberEmail.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.memberMobile.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.product.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || order.status === statusFilter;

    let matchesDate = true;
    if (order.createdAt) {
      const orderDateStr = getLocalDateString(order.createdAt);
      if (fromDate && orderDateStr < fromDate) matchesDate = false;
      if (toDate && orderDateStr > toDate) matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const { currentData: paginatedPurchases, currentPage, totalPages, next, prev, itemsPerPage } = usePagination(filteredPurchases);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900">Equipment Purchases</h1>
          <p className="text-gray-500 text-sm">Manage gear orders and equipment request fulfillments.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col gap-4">
          {/* Top Row: Search and Status Buttons */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Order ID, member, or product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder-gray-400 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              {["All", "Completed", "Pending", "Cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    statusFilter === status
                      ? "bg-brand-navy text-white shadow-sm"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 my-1" />

          {/* Bottom Row: Date Range Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 items-end sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Date Range:</span>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue text-sm text-gray-700 w-full sm:w-auto"
                  placeholder="From Date"
                />
                <span className="text-gray-400 text-sm">to</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue text-sm text-gray-700 w-full sm:w-auto"
                  placeholder="To Date"
                />
              </div>
            </div>

            {(fromDate || toDate || statusFilter !== "All" || searchTerm) && (
              <button
                onClick={handleResetFilters}
                className="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline transition-all"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-outfit tracking-wider">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">SL NO</th>
                  <th className="px-6 py-4 whitespace-nowrap">Order ID</th>
                  <th className="px-6 py-4 whitespace-nowrap">Member Name</th>
                  <th className="px-6 py-4 whitespace-nowrap">Product</th>
                  <th className="px-6 py-4 whitespace-nowrap">Amount</th>
                  <th className="px-6 py-4 whitespace-nowrap">Date</th>
                  <th className="px-6 py-4 whitespace-nowrap">Payment Status</th>
                  <th className="pl-6 pr-12 py-4 whitespace-nowrap">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-500 font-medium">
                      <div className="flex justify-center items-center gap-2 text-brand-blue">
                        <Loader className="animate-spin h-5 w-5" />
                        <span>Loading purchases...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-400">
                      No equipment purchases found.
                    </td>
                  </tr>
                ) : (
                  paginatedPurchases.map((order, index) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-gray-900 text-xs whitespace-nowrap">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">{order.memberName}</div>
                        <div className="text-xs text-gray-400 font-normal">{order.memberEmail} | {order.memberMobile}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">{order.product}</td>
                      <td className="px-6 py-4 text-gray-900 font-bold whitespace-nowrap">₹{order.amount.toLocaleString("en-IN")}</td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {formatDate(order.createdAt || order.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          Completed
                        </span>
                      </td>
                      <td className="pl-6 pr-12 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleFulfillmentChange(order.dbId, e.target.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border-none outline-none cursor-pointer transition-all ${
                            order.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : order.status === "Pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          <option value="Pending" className="bg-white text-amber-700 font-bold">Pending</option>
                          <option value="Completed" className="bg-white text-green-700 font-bold">Completed</option>
                          <option value="Cancelled" className="bg-white text-red-700 font-bold">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {filteredPurchases.length > 0 && !loading && (
          <Pagination currentPage={currentPage} totalPages={totalPages} next={next} prev={prev} />
        )}
      </div>
    </div>
  );
};

export default AdminPurchases;
