import React, { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Calendar, Info } from "lucide-react";
import { getActiveBanners } from "../services/bannerService";

export const BannersDisplay = ({ placement, position }) => {
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await getActiveBanners();
        if (data && Array.isArray(data)) {
          const filtered = data.filter(
            (b) => b.placement === placement && b.position === position
          );
          setBanners(filtered);
        }
      } catch (error) {
        console.error("Failed to load banners for", placement, position, error);
      }
    };
    fetchBanners();
  }, [placement, position]);

  if (banners.length === 0) return null;

  if (position === "Popup") {
    return <BannerPopupModal banners={banners} />;
  }

  return (
    <div className="w-full my-6 space-y-4">
      {banners.map((banner) => {
        const hasTitle = banner.title && banner.title.trim() !== "";
        const hasDesc = banner.description && banner.description.trim() !== "";
        const hasContent = hasTitle || hasDesc;

        return (
          <div 
            key={banner._id} 
            className="w-full overflow-hidden rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 bg-[#0F172A] relative group"
          >
            <img 
              src={banner.imageUrl} 
              alt={banner.title || "Promotional Banner"} 
              className="w-full h-auto max-h-[180px] sm:max-h-[260px] md:max-h-[300px] object-contain block mx-auto"
            />
            {hasContent && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 sm:p-6 text-white pt-16 transition-opacity duration-300">
                {hasTitle && (
                  <h3 className="font-bold text-base sm:text-lg font-outfit drop-shadow-md">
                    {banner.title}
                  </h3>
                )}
                {hasDesc && (
                  <p className="text-gray-200 text-xs sm:text-sm mt-1 leading-relaxed drop-shadow-sm max-w-2xl line-clamp-2">
                    {banner.description}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const BannerPopupModal = ({ banners }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  if (!isOpen || banners.length === 0) return null;

  const banner = banners[currentIndex];
  const hasTitle = banner.title && banner.title.trim() !== "";
  const hasDesc = banner.description && banner.description.trim() !== "";
  const hasContent = hasTitle || hasDesc;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative bg-[#0F172A] rounded-2xl w-fit max-w-[90vw] max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in-up border border-slate-800">
        
        {/* Close Button (Top-Right) */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 z-50 p-2 bg-black/35 hover:bg-black/60 text-white rounded-full transition-all backdrop-blur-md border border-white/10"
          title="Close Popup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Info Icon Button (Top-Left) */}
        {hasContent && (
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`absolute top-3 left-3 z-50 p-2 text-white rounded-full transition-all backdrop-blur-md border border-white/10 ${
              showInfo ? "bg-brand-blue" : "bg-black/35 hover:bg-black/60"
            }`}
            title="Show Information"
          >
            <Info className="w-5 h-5" />
          </button>
        )}

        {/* Image / Content Container */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
          <img 
            src={banner.imageUrl} 
            alt={banner.title || "Banner"} 
            className="w-auto h-auto max-h-[80vh] max-w-[85vw] object-contain block rounded-2xl"
          />

          {/* Info Details Overlay */}
          {hasContent && showInfo && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm flex flex-col justify-center p-8 text-white z-40 overflow-y-auto">
              <div className="max-w-md mx-auto text-center space-y-4">
                <Info className="w-10 h-10 text-brand-blue mx-auto mb-2" />
                {hasTitle && (
                  <h3 className="font-bold text-xl font-outfit text-white">
                    {banner.title}
                  </h3>
                )}
                {hasDesc && (
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {banner.description}
                  </p>
                )}
                <button
                  onClick={() => setShowInfo(false)}
                  className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold transition-all border border-white/10"
                >
                  Back to Flyer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Carousel controls floating at the bottom if more than 1 banner */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/60 border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 text-xs text-white backdrop-blur-md shadow-lg shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowInfo(false);
                setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
              }}
              className="p-1 hover:text-brand-blue transition-colors"
              title="Previous Banner"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium whitespace-nowrap">{currentIndex + 1} / {banners.length}</span>
            <button
              type="button"
              onClick={() => {
                setShowInfo(false);
                setCurrentIndex((prev) => (prev + 1) % banners.length);
              }}
              className="p-1 hover:text-brand-blue transition-colors"
              title="Next Banner"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannersDisplay;
