import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyPurchases } from "../../services/paymentService";
import { getAllEquipment } from "../../services/equipmentService";
import { formatDate } from "../../utils/dateFormatter";
import { ShoppingBag, Loader, AlertCircle, PlusCircle, Package } from "lucide-react";
import { ProductCard } from "../Products";

const StudentPurchases = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("history"); // "history" or "new"
  
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const studentGear = await getMyPurchases();
      if (Array.isArray(studentGear)) {
        const formatted = studentGear.map((txn) => ({
          id: txn.transactionId || txn._id.substring(0, 8).toUpperCase(),
          product: txn.equipmentId ? txn.equipmentId.name : "Archery Gear",
          amount: txn.equipmentId && txn.equipmentId.price !== undefined ? txn.equipmentId.price : txn.amount,
          createdAt: txn.createdAt,
          paymentStatus: "Completed",
          deliveryStatus: txn.fulfillmentStatus || "Pending",
        }));

        setPurchases(formatted);
      }
    } catch (err) {
      console.error("Failed to load student purchases:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await getAllEquipment();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      if (activeTab === "history") {
        fetchPurchases();
      } else if (activeTab === "new") {
        fetchProducts();
      }
    }
  }, [user, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold font-outfit text-gray-900">Purchases</h1>
          <p className="text-gray-500 text-sm">Review your equipment orders or buy new gear.</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "history"
                ? "bg-white text-brand-navy shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Package size={16} /> My Purchases
          </button>
          <button
            onClick={() => setActiveTab("new")}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "new"
                ? "bg-white text-brand-navy shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <PlusCircle size={16} /> New Purchase
          </button>
        </div>
      </div>

      {activeTab === "history" && (
        <>
          {loading ? (
            <div className="flex justify-center items-center py-24 text-brand-blue">
              <Loader className="animate-spin h-8 w-8 mr-2" />
              <span className="font-medium">Loading your purchases...</span>
            </div>
          ) : purchases.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
                    <tr>
                      <th className="px-6 py-4 whitespace-nowrap">Order ID</th>
                      <th className="px-6 py-4 whitespace-nowrap">Product</th>
                      <th className="px-6 py-4 whitespace-nowrap">Amount</th>
                      <th className="px-6 py-4 whitespace-nowrap">Purchase Date</th>
                      <th className="px-6 py-4 whitespace-nowrap">Payment Status</th>
                      <th className="px-6 py-4 whitespace-nowrap">Delivery Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {purchases.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-gray-950 text-xs whitespace-nowrap">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                          {order.product}
                        </td>
                        <td className="px-6 py-4 text-gray-900 font-extrabold whitespace-nowrap">
                          ₹{order.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                            {order.paymentStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              order.deliveryStatus === "Completed"
                                ? "bg-green-100 text-green-700"
                                : order.deliveryStatus === "Pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {order.deliveryStatus.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-900 font-bold mb-1 font-outfit">No Purchases Found</h3>
              <p className="text-gray-500 text-sm">You haven't purchased any equipment yet.</p>
            </div>
          )}
        </>
      )}

      {activeTab === "new" && (
        <div>
          {loadingProducts ? (
            <div className="flex justify-center items-center py-24 text-brand-blue">
              <Loader className="animate-spin h-8 w-8 mr-2" />
              <span className="font-medium">Loading products...</span>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  onPurchaseSuccess={() => setActiveTab("history")} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-900 font-bold mb-1 font-outfit">No Products Available</h3>
              <p className="text-gray-500 text-sm">There is currently no equipment available for purchase.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentPurchases;
