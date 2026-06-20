import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight, Box, Check, ShieldAlert, Award, FileText, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getAllEquipment } from "../services/equipmentService";
import { useAuth } from "../context/AuthContext";
import { createOrder, purchaseProduct } from "../services/paymentService";
import toast from "react-hot-toast";

const heroImg = "/ref-banner.png";

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const ProductCard = ({ product, onPurchaseSuccess }) => {
  const { user } = useAuth();
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [guestDetails, setGuestDetails] = useState({ name: "", email: "", mobile: "" });
  const images = product.images && product.images.length > 0 ? product.images : [];
  const availableStock = product.availableQty !== undefined ? product.availableQty : product.qty;

  const handleNextImg = (e) => {
    e.preventDefault();
    setActiveImgIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrevImg = (e) => {
    e.preventDefault();
    setActiveImgIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const hasMultipleImages = images.length > 1;
  const currentImage = images.length > 0 ? images[activeImgIdx] : null;

  // Build Inquiry link
  const subject = encodeURIComponent(`Product Inquiry: ${product.name} (Code: ${product.itemCode || "N/A"})`);
  const message = encodeURIComponent(
    `Hello Archery Academy,\n\nI am interested in purchasing/inquiring about the following product:\nProduct Name: ${product.name}\nItem Code: ${product.itemCode || "N/A"}\nPrice: ₹${product.price}\n\nPlease let me know if it is available and how I can proceed with the purchase.\n\nThank you!`
  );
  const inquiryLink = `/contact?subject=${subject}&message=${message}`;

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setCompletedOrder(null);
    if (onPurchaseSuccess) onPurchaseSuccess();
  };

  const handleBuyNow = async () => {
    if (!user || user.role !== "student") {
      toast.error("You must be logged in as a student to purchase products.");
      return;
    }

    setIsPurchasing(true);
    try {
      // 1. Create payment order on backend
      const orderData = await createOrder(product.price);

      // 2. Check if Mock Payment
      if (orderData.key_id === "rzp_test_dummy") {
        toast.success("Simulating payment in development...");
        const payload = {
          userId: user._id,
          studentId: user.studentId,
          equipmentId: product._id,
          amount: product.price,
          razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(7).toUpperCase()}`,
          razorpayOrderId: orderData.id,
        };
        const res = await purchaseProduct(payload);
        setCompletedOrder(res.order);
        setShowSuccessModal(true);
        return;
      }

      // 3. Load Razorpay and open checkout modal
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Failed to load Razorpay SDK. Check your internet connection.");
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Archery Academy",
        description: `Purchase: ${product.name}`,
        order_id: orderData.id,
        handler: async (response) => {
          setIsPurchasing(true);
          try {
            const payload = {
              userId: user._id,
              studentId: user.studentId,
              equipmentId: product._id,
              amount: product.price,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            };
            const res = await purchaseProduct(payload);
            setCompletedOrder(res.order);
            setShowSuccessModal(true);
          } catch (err) {
            toast.error(err.message || "Failed to complete purchase");
          } finally {
            setIsPurchasing(false);
          }
        },
        prefill: {
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          contact: user.mobile || "",
        },
        theme: { color: "#1E40AF" },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled by user");
            setIsPurchasing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleBuyButtonClick = () => {
    if (user && user.role === "student") {
      handleBuyNow();
    } else {
      setShowGuestModal(true);
    }
  };

  const handleGuestSubmit = async (e) => {
    e.preventDefault();
    if (!guestDetails.name || !guestDetails.email || !guestDetails.mobile) {
      toast.error("Please fill in all details");
      return;
    }

    setShowGuestModal(false);
    setIsPurchasing(true);
    try {
      // 1. Create order on backend
      const orderData = await createOrder(product.price);

      // 2. Check if Mock Payment
      if (orderData.key_id === "rzp_test_dummy") {
        toast.success("Simulating payment in development...");
        const payload = {
          equipmentId: product._id,
          amount: product.price,
          guestName: guestDetails.name,
          guestEmail: guestDetails.email,
          guestMobile: guestDetails.mobile,
          razorpayPaymentId: `pay_mock_${Math.random().toString(36).substring(7).toUpperCase()}`,
          razorpayOrderId: orderData.id,
        };
        const res = await purchaseProduct(payload);
        setCompletedOrder(res.order);
        setShowSuccessModal(true);
        return;
      }

      // 3. Load Razorpay and open checkout modal
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Failed to load Razorpay SDK. Check your internet connection.");
      }

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Archery Academy",
        description: `Purchase: ${product.name}`,
        order_id: orderData.id,
        handler: async (response) => {
          setIsPurchasing(true);
          try {
            const payload = {
              equipmentId: product._id,
              amount: product.price,
              guestName: guestDetails.name,
              guestEmail: guestDetails.email,
              guestMobile: guestDetails.mobile,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            };
            const res = await purchaseProduct(payload);
            setCompletedOrder(res.order);
            setShowSuccessModal(true);
          } catch (err) {
            toast.error(err.message || "Failed to complete purchase");
          } finally {
            setIsPurchasing(false);
          }
        },
        prefill: {
          name: guestDetails.name,
          email: guestDetails.email,
          contact: guestDetails.mobile,
        },
        theme: { color: "#1E40AF" },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled by user");
            setIsPurchasing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "16px",
        border: "1px solid #f1f5f9",
        boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        width: "100%",
        minWidth: "0",
      }}
      className="group hover:shadow-lg hover:border-blue-100"
    >
      {/* Image Container */}
      <div style={{ height: "260px", backgroundColor: "#f8fafc", position: "relative", overflow: "hidden" }}>
        {currentImage ? (
          <img
            src={currentImage}
            alt={product.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }}
            className="group-hover:scale-105"
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#1E40AF" }}>
            <Box size={48} className="opacity-40" />
          </div>
        )}

        {/* Navigation arrows for images */}
        {hasMultipleImages && (
          <>
            <button
              onClick={handlePrevImg}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                color: "#1E40AF",
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextImg}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "none",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                color: "#1E40AF",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Code Badge */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            backgroundColor: "#0F172A",
            color: "white",
            fontSize: "10px",
            fontWeight: "800",
            padding: "5px 10px",
            borderRadius: "6px",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          {product.itemCode || "NO CODE"}
        </div>

        {/* Stock Badge */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            backgroundColor: availableStock > 5 ? "#def7ec" : availableStock > 0 ? "#fef3c7" : "#fde8e8",
            color: availableStock > 5 ? "#03543f" : availableStock > 0 ? "#92400e" : "#9b1c1c",
            fontSize: "10px",
            fontWeight: "800",
            padding: "5px 10px",
            borderRadius: "6px",
            letterSpacing: "0.5px",
          }}
        >
          {availableStock > 5 ? "IN STOCK" : availableStock > 0 ? `LOW STOCK (${availableStock})` : "OUT OF STOCK"}
        </div>

        {/* Dots for image index */}
        {hasMultipleImages && (
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "6px",
            }}
          >
            {images.map((_, idx) => (
              <span
                key={idx}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: idx === activeImgIdx ? "#1E40AF" : "rgba(255, 255, 255, 0.7)",
                  transition: "background-color 0.2s",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Content */}
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <div style={{ display: "flex", gap: "6px", marginBottom: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "10px", fontWeight: "800", color: "#1E40AF", backgroundColor: "#DBEAFE", padding: "4px 8px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Category: {product.category || "UNCATEGORIZED"}
          </span>
          {product.subCategory && (
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#475569", backgroundColor: "#F1F5F9", padding: "4px 8px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Sub-category: {product.subCategory}
            </span>
          )}
        </div>
        <h3 style={{ fontSize: "20px", fontWeight: "900", color: "#0F172A", marginBottom: "8px" }}>
          {product.name}
        </h3>

        <div style={{ display: "flex", alignItems: "baseline", gap: "5px", marginBottom: "15px" }}>
          <span style={{ fontSize: "24px", fontWeight: "900", color: "#1E40AF" }}>₹{product.price.toLocaleString("en-IN")}</span>
        </div>

        {product.description && (
          <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px", flexGrow: 1 }} className="line-clamp-3">
            {product.description}
          </p>
        )}

        {/* Specifications Table */}
        {product.specifications && product.specifications.length > 0 && (
          <div
            style={{
              backgroundColor: "#F8FAFC",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "20px",
              border: "1px solid #E2E8F0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#1E40AF",
                fontWeight: "800",
                fontSize: "10px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              <FileText size={14} />
              <span>SPECIFICATIONS</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px" }}>
              {product.specifications.map((spec, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: idx < product.specifications.length - 1 ? "1px solid #E2E8F0" : "none",
                    paddingBottom: idx < product.specifications.length - 1 ? "6px" : "0",
                  }}
                >
                  <span style={{ color: "#64748B", fontWeight: "500" }}>{spec.type}:</span>
                  <span style={{ color: "#0F172A", fontWeight: "700" }}>{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {availableStock <= 0 ? (
          <button
            disabled
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: "#E2E8F0",
              color: "#94A3B8",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: "800",
              fontSize: "13px",
              marginTop: "auto",
              cursor: "not-allowed",
              width: "100%",
            }}
          >
            <ShieldAlert size={16} /> OUT OF STOCK
          </button>
        ) : (user && user.role !== "student") ? (
          <Link
            to={inquiryLink}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: "#1E40AF",
              color: "white",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: "800",
              fontSize: "13px",
              textDecoration: "none",
              marginTop: "auto",
              textAlign: "center",
              transition: "background-color 0.2s",
            }}
            className="hover:bg-blue-800"
          >
            INQUIRE NOW <ArrowRight size={16} />
          </Link>
        ) : (
          <button
            onClick={handleBuyButtonClick}
            disabled={isPurchasing}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: "linear-gradient(135deg, #1E40AF, #3B82F6)",
              color: "white",
              padding: "12px",
              borderRadius: "8px",
              fontWeight: "800",
              fontSize: "13px",
              border: "none",
              cursor: isPurchasing ? "wait" : "pointer",
              marginTop: "auto",
              textAlign: "center",
              width: "100%",
              boxShadow: "0 4px 12px rgba(30, 64, 175, 0.2)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            className="hover:scale-[1.02] hover:shadow-md active:scale-[0.98]"
          >
            {isPurchasing ? (
              <>
                <Loader2 size={16} className="animate-spin" /> PURCHASING...
              </>
            ) : (
              <>
                BUY NOW <ShoppingBag size={16} />
              </>
            )}
          </button>
        )}
      </div>

      {showGuestModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              overflow: "hidden",
              animation: "fadeInScale 0.3s ease",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #0F172A, #1E40AF)",
                padding: "20px",
                color: "white",
                textAlign: "center",
              }}
            >
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800" }}>Checkout Details</h3>
              <p style={{ margin: "5px 0 0", fontSize: "12px", opacity: 0.8 }}>Please enter your contact details to proceed</p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleGuestSubmit} style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  FULL NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={guestDetails.name}
                  onChange={(e) => setGuestDetails(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "14px",
                    outline: "none",
                    color: "#0F172A",
                    fontWeight: "500",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@example.com"
                  value={guestDetails.email}
                  onChange={(e) => setGuestDetails(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "14px",
                    outline: "none",
                    color: "#0F172A",
                    fontWeight: "500",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  MOBILE NUMBER
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={guestDetails.mobile}
                  onChange={(e) => setGuestDetails(prev => ({ ...prev, mobile: e.target.value }))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #CBD5E1",
                    fontSize: "14px",
                    outline: "none",
                    color: "#0F172A",
                    fontWeight: "500",
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowGuestModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#F8FAFC",
                    color: "#64748B",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #1E40AF, #3B82F6)",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Proceed to Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccessModal && completedOrder && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              overflow: "hidden",
              textAlign: "center",
              animation: "fadeInScale 0.3s ease",
            }}
          >
            {/* Header Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, #10B981, #059669)",
                padding: "30px 20px",
                color: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  width: "60px",
                  height: "60px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check size={36} color="white" strokeWidth={3} />
              </div>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "900" }}>Order Successful!</h3>
              <p style={{ margin: 0, fontSize: "12px", opacity: 0.9 }}>Thank you for buying from Archery</p>
            </div>

            {/* Receipt Content */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div
                style={{
                  backgroundColor: "#F8FAFC",
                  borderRadius: "12px",
                  padding: "16px",
                  border: "1px solid #E2E8F0",
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  fontSize: "13px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B", fontWeight: "500" }}>Order ID:</span>
                  <span style={{ color: "#0F172A", fontWeight: "750", fontFamily: "monospace" }}>{completedOrder.transactionId}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B", fontWeight: "500" }}>Product:</span>
                  <span style={{ color: "#0F172A", fontWeight: "750", textAlign: "right" }}>{product.name}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B", fontWeight: "500" }}>Amount Paid:</span>
                  <span style={{ color: "#1E40AF", fontWeight: "900" }}>₹{completedOrder.amount.toLocaleString("en-IN")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B", fontWeight: "500" }}>Payment:</span>
                  <span style={{ color: "#475569", fontWeight: "700" }}>{completedOrder.paymentMode}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#64748B", fontWeight: "500" }}>Fulfillment:</span>
                  <span style={{ color: "#D97706", fontWeight: "700" }}>Pending Delivery</span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={handleCloseSuccessModal}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #1E40AF, #3B82F6)",
                  color: "white",
                  fontWeight: "800",
                  fontSize: "13px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(30, 64, 175, 0.2)",
                  transition: "transform 0.2s",
                }}
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const data = await getAllEquipment();
      if (Array.isArray(data)) {
        // Display active products first
        setProducts(data.filter((item) => item.active !== false));
      }
    } catch (error) {
      console.error("Failed to fetch equipment products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", fontFamily: "'Outfit', sans-serif", color: "#0F172A", overflowX: "hidden" }}>
      {/* HERO SECTION */}
      <section
        style={{
          position: "relative",
          minHeight: "50vh",
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.7), rgba(30, 64, 175, 0.4)), url('${heroImg}')`,
          backgroundSize: "cover",
          backgroundPosition: 'center',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "white",
          padding: "80px 5%",
        }}
      >
        <div style={{ animation: "fadeInDown 0.8s ease" }}>
          <span style={{ fontSize: "13px", fontWeight: "800", letterSpacing: "4px", textTransform: "uppercase", color: "#3B82F6" }}>
            Academy Pro Shop
          </span>
          <h1 style={{ fontSize: "clamp(36px, 8vw, 64px)", fontWeight: "900", margin: "15px 0" }}>
            ELITE ARCHERY EQUIPMENT
          </h1>
          <p style={{ fontSize: "clamp(16px, 2.5vw, 18px)", opacity: 0.9, maxWidth: "700px", margin: "0 auto" }}>
            Precision-engineered gear and kits. Tested and approved by our Olympic-level coaches.
          </p>
        </div>
      </section>

      {/* PRODUCTS CATALOG SECTION */}
      <section style={{ padding: "80px 0", backgroundColor: "#f8fafc" }}>
        <div className="site-container" style={{ margin: "0 auto", maxWidth: "1200px", padding: "0 20px" }}>
          <div style={{ textAlign: "center", marginBottom: "50px" }}>
            <h2 style={{ fontSize: "32px", fontWeight: "900", color: "#0F172A", marginBottom: "10px" }}>
              AVAILABLE GEAR & KITS
            </h2>
            <p style={{ color: "#64748B", fontSize: "16px", maxWidth: "600px", margin: "0 auto" }}>
              Equip yourself with training bows, arrows, stabilizers, and complete packages custom configured for different levels.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid #E2E8F0",
                  borderTopColor: "#1E40AF",
                  borderRadius: "50%",
                  margin: "0 auto 20px",
                  animation: "spin 1s linear infinite",
                }}
              />
              <p style={{ color: "#64748B", fontWeight: "600" }}>Loading products catalog...</p>
            </div>
          ) : products.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "30px",
              }}
            >
              {products.map((product) => (
                <ProductCard key={product._id} product={product} onPurchaseSuccess={fetchProducts} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 0", backgroundColor: "white", borderRadius: "16px", border: "1px solid #e2e8f0" }}>
              <Box size={48} style={{ color: "#94A3B8", margin: "0 auto 15px" }} />
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0F172A", marginBottom: "8px" }}>No Products Available</h3>
              <p style={{ color: "#64748B", fontSize: "14px", maxWidth: "400px", margin: "0 auto" }}>
                We are currently replenishing our equipment stock. Check back soon or contact support for special orders.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* WHY BUY FROM US SECTION */}
      <section style={{ padding: "80px 0", backgroundColor: "white" }}>
        <div className="site-container" style={{ margin: "0 auto", maxWidth: "1000px", padding: "0 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "40px" }}>
            <div style={{ display: "flex", gap: "15px" }}>
              <div style={{ backgroundColor: "#eff6ff", color: "#1E40AF", padding: "12px", borderRadius: "12px", height: "48px", width: "48px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Award size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A", marginBottom: "8px" }}>Coaches Approved</h4>
                <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6" }}>Every bow, arrow shaft, and accessory is selected and tuned by our national coaching team for optimal alignment.</p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "15px" }}>
              <div style={{ backgroundColor: "#eff6ff", color: "#1E40AF", padding: "12px", borderRadius: "12px", height: "48px", width: "48px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Check size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: "18px", fontWeight: "800", color: "#0F172A", marginBottom: "8px" }}>Custom Configuration</h4>
                <p style={{ color: "#64748B", fontSize: "14px", lineHeight: "1.6" }}>We size draws, set poundages, and customize recurve/compound kits to match your precise height, wingspan, and level.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Products;
