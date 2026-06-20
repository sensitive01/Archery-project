import React, { useState, useEffect } from "react";
import { X, ZoomIn, Camera } from "lucide-react";
import { getActiveGallery } from "../services/galleryService";

// ASSETS
const heroImg = "/ref-banner.png";

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const data = await getActiveGallery();
        setGalleryImages(data);
      } catch (error) {
        console.error("Failed to load gallery");
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'Outfit', sans-serif", overflowX: 'hidden' }}>
      
      {/* HERO */}
      <section style={{ 
          position: 'relative', 
          minHeight: '60vh', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: 'white',
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(30, 64, 175, 0.5)), url('${heroImg}')`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          padding: '80px 5%'
      }}>
        <div style={{ animation: 'fadeInDown 0.8s ease', position: 'relative', zIndex: 2 }}>
           <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3ABEF9', padding: '8px 24px', borderRadius: '100px', marginBottom: '30px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <Camera size={14} /> <span style={{ fontSize: '11px', fontWeight: '900', letterSpacing: '4px' }}>MEDIA ARCHIVE</span>
           </div>
           <h1 style={{ fontSize: 'clamp(32px, 8vw, 72px)', fontWeight: '900', margin: '20px 0', letterSpacing: '-0.02em', lineHeight: '1.1' }}>ACADEMY MOMENTS</h1>
           <p style={{ fontSize: 'clamp(16px, 2.5vw, 20px)', opacity: 0.9, maxWidth: '700px', margin: '0 auto' }}>A visual record of precision, focus, and excellence across our global community.</p>
        </div>
      </section>

      {/* GALLERY GRID */}
      <section className="section-wrapper">
         {loading ? (
             <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
             </div>
         ) : galleryImages.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '100px 0', color: '#64748B' }}>
                 <h3>No gallery moments added yet.</h3>
             </div>
         ) : (
             <div className="site-container" style={{ 
                 display: 'grid', 
                 gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', 
                 gap: '30px' 
             }}>
                {galleryImages.map((img) => (
                   <div 
                      key={img._id} 
                      onClick={() => setSelectedImage(img)}
                      style={{ 
                         position: 'relative', 
                         aspectRatio: '16/10',
                         borderRadius: '16px', 
                         overflow: 'hidden', 
                         cursor: 'pointer',
                         boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                         transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                         border: '1px solid #f1f5f9'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.querySelector('.overlay').style.opacity = '1'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.querySelector('.overlay').style.opacity = '0'; }}
                   >
                      <img 
                        src={img.image} 
                        alt={img.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                      />
                      <div className="overlay" style={{ 
                          position: 'absolute', inset: 0, backgroundColor: 'rgba(30, 64, 175, 0.85)', 
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                          opacity: 0, transition: 'opacity 0.4s ease', color: 'white', textAlign: 'center',
                          padding: '20px'
                      }}>
                         <ZoomIn size={40} style={{ marginBottom: '15px' }} />
                         <span style={{ 
                             fontSize: '12px', 
                             fontWeight: '700', 
                             textTransform: 'uppercase', 
                             letterSpacing: '1px', 
                             color: '#93c5fd', 
                             marginBottom: '8px',
                             display: '-webkit-box',
                             WebkitLineClamp: 3,
                             WebkitBoxOrient: 'vertical',
                             overflow: 'hidden',
                             lineHeight: '1.4'
                         }}>
                             {img.description}
                         </span>
                         <h4 style={{ 
                             fontSize: '18px', 
                             fontWeight: '900', 
                             display: '-webkit-box',
                             WebkitLineClamp: 2,
                             WebkitBoxOrient: 'vertical',
                             overflow: 'hidden',
                             lineHeight: '1.2'
                         }}>
                             {img.title}
                         </h4>
                      </div>
                   </div>
                ))}
             </div>
         )}
      </section>

      {/* LIGHTBOX */}
      {selectedImage && (
         <div 
            onClick={() => setSelectedImage(null)}
            style={{ 
                position: 'fixed', inset: 0, zIndex: 3000, 
                backgroundColor: 'rgba(15, 23, 42, 0.98)', 
                backdropFilter: 'blur(20px)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                padding: '20px' 
            }}
         >
            <button style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: 'none', color: '#0F172A', cursor: 'pointer', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', zIndex: 3001 }}>
               <X size={28} />
            </button>
            <div style={{ maxWidth: '1200px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', animation: 'zoomIn 0.4s ease' }}>
               <img src={selectedImage.image} alt="Full View" style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 60px 150px rgba(0,0,0,0.6)' }} />
               <div style={{ textAlign: 'center', color: 'white', maxWidth: '800px', padding: '0 20px' }}>
                  <p style={{ color: '#3B82F6', fontWeight: '800', fontSize: '13px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px', lineHeight: '1.5' }}>{selectedImage.description}</p>
                  <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: '900', marginTop: '0', lineHeight: '1.2' }}>{selectedImage.title}</h2>
               </div>
            </div>
         </div>
      )}

      <style>{`
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default Gallery;
