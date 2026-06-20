import React, { useState, useEffect } from "react";
import { CreditCard, Search, Filter, ArrowUpRight, ArrowDownLeft, Loader } from "lucide-react";
import { getTransactions } from "../../services/adminService";
import { formatDate } from "../../utils/dateFormatter";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";

const AdminTransactions = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await getTransactions();
        if (Array.isArray(data)) {
          setTransactions(data);
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const getBillingType = (txn) => {
    if (txn.programId && txn.equipmentId) return "Course + Gear";
    if (txn.equipmentId) return "Gear Purchase";
    if (txn.programId) return "Course Enrollment";
    return "Registration Fee";
  };

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
    setTypeFilter("All");
    setFromDate("");
    setToDate("");
    setStatusFilter("All");
  };

  const filteredTransactions = transactions.filter((txn) => {
    const memberName = txn.user ? `${txn.user.firstName} ${txn.user.lastName}` : (txn.guestName || "Guest Buyer");
    const memberEmail = txn.user ? txn.user.email : (txn.guestEmail || "");
    const memberMobile = txn.user ? txn.user.mobile : (txn.guestMobile || "");
    const txnId = txn.transactionId || "";
    const billingType = getBillingType(txn);

    const matchesSearch = 
      memberName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      memberEmail.toLowerCase().includes(searchTerm.toLowerCase()) || 
      memberMobile.toLowerCase().includes(searchTerm.toLowerCase()) || 
      txnId.toLowerCase().includes(searchTerm.toLowerCase()) || 
      billingType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "All" || 
      (typeFilter === "Course Enrollment" && txn.programId && !txn.equipmentId) ||
      (typeFilter === "Gear Purchase" && txn.equipmentId && !txn.programId) ||
      (typeFilter === "Course + Gear" && txn.programId && txn.equipmentId);

    const matchesStatus = statusFilter === "All" || txn.status === statusFilter;

    let matchesDate = true;
    if (txn.createdAt) {
      const txnDateStr = getLocalDateString(txn.createdAt);
      if (fromDate && txnDateStr < fromDate) matchesDate = false;
      if (toDate && txnDateStr > toDate) matchesDate = false;
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const { currentData: paginatedTransactions, currentPage, totalPages, next, prev, itemsPerPage } = usePagination(filteredTransactions);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900">Transaction History</h1>
          <p className="text-gray-500 text-sm">Review details of payment transactions, enrollments, and equipment billing.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col gap-4">
          {/* Top Row: Search and Type Filter */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Txn ID, member, or billing type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-blue outline-none transition-all placeholder-gray-400 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              {["All", "Gear Purchase", "Course Enrollment", "Course + Gear"].map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    typeFilter === type
                      ? "bg-brand-navy text-white shadow-sm"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100 my-1" />

          {/* Bottom Row: Date Range and Status Filters */}
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

            <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-blue text-sm text-gray-700 bg-white"
                >
                  <option value="All">All Statuses</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {(fromDate || toDate || statusFilter !== "All" || typeFilter !== "All" || searchTerm) && (
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
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <Loader className="w-8 h-8 text-brand-blue animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm font-medium">Loading transactions log...</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 font-outfit tracking-wider">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">SL NO</th>
                    <th className="px-6 py-4 whitespace-nowrap">Transaction ID</th>
                    <th className="px-6 py-4 whitespace-nowrap">Member Name</th>
                    <th className="px-6 py-4 whitespace-nowrap">Type</th>
                    <th className="px-6 py-4 whitespace-nowrap">Description</th>
                    <th className="px-6 py-4 whitespace-nowrap">Amount</th>
                    <th className="px-6 py-4 whitespace-nowrap">Ref Payment ID</th>
                    <th className="px-6 py-4 whitespace-nowrap">Date</th>
                    <th className="pl-6 pr-12 py-4 whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedTransactions.map((txn, index) => {
                    const memberName = txn.user ? `${txn.user.firstName} ${txn.user.lastName}` : (txn.guestName || "Guest Buyer");
                    const memberEmail = txn.user ? txn.user.email : (txn.guestEmail || "");
                    const memberMobile = txn.user ? txn.user.mobile : (txn.guestMobile || "");
                    const billingType = getBillingType(txn);
                    
                    // Generate description string
                    const details = [];
                    if (txn.programId?.title) details.push(txn.programId.title);
                    if (txn.equipmentId?.name) details.push(txn.equipmentId.name);
                    if (txn.batchId?.name) details.push(`Batch: ${txn.batchId.name}`);
                    const desc = details.join(" / ") || "Academy Enrolment Fee";

                    return (
                      <tr key={txn._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-gray-900 text-xs whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {txn.status === "success" ? (
                              <span className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center flex-shrink-0">
                                <ArrowDownLeft className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="w-6 h-6 rounded-full bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </span>
                            )}
                            {txn.transactionId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">{memberName}</div>
                          <div className="text-xs text-gray-400 font-normal">{memberEmail || "N/A"} | {memberMobile || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                            billingType.includes("Course") ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                          }`}>
                            {billingType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500 max-w-xs" title={desc}>
                          <div className="truncate font-semibold">{desc}</div>
                          {txn.paymentProof && (
                            <a 
                              href={txn.paymentProof} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-brand-blue hover:underline font-bold text-[10px] block mt-0.5"
                            >
                              📄 View Proof
                            </a>
                          )}
                          {txn.comments && (
                            <div className="text-[10px] text-gray-400 italic mt-0.5 truncate max-w-[200px]" title={txn.comments}>
                              Note: {txn.comments}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-bold whitespace-nowrap">
                          {txn.feeStatus === "FREE" ? (
                            <span className="text-[10px] font-extrabold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full uppercase">FREE</span>
                          ) : (
                            `₹${txn.amount.toLocaleString("en-IN")}`
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-400 font-mono text-xs select-all whitespace-nowrap">
                          {txn.razorpayPaymentId || (txn.paymentMode ? `Offline (${txn.paymentMode})` : "Offline / Cash")}
                        </td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{formatDate(txn.createdAt)}</td>
                        <td className="pl-6 pr-12 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                              txn.status === "success"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {txn.status === "success" ? "Success" : "Failed"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-gray-900 font-bold mb-1 font-outfit">No Transactions Found</h3>
            <p className="text-gray-500 text-sm">No transaction records match the selected filters.</p>
          </div>
        )}
        {filteredTransactions.length > 0 && !loading && (
          <Pagination currentPage={currentPage} totalPages={totalPages} next={next} prev={prev} />
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;
