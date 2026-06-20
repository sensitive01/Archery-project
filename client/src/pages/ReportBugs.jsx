import React from 'react';

const heroImg = "/ref-banner.png";

const ReportBugs = () => {
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', fontFamily: "'Outfit', sans-serif", color: '#0F172A', overflowX: 'hidden' }}>
      
      {/* HERO */}
      <section style={{ 
          position: 'relative', 
          minHeight: '50vh', 
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(30, 64, 175, 0.6)), url('${heroImg}')`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          textAlign: 'center',
          color: 'white',
          padding: '80px 5%'
      }}>
        <div style={{ animation: 'fadeInDown 0.8s ease' }}>
           <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '4px', textTransform: 'uppercase', color: '#3B82F6' }}>SUPPORT</span>
           <h1 style={{ fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: '900', margin: '15px 0' }}>REPORT BUGS</h1>
           <p style={{ fontSize: 'clamp(16px, 2.5vw, 18px)', opacity: 0.9, maxWidth: '700px', margin: '0 auto' }}>Help us keep our platform perfectly on target.</p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="section-wrapper" style={{ padding: '80px 5%' }}>
         <div className="site-container" style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8', fontSize: '16px', color: '#475569' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', marginBottom: '20px' }}>Technical Support</h2>
            <p style={{ marginBottom: '20px' }}>
               Just like a misaligned sight, software bugs can throw off your experience. This portal is currently being built to allow you to easily submit issue reports, feedback, and technical glitches you encounter on our platform.
            </p>
            <p style={{ marginBottom: '20px' }}>
               Our development team appreciates your patience. If you encounter a critical issue preventing you from booking a class or accessing your account, please contact our support team via phone or email in the meantime.
            </p>
            
            <div style={{ 
               backgroundColor: '#F0F6FF', 
               borderRadius: '12px', 
               padding: '30px', 
               marginTop: '40px',
               border: '1px solid #E2EAF8'
            }}>
               <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1E40AF', marginBottom: '10px' }}>Need immediate help?</h3>
               <p style={{ color: '#0F172A', fontWeight: '500' }}>Send an email to support@archerycoaching.com or call our front desk.</p>
            </div>
         </div>
      </section>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ReportBugs;
