import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getActiveBanners } from "../services/bannerService";

const BannerModal = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await getActiveBanners();
        if (data && data.length > 0) {
          setBanners(data);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Failed to fetch banners", error);
      }
    };

    fetchBanners();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const nextBanner = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (!isOpen || banners.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
            onClick={handleClose}
          />

          <div className="relative z-10 w-full max-w-4xl flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
              className="relative pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image Container with shadow */}
              <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/50 group">
                {/* Close Button - Floating Glass Style */}
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 z-30 p-2 bg-black/20 hover:bg-black/50 text-white rounded-full transition-all backdrop-blur-md border border-white/20 transform hover:scale-110 hover:rotate-90"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Navigation Arrows - Glass Style */}
                {banners.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevBanner();
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 -translate-x-2 group-hover:translate-x-0 z-20"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextBanner();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/50 text-white rounded-full backdrop-blur-md border border-white/20 transition-all opacity-0 group-hover:opacity-100 hover:scale-110 translate-x-2 group-hover:translate-x-0 z-20"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dots Indicator - Glass Pill */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 px-3 py-1.5 bg-black/20 backdrop-blur-md rounded-full border border-white/10">
                      {banners.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentIndex(idx);
                          }}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            idx === currentIndex
                              ? "bg-white w-6 shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                              : "bg-white/40 hover:bg-white/60"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentIndex}
                    src={banners[currentIndex].imageUrl}
                    alt={`Banner ${currentIndex + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-h-[85vh] max-w-[90vw] md:max-w-[800px] object-contain block select-none"
                    draggable="false"
                  />
                </AnimatePresence>

                {/* Subtle gradient overlay at bottom for better text visibility if needed */}
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BannerModal;
