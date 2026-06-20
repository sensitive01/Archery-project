import React from 'react';

const heroImg = "/ref-banner.png";

const PrivacyPolicy = () => {
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
           <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '4px', textTransform: 'uppercase', color: '#3B82F6' }}>LEGAL</span>
           <h1 style={{ fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: '900', margin: '15px 0' }}>PRIVACY POLICY</h1>
           <p style={{ fontSize: 'clamp(16px, 2.5vw, 18px)', opacity: 0.9, maxWidth: '700px', margin: '0 auto' }}>How we protect and manage your data.</p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="section-wrapper" style={{ padding: '80px 5%' }}>
         <div className="site-container" style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8', fontSize: '16px', color: '#475569' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', marginBottom: '20px' }}>Data Security & Privacy</h2>
            <p style={{ marginBottom: '20px' }}>
               At Archery Coaching Institute, we take your privacy as seriously as our safety guidelines on the range. This official Privacy Policy page is currently being drafted by our legal team.
            </p>
            <p style={{ marginBottom: '20px' }}>
               Once published, this document will detail how we collect, use, and protect your personal information, membership details, and payment data. We adhere to the highest industry standards for data protection.
            </p>
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

export default PrivacyPolicy;
