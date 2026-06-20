import React from 'react';

const heroImg = "/ref-banner.png";

const Competitions = () => {
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
           <span style={{ fontSize: '13px', fontWeight: '800', letterSpacing: '4px', textTransform: 'uppercase', color: '#3B82F6' }}>THE ARENA</span>
           <h1 style={{ fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: '900', margin: '15px 0' }}>COMPETITIONS</h1>
           <p style={{ fontSize: 'clamp(16px, 2.5vw, 18px)', opacity: 0.9, maxWidth: '700px', margin: '0 auto' }}>Test your skills against the best on the range.</p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="section-wrapper" style={{ padding: '80px 5%' }}>
         <div className="site-container" style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8', fontSize: '16px', color: '#475569' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '900', color: '#0F172A', marginBottom: '20px' }}>Tournament Season Awaits</h2>
            <p style={{ marginBottom: '20px' }}>
               Welcome to the Competitions hub. We host a variety of local, regional, and national archery tournaments. This page is currently under construction as we finalize the tournament calendar for the upcoming season.
            </p>
            <p style={{ marginBottom: '20px' }}>
               Whether you are a beginner looking for your first 18-meter indoor shoot or an advanced archer preparing for 70-meter outdoor championships, you'll find all the registration details, leaderboards, and schedules here soon.
            </p>
            
            <div style={{ 
               backgroundColor: '#F0F6FF', 
               borderRadius: '12px', 
               padding: '30px', 
               marginTop: '40px',
               border: '1px solid #E2EAF8'
            }}>
               <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1E40AF', marginBottom: '10px' }}>Next Event</h3>
               <p style={{ color: '#0F172A', fontWeight: '500' }}>Information regarding the Annual Archery Academy Championship will be posted shortly. Keep training!</p>
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

export default Competitions;
